"""
Dataset loader and preparation
"""
import json
import pandas as pd
from pathlib import Path

class DatasetLoader:
    """Load and prepare resume training dataset"""
    
    @staticmethod
    def load_dataset(dataset_path):
        """
        Load dataset from JSON file
        
        Args:
            dataset_path: Path to resume-dataset.json
            
        Returns:
            pd.DataFrame: Cleaned dataset with all required columns
        """
        print(f"📂 Loading dataset from {dataset_path}...")
        
        with open(dataset_path, 'r') as f:
            data = json.load(f)
        
        records = data.get('records', [])
        df = pd.DataFrame(records)
        
        print(f"✅ Loaded {len(df)} records")
        
        # Clean missing values
        df = DatasetLoader._clean_data(df)
        
        # Ensure numeric columns
        df = DatasetLoader._ensure_numeric_columns(df)
        
        # Validate required columns
        df = DatasetLoader._validate_columns(df)
        
        return df
    
    @staticmethod
    def _clean_data(df):
        """Clean missing values"""
        print("🧹 Cleaning data...")
        
        # Fill missing numeric columns with 0
        numeric_cols = ['Projects_Count', 'Certifications_Count', 'GitHub_Activity_Score', 
                       'LinkedIn_Activity_Score', 'Internships_Count', 'DSA_Score', 
                       'Open_Source_Contributions', 'ATS_Score', 'Resume_Score']
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = df[col].fillna(0)
        
        # Fill missing text columns
        text_cols = ['Skills', 'Projects', 'Certifications', 'Weak_Areas', 'Suggestions', 'Recommended_Tasks']
        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].fillna('')
        
        print(f"✅ Data cleaned")
        return df
    
    @staticmethod
    def _ensure_numeric_columns(df):
        """Ensure numeric columns are actually numeric"""
        print("🔢 Converting to numeric types...")
        
        numeric_cols = ['Projects_Count', 'Certifications_Count', 'GitHub_Activity_Score', 
                       'LinkedIn_Activity_Score', 'Internships_Count', 'DSA_Score', 
                       'Open_Source_Contributions', 'ATS_Score', 'Resume_Score']
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        print(f"✅ Numeric conversion complete")
        return df
    
    @staticmethod
    def _validate_columns(df):
        """Validate required columns exist"""
        print("✔️ Validating required columns...")
        
        required_cols = ['Resume_Score', 'Resume_Level', 'Weak_Areas', 'Suggestions', 'Recommended_Tasks']
        
        for col in required_cols:
            if col not in df.columns:
                print(f"⚠️  Missing column: {col}")
                if col == 'Resume_Score':
                    df[col] = 50
                elif col == 'Resume_Level':
                    df[col] = 'Average'
                else:
                    df[col] = ''
        
        print(f"✅ All required columns present")
        return df
    
    @staticmethod
    def get_feature_columns():
        """Get list of feature columns for training"""
        return [
            'Projects_Count', 'Certifications_Count', 'GitHub_Activity_Score',
            'LinkedIn_Activity_Score', 'Internships_Count', 'DSA_Score',
            'Open_Source_Contributions', 'ATS_Score'
        ]
    
    @staticmethod
    def get_target_columns():
        """Get list of target columns"""
        return ['Resume_Score', 'Resume_Level']
