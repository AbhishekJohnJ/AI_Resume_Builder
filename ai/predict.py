"""
Complete prediction pipeline for resume analysis
"""
import numpy as np
import joblib
import os

from ai.pdf_parser import PDFParser
from ai.preprocess import FeatureExtractor
from ai.embedder import Embedder
from ai.feedback import FeedbackEngine
from ai.data.dataset_loader import DatasetLoader
from ai.config import (
    MODEL_SCORE_PATH, MODEL_LEVEL_PATH, SCALER_PATH,
    EMBEDDER_MODEL, SCORE_THRESHOLDS
)

class ResumePredictionPipeline:
    """Complete pipeline for resume analysis and prediction"""
    
    def __init__(self):
        """Initialize pipeline with models and embedder"""
        print("\n" + "="*70)
        print("🚀 INITIALIZING RESUME PREDICTION PIPELINE")
        print("="*70)
        
        # Load models
        self.score_model = self._load_model(MODEL_SCORE_PATH, 'Score Model')
        self.level_model = self._load_model(MODEL_LEVEL_PATH, 'Level Model')
        self.scaler = self._load_model(SCALER_PATH, 'Scaler')
        
        # Initialize embedder
        self.embedder = Embedder(EMBEDDER_MODEL)
        
        # Get feature columns
        self.feature_cols = DatasetLoader.get_feature_columns()
        
        print("✅ Pipeline initialized successfully\n")
    
    def _load_model(self, path, name):
        """Load model from disk"""
        if not os.path.exists(path):
            raise FileNotFoundError(f"❌ {name} not found at {path}. Run training first.")
        
        model = joblib.load(path)
        print(f"   ✅ {name} loaded")
        return model
    
    def predict_from_pdf(self, file_buffer, filename='resume.pdf'):
        """
        Complete prediction from PDF file
        
        Args:
            file_buffer: PDF file buffer/bytes
            filename: Original filename
            
        Returns:
            dict: Complete analysis result
        """
        print("\n" + "="*70)
        print("📄 ANALYZING RESUME FROM PDF")
        print("="*70)
        
        try:
            # Step 1: Extract text from PDF
            print("\n1️⃣  Extracting text from PDF...")
            extraction = PDFParser.extract_text(file_buffer=file_buffer)
            resume_text = extraction['text']
            
            # Step 2: Generate prediction
            result = self.predict_from_text(resume_text, filename)
            result['extraction'] = extraction
            
            return result
            
        except Exception as e:
            print(f"❌ PDF analysis error: {str(e)}")
            raise Exception(f"Failed to analyze PDF: {str(e)}")
    
    def predict_from_text(self, resume_text, filename='resume.txt'):
        """
        Complete prediction from resume text
        
        Args:
            resume_text: Raw resume text
            filename: Source filename
            
        Returns:
            dict: Complete analysis result
        """
        print("\n" + "="*70)
        print("📝 ANALYZING RESUME FROM TEXT")
        print("="*70)
        
        try:
            # Step 1: Extract features
            print("\n1️⃣  Extracting features...")
            features = FeatureExtractor.extract_features(resume_text)
            
            # Step 2: Create combined text for embedding
            print("\n2️⃣  Creating combined text for embedding...")
            combined_text = FeatureExtractor.create_combined_text(resume_text, features)
            
            # Step 3: Generate embedding
            print("\n3️⃣  Generating embedding...")
            embedding = self.embedder.embed_text(combined_text)
            print(f"   ✅ Embedding generated: {embedding.shape}")
            
            # Step 4: Prepare features for model
            print("\n4️⃣  Preparing features for prediction...")
            feature_vector = self._prepare_feature_vector(features)
            print(f"   ✅ Feature vector prepared: {feature_vector.shape}")
            
            # Step 5: Combine embedding + numeric features
            print("\n5️⃣  Combining embedding with numeric features...")
            combined_features = np.concatenate([embedding, feature_vector])
            print(f"   ✅ Combined features: {combined_features.shape}")
            
            # Step 6: Predict score
            print("\n6️⃣  Predicting resume score...")
            score = self.score_model.predict([combined_features])[0]
            score = max(0, min(100, score))  # Clamp to 0-100
            print(f"   ✅ Resume Score: {score:.1f}/100")
            
            # Step 7: Predict level
            print("\n7️⃣  Predicting resume level...")
            level = self.level_model.predict([combined_features])[0]
            print(f"   ✅ Resume Level: {level}")
            
            # Step 8: Generate feedback
            print("\n8️⃣  Generating personalized feedback...")
            feedback = FeedbackEngine.generate_feedback(features, score, level)
            
            # Step 9: Compile result
            print("\n9️⃣  Compiling final result...")
            result = {
                'filename': filename,
                'resume_score': float(score),
                'resume_level': level,
                'features': features,
                'weak_areas': feedback['weak_areas'],
                'suggestions': feedback['suggestions'],
                'recommended_tasks': feedback['recommended_tasks'],
                'embedding_dim': len(embedding),
                'feature_count': len(feature_vector)
            }
            
            print("\n" + "="*70)
            print("✅ ANALYSIS COMPLETE")
            print("="*70)
            print(f"Score: {result['resume_score']:.1f}/100")
            print(f"Level: {result['resume_level']}")
            print(f"Weak Areas: {len(result['weak_areas'])}")
            print(f"Suggestions: {len(result['suggestions'])}")
            print(f"Tasks: {len(result['recommended_tasks'])}\n")
            
            return result
            
        except Exception as e:
            print(f"❌ Analysis error: {str(e)}")
            raise Exception(f"Failed to analyze resume: {str(e)}")
    
    def _prepare_feature_vector(self, features):
        """
        Prepare numeric feature vector for model
        
        Args:
            features: Extracted features dict
            
        Returns:
            np.ndarray: Feature vector
        """
        feature_vector = np.array([
            features.get('skill_count', 0),
            features.get('project_count', 0),
            features.get('cert_count', 0),
            features.get('has_github', 0),
            features.get('has_linkedin', 0),
            features.get('has_portfolio', 0),
            features.get('experience_years', 0),
            features.get('education_level', 0),
        ], dtype=np.float32)
        
        return feature_vector
