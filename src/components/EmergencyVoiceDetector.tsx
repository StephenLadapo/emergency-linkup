import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, AlertTriangle, CheckCircle, Activity, Settings } from 'lucide-react';
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EmergencyVoiceDetectorProps {
  onEmergencyDetected?: (detection: EmergencyDetection) => void;
  onStatusChange?: (isActive: boolean) => void;
}

interface EmergencyDetection {
  is_emergency: boolean;
  confidence: number;
  class_label: string;
  timestamp: string;
  audio_duration: number;
}

interface ModelInfo {
  model_loaded: boolean;
  sample_rate: number;
  duration: number;
  expected_features: number;
  model_version: string;
}

const EmergencyVoiceDetector: React.FC<EmergencyVoiceDetectorProps> = ({
  onEmergencyDetected,
  onStatusChange
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDetection, setLastDetection] = useState<EmergencyDetection | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<EmergencyDetection[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [continuousMode, setContinuousMode] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7]);
  const [processingInterval, setProcessingInterval] = useState([2000]); // ms
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessTimeRef = useRef<number>(0);
  
  // API configuration
  const API_BASE_URL = 'http://localhost:5000';
  
  // Check API status and model info
  const checkApiStatus = useCallback(async () => {
    try {
      setApiStatus('checking');
      
      // Check health
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      if (!healthResponse.ok) {
        throw new Error('API health check failed');
      }
      
      // Get model info
      const modelResponse = await fetch(`${API_BASE_URL}/model_info`);
      if (modelResponse.ok) {
        const modelData = await modelResponse.json();
        setModelInfo(modelData);
      }
      
      setApiStatus('connected');
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus('disconnected');
    }
  }, []);
  
  // Initialize component
  useEffect(() => {
    checkApiStatus();
    
    // Check API status periodically
    const statusInterval = setInterval(checkApiStatus, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(statusInterval);
      stopListening();
    };
  }, [checkApiStatus]);
  
  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // Send audio to ML API for prediction
  const predictEmergency = async (audioBlob: Blob): Promise<EmergencyDetection | null> => {
    try {
      setIsProcessing(true);
      
      // Check if the blob is valid
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Invalid audio data: empty blob');
      }
      
      // Log detailed audio information
      console.log(`Processing audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      // Convert audio to base64
      let audioBase64;
      try {
        audioBase64 = await blobToBase64(audioBlob);
        console.log(`Converted to base64: ${audioBase64.length} chars`);
        
        if (!audioBase64 || audioBase64.length === 0) {
          throw new Error('Empty base64 result');
        }
      } catch (conversionError) {
        console.error('Base64 conversion error:', conversionError);
        throw new Error(`Failed to convert audio to base64: ${conversionError.message}`);
      }
      
      // Prepare request with timestamp and device info
      const timestamp = new Date().toISOString();
      const requestBody = {
        audio_base64: audioBase64,
        mimeType: audioBlob.type,
        source: 'web_recorder',
        timestamp: timestamp,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };
      
      console.log(`Sending audio data to API at ${timestamp}`);
      
      // Send to API with detailed information and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API response:', result);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.processing_successful === false) {
          throw new Error('Audio processing failed on the server');
        }
        
        // Create detection object with all available information
        const detection: EmergencyDetection = {
          is_emergency: result.is_emergency,
          confidence: result.confidence || 0,
          class_label: result.class_label || (result.is_emergency ? 'Emergency' : 'Normal'),
          timestamp: result.timestamp || timestamp,
          audio_duration: result.audio_duration || 3.0
        };
        
        return detection;
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('API request timed out after 10 seconds');
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }
      
    } catch (error) {
      console.error('Emergency prediction failed:', error);
      toast.error(`Prediction failed: ${error.message}`, {
        id: 'prediction-error', // Use ID to prevent duplicate toasts
        duration: 3000
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process recorded audio chunk
  const processAudioChunk = async () => {
    if (audioChunksRef.current.length === 0) {
      console.log('No audio chunks to process');
      return;
    }
    
    console.log(`Processing ${audioChunksRef.current.length} audio chunks`);
    
    // Get the MIME type from the first chunk if available
    const firstChunkType = audioChunksRef.current[0]?.type || 'audio/webm';
    console.log(`Using MIME type: ${firstChunkType} for audio blob`);
    
    // Create blob with the detected MIME type
    const audioBlob = new Blob(audioChunksRef.current, { type: firstChunkType });
    console.log(`Audio blob size: ${audioBlob.size} bytes`);
    
    // Only clear chunks after creating the blob
    const chunksToProcess = [...audioChunksRef.current];
    audioChunksRef.current = []; // Clear chunks for next recording
    
    // Skip processing if blob is too small (likely silence or noise)
    if (audioBlob.size < 2000) { // Increased threshold to ensure we have enough audio data
      console.log('Audio blob too small, likely silence - skipping processing');
      setIsProcessing(false);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create an audio element to check if the blob is valid
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);
      
      // Wait for metadata to load to verify audio is valid
      let isAudioValid = false;
      try {
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            isAudioValid = true;
            resolve(null);
          };
          audio.onerror = (e) => reject(new Error(`Invalid audio data: ${e.toString()}`));
          
          // Set timeout in case metadata loading hangs
          setTimeout(() => {
            if (!isAudioValid) {
              console.warn('Audio metadata loading timed out');
              resolve(null); // Continue anyway and let the server try to process
            }
          }, 1000);
        });
      } catch (audioError) {
        console.warn(`Audio validation error: ${audioError.message}`);
        // Continue anyway - the server might still be able to process it
      }
      
      console.log('Sending audio to API for prediction...');
      const detection = await predictEmergency(audioBlob);
      
      // Clean up the URL object
      URL.revokeObjectURL(audioURL);
      
      if (detection) {
        console.log(`Detection result: ${detection.class_label} (${detection.confidence.toFixed(2)})`);
        setLastDetection(detection);
        setDetectionHistory(prev => [...prev.slice(-9), detection]); // Keep last 10
        
        // Check if emergency detected with sufficient confidence
        if (detection.is_emergency && detection.confidence >= confidenceThreshold[0]) {
          toast.error(`Emergency detected! Confidence: ${(detection.confidence * 100).toFixed(1)}%`, {
            duration: 5000, // Show longer for important alerts
            position: 'top-center'
          });
          
          if (onEmergencyDetected) {
            onEmergencyDetected(detection);
          }
        } else if (detection.is_emergency) {
          toast.warning(`Possible emergency detected (low confidence: ${(detection.confidence * 100).toFixed(1)}%)`);
        } else {
          // Only show normal speech toast occasionally to avoid too many notifications
          if (Math.random() < 0.3) { // Show only ~30% of normal detections
            toast.info(`Normal speech detected (confidence: ${(detection.confidence * 100).toFixed(1)}%)`, {
              duration: 2000 // Shorter duration for non-emergency notifications
            });
          }
        }
      } else {
        console.warn('No detection result returned from API');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(`Error processing audio: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Start listening for audio
  const startListening = async () => {
    try {
      if (apiStatus !== 'connected') {
        toast.error('ML API is not available. Please ensure the API server is running.');
        return;
      }
      
      console.log('Starting audio capture...');
      
      // Try to get the best audio quality for voice recognition with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,     // Disable echo cancellation for clearer voice
          noiseSuppression: true,      // Keep noise suppression
          autoGainControl: true,       // Keep auto gain
          sampleRate: { ideal: 22050 },// Match model's sample rate
          channelCount: 1,             // Mono audio (simpler processing)
          
        } 
      });
      
      // Log audio track settings
      const audioTrack = stream.getAudioTracks()[0];
      console.log('Audio stream obtained successfully');
      console.log('Audio track settings:', audioTrack.getSettings());
      streamRef.current = stream;
      
      // Get supported MIME types - try multiple formats in priority order
      const supportedMimeTypes = [
        'audio/wav', 
        'audio/webm', 
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ].filter(type => MediaRecorder.isTypeSupported(type));
      
      if (supportedMimeTypes.length === 0) {
        throw new Error('No supported audio MIME types found');
      }
      
      const selectedMimeType = supportedMimeTypes[0];
      console.log(`Using audio format: ${selectedMimeType}`);
      
      // Create media recorder with selected format and higher quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 256000 // Higher bitrate for better quality
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk captured: ${event.data.size} bytes, type: ${event.data.type}`);
        } else {
          console.warn('Received empty audio chunk');
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.warn('No audio chunks collected during recording');
          return;
        }
        
        if (continuousMode && isListening) {
          console.log(`Processing ${audioChunksRef.current.length} audio chunks...`);
          processAudioChunk();
        }
      };
      
      // Start recording with shorter timeslice for more frequent data
      mediaRecorder.start(300); // Get data every 0.3 seconds for more responsive detection
      console.log('MediaRecorder started with timeslice: 300ms');
      setIsListening(true);
      
      if (onStatusChange) {
        onStatusChange(true);
      }
      
      // Set up continuous processing with more responsive timing
      if (continuousMode) {
        intervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('Stopping recorder to process chunk...');
            mediaRecorderRef.current.stop();
            
            // Restart recording immediately after stopping
            setTimeout(() => {
              if (isListening && mediaRecorderRef.current) {
                console.log('Restarting recorder...');
                mediaRecorderRef.current.start(300);
              }
            }, 50); // Reduced delay for more continuous recording
          }
        }, processingInterval[0]);
      }
      
      toast.success('Emergency voice detection started - speak clearly for best results');
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error(`Failed to access microphone: ${error.message}. Please check permissions.`);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    
    if (onStatusChange) {
      onStatusChange(false);
    }
    
    toast.info('Emergency voice detection stopped');
  };
  
  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    if (apiStatus === 'disconnected') return 'destructive';
    if (isListening) return lastDetection?.is_emergency ? 'destructive' : 'default';
    return 'secondary';
  };
  
  // Get status icon
  const getStatusIcon = () => {
    if (isProcessing) return <Activity className="h-4 w-4 animate-spin" />;
    if (apiStatus === 'disconnected') return <AlertTriangle className="h-4 w-4" />;
    if (lastDetection?.is_emergency) return <AlertTriangle className="h-4 w-4" />;
    if (isListening) return <Mic className="h-4 w-4" />;
    return <MicOff className="h-4 w-4" />;
  };
  
  return (
    <div className="space-y-4">
      {/* Main Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Emergency Voice Detection
            <Badge variant={getStatusColor()} className="ml-auto">
              {getStatusIcon()}
              {apiStatus === 'disconnected' ? 'API Offline' : 
               isListening ? 'Listening' : 'Stopped'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Status Alert */}
          {apiStatus === 'disconnected' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ML API is not available. Please start the API server by running: <code>python ml/api_server.py</code>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Main Control Button */}
          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              disabled={apiStatus === 'disconnected' || isProcessing}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="w-full max-w-xs"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Detection
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Detection
                </>
              )}
            </Button>
          </div>
          
          {/* Last Detection */}
          {lastDetection && (
            <div className="space-y-2">
              <Label>Last Detection</Label>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {lastDetection.is_emergency ? 'Emergency Detected' : 'Normal Speech'}
                  </span>
                  <Badge variant={lastDetection.is_emergency ? 'destructive' : 'secondary'}>
                    {lastDetection.class_label}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Confidence: {(lastDetection.confidence * 100).toFixed(1)}%</div>
                  <Progress value={lastDetection.confidence * 100} className="h-2" />
                  <div>Time: {new Date(lastDetection.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label>Detection Settings</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="continuous-mode">Continuous Monitoring</Label>
                <Switch
                  id="continuous-mode"
                  checked={continuousMode}
                  onCheckedChange={setContinuousMode}
                  disabled={isListening}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Confidence Threshold: {(confidenceThreshold[0] * 100).toFixed(0)}%</Label>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  max={1}
                  min={0.1}
                  step={0.05}
                  disabled={isListening}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Processing Interval: {processingInterval[0] / 1000}s</Label>
                <Slider
                  value={processingInterval}
                  onValueChange={setProcessingInterval}
                  max={5000}
                  min={1000}
                  step={500}
                  disabled={isListening}
                />
              </div>
            </div>
          </div>
          
          {/* Model Info */}
          {modelInfo && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <div>Model: v{modelInfo.model_version} | Sample Rate: {modelInfo.sample_rate}Hz</div>
              <div>Features: {modelInfo.expected_features} | Duration: {modelInfo.duration}s</div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detection History */}
      {detectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {detectionHistory.slice(-5).reverse().map((detection, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {detection.is_emergency ? (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    <span>{detection.class_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{(detection.confidence * 100).toFixed(0)}%</span>
                    <span className="text-muted-foreground">
                      {new Date(detection.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyVoiceDetector;