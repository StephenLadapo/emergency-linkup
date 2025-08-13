#!/usr/bin/env python3
"""Retrain the Emergency Voice Detection Model"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from train_model import main

if __name__ == "__main__":
    print("Retraining Emergency Voice Detection Model...")
    main()
