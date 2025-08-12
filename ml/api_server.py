from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import librosa
import base64
import io
import tempfile
import os
from emergency_voice_model import EmergencyVoiceClassifier
import logging
from werkzeug.utils import secure_filename
import soundfile as sf
from pydub import AudioSegment
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global model instance
classifier = None

def initialize_model():
    """
    Initialize the emergency voice classifier
    """
    global classifier
    try:
        classifier = EmergencyVoiceClassifier('emergency_voice_model.h5')
        classifier.load_model()
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

def process_audio_data(audio_data, sample_rate=None):
    """
    Process audio data and extract features
    """
    try:
        if sample_rate is None:
            sample_rate = classifier.sample_rate
        
        logger.info(f"Processing audio data: shape={audio_data.shape}, sample_rate={sample_rate}Hz")
        
        # Check if audio data is valid
        if audio_data is None or len(audio_data) == 0:
            logger.error("Empty audio data received")
            raise ValueError("Empty audio data")
        
        # Check for NaN or infinity values
        if np.isnan(audio_data).any() or np.isinf(audio_data).any():
            logger.warning("Audio contains NaN or Inf values, replacing with zeros")
            audio_data = np.nan_to_num(audio_data)
        
        # Normalize audio if needed
        if np.max(np.abs(audio_data)) > 1.0:
            logger.info("Normalizing audio data")
            audio_data = audio_data / np.max(np.abs(audio_data))
        
        # Ensure audio is the right length and format
        if len(audio_data.shape) > 1:
            logger.info(f"Converting audio from {len(audio_data.shape)} channels to mono")
            audio_data = np.mean(audio_data, axis=1)  # Convert to mono
        
        # Resample if necessary
        if sample_rate != classifier.sample_rate:
            logger.info(f"Resampling audio from {sample_rate}Hz to {classifier.sample_rate}Hz")
            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=classifier.sample_rate)
        
        # Ensure audio is the right duration
        target_length = int(classifier.sample_rate * classifier.duration)
        
        # Check if audio is too short (less than 0.5 seconds)
        if len(audio_data) < (classifier.sample_rate * 0.5):
            logger.warning(f"Audio too short ({len(audio_data)/classifier.sample_rate:.2f}s), may not contain speech")
        
        if len(audio_data) > target_length:
            logger.info(f"Trimming audio from {len(audio_data)} to {target_length} samples ({len(audio_data)/classifier.sample_rate:.2f}s to {classifier.duration:.2f}s)")
            audio_data = audio_data[:target_length]
        elif len(audio_data) < target_length:
            logger.info(f"Padding audio from {len(audio_data)} to {target_length} samples ({len(audio_data)/classifier.sample_rate:.2f}s to {classifier.duration:.2f}s)")
            # Use reflection padding for more natural sound
            pad_length = target_length - len(audio_data)
            if len(audio_data) > pad_length:  # Can use reflection
                audio_data = np.pad(audio_data, (0, pad_length), mode='reflect')
            else:  # Not enough data for reflection, use zeros
                audio_data = np.pad(audio_data, (0, pad_length), mode='constant')
        
        # Apply a slight fade in/out to avoid clicks
        fade_samples = int(0.01 * classifier.sample_rate)  # 10ms fade
        if fade_samples > 0 and len(audio_data) > 2*fade_samples:
            fade_in = np.linspace(0, 1, fade_samples)
            fade_out = np.linspace(1, 0, fade_samples)
            audio_data[:fade_samples] *= fade_in
            audio_data[-fade_samples:] *= fade_out
        
        logger.info(f"Audio processing complete: {len(audio_data)} samples at {classifier.sample_rate}Hz")
        return audio_data
    except Exception as e:
        logger.error(f"Error processing audio data: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    global classifier
    status = {
        'status': 'healthy' if classifier is not None else 'unhealthy',
        'model_loaded': classifier is not None,
        'message': 'Emergency Voice Recognition API is running'
    }
    return jsonify(status)

@app.route('/predict', methods=['POST'])
def predict_emergency():
    """
    Predict if audio contains emergency voice
    Accepts audio file upload or base64 encoded audio
    """
    global classifier
    
    if classifier is None:
        return jsonify({
            'error': 'Model not loaded',
            'is_emergency': False,
            'confidence': 0.0,
            'processing_successful': False
        }), 500
    
    try:
        audio_data = None
        sample_rate = None
        source_info = {}
        
        # Get request data
        if request.is_json:
            data = request.get_json()
            source_info = {
                'source': data.get('source', 'unknown'),
                'timestamp': data.get('timestamp', None)
            }
            logger.info(f"Request from source: {source_info['source']}")
        
        # Check if file was uploaded
        if 'audio' in request.files:
            file = request.files['audio']
            if file.filename != '':
                logger.info(f"Processing uploaded audio file: {file.filename}")
                # Save uploaded file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
                    file.save(tmp_file.name)
                    
                    # Load audio file
                    audio_data, sample_rate = librosa.load(tmp_file.name, sr=classifier.sample_rate)
                    logger.info(f"Loaded audio file: {len(audio_data)} samples at {sample_rate}Hz")
                    
                    # Clean up temp file
                    os.unlink(tmp_file.name)
        
        # Check if base64 audio was provided
        elif request.is_json and 'audio_base64' in data:
            try:
                # Decode base64 audio
                audio_base64 = data['audio_base64']
                logger.info(f"Received base64 audio data of length: {len(audio_base64)}")
                
                if not audio_base64:
                    return jsonify({
                        'error': 'Empty base64 audio data',
                        'is_emergency': False,
                        'confidence': 0.0,
                        'processing_successful': False
                    }), 400
                
                try:
                    audio_bytes = base64.b64decode(audio_base64)
                except Exception as e:
                    logger.error(f"Base64 decoding error: {e}")
                    return jsonify({
                        'error': f'Invalid base64 encoding: {str(e)}',
                        'is_emergency': False,
                        'confidence': 0.0,
                        'processing_successful': False
                    }), 400
                
                # Get mime type
                mime_type = data.get('mimeType', 'audio/wav')
                logger.info(f"Audio mime type: {mime_type}")
                
                # Determine file extension based on mime type
                extension = '.wav'
                format_name = 'wav'
                
                if 'webm' in mime_type:
                    extension = '.webm'
                    format_name = 'webm'
                elif 'mp3' in mime_type:
                    extension = '.mp3'
                    format_name = 'mp3'
                elif 'ogg' in mime_type:
                    extension = '.ogg'
                    format_name = 'ogg'
                elif 'mp4' in mime_type or 'aac' in mime_type:
                    extension = '.m4a'
                    format_name = 'mp4'
                
                # Save to temporary file and load
                with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp_file:
                    tmp_file.write(audio_bytes)
                    tmp_file.flush()
                    tmp_path = tmp_file.name
                
                try:
                    # First try: Convert to WAV using pydub if not already WAV
                    if extension != '.wav':
                        logger.info(f"Converting {extension} to WAV format using pydub")
                        try:
                            # Use pydub to convert
                            audio = AudioSegment.from_file(tmp_path, format=format_name)
                            wav_path = tmp_path + '.wav'
                            audio.export(wav_path, format='wav')
                            
                            # Load the converted WAV
                            audio_data, sample_rate = librosa.load(wav_path, sr=classifier.sample_rate)
                            logger.info(f"Successfully loaded converted audio: {len(audio_data)} samples")
                            
                            # Clean up converted file
                            os.unlink(wav_path)
                        except Exception as e:
                            logger.warning(f"Pydub conversion failed: {e}, trying librosa directly")
                            audio_data, sample_rate = librosa.load(tmp_path, sr=classifier.sample_rate)
                    else:
                        # Load audio file directly if it's WAV
                        audio_data, sample_rate = librosa.load(tmp_path, sr=classifier.sample_rate)
                    
                    logger.info(f"Loaded audio data: {len(audio_data)} samples at {sample_rate}Hz")
                    
                except Exception as e:
                    logger.error(f"All audio loading methods failed: {e}")
                    # Try one last approach - soundfile
                    try:
                        logger.info("Attempting to load with soundfile as fallback")
                        audio_data, sample_rate = sf.read(tmp_path)
                        if sample_rate != classifier.sample_rate:
                            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=classifier.sample_rate)
                            sample_rate = classifier.sample_rate
                    except Exception as sf_error:
                        logger.error(f"Soundfile loading also failed: {sf_error}")
                        return jsonify({
                            'error': f'Could not process audio format: {str(e)}',
                            'is_emergency': False,
                            'confidence': 0.0,
                            'processing_successful': False
                        }), 400
                
                finally:
                    # Clean up temp file
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
                    
            except Exception as e:
                logger.error(f"Error processing base64 audio: {e}")
                return jsonify({
                    'error': f'Failed to process audio data: {str(e)}',
                    'is_emergency': False,
                    'confidence': 0.0,
                    'processing_successful': False
                }), 400
        
        # Check for direct numpy array input
        elif request.is_json and 'audio_array' in data:
            audio_data = np.array(data['audio_array'])
            sample_rate = data.get('sample_rate', classifier.sample_rate)
            logger.info(f"Received audio array of length: {len(audio_data)}")
        
        if audio_data is None:
            return jsonify({
                'error': 'No audio data provided',
                'is_emergency': False,
                'confidence': 0.0,
                'processing_successful': False
            }), 400
        
        # Process audio data
        try:
            audio_data = process_audio_data(audio_data, sample_rate)
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return jsonify({
                'error': f'Audio processing failed: {str(e)}',
                'is_emergency': False,
                'confidence': 0.0,
                'processing_successful': False
            }), 400
        
        # Make prediction
        result = classifier.predict(audio_data)
        
        # Add additional metadata
        result['model_version'] = '1.0'
        result['processing_successful'] = True
        
        # Add source info if available
        if source_info:
            result.update(source_info)
            
        logger.info(f"Prediction made: {result}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}',
            'is_emergency': False,
            'confidence': 0.0,
            'processing_successful': False
        }), 500

@app.route('/predict_file', methods=['POST'])
def predict_from_file():
    """
    Predict emergency from uploaded audio file
    """
    global classifier
    
    if classifier is None:
        return jsonify({
            'error': 'Model not loaded',
            'is_emergency': False,
            'confidence': 0.0
        }), 500
    
    if 'file' not in request.files:
        return jsonify({
            'error': 'No file provided',
            'is_emergency': False,
            'confidence': 0.0
        }), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'error': 'No file selected',
            'is_emergency': False,
            'confidence': 0.0
        }), 400
    
    try:
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            
            # Make prediction
            result = classifier.predict_from_file(tmp_file.name)
            
            # Clean up temp file
            os.unlink(tmp_file.name)
            
            # Add metadata
            result['filename'] = filename
            result['model_version'] = '1.0'
            
            logger.info(f"File prediction made for {filename}: {result}")
            
            return jsonify(result)
            
    except Exception as e:
        logger.error(f"Error in file prediction: {e}")
        return jsonify({
            'error': f'File prediction failed: {str(e)}',
            'is_emergency': False,
            'confidence': 0.0
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """
    Get information about the loaded model
    """
    global classifier
    
    if classifier is None:
        return jsonify({
            'error': 'Model not loaded',
            'model_loaded': False
        }), 500
    
    try:
        info = {
            'model_loaded': True,
            'model_path': classifier.model_path,
            'sample_rate': classifier.sample_rate,
            'duration': classifier.duration,
            'n_mfcc': classifier.n_mfcc,
            'expected_features': classifier.get_feature_count(),
            'model_version': '1.0',
            'supported_formats': ['wav', 'mp3', 'flac', 'm4a'],
            'api_version': '1.0'
        }
        
        if classifier.model is not None:
            info['model_summary'] = {
                'input_shape': classifier.model.input_shape,
                'output_shape': classifier.model.output_shape,
                'total_params': classifier.model.count_params()
            }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({
            'error': f'Failed to get model info: {str(e)}',
            'model_loaded': False
        }), 500

@app.route('/test', methods=['POST'])
def test_endpoint():
    """
    Test endpoint for debugging
    """
    try:
        data = request.get_json() if request.is_json else {}
        
        response = {
            'message': 'Test endpoint working',
            'received_data': data,
            'model_loaded': classifier is not None,
            'timestamp': str(np.datetime64('now'))
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': f'Test failed: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/health',
            '/predict',
            '/predict_file',
            '/model_info',
            '/test'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong on the server'
    }), 500

if __name__ == '__main__':
    print("Starting Emergency Voice Recognition API Server...")
    
    # Initialize model
    if initialize_model():
        print("Model loaded successfully!")
        print("API Server starting on http://localhost:5000")
        print("Available endpoints:")
        print("  GET  /health - Health check")
        print("  POST /predict - Predict from audio data")
        print("  POST /predict_file - Predict from uploaded file")
        print("  GET  /model_info - Get model information")
        print("  POST /test - Test endpoint")
        
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Failed to load model. Please ensure the model files exist.")
        print("Run train_model.py first to train the model.")