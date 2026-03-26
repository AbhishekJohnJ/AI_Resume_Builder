"""
Train ML models for resume scoring and classification
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

from ai.data.dataset_loader import DatasetLoader
from ai.embedder import Embedder
from ai.preprocess import FeatureExtractor
from ai.config import (
    MODEL_SCORE_PATH, MODEL_LEVEL_PATH, SCALER_PATH, EMBEDDER_PATH,
    DATASET_PATH, EMBEDDER_MODEL
)

class ModelTrainer:
    """Train and save ML models"""
    
    @staticmethod
    def train_all_models():
        """Train all models: score regressor, level classifier, and scaler"""
        print("\n" + "="*70)
        print("🚀 TRAINING AI RESUME ANALYZER MODELS")
        print("="*70)
        
        # Load dataset
        df = DatasetLoader.load_dataset(DATASET_PATH)
        
        # Get feature columns
        feature_cols = DatasetLoader.get_feature_columns()
        X = df[feature_cols].values
        y_score = df['Resume_Score'].values
        y_level = df['Resume_Level'].values
        
        print(f"\n📊 Dataset shape: {X.shape}")
        print(f"   Features: {len(feature_cols)}")
        print(f"   Samples: {len(X)}")
        
        # Train score model (regression)
        print("\n" + "-"*70)
        print("1️⃣  Training Resume Score Model (Regression)...")
        print("-"*70)
        score_model = ModelTrainer._train_score_model(X, y_score)
        
        # Train level model (classification)
        print("\n" + "-"*70)
        print("2️⃣  Training Resume Level Model (Classification)...")
        print("-"*70)
        level_model = ModelTrainer._train_level_model(X, y_level)
        
        # Train scaler
        print("\n" + "-"*70)
        print("3️⃣  Training Feature Scaler...")
        print("-"*70)
        scaler = ModelTrainer._train_scaler(X)
        
        # Save models
        print("\n" + "-"*70)
        print("💾 Saving Models...")
        print("-"*70)
        ModelTrainer._save_models(score_model, level_model, scaler)
        
        print("\n" + "="*70)
        print("✅ ALL MODELS TRAINED AND SAVED SUCCESSFULLY")
        print("="*70 + "\n")
    
    @staticmethod
    def _train_score_model(X, y):
        """Train regression model for resume score"""
        print("   Training RandomForestRegressor...")
        
        # Handle small datasets
        if len(X) < 5:
            print(f"   ⚠️  Small dataset ({len(X)} samples). Using all data for training.")
            X_train, X_test = X, X
            y_train, y_test = y, y
        else:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        print(f"   ✅ Score Model trained")
        print(f"      Train R²: {train_score:.4f}")
        print(f"      Test R²: {test_score:.4f}")
        
        return model
    
    @staticmethod
    def _train_level_model(X, y):
        """Train classification model for resume level"""
        print("   Training RandomForestClassifier...")
        
        # Handle small datasets
        if len(X) < 5:
            print(f"   ⚠️  Small dataset ({len(X)} samples). Using all data for training.")
            X_train, X_test = X, X
            y_train, y_test = y, y
        else:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        print(f"   ✅ Level Model trained")
        print(f"      Train Accuracy: {train_score:.4f}")
        print(f"      Test Accuracy: {test_score:.4f}")
        
        return model
    
    @staticmethod
    def _train_scaler(X):
        """Train feature scaler"""
        print("   Training StandardScaler...")
        
        scaler = StandardScaler()
        scaler.fit(X)
        
        print(f"   ✅ Scaler trained")
        
        return scaler
    
    @staticmethod
    def _save_models(score_model, level_model, scaler):
        """Save trained models to disk"""
        os.makedirs('ai/models', exist_ok=True)
        
        joblib.dump(score_model, MODEL_SCORE_PATH)
        print(f"   ✅ Score model saved: {MODEL_SCORE_PATH}")
        
        joblib.dump(level_model, MODEL_LEVEL_PATH)
        print(f"   ✅ Level model saved: {MODEL_LEVEL_PATH}")
        
        joblib.dump(scaler, SCALER_PATH)
        print(f"   ✅ Scaler saved: {SCALER_PATH}")

if __name__ == '__main__':
    ModelTrainer.train_all_models()
