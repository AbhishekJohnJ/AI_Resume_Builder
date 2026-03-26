"""
Configuration for AI Resume Analyzer
"""

# Model paths
MODEL_SCORE_PATH = 'ai/models/score_model.pkl'
MODEL_LEVEL_PATH = 'ai/models/level_model.pkl'
SCALER_PATH = 'ai/models/scaler.pkl'
EMBEDDER_PATH = 'ai/models/embedder.pkl'

# Dataset path
DATASET_PATH = 'dataset/resume-dataset.json'

# Hugging Face model
EMBEDDER_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'

# Feature dimensions
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension

# Scoring thresholds
SCORE_THRESHOLDS = {
    'Excellent': (90, 100),
    'Good': (70, 89),
    'Average': (50, 69),
    'Needs Improvement': (0, 49)
}

# Weak areas and suggestions
WEAK_AREAS_RULES = {
    'low_skills': {'threshold': 5, 'message': 'Limited technical skills'},
    'no_projects': {'threshold': 0, 'message': 'No projects in resume'},
    'no_certifications': {'threshold': 0, 'message': 'No certifications'},
    'low_github': {'threshold': 3, 'message': 'Low GitHub activity'},
    'low_linkedin': {'threshold': 3, 'message': 'Weak LinkedIn profile'},
    'low_ats': {'threshold': 50, 'message': 'Poor ATS score'},
}

SUGGESTIONS = [
    'Add more technical skills to your resume',
    'Build and showcase 2-3 projects on GitHub',
    'Complete at least 1 industry certification',
    'Optimize your resume for ATS keywords',
    'Improve your LinkedIn profile with recent updates',
    'Add quantifiable achievements to your experience',
    'Include a portfolio website link',
    'Highlight your open-source contributions',
]

RECOMMENDED_TASKS = [
    'Complete 1 certification this month',
    'Build 1 new project and push to GitHub',
    'Update LinkedIn profile with recent work',
    'Solve 50 DSA problems',
    'Apply to 5 internships',
    'Create a personal portfolio website',
    'Write 2 technical blog posts',
    'Make 1 open-source contribution',
]
