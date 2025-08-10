
import EmergencyVoiceDetector from "@/components/EmergencyVoiceDetector";

const AudioPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Emergency Voice Detection</h2>
        <p className="text-muted-foreground">
          AI-powered voice recognition system that continuously monitors for emergency phrases and triggers instant alerts.
        </p>
      </div>
      
      <EmergencyVoiceDetector />
    </div>
  );
};

export default AudioPage;
