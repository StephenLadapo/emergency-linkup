import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, AlertTriangle, CheckCircle, Activity, Settings, Smile } from 'lucide-react';
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmotionDetectorProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
  onStatusChange?: (isActive: boolean) => void;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ 
  onEmotionDetected, 
  onStatusChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [detectionFrequency, setDetectionFrequency] = useState<number>(500); // ms
  
  const detectionRef = useRef<number | null>(null);
  
  // Load face-api models
  const loadModels = async () => {
    try {
      setLoadingProgress(10);
      setErrorMessage('');
      
      // Load models from public directory
      const MODEL_URL = '/models';
      
      // Load models sequentially to ensure proper loading
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoadingProgress(40);
        
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setLoadingProgress(60);
        
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setLoadingProgress(80);
        
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setLoadingProgress(100);
      } catch (modelError) {
        console.error('Error loading specific model:', modelError);
        throw modelError;
      }
      
      setIsModelLoaded(true);
      toast.success('Emotion detection models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      setErrorMessage('Failed to load emotion detection models. Please try again.');
      toast.error('Failed to load emotion detection models');
    }
  };
  
  // Start webcam
  const startWebcam = async () => {
    if (!videoRef.current) return;
    
    try {
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
        toast.success('Camera activated');
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setErrorMessage('Failed to access webcam. Please check permissions and try again.');
      toast.error('Failed to access webcam');
    }
  };
  
  // Stop webcam
  const stopWebcam = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setIsWebcamActive(false);
    
    // Also stop detection if it's running
    if (isDetecting) {
      stopDetection();
    }
    
    toast.info('Camera deactivated');
  };
  
  // Start face detection
  const startDetection = () => {
    if (!isModelLoaded || !isWebcamActive || !videoRef.current || !canvasRef.current) {
      toast.error('Please ensure camera and models are loaded before starting detection');
      return;
    }
    
    setIsDetecting(true);
    if (onStatusChange) onStatusChange(true);
    toast.success('Emotion detection started');
    
    // Start detection loop
    detectEmotions();
  };
  
  // Stop face detection
  const stopDetection = () => {
    if (detectionRef.current) {
      // Clear both setTimeout and cancelAnimationFrame to ensure proper cleanup
      window.clearTimeout(detectionRef.current);
      cancelAnimationFrame(detectionRef.current);
      detectionRef.current = null;
    }
    
    setIsDetecting(false);
    if (onStatusChange) onStatusChange(false);
    toast.info('Emotion detection stopped');
  };
  
  // Detect emotions
  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.readyState !== 4) {
      detectionRef.current = requestAnimationFrame(detectEmotions);
      return;
    }
    
    // Set canvas dimensions to match video
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    
    try {
      // Detect faces with expressions using optimized options
      const tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,  // smaller input size for better performance
        scoreThreshold: 0.5  // minimum confidence threshold
      });
      
      const detections = await faceapi
        .detectAllFaces(video, tinyFaceDetectorOptions)
        .withFaceLandmarks()
        .withFaceExpressions();
      
      // Resize detections to match display size
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      // Clear canvas and draw detections
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face detections
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        
        // Process emotions if faces detected
        if (resizedDetections.length > 0) {
          const expressions = resizedDetections[0].expressions;
          let highestExpression = 'neutral';
          let highestConfidence = 0;
          
          // Find the emotion with highest confidence
          Object.entries(expressions).forEach(([emotion, confidence]) => {
            if (confidence > highestConfidence) {
              highestConfidence = confidence;
              highestExpression = emotion;
            }
          });
          
          // Update state with detected emotion
          setCurrentEmotion(highestExpression);
          setEmotionConfidence(highestConfidence);
          
          // Call callback if provided
          if (onEmotionDetected) {
            onEmotionDetected(highestExpression, highestConfidence);
          }
        }
      }
    } catch (error) {
      console.error('Error during emotion detection:', error);
      // Don't stop the detection loop on error, just continue
    }
    
    // Continue detection loop with a slight delay to improve performance
    detectionRef.current = window.setTimeout(() => {
      requestAnimationFrame(detectEmotions);
    }, detectionFrequency);
  };
  
  // Get emotion color based on the detected emotion
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      happy: 'text-yellow-500',
      sad: 'text-blue-500',
      angry: 'text-red-600',
      fearful: 'text-purple-500',
      disgusted: 'text-green-600',
      surprised: 'text-pink-500',
      neutral: 'text-gray-500'
    };
    
    return colors[emotion] || 'text-gray-500';
  };
  
  // Get emotion badge variant based on the detected emotion
  const getEmotionVariant = (emotion: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      happy: 'default',
      sad: 'secondary',
      angry: 'destructive',
      fearful: 'secondary',
      disgusted: 'destructive',
      surprised: 'default',
      neutral: 'outline'
    };
    
    return variants[emotion] || 'outline';
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (detectionRef.current) {
        window.clearTimeout(detectionRef.current);
        cancelAnimationFrame(detectionRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5" />
          Emotion Detector
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Video and canvas container */}
        <div className="relative rounded-md overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full"
          />
          
          {/* Loading overlay */}
          {!isModelLoaded && loadingProgress > 0 && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
              <Activity className="h-8 w-8 text-primary animate-pulse mb-2" />
              <div className="text-center mb-2 text-white">Loading emotion detection models...</div>
              <Progress value={loadingProgress} className="w-full max-w-xs" />
              <div className="text-xs text-white/70 mt-1">{loadingProgress}%</div>
              {loadingProgress === 100 && (
                <div className="text-xs text-green-400 mt-2">Finalizing model initialization...</div>
              )}
            </div>
          )}
          
          {/* Camera inactive overlay */}
          {!isWebcamActive && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
              <CameraOff className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-center text-white">Camera is not active</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={startWebcam}
              >
                <Camera className="h-4 w-4 mr-2" />
                Activate Camera
              </Button>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Webcam toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="webcam-toggle" className="font-medium">Camera</Label>
              <span className="text-xs text-muted-foreground">
                {isWebcamActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Switch
              id="webcam-toggle"
              checked={isWebcamActive}
              onCheckedChange={(checked) => {
                if (checked) {
                  startWebcam();
                } else {
                  stopWebcam();
                }
              }}
            />
          </div>
          
          {/* Model toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="model-toggle" className="font-medium">Load Models</Label>
              <span className="text-xs text-muted-foreground">
                {isModelLoaded ? 'Loaded' : 'Not loaded'}
              </span>
            </div>
            <Switch
              id="model-toggle"
              checked={isModelLoaded}
              onCheckedChange={(checked) => {
                if (checked && !isModelLoaded) {
                  loadModels();
                }
              }}
              disabled={isModelLoaded}
            />
          </div>
          
          {/* Detection toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="detection-toggle" className="font-medium">Detect Emotions</Label>
              <span className="text-xs text-muted-foreground">
                {isDetecting ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Switch
              id="detection-toggle"
              checked={isDetecting}
              onCheckedChange={(checked) => {
                if (checked) {
                  startDetection();
                } else {
                  stopDetection();
                }
              }}
              disabled={!isModelLoaded || !isWebcamActive}
            />
          </div>
          
          {/* Performance control */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="performance-setting" className="font-medium">Performance</Label>
              <span className="text-xs text-muted-foreground">
                {detectionFrequency <= 100 ? 'High' : detectionFrequency <= 300 ? 'Medium' : 'Low'}
              </span>
            </div>
            <select 
              id="performance-setting"
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
              value={detectionFrequency}
              onChange={(e) => setDetectionFrequency(Number(e.target.value))}
              disabled={isDetecting}
            >
              <option value="100">High (100ms)</option>
              <option value="300">Medium (300ms)</option>
              <option value="500">Low (500ms)</option>
            </select>
          </div>
        </div>
        
        {/* Current emotion display */}
        {isDetecting && (
          <div className="mt-4 p-4 border rounded-md bg-muted/20">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Current Emotion</div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={getEmotionVariant(currentEmotion)}>
                  {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                </Badge>
                <span className={`text-sm font-medium ${getEmotionColor(currentEmotion)}`}>
                  {(emotionConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <Progress 
              value={emotionConfidence * 100} 
              className="mt-2" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionDetector;