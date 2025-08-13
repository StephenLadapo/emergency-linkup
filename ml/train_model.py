import numpy as np
import pandas as pd
import librosa
import os
from emergency_voice_model import EmergencyVoiceClassifier
from dataset_generator import EmergencyVoiceDatasetGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Tuple, List
import warnings
warnings.filterwarnings('ignore')

def load_dataset_from_files(dataset_dir: str) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Load audio dataset from files and extract features
    """
    print("Loading dataset from files...")
    
    # Initialize classifier for feature extraction
    classifier = EmergencyVoiceClassifier()
    
    features_list = []
    labels_list = []
    filenames_list = []
    
    # Load emergency samples
    emergency_dir = os.path.join(dataset_dir, 'emergency')
    if os.path.exists(emergency_dir):
        emergency_files = [f for f in os.listdir(emergency_dir) if f.endswith('.wav')]
        print(f"Found {len(emergency_files)} emergency files")
        
        for i, filename in enumerate(emergency_files):
            try:
                filepath = os.path.join(emergency_dir, filename)
                audio_data, sr = librosa.load(filepath, sr=classifier.sample_rate, duration=classifier.duration)
                features = classifier.extract_features(audio_data, sr)
                
                features_list.append(features)
                labels_list.append('emergency')
                filenames_list.append(filename)
                
                if (i + 1) % 50 == 0:
                    print(f"Processed {i + 1}/{len(emergency_files)} emergency files")
                    
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue
    
    # Load normal samples
    normal_dir = os.path.join(dataset_dir, 'normal')
    if os.path.exists(normal_dir):
        normal_files = [f for f in os.listdir(normal_dir) if f.endswith('.wav')]
        print(f"Found {len(normal_files)} normal files")
        
        for i, filename in enumerate(normal_files):
            try:
                filepath = os.path.join(normal_dir, filename)
                audio_data, sr = librosa.load(filepath, sr=classifier.sample_rate, duration=classifier.duration)
                features = classifier.extract_features(audio_data, sr)
                
                features_list.append(features)
                labels_list.append('normal')
                filenames_list.append(filename)
                
                if (i + 1) % 50 == 0:
                    print(f"Processed {i + 1}/{len(normal_files)} normal files")
                    
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue
    
    # Convert to numpy arrays
    X = np.array(features_list)
    y = np.array(labels_list)
    
    print(f"\nDataset loaded successfully!")
    print(f"Total samples: {len(X)}")
    print(f"Feature dimensions: {X.shape[1] if len(X) > 0 else 0}")
    print(f"Emergency samples: {np.sum(y == 'emergency')}")
    print(f"Normal samples: {np.sum(y == 'normal')}")
    
    return X, y, filenames_list

def plot_training_history(history):
    """
    Plot training history
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot training & validation accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Training Accuracy')
    axes[0, 0].plot(history.history['val_accuracy'], label='Validation Accuracy')
    axes[0, 0].set_title('Model Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Plot training & validation loss
    axes[0, 1].plot(history.history['loss'], label='Training Loss')
    axes[0, 1].plot(history.history['val_loss'], label='Validation Loss')
    axes[0, 1].set_title('Model Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Plot precision
    axes[1, 0].plot(history.history['precision'], label='Training Precision')
    axes[1, 0].plot(history.history['val_precision'], label='Validation Precision')
    axes[1, 0].set_title('Model Precision')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Precision')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Plot recall
    axes[1, 1].plot(history.history['recall'], label='Training Recall')
    axes[1, 1].plot(history.history['val_recall'], label='Validation Recall')
    axes[1, 1].set_title('Model Recall')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Recall')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    plt.show()
    print("Training history plot saved as 'training_history.png'")

def evaluate_model(classifier: EmergencyVoiceClassifier, X_test: np.ndarray, y_test: np.ndarray):
    """
    Evaluate the trained model
    """
    print("\nEvaluating model...")
    
    # Scale test features
    X_test_scaled = classifier.scaler.transform(X_test)
    
    # Make predictions
    y_pred_prob = classifier.model.predict(X_test_scaled)
    y_pred = (y_pred_prob > 0.5).astype(int)
    
    # Convert labels to binary
    y_test_binary = classifier.label_encoder.transform(y_test)
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test_binary, y_pred, target_names=['Normal', 'Emergency']))
    
    # Plot confusion matrix
    cm = confusion_matrix(y_test_binary, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Normal', 'Emergency'], 
                yticklabels=['Normal', 'Emergency'])
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.show()
    print("Confusion matrix saved as 'confusion_matrix.png'")
    
    # Calculate additional metrics
    accuracy = np.mean(y_test_binary == y_pred.flatten())
    print(f"\nOverall Accuracy: {accuracy:.4f}")
    
    return accuracy

def main():
    """
    Main training pipeline
    """
    print("=" * 60)
    print("EMERGENCY VOICE RECOGNITION MODEL TRAINING")
    print("=" * 60)
    
    # Step 1: Generate dataset if it doesn't exist
    dataset_dir = 'dataset'
    if not os.path.exists(dataset_dir) or len(os.listdir(dataset_dir)) < 2:
        print("\nStep 1: Generating synthetic dataset...")
        generator = EmergencyVoiceDatasetGenerator(dataset_dir)
        dataset_df = generator.generate_complete_dataset(emergency_samples=300, normal_samples=300)
    else:
        print("\nStep 1: Dataset already exists, skipping generation...")
    
    # Step 2: Load and prepare dataset
    print("\nStep 2: Loading dataset and extracting features...")
    X, y, filenames = load_dataset_from_files(dataset_dir)
    
    if len(X) == 0:
        print("Error: No data loaded. Please check the dataset directory.")
        return
    
    # Step 3: Train the model
    print("\nStep 3: Training the emergency voice classification model...")
    classifier = EmergencyVoiceClassifier('emergency_voice_model.h5')
    
    # Train with 80% of data, validate with 20%
    history = classifier.train(X, y, validation_split=0.2, epochs=100)
    
    # Step 4: Plot training history
    print("\nStep 4: Plotting training history...")
    plot_training_history(history)
    
    # Step 5: Final evaluation
    print("\nStep 5: Final model evaluation...")
    # Use a small test set for final evaluation
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    accuracy = evaluate_model(classifier, X_test, y_test)
    
    # Step 6: Test with sample predictions
    print("\nStep 6: Testing sample predictions...")
    
    # Test a few random samples
    test_indices = np.random.choice(len(X_test), min(5, len(X_test)), replace=False)
    
    for idx in test_indices:
        features = X_test[idx].reshape(1, -1)
        features_scaled = classifier.scaler.transform(features)
        prediction_prob = classifier.model.predict(features_scaled, verbose=0)[0][0]
        prediction_class = int(prediction_prob > 0.5)
        actual_class = y_test[idx]
        
        print(f"Sample {idx}: Actual={actual_class}, Predicted={'emergency' if prediction_class else 'normal'}, Confidence={prediction_prob:.3f}")
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"Model saved as: emergency_voice_model.h5")
    print(f"Scaler saved as: scaler.pkl")
    print(f"Label encoder saved as: label_encoder.pkl")
    print(f"Final accuracy: {accuracy:.4f}")
    print("\nYou can now use the trained model for emergency voice detection!")

if __name__ == "__main__":
    main()