#!/usr/bin/env python3
"""
Quick test to verify AI module setup
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all imports work"""
    print("🧪 Testing imports...")
    try:
        from ai.config import MODEL_SCORE_PATH, MODEL_LEVEL_PATH
        print("   ✅ config.py")
        
        from ai.pdf_parser import PDFParser
        print("   ✅ pdf_parser.py")
        
        from ai.preprocess import FeatureExtractor
        print("   ✅ preprocess.py")
        
        from ai.embedder import Embedder
        print("   ✅ embedder.py")
        
        from ai.feedback import FeedbackEngine
        print("   ✅ feedback.py")
        
        from ai.data.dataset_loader import DatasetLoader
        print("   ✅ dataset_loader.py")
        
        print("✅ All imports successful\n")
        return True
    except Exception as e:
        print(f"❌ Import error: {str(e)}\n")
        return False

def test_models_exist():
    """Test if trained models exist"""
    print("🧪 Checking trained models...")
    from ai.config import MODEL_SCORE_PATH, MODEL_LEVEL_PATH, SCALER_PATH
    
    score_exists = os.path.exists(MODEL_SCORE_PATH)
    level_exists = os.path.exists(MODEL_LEVEL_PATH)
    scaler_exists = os.path.exists(SCALER_PATH)
    
    print(f"   Score model: {'✅' if score_exists else '❌'} {MODEL_SCORE_PATH}")
    print(f"   Level model: {'✅' if level_exists else '❌'} {MODEL_LEVEL_PATH}")
    print(f"   Scaler: {'✅' if scaler_exists else '❌'} {SCALER_PATH}")
    
    if score_exists and level_exists and scaler_exists:
        print("✅ All models exist\n")
        return True
    else:
        print("❌ Some models missing. Run: python train_ai_models.py\n")
        return False

def test_dataset():
    """Test if dataset loads"""
    print("🧪 Testing dataset loading...")
    try:
        from ai.data.dataset_loader import DatasetLoader
        from ai.config import DATASET_PATH
        
        df = DatasetLoader.load_dataset(DATASET_PATH)
        print(f"   ✅ Dataset loaded: {len(df)} records")
        print(f"   Columns: {len(df.columns)}")
        print("✅ Dataset test passed\n")
        return True
    except Exception as e:
        print(f"❌ Dataset error: {str(e)}\n")
        return False

def test_feature_extraction():
    """Test feature extraction"""
    print("🧪 Testing feature extraction...")
    try:
        from ai.preprocess import FeatureExtractor
        
        sample_text = """
        John Doe
        Software Engineer
        
        Skills: Python, JavaScript, React, Docker, Kubernetes, AWS
        
        Projects:
        - Built a machine learning model
        - Created a web application
        - Developed a mobile app
        
        Certifications:
        - AWS Solutions Architect
        - Kubernetes CKA
        
        GitHub: github.com/johndoe
        LinkedIn: linkedin.com/in/johndoe
        
        Experience: 5 years
        Education: Master's in Computer Science
        """
        
        features = FeatureExtractor.extract_features(sample_text)
        print(f"   ✅ Features extracted")
        print(f"      Skills: {features['skill_count']}")
        print(f"      Projects: {features['project_count']}")
        print(f"      Certifications: {features['cert_count']}")
        print(f"      GitHub: {features['has_github']}")
        print(f"      LinkedIn: {features['has_linkedin']}")
        print("✅ Feature extraction test passed\n")
        return True
    except Exception as e:
        print(f"❌ Feature extraction error: {str(e)}\n")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("🧪 AI MODULE SETUP TEST")
    print("="*70 + "\n")
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Models", test_models_exist()))
    results.append(("Dataset", test_dataset()))
    results.append(("Features", test_feature_extraction()))
    
    print("="*70)
    print("📊 TEST RESULTS")
    print("="*70)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:20} {status}")
    
    all_passed = all(result[1] for result in results)
    
    print("="*70)
    if all_passed:
        print("✅ ALL TESTS PASSED - AI module is ready!")
    else:
        print("❌ SOME TESTS FAILED - Check errors above")
    print("="*70 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
