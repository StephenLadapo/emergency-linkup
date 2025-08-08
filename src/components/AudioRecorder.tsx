
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Save, Play, Trash, File } from 'lucide-react';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface AudioRecorderProps {
  onSoundDetectionChange?: (isActive: boolean) => void;
}

type EmergencySoundPattern = {
  id: number;
  name: string;
  description: string;
  audioBlob?: Blob;
  audioUrl?: string;
  timestamp: string;
};

const AudioRecorder = ({ onSoundDetectionChange }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [soundDetectionActive, setSoundDetectionActive] = useState(false);
  const [savedPatterns, setSavedPatterns] = useState<EmergencySoundPattern[]>([]);
  const [newPatternName, setNewPatternName] = useState('');
  const [newPatternDescription, setNewPatternDescription] = useState('');
  const [analysingAudio, setAnalysingAudio] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const detectionMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const detectionStreamRef = useRef<MediaStream | null>(null);
  const lastAlertRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Load saved sound patterns from localStorage
    const loadSavedPatterns = () => {
      try {
        const patterns = localStorage.getItem('emergencySoundPatterns');
        if (patterns) {
          const parsedPatterns = JSON.parse(patterns);
          
          // Recreate audio URLs for saved patterns
          const patternsWithUrls = parsedPatterns.map((pattern: EmergencySoundPattern) => {
            if (pattern.audioBlob) {
              const blob = new Blob([new Uint8Array(Object.values(pattern.audioBlob))], { type: 'audio/wav' });
              return {
                ...pattern,
                audioBlob: blob,
                audioUrl: URL.createObjectURL(blob)
              };
            }
            return pattern;
          });
          
          setSavedPatterns(patternsWithUrls);
        }
      } catch (error) {
        console.error('Error loading saved sound patterns:', error);
      }
    };
    
    loadSavedPatterns();
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context and analyser for future sound detection
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      audioAnalyserRef.current = audioContext.createAnalyser();
      audioSourceRef.current = audioContext.createMediaStreamSource(stream);
      audioSourceRef.current.connect(audioAnalyserRef.current);
      
      audioAnalyserRef.current.fftSize = 2048;
      
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
      
      // Add to history
      addToHistory('audio', 'Started audio recording');
      
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
      
      // Add to history
      addToHistory('audio', 'Stopped audio recording');
      
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
      startSoundAnalysis();
      
      // Add to history
      addToHistory('audio', 'Sound detection activated');
      
      toast.info('Sound detection activated. Monitoring for unusual sounds.');
    } else {
      stopSoundAnalysis();
      
      // Add to history
      addToHistory('audio', 'Sound detection deactivated');
      
      toast.info('Sound detection deactivated.');
    }
  };
  
  const startSoundAnalysis = async () => {
    // Proceed with real-time voice analysis

    try {
      setAnalysingAudio(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      audioAnalyserRef.current = audioContext.createAnalyser();
      audioSourceRef.current = audioContext.createMediaStreamSource(stream);
      audioSourceRef.current.connect(audioAnalyserRef.current);
      
      audioAnalyserRef.current.fftSize = 2048;
      
      // Real-time emergency voice detection using edge function
      const mimeType = 'audio/webm';
      const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve((res.split(',')[1]) || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      detectionStreamRef.current = stream;
      try {
        detectionMediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        // Fallback if mimeType unsupported
        detectionMediaRecorderRef.current = new MediaRecorder(stream);
      }

      detectionMediaRecorderRef.current.ondataavailable = async (e) => {
        if (!soundDetectionActive) return;
        if (!e.data || e.data.size < 1024) return; // ignore tiny chunks
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        try {
          const base64 = await blobToBase64(e.data);
          const { data, error } = await supabase.functions.invoke('emergency-analyze', {
            body: { audio: base64, mimeType: e.data.type || mimeType },
          });
          if (error) {
            console.error('Emergency analyze error:', error);
            return;
          }
          if (data?.is_emergency) {
            const now = Date.now();
            if (now - (lastAlertRef.current || 0) > 30000) {
              lastAlertRef.current = now;
              const matched = Array.isArray(data.matched_keywords) ? data.matched_keywords.join(', ') : undefined;
              addToHistory(
                'emergency',
                `Emergency voice detected${matched ? ` (${matched})` : ''}${data?.confidence ? ` [confidence: ${Math.round((data.confidence as number) * 100)}%]` : ''}`,
                'sent'
              );
              toast.success(`Emergency detected and alert sent${data?.transcript ? `: ${data.transcript}` : ''}`, {
                duration: 10000,
              });
            }
          }
        } catch (err) {
          console.error('Chunk analysis failed:', err);
        } finally {
          inFlightRef.current = false;
        }
      };

      detectionMediaRecorderRef.current.start(5000); // analyze every 5s
    } catch (err) {
      console.error('Error accessing microphone for sound analysis:', err);
      toast.error('Could not access microphone for sound detection.');
      setSoundDetectionActive(false);
      setAnalysingAudio(false);
    }
  };
  
  const stopSoundAnalysis = () => {
    setAnalysingAudio(false);
    
    // Stop detection recorder and stream
    if (detectionMediaRecorderRef.current && detectionMediaRecorderRef.current.state !== 'inactive') {
      try { detectionMediaRecorderRef.current.stop(); } catch (_) {}
      detectionMediaRecorderRef.current = null;
    }
    if (detectionStreamRef.current) {
      try { detectionStreamRef.current.getTracks().forEach(t => t.stop()); } catch (_) {}
      detectionStreamRef.current = null;
    }

    // Clean up any audio analysis resources
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };
  
  const savePattern = () => {
    if (!recordedAudio) {
      toast.error('Please record audio first');
      return;
    }
    
    if (!newPatternName.trim()) {
      toast.error('Please provide a name for this sound pattern');
      return;
    }
    
    // Create new pattern
    const newPattern: EmergencySoundPattern = {
      id: Date.now(),
      name: newPatternName,
      description: newPatternDescription,
      audioBlob: recordedAudio,
      audioUrl: audioURL || undefined,
      timestamp: new Date().toISOString()
    };
    
    const updatedPatterns = [...savedPatterns, newPattern];
    setSavedPatterns(updatedPatterns);
    
    // Serialize and save to localStorage
    try {
      const serializedPatterns = JSON.stringify(updatedPatterns.map(pattern => ({
        ...pattern,
        // Convert Blob to array buffer for storage
        audioBlob: pattern.audioBlob ? Array.from(new Uint8Array(pattern.audioBlob as any)) : undefined,
        audioUrl: undefined // Don't store URLs, recreate them on load
      })));
      
      localStorage.setItem('emergencySoundPatterns', serializedPatterns);
      
      // Add to history
      addToHistory('audio', `Saved new emergency sound pattern: ${newPatternName}`);
      
      toast.success('Emergency sound pattern saved successfully');
      
      // Reset form
      setNewPatternName('');
      setNewPatternDescription('');
      setRecordedAudio(null);
      setAudioURL(null);
    } catch (error) {
      console.error('Error saving sound pattern:', error);
      toast.error('Error saving sound pattern');
    }
  };
  
  const deletePattern = (id: number) => {
    const patternToDelete = savedPatterns.find(p => p.id === id);
    const filteredPatterns = savedPatterns.filter(pattern => pattern.id !== id);
    
    setSavedPatterns(filteredPatterns);
    
    // Update localStorage
    try {
      const serializedPatterns = JSON.stringify(filteredPatterns.map(pattern => ({
        ...pattern,
        audioBlob: pattern.audioBlob ? Array.from(new Uint8Array(pattern.audioBlob as any)) : undefined,
        audioUrl: undefined
      })));
      
      localStorage.setItem('emergencySoundPatterns', serializedPatterns);
      
      // Add to history
      if (patternToDelete) {
        addToHistory('audio', `Deleted emergency sound pattern: ${patternToDelete.name}`);
      }
      
      toast.success('Pattern deleted');
    } catch (error) {
      console.error('Error updating sound patterns:', error);
    }
  };
  
  // Function to add events to user history
  const addToHistory = (type: string, description: string, status?: string) => {
    try {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const historyItem = {
        id: Date.now(),
        type,
        timestamp: formattedDate,
        description,
        status
      };
      
      const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
      userHistory.unshift(historyItem);
      localStorage.setItem('userHistory', JSON.stringify(userHistory));
    } catch (error) {
      console.error('Error adding history item:', error);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clean up audio analysis resources
      stopSoundAnalysis();
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`h-24 w-24 rounded-full ${isRecording ? 'bg-red-500/10 animate-pulse' : 'bg-primary/10'} flex items-center justify-center`}>
            {isRecording ? (
              <Mic className="h-10 w-10 text-red-500 animate-pulse" />
            ) : (
              <Mic className="h-10 w-10 text-primary" />
            )}
          </div>
          
          <div className="space-y-2 text-center">
            <h3 className="font-medium">Audio Recording</h3>
            <p className="text-sm text-muted-foreground">
              Record emergency sound patterns for system recognition
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
            <audio controls src={audioURL} className="w-full mb-3"></audio>
            
            <div className="grid gap-3">
              <div>
                <Label htmlFor="patternName">Sound Pattern Name</Label>
                <Input 
                  id="patternName"
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                  placeholder="e.g., Fire Alarm, Breaking Glass, Scream"
                  className="mb-2"
                />
              </div>
              
              <div>
                <Label htmlFor="patternDescription">Description (Optional)</Label>
                <Input 
                  id="patternDescription"
                  value={newPatternDescription}
                  onChange={(e) => setNewPatternDescription(e.target.value)}
                  placeholder="Describe this sound pattern"
                />
              </div>
              
              <Button onClick={savePattern} className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save as Emergency Sound Pattern
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-card border rounded-lg">
        <CardHeader>
          <CardTitle>Emergency Sound Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedPatterns.length > 0 ? (
            <ScrollArea className="h-60">
              <div className="space-y-4">
                {savedPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{pattern.name}</div>
                        {pattern.description && <div className="text-sm text-muted-foreground">{pattern.description}</div>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deletePattern(pattern.id)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    {pattern.audioUrl && (
                      <div className="mt-2">
                        <audio controls src={pattern.audioUrl} className="w-full h-8"></audio>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Saved on: {new Date(pattern.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No sound patterns saved yet</p>
              <p className="text-sm">Record and save emergency sounds for detection</p>
            </div>
          )}
        </CardContent>
      </div>
      
      <div className="bg-card border rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound Detection</h3>
              <p className="text-sm text-muted-foreground">
                Monitor for emergency sound patterns that match saved recordings
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
          
          {analysingAudio && (
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-900/30 animate-pulse">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-amber-500 rounded-full mr-2"></div>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Actively monitoring for emergency sounds...
                </p>
              </div>
            </div>
          )}
          
          
          {soundDetectionActive && (
            <div className="text-sm p-2 bg-amber-100 dark:bg-amber-900/10 rounded-md">
              <p>Sound detection is active. Emergency alerts will trigger when matching sounds are detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
