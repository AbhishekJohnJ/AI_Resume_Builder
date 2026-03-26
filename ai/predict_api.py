"""
API wrapper for prediction pipeline
Called from Node.js backend
Reads input from stdin instead of command-line arguments
"""
import sys
import json
import base64
import io
import traceback
import os

# Suppress verbose logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from ai.predict import ResumePredictionPipeline

def main():
    """Main entry point for API calls"""
    if len(sys.argv) < 2:
        error_result = {'error': 'Invalid arguments', 'message': 'Missing method'}
        print(json.dumps(error_result))
        sys.exit(1)
    
    method = sys.argv[1]
    
    try:
        # Read input from stdin instead of command-line arguments
        input_data = sys.stdin.read()
        data = json.loads(input_data)
    except json.JSONDecodeError as e:
        error_result = {'error': f'JSON parse error: {str(e)}', 'message': 'Invalid JSON data'}
        print(json.dumps(error_result))
        sys.exit(1)
    except Exception as e:
        error_result = {'error': f'Input error: {str(e)}', 'message': 'Failed to read input'}
        print(json.dumps(error_result))
        sys.exit(1)
    
    try:
        # Initialize pipeline (suppress logging)
        import logging
        logging.getLogger().setLevel(logging.ERROR)
        
        pipeline = ResumePredictionPipeline()
        
        if method == 'predict_pdf':
            # Decode base64 buffer
            file_buffer = base64.b64decode(data['buffer'])
            filename = data.get('filename', 'resume.pdf')
            
            # Predict from PDF
            result = pipeline.predict_from_pdf(file_buffer, filename)
            
        elif method == 'predict_text':
            # Predict from text
            resume_text = data.get('resume_text', '')
            filename = data.get('filename', 'resume.txt')
            
            result = pipeline.predict_from_text(resume_text, filename)
            
        else:
            raise ValueError(f"Unknown method: {method}")
        
        # Output result as JSON (ensure all values are JSON serializable)
        output = json.dumps(result, default=str)
        print(output)
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'message': 'Analysis failed',
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_result, default=str))
        sys.exit(1)

if __name__ == '__main__':
    main()
