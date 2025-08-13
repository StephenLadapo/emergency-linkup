import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmotionDetector from '@/components/EmotionDetector';
import { Brain, Camera, AlertTriangle, CheckCircle, Info, Play, Code, Database, Smile } from 'lucide-react';
import { toast } from "sonner";

interface EmotionDetection {
  emotion: string;
  confidence: number;
  timestamp: string;
}

const EmotionDetectorDemo: React.FC = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<EmotionDetection | null>(null);
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0
  });
  const [totalDetections, setTotalDetections] = useState(0);

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    // Only count emotions with confidence above 70%
    if (confidence < 0.7) return;
    
    // Update last emotion
    const detection: EmotionDetection = {
      emotion,
      confidence,
      timestamp: new Date().toISOString()
    };
    setLastEmotion(detection);
    
    // Update counts
    setEmotionCounts(prev => ({
      ...prev,
      [emotion]: prev[emotion] + 1 || 1
    }));
    
    setTotalDetections(prev => prev + 1);
  };

  const handleStatusChange = (isActive: boolean) => {
    setIsSystemActive(isActive);
    if (isActive) {
      setTotalDetections(0);
      setEmotionCounts({
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0
      });
    }
  };
  
  // Get emotion color based on the emotion
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Emotion Detection</h1>
          <Smile className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced facial emotion recognition system using deep neural networks to identify emotions from facial expressions in real-time.
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isSystemActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-sm text-muted-foreground">Detection Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {emotionCounts.happy}
              </div>
              <div className="text-sm text-muted-foreground">Happy Detections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalDetections}
              </div>
              <div className="text-sm text-muted-foreground">Total Detections</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${lastEmotion ? getEmotionColor(lastEmotion.emotion) : 'text-gray-500'}`}>
                {lastEmotion ? `${(lastEmotion.confidence * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Last Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="detector" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detector" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Live Detection
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Technical
          </TabsTrigger>
        </TabsList>

        {/* Detector Tab */}
        <TabsContent value="detector" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EmotionDetector 
                onEmotionDetected={handleEmotionDetected}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Instructions and Tips */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    How to Use
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <div className="font-medium">Activate Camera</div>
                        <div className="text-sm text-muted-foreground">
                          Enable your webcam by toggling the Camera switch
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <div className="font-medium">Load Models</div>
                        <div className="text-sm text-muted-foreground">
                          Toggle the Load Models switch to initialize the emotion detection models
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <div className="font-medium">Start Detection</div>
                        <div className="text-sm text-muted-foreground">
                          Toggle the Detect Emotions switch to begin analyzing facial expressions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <div>
                        <div className="font-medium">Express Emotions</div>
                        <div className="text-sm text-muted-foreground">
                          Try different facial expressions to see how the system responds
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emotion Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Emotion Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(emotionCounts).map(([emotion, count]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getEmotionColor(emotion)}>
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          </Badge>
                        </div>
                        <div className="font-medium">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This emotion detection system uses advanced machine learning 
                  to recognize facial expressions and identify emotions in real-time.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time facial analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Convolutional neural network classification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Seven distinct emotion categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Privacy-focused local processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div>
                    <div className="font-medium">Accuracy</div>
                    <div className="text-sm text-muted-foreground">80-90% emotion recognition accuracy</div>
                  </div>
                  <div>
                    <div className="font-medium">Speed</div>
                    <div className="text-sm text-muted-foreground">Real-time processing at 15-30 FPS</div>
                  </div>
                  <div>
                    <div className="font-medium">Privacy</div>
                    <div className="text-sm text-muted-foreground">All processing done locally in your browser</div>
                  </div>
                  <div>
                    <div className="font-medium">Emotions</div>
                    <div className="text-sm text-muted-foreground">Detects happy, sad, angry, fearful, disgusted, surprised, and neutral</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>Framework:</strong> TensorFlow.js</div>
                  <div><strong>Architecture:</strong> Convolutional Neural Network</div>
                  <div><strong>Base Model:</strong> MobileNet</div>
                  <div><strong>Face Detection:</strong> TinyFaceDetector</div>
                  <div><strong>Landmark Detection:</strong> 68-point model</div>
                  <div><strong>Expression Recognition:</strong> FaceExpressionNet</div>
                  <div><strong>Model Size:</strong> ~6MB total</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>Library:</strong> face-api.js</div>
                  <div><strong>Video Processing:</strong> HTML5 Canvas API</div>
                  <div><strong>Frame Rate:</strong> 15-30 FPS (device dependent)</div>
                  <div><strong>Confidence Threshold:</strong> 70%</div>
                  <div><strong>Face Tracking:</strong> Real-time with landmarks</div>
                  <div><strong>Browser Support:</strong> Chrome, Firefox, Safari, Edge</div>
                  <div><strong>Mobile Support:</strong> iOS Safari, Android Chrome</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmotionDetectorDemo;