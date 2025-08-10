import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Mic, MicOff, Play, Pause, Plus, Trash2, Shield, Heart, Flame, AlertCircle } from 'lucide-react';
import { EmergencyVoiceRecognition, EmergencyDetection, EmergencyPhrase } from '@/utils/EmergencyVoiceRecognition';
import { useToast } from '@/components/ui/use-toast';

const EmergencyVoiceDetector: React.FC = () => {
  const [recognizer] = useState(() => new EmergencyVoiceRecognition());
  const [isListening, setIsListening] = useState(false);
  const [detections, setDetections] = useState<EmergencyDetection[]>([]);
  const [phrases, setPhrases] = useState<EmergencyPhrase[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [newCategory, setNewCategory] = useState<EmergencyPhrase['category']>('general');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    setDetections(recognizer.getDetectionHistory());
    setPhrases(recognizer.getEmergencyPhrases());
  }, [recognizer]);

  const handleEmergencyDetected = useCallback(async (detection: EmergencyDetection) => {
    setDetections(prev => [detection, ...prev.slice(0, 99)]); // Keep latest 100
    
    // Auto-send emergency alert
    const alertSent = await recognizer.sendEmergencyAlert(detection);
    
    toast({
      title: "🚨 Emergency Detected!",
      description: `"${detection.detectedPhrase}" - ${detection.category} (${Math.round(detection.confidence * 100)}% confidence)`,
      variant: alertSent ? "default" : "destructive",
    });

    // Play alert sound
    try {
      const audio = new Audio('/emergency-alert.mp3'); // You'll need to add this file
      audio.play().catch(() => {
        // Fallback: use Web Audio API to generate alert tone
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  }, [recognizer, toast]);

  const startListening = async () => {
    try {
      await recognizer.startListening(handleEmergencyDetected);
      setIsListening(true);
      toast({
        title: "Voice Detection Started",
        description: "Now monitoring for emergency phrases in the background",
      });
    } catch (error) {
      toast({
        title: "Failed to Start Detection",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    recognizer.stopListening();
    setIsListening(false);
    toast({
      title: "Voice Detection Stopped",
      description: "No longer monitoring for emergency phrases",
    });
  };

  const addCustomPhrase = () => {
    if (!newPhrase.trim()) return;
    
    recognizer.addCustomPhrase(newPhrase.trim().toLowerCase(), newCategory);
    setPhrases(recognizer.getEmergencyPhrases());
    setNewPhrase('');
    
    toast({
      title: "Phrase Added",
      description: `"${newPhrase}" added to ${newCategory} category`,
    });
  };

  const removePhrase = (phrase: string) => {
    recognizer.removePhrase(phrase);
    setPhrases(recognizer.getEmergencyPhrases());
    
    toast({
      title: "Phrase Removed",
      description: `"${phrase}" removed from detection`,
    });
  };

  const playAudioClip = (detection: EmergencyDetection) => {
    if (!detection.audioClip) return;

    if (currentAudio) {
      currentAudio.pause();
      setPlayingId(null);
    }

    if (playingId === detection.id) {
      setCurrentAudio(null);
      setPlayingId(null);
      return;
    }

    const audio = new Audio(detection.audioClip);
    audio.onended = () => {
      setPlayingId(null);
      setCurrentAudio(null);
    };
    
    audio.play();
    setCurrentAudio(audio);
    setPlayingId(detection.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <Heart className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-red-500';
      case 'security': return 'bg-blue-500';
      case 'fire': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Emergency Voice Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className="gap-2"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop Detection' : 'Start Detection'}
              </Button>
              
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Listening for emergencies...</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Detections</div>
              <div className="text-2xl font-bold text-primary">{detections.length}</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>This system continuously monitors speech for emergency phrases like "help", "I'm hurt", "call security", etc.</p>
            <p>When detected, it automatically logs the event and triggers an emergency alert.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Detections */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {detections.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No emergency detections yet
                </div>
              ) : (
                <div className="space-y-3">
                  {detections.map((detection) => (
                    <div key={detection.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getCategoryColor(detection.category)} text-white gap-1`}>
                          {getCategoryIcon(detection.category)}
                          {detection.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {detection.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Detected:</strong> "{detection.detectedPhrase}"
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {Math.round(detection.confidence * 100)}%
                        </span>
                        
                        {detection.audioClip && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAudioClip(detection)}
                            className="gap-1"
                          >
                            {playingId === detection.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            Audio
                          </Button>
                        )}
                      </div>
                      
                      {detection.location && (
                        <div className="text-xs text-muted-foreground">
                          Location: {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Emergency Phrases Management */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Phrase */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter emergency phrase..."
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomPhrase()}
                  />
                  <Select value={newCategory} onValueChange={(value: EmergencyPhrase['category']) => setNewCategory(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomPhrase} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Phrases List */}
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {phrases.map((phrase, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(phrase.category)}
                          {phrase.category}
                        </Badge>
                        <span className="text-sm">"{phrase.phrase}"</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(phrase.confidence * 100)}%
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePhrase(phrase.phrase)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyVoiceDetector;