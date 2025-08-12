#!/usr/bin/env python3
"""
Emergency Voice Recognition ML System Setup Script

This script automates the setup process for the emergency voice detection system.
It handles dependency installation, dataset generation, model training, and validation.
"""

import os
import sys
import subprocess
import platform
import time
from pathlib import Path

def print_banner():
    """Print setup banner"""
    print("=" * 70)
    print("🚨 EMERGENCY VOICE RECOGNITION ML SYSTEM SETUP 🚨")
    print("=" * 70)
    print("This script will set up the complete ML system for emergency voice detection.")
    print("Estimated setup time: 10-15 minutes")
    print("")

def check_python_version():
    """Check if Python version is compatible"""
    print("📋 Checking Python version...")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Python 3.8 or higher is required.")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        print("   Please upgrade Python and try again.")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
    return True

def check_system_requirements():
    """Check system requirements"""
    print("\n🔍 Checking system requirements...")
    
    # Check operating system
    os_name = platform.system()
    print(f"   Operating System: {os_name}")
    
    # Check available disk space (approximate)
    try:
        import shutil
        total, used, free = shutil.disk_usage(".")
        free_gb = free // (1024**3)
        print(f"   Available disk space: {free_gb} GB")
        
        if free_gb < 2:
            print("⚠️  Warning: Low disk space. At least 2GB recommended.")
    except:
        print("   Could not check disk space")
    
    print("✅ System requirements check completed")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    print("   This may take several minutes...")
    
    try:
        # Upgrade pip first
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        
        # Install requirements
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        
        print("✅ Dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        print("   Please check your internet connection and try again.")
        print("   You can also install manually with: pip install -r requirements.txt")
        return False
    except FileNotFoundError:
        print("❌ Error: requirements.txt not found")
        return False

def verify_imports():
    """Verify that key packages can be imported"""
    print("\n🔬 Verifying package imports...")
    
    packages = [
        ('tensorflow', 'TensorFlow'),
        ('librosa', 'Librosa'),
        ('sklearn', 'Scikit-learn'),
        ('flask', 'Flask'),
        ('numpy', 'NumPy'),
        ('pandas', 'Pandas')
    ]
    
    failed_imports = []
    
    for package, name in packages:
        try:
            __import__(package)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} - Import failed")
            failed_imports.append(name)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        print("   Please check the installation and try again.")
        return False
    
    print("✅ All packages imported successfully")
    return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        'dataset',
        'dataset/emergency',
        'dataset/normal',
        'models',
        'logs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   ✅ {directory}")
    
    print("✅ Directories created")
    return True

def generate_dataset():
    """Generate synthetic dataset"""
    print("\n🎵 Generating synthetic dataset...")
    print("   This will create 500 audio samples (250 emergency + 250 normal)")
    print("   Estimated time: 5-8 minutes")
    
    try:
        from dataset_generator import EmergencyVoiceDatasetGenerator
        
        generator = EmergencyVoiceDatasetGenerator('dataset')
        
        print("   Generating emergency samples...")
        emergency_files = generator.generate_emergency_samples(250)
        
        print("   Generating normal samples...")
        normal_files = generator.generate_normal_samples(250)
        
        print("   Creating metadata...")
        metadata_df = generator.create_dataset_metadata(emergency_files, normal_files)
        
        print(f"✅ Dataset generated successfully")
        print(f"   Emergency samples: {len(emergency_files)}")
        print(f"   Normal samples: {len(normal_files)}")
        print(f"   Total samples: {len(emergency_files) + len(normal_files)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating dataset: {e}")
        print("   You can generate the dataset manually with: python dataset_generator.py")
        return False

def train_model():
    """Train the emergency voice detection model"""
    print("\n🧠 Training machine learning model...")
    print("   This will train a deep neural network for emergency detection")
    print("   Estimated time: 3-5 minutes")
    
    try:
        from train_model import main as train_main
        
        # Redirect training to avoid duplicate dataset generation
        print("   Loading dataset and extracting features...")
        
        from train_model import load_dataset_from_files
        from emergency_voice_model import EmergencyVoiceClassifier
        
        # Load dataset
        X, y, filenames = load_dataset_from_files('dataset')
        
        if len(X) == 0:
            print("❌ Error: No dataset found. Please generate dataset first.")
            return False
        
        print(f"   Dataset loaded: {len(X)} samples")
        
        # Train model
        print("   Training neural network...")
        classifier = EmergencyVoiceClassifier('emergency_voice_model.h5')
        history = classifier.train(X, y, validation_split=0.2, epochs=50)  # Reduced epochs for setup
        
        print("✅ Model trained successfully")
        print("   Model saved as: emergency_voice_model.h5")
        print("   Scaler saved as: scaler.pkl")
        print("   Label encoder saved as: label_encoder.pkl")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training model: {e}")
        print("   You can train the model manually with: python train_model.py")
        return False

def test_model():
    """Test the trained model"""
    print("\n🧪 Testing trained model...")
    
    try:
        from emergency_voice_model import EmergencyVoiceClassifier
        import numpy as np
        
        # Load model
        classifier = EmergencyVoiceClassifier('emergency_voice_model.h5')
        classifier.load_model()
        
        # Test with dummy audio data
        dummy_audio = np.random.randn(int(classifier.sample_rate * classifier.duration))
        result = classifier.predict(dummy_audio)
        
        print(f"   ✅ Model prediction test successful")
        print(f"   Test result: {result['class_label']} (confidence: {result['confidence']:.3f})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False

def test_api_server():
    """Test the API server"""
    print("\n🌐 Testing API server...")
    
    try:
        import threading
        import time
        import requests
        from api_server import app, initialize_model
        
        # Initialize model
        if not initialize_model():
            print("❌ Failed to initialize model for API")
            return False
        
        # Start server in a separate thread
        def run_server():
            app.run(host='localhost', port=5001, debug=False, use_reloader=False)
        
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        time.sleep(3)
        
        # Test health endpoint
        response = requests.get('http://localhost:5001/health', timeout=5)
        
        if response.status_code == 200:
            print("   ✅ API server test successful")
            print("   Health check passed")
            return True
        else:
            print(f"   ❌ API server test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API server: {e}")
        print("   You can test the API manually with: python api_server.py")
        return False

def create_startup_scripts():
    """Create convenient startup scripts"""
    print("\n📝 Creating startup scripts...")
    
    # API server startup script
    api_script_content = '''#!/usr/bin/env python3
"""Start the Emergency Voice Detection API Server"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api_server import app, initialize_model

if __name__ == "__main__":
    print("Starting Emergency Voice Detection API Server...")
    
    if initialize_model():
        print("Model loaded successfully!")
        print("API Server running on http://localhost:5000")
        print("Press Ctrl+C to stop")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Failed to load model. Please run setup.py first.")
        sys.exit(1)
'''
    
    with open('start_api.py', 'w') as f:
        f.write(api_script_content)
    
    # Make executable on Unix systems
    if platform.system() != 'Windows':
        os.chmod('start_api.py', 0o755)
    
    print("   ✅ start_api.py - Quick API server startup")
    
    # Training script
    train_script_content = '''#!/usr/bin/env python3
"""Retrain the Emergency Voice Detection Model"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from train_model import main

if __name__ == "__main__":
    print("Retraining Emergency Voice Detection Model...")
    main()
'''
    
    with open('retrain_model.py', 'w') as f:
        f.write(train_script_content)
    
    if platform.system() != 'Windows':
        os.chmod('retrain_model.py', 0o755)
    
    print("   ✅ retrain_model.py - Quick model retraining")
    
    print("✅ Startup scripts created")
    return True

def print_completion_summary():
    """Print setup completion summary"""
    print("\n" + "=" * 70)
    print("🎉 SETUP COMPLETED SUCCESSFULLY! 🎉")
    print("=" * 70)
    
    print("\n📋 What was installed:")
    print("   ✅ Python dependencies")
    print("   ✅ Synthetic dataset (500 audio samples)")
    print("   ✅ Trained ML model")
    print("   ✅ API server")
    print("   ✅ Startup scripts")
    
    print("\n🚀 Quick Start:")
    print("   1. Start the API server:")
    print("      python start_api.py")
    print("")
    print("   2. Test the API:")
    print("      curl http://localhost:5000/health")
    print("")
    print("   3. Use in React app:")
    print("      Import EmergencyVoiceDetector component")
    
    print("\n📁 Generated Files:")
    print("   📄 emergency_voice_model.h5 - Trained model")
    print("   📄 scaler.pkl - Feature scaler")
    print("   📄 label_encoder.pkl - Label encoder")
    print("   📁 dataset/ - Training dataset")
    print("   📄 start_api.py - API startup script")
    print("   📄 retrain_model.py - Model retraining script")
    
    print("\n📖 Documentation:")
    print("   📄 README.md - Complete documentation")
    print("   🌐 API docs at http://localhost:5000 when running")
    
    print("\n⚠️  Important Notes:")
    print("   • Keep the API server running for real-time detection")
    print("   • Ensure microphone permissions in browser")
    print("   • Model accuracy improves with more training data")
    print("   • Use HTTPS in production for microphone access")
    
    print("\n🆘 Need Help?")
    print("   📖 Check README.md for detailed documentation")
    print("   🐛 Run python -c 'import emergency_voice_model; print(\"OK\")' to test")
    print("   🔧 Retrain model with: python retrain_model.py")
    
    print("\n" + "=" * 70)
    print("Emergency Voice Recognition System is ready to use!")
    print("=" * 70)

def main():
    """Main setup function"""
    start_time = time.time()
    
    print_banner()
    
    # Setup steps
    steps = [
        ("Python Version", check_python_version),
        ("System Requirements", check_system_requirements),
        ("Dependencies", install_dependencies),
        ("Package Imports", verify_imports),
        ("Directories", create_directories),
        ("Dataset Generation", generate_dataset),
        ("Model Training", train_model),
        ("Model Testing", test_model),
        ("API Testing", test_api_server),
        ("Startup Scripts", create_startup_scripts)
    ]
    
    failed_steps = []
    
    for step_name, step_function in steps:
        print(f"\n🔄 Step: {step_name}")
        try:
            if not step_function():
                failed_steps.append(step_name)
                print(f"⚠️  Step '{step_name}' completed with warnings")
        except KeyboardInterrupt:
            print("\n\n❌ Setup interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Step '{step_name}' failed: {e}")
            failed_steps.append(step_name)
    
    # Summary
    elapsed_time = time.time() - start_time
    
    if failed_steps:
        print(f"\n⚠️  Setup completed with {len(failed_steps)} warnings:")
        for step in failed_steps:
            print(f"   • {step}")
        print("\nYou may need to complete these steps manually.")
    else:
        print_completion_summary()
    
    print(f"\n⏱️  Total setup time: {elapsed_time:.1f} seconds")

if __name__ == "__main__":
    main()