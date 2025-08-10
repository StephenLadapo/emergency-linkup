import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use local models
env.allowRemoteModels = true;
env.allowLocalModels = true;

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  confidence: number;
  emergencyType: string;
  timestamp: number;
}

export interface AudioFeatures {
  mfcc: number[];
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  energy: number;
}

export class EmergencyMLModel {
  private classifier: any = null;
  private audioClassifier: any = null;
  private isInitialized = false;
  private trainingData: Array<{ features: AudioFeatures; label: string }> = [];
  
  // Emergency sound patterns and their characteristics
  private emergencyPatterns = {
    scream: {
      keywords: ['help', 'emergency', 'fire', 'call', 'police', 'ambulance'],
      spectralFeatures: { minFreq: 200, maxFreq: 4000, intensity: 0.7 }
    },
    fire_alarm: {
      keywords: ['fire', 'alarm', 'smoke', 'evacuation'],
      spectralFeatures: { minFreq: 2000, maxFreq: 4000, intensity: 0.8 }
    },
    breaking_glass: {
      keywords: ['break', 'glass', 'window', 'crash'],
      spectralFeatures: { minFreq: 3000, maxFreq: 8000, intensity: 0.6 }
    },
    distress_call: {
      keywords: ['help', 'stop', 'no', 'emergency', 'call', '911'],
      spectralFeatures: { minFreq: 100, maxFreq: 3000, intensity: 0.8 }
    },
    gunshot: {
      keywords: ['shot', 'gun', 'shooting', 'shots'],
      spectralFeatures: { minFreq: 200, maxFreq: 6000, intensity: 0.9 }
    }
  };

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Emergency ML Model...');
      
      // Initialize audio classification pipeline for emergency detection
      this.audioClassifier = await pipeline(
        'audio-classification',
        'MIT/ast-finetuned-speech-commands-v2',
        { device: 'webgpu' }
      );

      // Initialize text classification for transcribed speech
      this.classifier = await pipeline(
        'text-classification',
        'cardiffnlp/twitter-roberta-base-emotion-multilabel-latest'
      );

      this.isInitialized = true;
      console.log('Emergency ML Model initialized successfully');
      
      // Load any existing training data
      this.loadTrainingData();
      
    } catch (error) {
      console.error('Error initializing Emergency ML Model:', error);
      // Fallback to simpler pattern matching if ML models fail
      this.initializeFallbackModel();
    }
  }

  private initializeFallbackModel() {
    console.log('Using fallback pattern matching model');
    this.isInitialized = true;
  }

  async analyzeAudio(audioData: Float32Array, transcription?: string): Promise<EmergencyDetectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Extract audio features
      const features = this.extractAudioFeatures(audioData);
      
      // Combine multiple detection methods
      const audioScore = await this.classifyAudio(audioData);
      const textScore = transcription ? await this.analyzeTranscription(transcription) : 0;
      const patternScore = this.matchEmergencyPatterns(features, transcription);
      
      // Weighted combination of scores
      const combinedScore = (audioScore * 0.4) + (textScore * 0.4) + (patternScore * 0.2);
      const isEmergency = combinedScore > 0.6;
      
      // Determine emergency type
      let emergencyType = 'unknown';
      if (isEmergency) {
        emergencyType = this.classifyEmergencyType(features, transcription);
      }

      const result: EmergencyDetectionResult = {
        isEmergency,
        confidence: combinedScore,
        emergencyType,
        timestamp: Date.now()
      };

      // Add to training data for continuous learning
      this.addTrainingData(features, isEmergency ? 'emergency' : 'normal');

      return result;

    } catch (error) {
      console.error('Error analyzing audio:', error);
      
      // Fallback analysis
      return this.fallbackAnalysis(audioData, transcription);
    }
  }

  private async classifyAudio(audioData: Float32Array): Promise<number> {
    if (!this.audioClassifier) return 0;

    try {
      // Resample audio to 16kHz for the model
      const resampledAudio = this.resampleAudio(audioData, 24000, 16000);
      
      const result = await this.audioClassifier(resampledAudio);
      
      // Look for emergency-related classifications
      const emergencyLabels = ['scream', 'cry', 'alarm', 'siren', 'glass_breaking'];
      let maxScore = 0;
      
      for (const prediction of result) {
        if (emergencyLabels.some(label => prediction.label.toLowerCase().includes(label))) {
          maxScore = Math.max(maxScore, prediction.score);
        }
      }
      
      return maxScore;
    } catch (error) {
      console.error('Audio classification error:', error);
      return 0;
    }
  }

  private async analyzeTranscription(text: string): Promise<number> {
    if (!this.classifier || !text.trim()) return 0;

    try {
      const result = await this.classifier(text);
      
      // Look for emergency emotions and keywords
      let emergencyScore = 0;
      
      // Check for emergency emotions
      const emergencyEmotions = ['fear', 'anger', 'sadness'];
      for (const prediction of result) {
        if (emergencyEmotions.includes(prediction.label.toLowerCase())) {
          emergencyScore += prediction.score * 0.7;
        }
      }
      
      // Check for emergency keywords
      const lowerText = text.toLowerCase();
      Object.values(this.emergencyPatterns).forEach(pattern => {
        pattern.keywords.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            emergencyScore += 0.3;
          }
        });
      });
      
      return Math.min(emergencyScore, 1.0);
    } catch (error) {
      console.error('Text classification error:', error);
      return this.analyzeKeywords(text);
    }
  }

  private analyzeKeywords(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let matches = 0;
    
    Object.values(this.emergencyPatterns).forEach(pattern => {
      pattern.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 0.2;
          matches++;
        }
      });
    });
    
    return Math.min(score, 1.0);
  }

  private matchEmergencyPatterns(features: AudioFeatures, transcription?: string): number {
    let maxScore = 0;
    
    Object.entries(this.emergencyPatterns).forEach(([type, pattern]) => {
      let score = 0;
      
      // Check spectral features
      const { spectralCentroid, energy } = features;
      const { minFreq, maxFreq, intensity } = pattern.spectralFeatures;
      
      if (spectralCentroid >= minFreq && spectralCentroid <= maxFreq) {
        score += 0.3;
      }
      
      if (energy >= intensity) {
        score += 0.3;
      }
      
      // Check transcription keywords
      if (transcription) {
        const lowerText = transcription.toLowerCase();
        pattern.keywords.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            score += 0.4;
          }
        });
      }
      
      maxScore = Math.max(maxScore, score);
    });
    
    return Math.min(maxScore, 1.0);
  }

  private classifyEmergencyType(features: AudioFeatures, transcription?: string): string {
    let bestMatch = 'general_emergency';
    let bestScore = 0;
    
    Object.entries(this.emergencyPatterns).forEach(([type, pattern]) => {
      let score = 0;
      
      // Spectral matching
      const { spectralCentroid, energy } = features;
      const { minFreq, maxFreq, intensity } = pattern.spectralFeatures;
      
      if (spectralCentroid >= minFreq && spectralCentroid <= maxFreq) {
        score += 0.4;
      }
      
      if (Math.abs(energy - intensity) < 0.2) {
        score += 0.3;
      }
      
      // Keyword matching
      if (transcription) {
        const lowerText = transcription.toLowerCase();
        pattern.keywords.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            score += 0.3;
          }
        });
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    });
    
    return bestMatch;
  }

  private extractAudioFeatures(audioData: Float32Array): AudioFeatures {
    // Extract basic audio features for classification
    const sampleRate = 24000;
    const fftSize = 2048;
    
    // Calculate energy
    let energy = 0;
    for (let i = 0; i < audioData.length; i++) {
      energy += audioData[i] * audioData[i];
    }
    energy = Math.sqrt(energy / audioData.length);
    
    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / audioData.length;
    
    // Simple spectral features (would be more complex in a real implementation)
    const spectralCentroid = this.calculateSpectralCentroid(audioData);
    const spectralRolloff = spectralCentroid * 1.5; // Simplified
    
    // Simplified MFCC (would use proper DCT in real implementation)
    const mfcc = this.calculateSimpleMFCC(audioData);
    
    return {
      mfcc,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate,
      energy
    };
  }

  private calculateSpectralCentroid(audioData: Float32Array): number {
    // Simplified spectral centroid calculation
    const fft = this.simpleFFT(audioData);
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < fft.length / 2; i++) {
      const magnitude = Math.sqrt(fft[i * 2] * fft[i * 2] + fft[i * 2 + 1] * fft[i * 2 + 1]);
      const frequency = (i * 24000) / fft.length;
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateSimpleMFCC(audioData: Float32Array): number[] {
    // Simplified MFCC calculation - in production would use proper mel-scale filter banks
    const fft = this.simpleFFT(audioData);
    const mfcc = [];
    
    for (let i = 0; i < 13; i++) {
      let sum = 0;
      const startBin = Math.floor((i * fft.length) / 26);
      const endBin = Math.floor(((i + 1) * fft.length) / 26);
      
      for (let j = startBin; j < endBin && j < fft.length / 2; j++) {
        const magnitude = Math.sqrt(fft[j * 2] * fft[j * 2] + fft[j * 2 + 1] * fft[j * 2 + 1]);
        sum += Math.log(magnitude + 1e-10);
      }
      
      mfcc.push(sum / (endBin - startBin));
    }
    
    return mfcc;
  }

  private simpleFFT(audioData: Float32Array): Float32Array {
    // Simplified FFT - in production would use a proper FFT library
    const N = Math.min(audioData.length, 2048);
    const fft = new Float32Array(N * 2);
    
    for (let k = 0; k < N; k++) {
      let realSum = 0;
      let imagSum = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        realSum += audioData[n] * Math.cos(angle);
        imagSum += audioData[n] * Math.sin(angle);
      }
      
      fft[k * 2] = realSum;
      fft[k * 2 + 1] = imagSum;
    }
    
    return fft;
  }

  private resampleAudio(audioData: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
    if (fromSampleRate === toSampleRate) return audioData;
    
    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.floor(audioData.length / ratio);
    const resampled = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;
      
      if (index + 1 < audioData.length) {
        resampled[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        resampled[i] = audioData[index];
      }
    }
    
    return resampled;
  }

  private fallbackAnalysis(audioData: Float32Array, transcription?: string): EmergencyDetectionResult {
    const features = this.extractAudioFeatures(audioData);
    
    // Simple threshold-based detection
    let score = 0;
    
    // High energy indicates potential emergency
    if (features.energy > 0.5) score += 0.3;
    
    // High zero crossing rate might indicate distress
    if (features.zeroCrossingRate > 0.1) score += 0.2;
    
    // Check keywords in transcription
    if (transcription) {
      score += this.analyzeKeywords(transcription);
    }
    
    const isEmergency = score > 0.6;
    const emergencyType = isEmergency ? this.classifyEmergencyType(features, transcription) : 'none';
    
    return {
      isEmergency,
      confidence: score,
      emergencyType,
      timestamp: Date.now()
    };
  }

  addTrainingData(features: AudioFeatures, label: string) {
    this.trainingData.push({ features, label });
    
    // Keep only recent training data (last 1000 samples)
    if (this.trainingData.length > 1000) {
      this.trainingData = this.trainingData.slice(-1000);
    }
    
    // Save to localStorage
    this.saveTrainingData();
  }

  private saveTrainingData() {
    try {
      localStorage.setItem('emergencyMLTrainingData', JSON.stringify(this.trainingData));
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  }

  private loadTrainingData() {
    try {
      const data = localStorage.getItem('emergencyMLTrainingData');
      if (data) {
        this.trainingData = JSON.parse(data);
        console.log(`Loaded ${this.trainingData.length} training samples`);
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  }

  getTrainingDataStats() {
    const stats = {
      totalSamples: this.trainingData.length,
      emergencySamples: this.trainingData.filter(d => d.label === 'emergency').length,
      normalSamples: this.trainingData.filter(d => d.label === 'normal').length
    };
    
    return stats;
  }

  exportTrainingData(): string {
    return JSON.stringify(this.trainingData, null, 2);
  }

  importTrainingData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.trainingData = data;
        this.saveTrainingData();
        return true;
      }
    } catch (error) {
      console.error('Error importing training data:', error);
    }
    return false;
  }
}

// Singleton instance
export const emergencyMLModel = new EmergencyMLModel();
