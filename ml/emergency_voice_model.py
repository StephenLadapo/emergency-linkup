import numpy as np
import librosa
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os
import json
from typing import Tuple, List, Dict, Any
import warnings
warnings.filterwarnings('ignore')

class EmergencyVoiceClassifier:
    def __init__(self, model_path: str = 'emergency_voice_model.h5'):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = []
        
        # Audio processing parameters
        self.sample_rate = 22050
        self.duration = 3.0  # seconds
        self.n_mfcc = 13
        self.n_fft = 2048
        self.hop_length = 512
        
    def extract_features(self, audio_data: np.ndarray, sr: int = None) -> np.ndarray:
        """
        Extract comprehensive audio features for emergency detection
        """
        if sr is None:
            sr = self.sample_rate
            
        features = []
        
        try:
            # Ensure audio is the right length
            target_length = int(sr * self.duration)
            if len(audio_data) > target_length:
                audio_data = audio_data[:target_length]
            elif len(audio_data) < target_length:
                audio_data = np.pad(audio_data, (0, target_length - len(audio_data)))
            
            # 1. MFCC features (Mel-frequency cepstral coefficients)
            mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=self.n_mfcc)
            mfcc_mean = np.mean(mfccs, axis=1)
            mfcc_std = np.std(mfccs, axis=1)
            features.extend(mfcc_mean)
            features.extend(mfcc_std)
            
            # 2. Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=sr)[0]
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio_data, sr=sr)[0]
            
            features.extend([
                np.mean(spectral_centroids),
                np.std(spectral_centroids),
                np.mean(spectral_rolloff),
                np.std(spectral_rolloff),
                np.mean(spectral_bandwidth),
                np.std(spectral_bandwidth)
            ])
            
            # 3. Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(audio_data)[0]
            features.extend([np.mean(zcr), np.std(zcr)])
            
            # 4. Chroma features
            chroma = librosa.feature.chroma_stft(y=audio_data, sr=sr)
            features.extend([np.mean(chroma), np.std(chroma)])
            
            # 5. Tempo and rhythm
            tempo, _ = librosa.beat.beat_track(y=audio_data, sr=sr)
            features.append(tempo)
            
            # 6. RMS Energy
            rms = librosa.feature.rms(y=audio_data)[0]
            features.extend([np.mean(rms), np.std(rms)])
            
            # 7. Pitch and fundamental frequency
            pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sr)
            pitch_mean = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0
            features.append(pitch_mean)
            
            # 8. Spectral contrast
            contrast = librosa.feature.spectral_contrast(y=audio_data, sr=sr)
            features.extend([np.mean(contrast), np.std(contrast)])
            
            # 9. Tonnetz (harmonic features)
            tonnetz = librosa.feature.tonnetz(y=audio_data, sr=sr)
            features.extend([np.mean(tonnetz), np.std(tonnetz)])
            
            return np.array(features)
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            # Return zero features if extraction fails
            return np.zeros(self.get_feature_count())
    
    def get_feature_count(self) -> int:
        """Get the expected number of features"""
        return (self.n_mfcc * 2) + 6 + 2 + 2 + 1 + 2 + 1 + 2 + 2
    
    def build_model(self, input_shape: int) -> keras.Model:
        """
        Build a deep neural network for emergency voice classification
        """
        model = keras.Sequential([
            layers.Dense(256, activation='relu', input_shape=(input_shape,)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(64, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            
            layers.Dense(16, activation='relu'),
            
            # Output layer for binary classification (emergency vs normal)
            layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
        )
        
        return model
    
    def train(self, X: np.ndarray, y: np.ndarray, validation_split: float = 0.2, epochs: int = 100):
        """
        Train the emergency voice classification model
        """
        print("Preparing data for training...")
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X_scaled, y_encoded, test_size=validation_split, random_state=42, stratify=y_encoded
        )
        
        print(f"Training set size: {X_train.shape[0]}")
        print(f"Validation set size: {X_val.shape[0]}")
        print(f"Feature dimensions: {X_train.shape[1]}")
        
        # Build model
        self.model = self.build_model(X_train.shape[1])
        
        print("Model architecture:")
        self.model.summary()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=10,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                self.model_path,
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train model
        print("Starting training...")
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate on validation set
        val_predictions = (self.model.predict(X_val) > 0.5).astype(int)
        print("\nValidation Results:")
        print(classification_report(y_val, val_predictions, target_names=['Normal', 'Emergency']))
        
        # Save preprocessing objects
        joblib.dump(self.scaler, 'scaler.pkl')
        joblib.dump(self.label_encoder, 'label_encoder.pkl')
        
        return history
    
    def load_model(self):
        """
        Load trained model and preprocessing objects
        """
        if os.path.exists(self.model_path):
            self.model = keras.models.load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            raise FileNotFoundError(f"Model file {self.model_path} not found")
            
        if os.path.exists('scaler.pkl'):
            self.scaler = joblib.load('scaler.pkl')
            print("Scaler loaded")
            
        if os.path.exists('label_encoder.pkl'):
            self.label_encoder = joblib.load('label_encoder.pkl')
            print("Label encoder loaded")
    
    def predict(self, audio_data: np.ndarray, sr: int = None) -> Dict[str, Any]:
        """
        Predict if audio contains emergency voice
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Extract features
        features = self.extract_features(audio_data, sr)
        features = features.reshape(1, -1)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Make prediction
        prediction_prob = self.model.predict(features_scaled, verbose=0)[0][0]
        prediction_class = int(prediction_prob > 0.5)
        
        # Get class label
        class_label = self.label_encoder.inverse_transform([prediction_class])[0]
        
        return {
            'is_emergency': bool(prediction_class),
            'confidence': float(prediction_prob),
            'class_label': class_label,
            'features_extracted': len(features[0])
        }
    
    def predict_from_file(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Predict emergency from audio file
        """
        try:
            audio_data, sr = librosa.load(audio_file_path, sr=self.sample_rate, duration=self.duration)
            return self.predict(audio_data, sr)
        except Exception as e:
            return {
                'error': f"Failed to process audio file: {str(e)}",
                'is_emergency': False,
                'confidence': 0.0
            }

if __name__ == "__main__":
    # Example usage
    classifier = EmergencyVoiceClassifier()
    print("Emergency Voice Classifier initialized")
    print(f"Expected feature count: {classifier.get_feature_count()}")