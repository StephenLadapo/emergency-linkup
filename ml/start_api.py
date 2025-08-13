#!/usr/bin/env python3
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
