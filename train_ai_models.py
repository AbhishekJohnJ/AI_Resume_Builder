#!/usr/bin/env python3
"""
Training script for AI Resume Analyzer
Run this to train all models before using the API
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai.train_model import ModelTrainer

if __name__ == '__main__':
    try:
        ModelTrainer.train_all_models()
        print("\n✅ Training complete! Models are ready for predictions.")
    except Exception as e:
        print(f"\n❌ Training failed: {str(e)}")
        sys.exit(1)
