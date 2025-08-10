import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use browser cache
env.allowLocalModels = false;
env.allowRemoteModels = true;

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export interface EmergencyPhrase {
  phrase: string;
  category: 'medical' | 'security' | 'fire' | 'general';
  confidence: number;
}

export interface EmergencyDetection {
  id: string;
  timestamp: Date;
  detectedPhrase: string;
  category: string;
  confidence: number;
  audioClip?: string;
  location?: { lat: number; lng: number };
}

export class EmergencyVoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private emergencyPhrases: EmergencyPhrase[] = [];
  private detectionHistory: EmergencyDetection[] = [];
  private onEmergencyDetected?: (detection: EmergencyDetection) => void;
  private whisperPipeline: any = null;

  constructor() {
    this.loadEmergencyPhrases();
    this.initializeWhisper();
  }

  private async initializeWhisper() {
    try {
      // Initialize Whisper for offline transcription
      this.whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('Whisper initialization failed, using Web Speech API only:', error);
    }
  }

  private loadEmergencyPhrases() {
    // Default emergency phrases - can be configured
    this.emergencyPhrases = [
      // Medical emergencies
      { phrase: 'help me', category: 'medical', confidence: 0.9 },
      { phrase: 'i\'m hurt', category: 'medical', confidence: 0.95 },
      { phrase: 'i need medical help', category: 'medical', confidence: 0.95 },
      { phrase: 'call an ambulance', category: 'medical', confidence: 0.9 },
      { phrase: 'medical emergency', category: 'medical', confidence: 0.95 },
      { phrase: 'i can\'t breathe', category: 'medical', confidence: 0.95 },
      { phrase: 'chest pain', category: 'medical', confidence: 0.85 },
      { phrase: 'heart attack', category: 'medical', confidence: 0.9 },
      
      // Security emergencies
      { phrase: 'call security', category: 'security', confidence: 0.9 },
      { phrase: 'help me please', category: 'security', confidence: 0.8 },
      { phrase: 'someone is attacking me', category: 'security', confidence: 0.95 },
      { phrase: 'i\'m being followed', category: 'security', confidence: 0.85 },
      { phrase: 'intruder', category: 'security', confidence: 0.9 },
      { phrase: 'robbery', category: 'security', confidence: 0.9 },
      { phrase: 'call the police', category: 'security', confidence: 0.85 },
      
      // Fire emergencies
      { phrase: 'fire', category: 'fire', confidence: 0.9 },
      { phrase: 'smoke', category: 'fire', confidence: 0.8 },
      { phrase: 'building is on fire', category: 'fire', confidence: 0.95 },
      { phrase: 'call fire department', category: 'fire', confidence: 0.9 },
      
      // General emergencies
      { phrase: 'emergency', category: 'general', confidence: 0.8 },
      { phrase: 'help', category: 'general', confidence: 0.7 },
      { phrase: 'urgent help needed', category: 'general', confidence: 0.9 },
      { phrase: 'call for help', category: 'general', confidence: 0.8 },
      { phrase: 'mayday', category: 'general', confidence: 0.95 },
      { phrase: 'sos', category: 'general', confidence: 0.95 }
    ];

    // Load custom phrases from localStorage
    const customPhrases = localStorage.getItem('emergency_phrases');
    if (customPhrases) {
      try {
        const parsed = JSON.parse(customPhrases);
        this.emergencyPhrases = [...this.emergencyPhrases, ...parsed];
      } catch (error) {
        console.error('Failed to load custom phrases:', error);
      }
    }
  }

  public addCustomPhrase(phrase: string, category: EmergencyPhrase['category'], confidence: number = 0.8) {
    const newPhrase: EmergencyPhrase = { phrase: phrase.toLowerCase(), category, confidence };
    this.emergencyPhrases.push(newPhrase);
    this.saveCustomPhrases();
  }

  public removePhrase(phrase: string) {
    this.emergencyPhrases = this.emergencyPhrases.filter(p => p.phrase !== phrase.toLowerCase());
    this.saveCustomPhrases();
  }

  private saveCustomPhrases() {
    const customPhrases = this.emergencyPhrases.filter(p => 
      !this.getDefaultPhrases().find(dp => dp.phrase === p.phrase)
    );
    localStorage.setItem('emergency_phrases', JSON.stringify(customPhrases));
  }

  private getDefaultPhrases(): EmergencyPhrase[] {
    // Return just the default phrases for comparison
    return this.emergencyPhrases.slice(0, 26); // First 26 are default
  }

  public async startListening(onEmergencyDetected: (detection: EmergencyDetection) => void) {
    this.onEmergencyDetected = onEmergencyDetected;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;

    // Start audio recording for clips
    await this.startAudioRecording();

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        
        if (event.results[i].isFinal) {
          this.analyzeTranscript(transcript);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Auto-restart on error (unless manually stopped)
      if (this.isListening && event.error !== 'aborted') {
        setTimeout(() => {
          if (this.isListening) {
            this.recognition?.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart unless manually stopped
      if (this.isListening) {
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            this.recognition.start();
          }
        }, 100);
      }
    };

    this.isListening = true;
    this.recognition.start();
    
    console.log('Emergency voice recognition started');
  }

  private async startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Record in 10-second chunks
      this.mediaRecorder.start(10000);
    } catch (error) {
      console.error('Failed to start audio recording:', error);
    }
  }

  private analyzeTranscript(transcript: string) {
    const words = transcript.split(' ');
    
    for (const emergencyPhrase of this.emergencyPhrases) {
      const phraseWords = emergencyPhrase.phrase.split(' ');
      const confidence = this.calculatePhraseMatch(words, phraseWords);
      
      if (confidence >= emergencyPhrase.confidence * 0.8) { // Allow 80% of the set confidence
        this.triggerEmergencyDetection(transcript, emergencyPhrase, confidence);
        break; // Only trigger once per transcript
      }
    }
  }

  private calculatePhraseMatch(transcript: string[], phraseWords: string[]): number {
    let matches = 0;
    let totalWords = phraseWords.length;
    
    for (const word of phraseWords) {
      if (transcript.some(tw => tw.includes(word) || word.includes(tw))) {
        matches++;
      }
    }
    
    return matches / totalWords;
  }

  private async triggerEmergencyDetection(transcript: string, phrase: EmergencyPhrase, confidence: number) {
    // Get current location if available
    let location: { lat: number; lng: number } | undefined;
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.warn('Could not get location:', error);
    }

    // Create audio clip from recent recording
    let audioClip: string | undefined;
    if (this.audioChunks.length > 0) {
      const audioBlob = new Blob(this.audioChunks.slice(-3), { type: 'audio/webm' }); // Last 30 seconds
      audioClip = URL.createObjectURL(audioBlob);
      this.audioChunks = []; // Clear chunks
    }

    const detection: EmergencyDetection = {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      detectedPhrase: transcript,
      category: phrase.category,
      confidence,
      audioClip,
      location
    };

    // Save to history
    this.detectionHistory.push(detection);
    this.saveDetectionHistory();

    // Trigger callback
    if (this.onEmergencyDetected) {
      this.onEmergencyDetected(detection);
    }

    console.log('Emergency detected:', detection);
  }

  private saveDetectionHistory() {
    // Keep only last 100 detections
    const recentHistory = this.detectionHistory.slice(-100);
    localStorage.setItem('emergency_detection_history', JSON.stringify(recentHistory));
  }

  public stopListening() {
    this.isListening = false;
    
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    console.log('Emergency voice recognition stopped');
  }

  public getDetectionHistory(): EmergencyDetection[] {
    return [...this.detectionHistory];
  }

  public getEmergencyPhrases(): EmergencyPhrase[] {
    return [...this.emergencyPhrases];
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Method to send emergency alert (to be implemented based on backend)
  public async sendEmergencyAlert(detection: EmergencyDetection): Promise<boolean> {
    try {
      // This would integrate with your backend emergency system
      console.log('Sending emergency alert:', detection);
      
      // For now, store in localStorage and trigger browser notification
      const alerts = JSON.parse(localStorage.getItem('emergency_alerts') || '[]');
      alerts.push(detection);
      localStorage.setItem('emergency_alerts', JSON.stringify(alerts));
      
      // Request notification permission and show notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Emergency Detected!', {
            body: `Detected: "${detection.detectedPhrase}" - Category: ${detection.category}`,
            icon: '/favicon.ico',
            requireInteraction: true
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('Emergency Detected!', {
              body: `Detected: "${detection.detectedPhrase}" - Category: ${detection.category}`,
              icon: '/favicon.ico',
              requireInteraction: true
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }
  }
}

export default EmergencyVoiceRecognition;
