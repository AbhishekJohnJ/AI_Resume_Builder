"""
Feature extraction from resume text
"""
import re
from collections import Counter

class FeatureExtractor:
    """Extract structured features from resume text"""
    
    # Skill keywords database
    SKILL_KEYWORDS = {
        'Python': ['python', 'py'],
        'JavaScript': ['javascript', 'js', 'node', 'nodejs'],
        'Java': ['java'],
        'C++': ['c++', 'cpp'],
        'SQL': ['sql', 'mysql', 'postgresql', 'oracle'],
        'React': ['react', 'reactjs'],
        'Angular': ['angular', 'angularjs'],
        'Vue': ['vue', 'vuejs'],
        'Docker': ['docker'],
        'Kubernetes': ['kubernetes', 'k8s'],
        'AWS': ['aws', 'amazon'],
        'GCP': ['gcp', 'google cloud'],
        'Azure': ['azure'],
        'Git': ['git', 'github', 'gitlab'],
        'Linux': ['linux', 'ubuntu'],
        'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'pytorch', 'scikit-learn'],
        'Data Science': ['data science', 'pandas', 'numpy'],
        'DevOps': ['devops', 'ci/cd', 'jenkins'],
        'REST API': ['rest', 'api', 'restful'],
        'MongoDB': ['mongodb', 'nosql'],
    }
    
    # Certification keywords
    CERT_KEYWORDS = [
        'certification', 'certified', 'aws certified', 'gcp certified', 'azure certified',
        'ccna', 'cissp', 'ceh', 'oscp', 'ckad', 'cka', 'scrum master', 'pmp'
    ]
    
    # Project keywords
    PROJECT_KEYWORDS = [
        'project', 'built', 'developed', 'created', 'implemented', 'designed',
        'github', 'deployed', 'live', 'website', 'application', 'system'
    ]
    
    @staticmethod
    def extract_features(resume_text):
        """
        Extract all features from resume text
        
        Args:
            resume_text: Raw resume text
            
        Returns:
            dict: Extracted features
        """
        print("🔍 Extracting features from resume...")
        
        text_lower = resume_text.lower()
        
        features = {
            'skill_count': FeatureExtractor._extract_skill_count(text_lower),
            'project_count': FeatureExtractor._extract_project_count(text_lower),
            'cert_count': FeatureExtractor._extract_cert_count(text_lower),
            'has_github': FeatureExtractor._has_github(text_lower),
            'has_linkedin': FeatureExtractor._has_linkedin(text_lower),
            'has_portfolio': FeatureExtractor._has_portfolio(text_lower),
            'experience_years': FeatureExtractor._extract_experience_years(text_lower),
            'education_level': FeatureExtractor._extract_education_level(text_lower),
            'top_skills': FeatureExtractor._extract_top_skills(text_lower),
            'keywords': FeatureExtractor._extract_keywords(text_lower),
        }
        
        print(f"✅ Features extracted: {len(features)} features")
        print(f"   Skills: {features['skill_count']}")
        print(f"   Projects: {features['project_count']}")
        print(f"   Certifications: {features['cert_count']}")
        
        return features
    
    @staticmethod
    def _extract_skill_count(text):
        """Count unique skills found in text"""
        count = 0
        for skill_group in FeatureExtractor.SKILL_KEYWORDS.values():
            for keyword in skill_group:
                if keyword in text:
                    count += 1
                    break
        return count
    
    @staticmethod
    def _extract_project_count(text):
        """Estimate project count from keywords"""
        count = 0
        for keyword in FeatureExtractor.PROJECT_KEYWORDS:
            count += len(re.findall(r'\b' + keyword + r'\b', text))
        return max(0, min(count // 2, 10))  # Normalize to 0-10
    
    @staticmethod
    def _extract_cert_count(text):
        """Count certifications mentioned"""
        count = 0
        for keyword in FeatureExtractor.CERT_KEYWORDS:
            if keyword in text:
                count += 1
        return count
    
    @staticmethod
    def _has_github(text):
        """Check if GitHub profile mentioned"""
        return 1 if 'github' in text or 'github.com' in text else 0
    
    @staticmethod
    def _has_linkedin(text):
        """Check if LinkedIn profile mentioned"""
        return 1 if 'linkedin' in text or 'linkedin.com' in text else 0
    
    @staticmethod
    def _has_portfolio(text):
        """Check if portfolio website mentioned"""
        portfolio_keywords = ['portfolio', 'website', 'personal website', 'my website']
        return 1 if any(kw in text for kw in portfolio_keywords) else 0
    
    @staticmethod
    def _extract_experience_years(text):
        """Extract years of experience"""
        matches = re.findall(r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)', text)
        if matches:
            return int(matches[0])
        return 0
    
    @staticmethod
    def _extract_education_level(text):
        """Extract education level"""
        education_levels = {
            'PhD': 4,
            'Master': 3,
            'Bachelor': 2,
            'Diploma': 1,
            'High School': 0
        }
        
        for level, score in education_levels.items():
            if level.lower() in text:
                return score
        return 0
    
    @staticmethod
    def _extract_top_skills(text):
        """Extract top skills mentioned"""
        found_skills = []
        for skill, keywords in FeatureExtractor.SKILL_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    found_skills.append(skill)
                    break
        return found_skills[:10]  # Top 10 skills
    
    @staticmethod
    def _extract_keywords(text):
        """Extract important keywords"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        
        words = re.findall(r'\b[a-z]{4,}\b', text.lower())
        word_freq = Counter(words)
        
        # Remove stop words
        keywords = [word for word, _ in word_freq.most_common(20) if word not in stop_words]
        return keywords
    
    @staticmethod
    def create_combined_text(resume_text, features):
        """
        Create combined text for embedding
        
        Args:
            resume_text: Original resume text
            features: Extracted features dict
            
        Returns:
            str: Combined text for embedding
        """
        combined = f"""
Resume Analysis:
Skills: {', '.join(features.get('top_skills', []))}
Projects: {features.get('project_count', 0)} projects
Certifications: {features.get('cert_count', 0)} certifications
Experience: {features.get('experience_years', 0)} years
Education: {features.get('education_level', 0)}
GitHub: {'Yes' if features.get('has_github') else 'No'}
LinkedIn: {'Yes' if features.get('has_linkedin') else 'No'}
Portfolio: {'Yes' if features.get('has_portfolio') else 'No'}

Resume Text:
{resume_text[:2000]}
"""
        return combined
