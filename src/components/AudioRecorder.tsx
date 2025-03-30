
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Play, Pause, Save } from 'lucide-react';
import { toast } from "sonner";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDetected, setAudioDetected] = useState(false);
  const [emergencyDetectionTimer, setEmergencyDetectionTimer] = useState<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  
  // Start recording function
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      // Set up audio analysis for emergency sound detection
      setupAudioAnalysis(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer for recording duration
      timerId.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      toast.success("Recording started");
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Could not start recording. Please check microphone permissions.");
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (emergencyDetectionTimer) {
        clearTimeout(emergencyDetectionTimer);
        setEmergencyDetectionTimer(null);
      }
      setIsRecording(false);
      cleanupAudioAnalysis();
      toast.success("Recording stopped");
    }
  };
  
  // Set up audio analysis for emergency sound detection
  const setupAudioAnalysis = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // If loud sound detected (threshold can be adjusted)
      if (average > 130) {
        setAudioDetected(true);
        
        // Start emergency detection timer if not already started
        if (!emergencyDetectionTimer) {
          const timer = setTimeout(() => {
            detectEmergency();
          }, 120000); // 120 seconds = 2 minutes
          
          setEmergencyDetectionTimer(timer);
          toast.warning("Loud sound detected! Emergency request will be sent in 2 minutes if not canceled.", {
            duration: 10000,
            action: {
              label: "Cancel",
              onClick: () => {
                if (emergencyDetectionTimer) {
                  clearTimeout(emergencyDetectionTimer);
                  setEmergencyDetectionTimer(null);
                  toast.info("Emergency detection canceled");
                  setAudioDetected(false);
                }
              },
            },
          });
        }
      }
      
      // Continue checking
      if (isRecording) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    checkAudioLevel();
  };
  
  // Detect emergency function (would use ML in a real app)
  const detectEmergency = () => {
    // In a real app, this would use machine learning to analyze sounds
    console.log("Emergency detection triggered after timeout");
    
    // Send emergency request
    toast.error("Emergency detected! Sending emergency request.", {
      duration: 10000,
    });
    
    // Here you would call your emergency request API
    console.log("Emergency request sent automatically");
    
    setEmergencyDetectionTimer(null);
    setAudioDetected(false);
  };
  
  // Clean up audio analysis
  const cleanupAudioAnalysis = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };
  
  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!audioBlob) return;
    
    if (!audioPlayerRef.current) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audioPlayerRef.current = audio;
    }
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Save recording
  const saveRecording = () => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `emergency-recording-${new Date().toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Recording saved to your device");
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (emergencyDetectionTimer) {
        clearTimeout(emergencyDetectionTimer);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      cleanupAudioAnalysis();
    };
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Audio Recorder
        </CardTitle>
        <CardDescription>
          Record audio during emergency situations
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {audioDetected && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 animate-pulse">
            Loud sound detected - monitoring for emergency
          </div>
        )}
        
        <div className="flex justify-center mb-4">
          <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center ${
            isRecording ? 'border-destructive animate-pulse' : 'border-muted'
          }`}>
            {isRecording ? (
              <Mic className="h-10 w-10 text-destructive" />
            ) : (
              <MicOff className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {isRecording && (
          <div className="text-lg font-mono mb-4">{formatTime(recordingTime)}</div>
        )}
        
        {audioBlob && !isRecording && (
          <div className="flex justify-center gap-4 mt-4 mb-2">
            <Button variant="outline" size="icon" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={saveRecording}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isRecording ? "outline" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AudioRecorder;
