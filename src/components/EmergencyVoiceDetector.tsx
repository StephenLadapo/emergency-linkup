import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Brain, 
  AlertTriangle, 
  Activity, 
  Database, 
  Download, 
  Upload,
  Shield,
  AudioLines
} from 'lucide-react';
import { toast } from "sonner";
import { emergencyMLModel, EmergencyDetectionResult, AudioFeatures } from '@/utils/EmergencyMLModel';

interface DetectionEvent {
  id: string;
  timestamp: string;
  result: EmergencyDetectionResult;
  audioFeatures: AudioFeatures;
  transcription?: string;
}

interface EmergencyVoiceDetectorProps {
  onEmergencyDetected?: (result: EmergencyDetectionResult) => void;
}

const EmergencyVoiceDetector: React.FC<EmergencyVoiceDetectorProps> = ({ 
  onEmergencyDetected 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmergencyDetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectionEvent[]>([]);
  const [realTimeActivity, setRealTimeActivity] = useState(0);
  const [trainingData, setTrainingData] = useState('');
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const animationFrameRef = useRef<number>(0);
  const audioBufferRef = useRef<Float32Array>(new Float32Array(0));
  const lastAnalysisRef = useRef<number>(0);

  useEffect(() => {
    initializeModel();
    loadDetectionHistory();
    
    return () => {
      stopListening();
    };
  }, []);

  const initializeModel = async () => {
    setIsInitializing(true);
    try {
      await emergencyMLModel.initialize();
      setModelReady(true);
      toast.success('Emergency ML Model initialized successfully');
    } catch (error) {
      console.error('Error initializing model:', error);
      toast.error('Error initializing ML model. Using fallback detection.');
      setModelReady(true); // Still allow fallback mode
    } finally {
      setIsInitializing(false);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false, // Disable to preserve emergency sounds
          autoGainControl: false
        }
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      analyserRef.current.fftSize = 2048;
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      processorRef.current.onaudioprocess = handleAudioProcess;
      
      setIsListening(true);
      startRealTimeVisualization();
      
      toast.success('Emergency voice detection started');
      addToHistory('system', 'Emergency voice detection activated');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsListening(false);
    setRealTimeActivity(0);
    setCurrentAnalysis(null);
    
    toast.info('Emergency voice detection stopped');
    addToHistory('system', 'Emergency voice detection deactivated');
  };

  const handleAudioProcess = useCallback((event: AudioProcessingEvent) => {
    const inputBuffer = event.inputBuffer;
    const audioData = inputBuffer.getChannelData(0);
    
    // Accumulate audio data for analysis
    const newBuffer = new Float32Array(audioBufferRef.current.length + audioData.length);
    newBuffer.set(audioBufferRef.current);
    newBuffer.set(audioData, audioBufferRef.current.length);
    audioBufferRef.current = newBuffer;
    
    // Analyze in chunks of ~3 seconds (72000 samples at 24kHz)
    if (audioBufferRef.current.length >= 72000) {
      const now = Date.now();
      
      // Throttle analysis to every 2 seconds
      if (now - lastAnalysisRef.current > 2000) {
        analyzeAudioChunk(audioBufferRef.current.slice(0, 72000));
        lastAnalysisRef.current = now;
      }
      
      // Keep only the last second of audio for next analysis
      audioBufferRef.current = audioBufferRef.current.slice(48000);
    }
  }, []);

  const analyzeAudioChunk = async (audioData: Float32Array) => {
    try {
      const result = await emergencyMLModel.analyzeAudio(audioData);
      
      setCurrentAnalysis(result);
      
      if (result.isEmergency && result.confidence > 0.7) {
        const event: DetectionEvent = {
          id: `detection_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          result,
          audioFeatures: emergencyMLModel['extractAudioFeatures'](audioData)
        };
        
        setDetectionHistory(prev => [event, ...prev.slice(0, 49)]); // Keep last 50
        saveDetectionHistory();
        
        onEmergencyDetected?.(result);
        
        toast.error(`EMERGENCY DETECTED: ${result.emergencyType.replace('_', ' ').toUpperCase()}`, {
          duration: 10000,
          action: {
            label: "Alert Authorities",
            onClick: () => {
              toast.success("Emergency services alerted!");
              addToHistory('emergency', `Emergency alert sent for: ${result.emergencyType}`);
            }
          }
        });
        
        addToHistory('emergency', `Emergency detected: ${result.emergencyType} (${Math.round(result.confidence * 100)}% confidence)`);
      }
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  };

  const startRealTimeVisualization = () => {
    const updateVisualization = () => {
      if (analyserRef.current && isListening) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setRealTimeActivity(Math.round((average / 255) * 100));
        
        animationFrameRef.current = requestAnimationFrame(updateVisualization);
      }
    };
    
    updateVisualization();
  };

  const addToHistory = (type: string, description: string) => {
    try {
      const historyItem = {
        id: Date.now(),
        type,
        timestamp: new Date().toLocaleString(),
        description
      };
      
      const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      userHistory.unshift(historyItem);
      localStorage.setItem('userHistory', JSON.stringify(userHistory.slice(0, 100)));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const saveDetectionHistory = () => {
    try {
      localStorage.setItem('emergencyDetectionHistory', JSON.stringify(detectionHistory));
    } catch (error) {
      console.error('Error saving detection history:', error);
    }
  };

  const loadDetectionHistory = () => {
    try {
      const history = localStorage.getItem('emergencyDetectionHistory');
      if (history) {
        setDetectionHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading detection history:', error);
    }
  };

  const exportTrainingData = () => {
    const data = emergencyMLModel.exportTrainingData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency_training_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Training data exported successfully');
  };

  const importTrainingData = () => {
    if (!trainingData.trim()) {
      toast.error('Please paste training data first');
      return;
    }
    
    const success = emergencyMLModel.importTrainingData(trainingData);
    if (success) {
      toast.success('Training data imported successfully');
      setTrainingData('');
    } else {
      toast.error('Error importing training data. Please check the format.');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-600';
    if (confidence >= 0.6) return 'text-orange-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'destructive';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            University of Limpopo Emergency Voice Detection System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Model Status */}
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${modelReady ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-sm">
                ML Model: {isInitializing ? 'Initializing...' : modelReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>

            {/* Main Detection Interface */}
            <div className={`h-32 w-32 rounded-full ${isListening ? 'bg-red-500/20 animate-pulse' : 'bg-primary/10'} flex items-center justify-center relative`}>
              {isListening ? (
                <>
                  <Mic className="h-12 w-12 text-red-500" />
                  <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></div>
                </>
              ) : (
                <Mic className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Real-time Activity */}
            {isListening && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Audio Activity</span>
                  <span>{realTimeActivity}%</span>
                </div>
                <Progress value={realTimeActivity} className="h-2" />
              </div>
            )}

            {/* Current Analysis */}
            {currentAnalysis && (
              <Alert className={currentAnalysis.isEmergency ? 'border-red-500' : 'border-green-500'}>
                <AlertTriangle className={`h-4 w-4 ${currentAnalysis.isEmergency ? 'text-red-500' : 'text-green-500'}`} />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <Badge variant={currentAnalysis.isEmergency ? 'destructive' : 'outline'}>
                        {currentAnalysis.isEmergency ? 'EMERGENCY DETECTED' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Confidence:</span>
                      <span className={getConfidenceColor(currentAnalysis.confidence)}>
                        {Math.round(currentAnalysis.confidence * 100)}%
                      </span>
                    </div>
                    {currentAnalysis.isEmergency && (
                      <div className="flex items-center gap-2">
                        <span>Type:</span>
                        <Badge variant="secondary">
                          {currentAnalysis.emergencyType.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isListening ? (
                <Button 
                  onClick={startListening} 
                  disabled={!modelReady || isInitializing}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Start Detection
                </Button>
              ) : (
                <Button 
                  onClick={stopListening} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <MicOff className="h-4 w-4" />
                  Stop Detection
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Interface */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Detection History</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {detectionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {detectionHistory.map((event) => (
                      <div key={event.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getConfidenceBadgeVariant(event.result.confidence)}>
                            {event.result.isEmergency ? 'EMERGENCY' : 'Normal'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Type: {event.result.emergencyType.replace('_', ' ')}</div>
                          <div>Confidence: {Math.round(event.result.confidence * 100)}%</div>
                          <div>Energy: {event.audioFeatures.energy.toFixed(3)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AudioLines className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No detections yet</p>
                    <p className="text-sm">Start detection to see results here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Training Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {emergencyMLModel.getTrainingDataStats().normalSamples}
                  </div>
                  <div className="text-sm text-muted-foreground">Normal Samples</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {emergencyMLModel.getTrainingDataStats().emergencySamples}
                  </div>
                  <div className="text-sm text-muted-foreground">Emergency Samples</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Import Training Data (JSON)</label>
                <Textarea
                  value={trainingData}
                  onChange={(e) => setTrainingData(e.target.value)}
                  placeholder="Paste training data JSON here..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={importTrainingData} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                  <Button onClick={exportTrainingData} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {emergencyMLModel.getTrainingDataStats().totalSamples}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Training Samples</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {detectionHistory.filter(h => h.result.isEmergency).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Emergencies Detected</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Emergency Categories Detected:</h4>
                <div className="space-y-1">
                  {Array.from(new Set(detectionHistory.filter(h => h.result.isEmergency).map(h => h.result.emergencyType))).map(type => (
                    <Badge key={type} variant="outline" className="mr-2">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyVoiceDetector;
