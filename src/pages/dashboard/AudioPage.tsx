
import AudioRecorder from "@/components/AudioRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const AudioPage = () => {
  const [isSoundDetectionActive, setIsSoundDetectionActive] = useState(false);
  
  const handleSoundDetection = (isActive: boolean) => {
    setIsSoundDetectionActive(isActive);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Audio Recording</h2>
      <p className="text-muted-foreground">
        Record audio or activate sound detection for emergency situations.
      </p>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Record & Sound Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioRecorder onSoundDetectionChange={handleSoundDetection} />
          {isSoundDetectionActive && (
            <div className="bg-amber-100 p-2 rounded mt-4 text-sm text-center">
              Sound detection is active. Unusual sounds will trigger an emergency alert.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPage;
