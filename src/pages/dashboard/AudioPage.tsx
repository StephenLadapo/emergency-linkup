
import EmergencyVoiceDetector from "@/components/EmergencyVoiceDetector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { EmergencyDetectionResult } from "@/utils/EmergencyMLModel";

const AudioPage = () => {
  const [lastEmergencyDetection, setLastEmergencyDetection] = useState<EmergencyDetectionResult | null>(null);
  
  const handleEmergencyDetected = (result: EmergencyDetectionResult) => {
    setLastEmergencyDetection(result);
    // Additional emergency handling logic can be added here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emergency Voice Detection System</h1>
        <p className="text-lg text-muted-foreground mb-1">
          University of Limpopo - Advanced AI-Powered Emergency Response
        </p>
        <p className="text-muted-foreground">
          Real-time machine learning voice analysis for emergency detection and response.
        </p>
      </div>
      
      <EmergencyVoiceDetector onEmergencyDetected={handleEmergencyDetected} />
      
      {lastEmergencyDetection && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Last Emergency Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Type:</strong> {lastEmergencyDetection.emergencyType.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Confidence:</strong> {Math.round(lastEmergencyDetection.confidence * 100)}%</p>
              <p><strong>Time:</strong> {new Date(lastEmergencyDetection.timestamp).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioPage;
