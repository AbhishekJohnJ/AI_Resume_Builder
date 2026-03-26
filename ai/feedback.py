"""
Feedback engine for weak areas, suggestions, and recommendations
"""
import random
from ai.config import WEAK_AREAS_RULES, SUGGESTIONS, RECOMMENDED_TASKS

class FeedbackEngine:
    """Generate personalized feedback based on resume analysis"""
    
    @staticmethod
    def generate_feedback(features, score, level):
        """
        Generate weak areas, suggestions, and recommended tasks
        
        Args:
            features: Extracted features dict
            score: Resume score (0-100)
            level: Resume level (Excellent, Good, Average, Needs Improvement)
            
        Returns:
            dict: {
                'weak_areas': list of weak areas,
                'suggestions': list of suggestions,
                'recommended_tasks': list of recommended tasks
            }
        """
        print("💡 Generating personalized feedback...")
        
        weak_areas = FeedbackEngine._identify_weak_areas(features, score)
        suggestions = FeedbackEngine._generate_suggestions(features, weak_areas)
        tasks = FeedbackEngine._generate_tasks(features, level)
        
        feedback = {
            'weak_areas': weak_areas,
            'suggestions': suggestions,
            'recommended_tasks': tasks
        }
        
        print(f"✅ Feedback generated")
        print(f"   Weak areas: {len(weak_areas)}")
        print(f"   Suggestions: {len(suggestions)}")
        print(f"   Tasks: {len(tasks)}")
        
        return feedback
    
    @staticmethod
    def _identify_weak_areas(features, score):
        """Identify weak areas based on features"""
        weak_areas = []
        
        # Low skills
        if features.get('skill_count', 0) < 5:
            weak_areas.append('Limited technical skills - add more relevant skills to your resume')
        
        # No projects
        if features.get('project_count', 0) == 0:
            weak_areas.append('No projects mentioned - build and showcase projects on GitHub')
        
        # No certifications
        if features.get('cert_count', 0) == 0:
            weak_areas.append('No certifications - complete at least one industry certification')
        
        # Low GitHub
        if not features.get('has_github', 0):
            weak_areas.append('No GitHub profile - create and maintain an active GitHub account')
        
        # Low LinkedIn
        if not features.get('has_linkedin', 0):
            weak_areas.append('No LinkedIn profile - create and optimize your LinkedIn profile')
        
        # No portfolio
        if not features.get('has_portfolio', 0):
            weak_areas.append('No portfolio website - create a personal portfolio to showcase work')
        
        # Low experience
        if features.get('experience_years', 0) < 1:
            weak_areas.append('Limited work experience - seek internships or entry-level positions')
        
        # Low education
        if features.get('education_level', 0) < 2:
            weak_areas.append('Education level could be improved - consider pursuing higher education')
        
        # Low score
        if score < 50:
            weak_areas.append('Overall resume quality is low - focus on improving multiple areas')
        
        return weak_areas[:5]  # Top 5 weak areas
    
    @staticmethod
    def _generate_suggestions(features, weak_areas):
        """Generate actionable suggestions"""
        suggestions = []
        
        # Based on weak areas
        if any('skills' in area.lower() for area in weak_areas):
            suggestions.append('Add 5-10 more technical skills relevant to your target role')
        
        if any('project' in area.lower() for area in weak_areas):
            suggestions.append('Build 2-3 portfolio projects and push them to GitHub')
        
        if any('certification' in area.lower() for area in weak_areas):
            suggestions.append('Complete 1-2 industry certifications (AWS, GCP, Azure, etc.)')
        
        if any('github' in area.lower() for area in weak_areas):
            suggestions.append('Create GitHub profile and push at least 10 projects')
        
        if any('linkedin' in area.lower() for area in weak_areas):
            suggestions.append('Optimize LinkedIn profile with professional photo and detailed experience')
        
        if any('portfolio' in area.lower() for area in weak_areas):
            suggestions.append('Create a personal portfolio website showcasing your best work')
        
        if any('experience' in area.lower() for area in weak_areas):
            suggestions.append('Apply to internships to gain practical work experience')
        
        # Add random suggestions
        while len(suggestions) < 4:
            suggestion = random.choice(SUGGESTIONS)
            if suggestion not in suggestions:
                suggestions.append(suggestion)
        
        return suggestions[:4]  # Top 4 suggestions
    
    @staticmethod
    def _generate_tasks(features, level):
        """Generate recommended tasks based on level"""
        tasks = []
        
        if level == 'Needs Improvement':
            tasks = [
                'Complete 1 certification this month',
                'Build 1 new project and push to GitHub',
                'Solve 50 DSA problems',
                'Apply to 5 internships'
            ]
        elif level == 'Average':
            tasks = [
                'Complete 1 advanced certification',
                'Build 2 new projects with real-world impact',
                'Solve 100 DSA problems',
                'Make 1 open-source contribution'
            ]
        elif level == 'Good':
            tasks = [
                'Complete 1 specialized certification',
                'Build 1 complex project with multiple technologies',
                'Contribute to 2 open-source projects',
                'Write 2 technical blog posts'
            ]
        else:  # Excellent
            tasks = [
                'Mentor junior developers',
                'Lead an open-source project',
                'Publish research or technical papers',
                'Speak at tech conferences'
            ]
        
        return tasks
