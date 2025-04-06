
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from "sonner";

interface AudioRecorderProps {
  onSoundDetectionChange?: (isActive: boolean) => void;
}

const AudioRecorder = ({ onSoundDetectionChange }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [soundDetectionActive, setSoundDetectionActive] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordedAudio(audioBlob);
        setAudioURL(audioUrl);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      toast.success('Recording saved');
    }
  };
  
  const toggleSoundDetection = () => {
    const newState = !soundDetectionActive;
    setSoundDetectionActive(newState);
    
    if (onSoundDetectionChange) {
      onSoundDetectionChange(newState);
    }
    
    if (newState) {
      toast.info('Sound detection activated. Monitoring for unusual sounds.');
    } else {
      toast.info('Sound detection deactivated.');
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            {isRecording ? (
              <Mic className="h-10 w-10 text-primary animate-pulse" />
            ) : (
              <Mic className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2 text-center">
            <h3 className="font-medium">Audio Recording</h3>
            <p className="text-sm text-muted-foreground">
              Record audio messages for emergency services
            </p>
          </div>
          
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex items-center">
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex items-center">
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
        
        {audioURL && (
          <div className="mt-4 p-3 border rounded-md">
            <Label className="block mb-2">Recorded Audio</Label>
            <audio controls src={audioURL} className="w-full"></audio>
          </div>
        )}
      </div>
      
      <div className="bg-card border rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound Detection</h3>
              <p className="text-sm text-muted-foreground">
                Monitor for unusual sounds that may indicate an emergency situation
              </p>
            </div>
            <Button 
              variant={soundDetectionActive ? "destructive" : "outline"} 
              onClick={toggleSoundDetection}
              className="ml-2"
            >
              {soundDetectionActive ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </div>
          
          {soundDetectionActive && (
            <div className="text-sm p-2 bg-muted rounded-md">
              <p>Sound detection is active. Unusual sounds will trigger an emergency alert.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
