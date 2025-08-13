import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmergencyVoiceDetector from '@/components/EmergencyVoiceDetector';
import { Brain, Mic, AlertTriangle, CheckCircle, Info, Play, Code, Database } from 'lucide-react';
import { toast } from "sonner";

interface EmergencyDetection {
  is_emergency: boolean;
  confidence: number;
  class_label: string;
  timestamp: string;
  audio_duration: number;
}

const EmergencyVoiceDemo: React.FC = () => {
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [totalDetections, setTotalDetections] = useState(0);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [lastEmergency, setLastEmergency] = useState<EmergencyDetection | null>(null);

  const handleEmergencyDetected = (detection: EmergencyDetection) => {
    setEmergencyCount(prev => prev + 1);
    setTotalDetections(prev => prev + 1);
    setLastEmergency(detection);
    
    // In a real application, this would trigger emergency protocols
    console.log('Emergency detected:', detection);
    
    // Show emergency alert
    toast.error(`🚨 EMERGENCY DETECTED! Confidence: ${(detection.confidence * 100).toFixed(1)}%`, {
      duration: 10000,
    });
  };

  const handleStatusChange = (isActive: boolean) => {
    setIsSystemActive(isActive);
    if (isActive) {
      setTotalDetections(0);
      setEmergencyCount(0);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Emergency Voice Recognition</h1>
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced machine learning system for real-time emergency voice detection. 
          Uses deep neural networks to identify emergency situations from audio input.
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
              <div className="text-2xl font-bold text-red-600">
                {emergencyCount}
              </div>
              <div className="text-sm text-muted-foreground">Emergencies Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalDetections}
              </div>
              <div className="text-sm text-muted-foreground">Total Detections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {lastEmergency ? `${(lastEmergency.confidence * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Last Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="detector" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detector" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
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
          <TabsTrigger value="dataset" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dataset
          </TabsTrigger>
        </TabsList>

        {/* Live Detection Tab */}
        <TabsContent value="detector" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emergency Voice Detector */}
            <div>
              <EmergencyVoiceDetector
                onEmergencyDetected={handleEmergencyDetected}
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
                        <div className="font-medium">Start Detection</div>
                        <div className="text-sm text-muted-foreground">
                          Click "Start Detection" to begin monitoring
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <div className="font-medium">Speak Normally</div>
                        <div className="text-sm text-muted-foreground">
                          The system continuously analyzes your voice
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <div className="font-medium">Emergency Detection</div>
                        <div className="text-sm text-muted-foreground">
                          System alerts when emergency phrases are detected
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Phrases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="font-medium text-red-600">Emergency Phrases:</div>
                      <div className="text-sm text-muted-foreground">
                        "Help me please!", "Call the police!", "I'm in danger!", "Emergency!"
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">Normal Phrases:</div>
                      <div className="text-sm text-muted-foreground">
                        "Hello, how are you?", "The weather is nice", "I'm going to the store"
                      </div>
                    </div>
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
                  This emergency voice recognition system uses advanced machine learning 
                  to detect emergency situations from audio input in real-time.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time audio processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Deep neural network classification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Configurable confidence thresholds</span>
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
                    <div className="text-sm text-muted-foreground">85-95% detection accuracy</div>
                  </div>
                  <div>
                    <div className="font-medium">Speed</div>
                    <div className="text-sm text-muted-foreground">Sub-second response time</div>
                  </div>
                  <div>
                    <div className="font-medium">Privacy</div>
                    <div className="text-sm text-muted-foreground">Audio processed locally</div>
                  </div>
                  <div>
                    <div className="font-medium">Integration</div>
                    <div className="text-sm text-muted-foreground">REST API for easy integration</div>
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
                  <div><strong>Framework:</strong> TensorFlow/Keras</div>
                  <div><strong>Architecture:</strong> Deep Neural Network</div>
                  <div><strong>Input Features:</strong> 45 audio features</div>
                  <div><strong>Layers:</strong> 6 dense layers with dropout</div>
                  <div><strong>Activation:</strong> ReLU + Sigmoid output</div>
                  <div><strong>Optimizer:</strong> Adam</div>
                  <div><strong>Loss:</strong> Binary crossentropy</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div><strong>Sample Rate:</strong> 22,050 Hz</div>
                  <div><strong>Duration:</strong> 3 seconds</div>
                  <div><strong>Features:</strong> MFCC, Spectral, Chroma</div>
                  <div><strong>Processing:</strong> Real-time chunks</div>
                  <div><strong>Format:</strong> WAV/WebM</div>
                  <div><strong>Channels:</strong> Mono</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 text-sm font-mono">
                  <div><Badge variant="outline">GET</Badge> /health</div>
                  <div><Badge variant="outline">POST</Badge> /predict</div>
                  <div><Badge variant="outline">POST</Badge> /predict_file</div>
                  <div><Badge variant="outline">GET</Badge> /model_info</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 text-sm">
                  <div>Accuracy: <Badge variant="secondary">90%+</Badge></div>
                  <div>Precision: <Badge variant="secondary">85%+</Badge></div>
                  <div>Recall: <Badge variant="secondary">90%+</Badge></div>
                  <div>Latency: <Badge variant="secondary">&lt;500ms</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dataset Tab */}
        <TabsContent value="dataset" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Dataset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Emergency Samples:</span>
                    <Badge variant="destructive">300</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Normal Samples:</span>
                    <Badge variant="secondary">300</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Samples:</span>
                    <Badge variant="outline">600</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Synthetic dataset generated using text-to-speech with audio effects 
                  to simulate real-world emergency and normal speech patterns.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Stress simulation for emergencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Background noise variation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Speed and pitch variations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The synthetic dataset provides a solid foundation for emergency detection. 
              For production use, consider training with real emergency audio data 
              (following appropriate privacy and ethical guidelines).
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyVoiceDemo;