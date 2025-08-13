import numpy as np
import librosa
import soundfile as sf
from gtts import gTTS
import os
import pandas as pd
from pydub import AudioSegment
from pydub.generators import Sine, WhiteNoise
import random
import tempfile
from typing import List, Tuple
import warnings
warnings.filterwarnings('ignore')

class EmergencyVoiceDatasetGenerator:
    def __init__(self, output_dir: str = 'dataset'):
        self.output_dir = output_dir
        self.sample_rate = 22050
        self.duration = 3000  # milliseconds for pydub
        
        # Create output directories
        os.makedirs(f"{output_dir}/emergency", exist_ok=True)
        os.makedirs(f"{output_dir}/normal", exist_ok=True)
        
        # Emergency phrases and keywords
        self.emergency_phrases = [
            "Help me please!",
            "Call the police!",
            "I'm in danger!",
            "Emergency! Someone help!",
            "Fire! Fire! Help!",
            "I'm being attacked!",
            "Call an ambulance!",
            "Help! I'm trapped!",
            "Someone is breaking in!",
            "I need help immediately!",
            "This is an emergency!",
            "Please help me!",
            "I'm hurt and need help!",
            "Call for help!",
            "Emergency situation!",
            "I'm scared, help me!",
            "Get away from me!",
            "Stop! Help!",
            "I can't breathe!",
            "Medical emergency!",
            "Help! Robbery!",
            "I'm lost and scared!",
            "Someone call 911!",
            "Help! I'm bleeding!",
            "Fire emergency!",
            "Heart attack! Help!",
            "I'm choking!",
            "Help! Accident!",
            "I'm being followed!",
            "Break-in! Help!",
            "Violence! Call police!",
            "I'm in trouble!",
            "Urgent help needed!",
            "Save me!",
            "I'm being harassed!",
            "Help! Kidnapping!",
            "I'm injured!",
            "Emergency! Come quick!",
            "I'm in pain!",
            "Help! Intruder!"
        ]
        
        # Normal conversation phrases
        self.normal_phrases = [
            "Hello, how are you today?",
            "The weather is nice today.",
            "I'm going to the store.",
            "What time is the meeting?",
            "Can you pass the salt?",
            "I love this music.",
            "How was your weekend?",
            "Let's go for a walk.",
            "I'm cooking dinner tonight.",
            "The movie was great.",
            "I need to buy groceries.",
            "What's your favorite color?",
            "I'm reading a good book.",
            "The traffic is heavy today.",
            "I'm learning something new.",
            "Let's meet for coffee.",
            "I'm working from home.",
            "The garden looks beautiful.",
            "I'm planning a vacation.",
            "How's your family?",
            "I'm watching television.",
            "The food tastes delicious.",
            "I'm going to bed early.",
            "What's the latest news?",
            "I'm exercising regularly.",
            "The sunset is gorgeous.",
            "I'm learning to cook.",
            "Let's play a game.",
            "I'm organizing my room.",
            "The concert was amazing.",
            "I'm studying for exams.",
            "What's your hobby?",
            "I'm calling my friend.",
            "The project is going well.",
            "I'm enjoying the weekend.",
            "Let's go shopping.",
            "I'm feeling happy today.",
            "The presentation went well.",
            "I'm learning a new language.",
            "What's for lunch today?"
        ]
        
        # Available languages for TTS
        self.languages = ['en', 'en-us', 'en-uk', 'en-au']
        
    def add_noise(self, audio: AudioSegment, noise_level: float = 0.1) -> AudioSegment:
        """
        Add background noise to audio
        """
        noise = WhiteNoise().to_audio_segment(duration=len(audio))
        noise = noise - (60 - noise_level * 60)  # Adjust noise level
        return audio.overlay(noise)
    
    def change_speed(self, audio: AudioSegment, speed_factor: float) -> AudioSegment:
        """
        Change the speed of audio
        """
        return audio.speedup(playback_speed=speed_factor)
    
    def change_pitch(self, audio: AudioSegment, semitones: int) -> AudioSegment:
        """
        Change the pitch of audio
        """
        new_sample_rate = int(audio.frame_rate * (2.0 ** (semitones / 12.0)))
        return audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate}).set_frame_rate(audio.frame_rate)
    
    def add_echo(self, audio: AudioSegment, delay_ms: int = 100, decay: float = 0.3) -> AudioSegment:
        """
        Add echo effect to audio
        """
        echo = audio - (60 - decay * 60)  # Reduce volume for echo
        echo = AudioSegment.silent(duration=delay_ms) + echo
        return audio.overlay(echo)
    
    def simulate_emergency_stress(self, audio: AudioSegment) -> AudioSegment:
        """
        Apply effects to simulate stress/panic in emergency situations
        """
        # Increase speed slightly (panic speech)
        audio = self.change_speed(audio, random.uniform(1.1, 1.3))
        
        # Slight pitch variation
        audio = self.change_pitch(audio, random.randint(-2, 3))
        
        # Add some background noise
        audio = self.add_noise(audio, random.uniform(0.05, 0.15))
        
        # Sometimes add echo (shouting in a room)
        if random.random() < 0.3:
            audio = self.add_echo(audio, random.randint(50, 150), random.uniform(0.2, 0.4))
        
        return audio
    
    def simulate_normal_conversation(self, audio: AudioSegment) -> AudioSegment:
        """
        Apply effects to simulate normal conversation
        """
        # Normal speed variation
        audio = self.change_speed(audio, random.uniform(0.9, 1.1))
        
        # Slight pitch variation
        audio = self.change_pitch(audio, random.randint(-1, 1))
        
        # Minimal background noise
        audio = self.add_noise(audio, random.uniform(0.01, 0.05))
        
        return audio
    
    def generate_tts_audio(self, text: str, lang: str = 'en') -> AudioSegment:
        """
        Generate audio from text using TTS
        """
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tts = gTTS(text=text, lang=lang, slow=False)
                tts.save(tmp_file.name)
                
                # Load and convert to AudioSegment
                audio = AudioSegment.from_mp3(tmp_file.name)
                
                # Clean up temp file
                os.unlink(tmp_file.name)
                
                return audio
        except Exception as e:
            print(f"Error generating TTS for '{text}': {e}")
            # Return silence if TTS fails
            return AudioSegment.silent(duration=2000)
    
    def generate_emergency_samples(self, num_samples: int = 200) -> List[str]:
        """
        Generate emergency voice samples
        """
        print(f"Generating {num_samples} emergency samples...")
        generated_files = []
        
        for i in range(num_samples):
            # Select random phrase and language
            phrase = random.choice(self.emergency_phrases)
            lang = random.choice(self.languages)
            
            try:
                # Generate TTS audio
                audio = self.generate_tts_audio(phrase, lang)
                
                # Apply emergency stress effects
                audio = self.simulate_emergency_stress(audio)
                
                # Ensure duration is consistent
                if len(audio) > self.duration:
                    audio = audio[:self.duration]
                else:
                    audio = audio + AudioSegment.silent(duration=self.duration - len(audio))
                
                # Save file
                filename = f"emergency_{i:04d}.wav"
                filepath = os.path.join(self.output_dir, "emergency", filename)
                audio.export(filepath, format="wav")
                generated_files.append(filepath)
                
                if (i + 1) % 50 == 0:
                    print(f"Generated {i + 1}/{num_samples} emergency samples")
                    
            except Exception as e:
                print(f"Error generating emergency sample {i}: {e}")
                continue
        
        return generated_files
    
    def generate_normal_samples(self, num_samples: int = 200) -> List[str]:
        """
        Generate normal conversation samples
        """
        print(f"Generating {num_samples} normal samples...")
        generated_files = []
        
        for i in range(num_samples):
            # Select random phrase and language
            phrase = random.choice(self.normal_phrases)
            lang = random.choice(self.languages)
            
            try:
                # Generate TTS audio
                audio = self.generate_tts_audio(phrase, lang)
                
                # Apply normal conversation effects
                audio = self.simulate_normal_conversation(audio)
                
                # Ensure duration is consistent
                if len(audio) > self.duration:
                    audio = audio[:self.duration]
                else:
                    audio = audio + AudioSegment.silent(duration=self.duration - len(audio))
                
                # Save file
                filename = f"normal_{i:04d}.wav"
                filepath = os.path.join(self.output_dir, "normal", filename)
                audio.export(filepath, format="wav")
                generated_files.append(filepath)
                
                if (i + 1) % 50 == 0:
                    print(f"Generated {i + 1}/{num_samples} normal samples")
                    
            except Exception as e:
                print(f"Error generating normal sample {i}: {e}")
                continue
        
        return generated_files
    
    def create_dataset_metadata(self, emergency_files: List[str], normal_files: List[str]) -> pd.DataFrame:
        """
        Create metadata DataFrame for the dataset
        """
        data = []
        
        # Add emergency samples
        for filepath in emergency_files:
            data.append({
                'filepath': filepath,
                'label': 'emergency',
                'category': 'emergency',
                'filename': os.path.basename(filepath)
            })
        
        # Add normal samples
        for filepath in normal_files:
            data.append({
                'filepath': filepath,
                'label': 'normal',
                'category': 'normal',
                'filename': os.path.basename(filepath)
            })
        
        df = pd.DataFrame(data)
        
        # Save metadata
        metadata_path = os.path.join(self.output_dir, 'dataset_metadata.csv')
        df.to_csv(metadata_path, index=False)
        print(f"Dataset metadata saved to {metadata_path}")
        
        return df
    
    def generate_complete_dataset(self, emergency_samples: int = 300, normal_samples: int = 300) -> pd.DataFrame:
        """
        Generate complete dataset with both emergency and normal samples
        """
        print("Starting dataset generation...")
        print(f"Target: {emergency_samples} emergency + {normal_samples} normal = {emergency_samples + normal_samples} total samples")
        
        # Generate samples
        emergency_files = self.generate_emergency_samples(emergency_samples)
        normal_files = self.generate_normal_samples(normal_samples)
        
        # Create metadata
        metadata_df = self.create_dataset_metadata(emergency_files, normal_files)
        
        print(f"\nDataset generation complete!")
        print(f"Emergency samples: {len(emergency_files)}")
        print(f"Normal samples: {len(normal_files)}")
        print(f"Total samples: {len(emergency_files) + len(normal_files)}")
        print(f"Dataset saved in: {self.output_dir}")
        
        return metadata_df

if __name__ == "__main__":
    # Generate dataset
    generator = EmergencyVoiceDatasetGenerator()
    dataset_df = generator.generate_complete_dataset(emergency_samples=250, normal_samples=250)
    print("\nDataset summary:")
    print(dataset_df.groupby('label').size())