"""
PDF text extraction using PyMuPDF
"""
import fitz  # PyMuPDF
import os

class PDFParser:
    """Extract text from PDF files"""
    
    @staticmethod
    def extract_text(file_path=None, file_buffer=None):
        """
        Extract text from PDF file
        
        Args:
            file_path: Path to PDF file (optional)
            file_buffer: File buffer/bytes (optional)
            
        Returns:
            dict: {
                'text': extracted text,
                'filename': filename,
                'pages': number of pages,
                'length': text length,
                'preview': first 300 chars
            }
        """
        try:
            print(f"📄 Extracting PDF text...")
            
            # Open PDF from file or buffer
            if file_buffer:
                doc = fitz.open(stream=file_buffer, filetype='pdf')
                filename = 'uploaded_resume.pdf'
            elif file_path:
                if not os.path.exists(file_path):
                    raise FileNotFoundError(f"File not found: {file_path}")
                doc = fitz.open(file_path)
                filename = os.path.basename(file_path)
            else:
                raise ValueError("Either file_path or file_buffer must be provided")
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += page.get_text()
            
            doc.close()
            
            # Validate extraction
            text = text.strip()
            if not text:
                raise ValueError("No text extracted from PDF")
            
            if len(text) < 50:
                raise ValueError(f"Extracted text too short ({len(text)} chars). Minimum 50 required.")
            
            # Prepare result
            result = {
                'text': text,
                'filename': filename,
                'pages': len(doc),
                'length': len(text),
                'preview': text[:300]
            }
            
            print(f"✅ Extracted {len(text)} characters from {len(doc)} pages")
            print(f"📝 Preview: {result['preview'][:100]}...")
            
            return result
            
        except Exception as e:
            print(f"❌ PDF extraction error: {str(e)}")
            raise Exception(f"PDF extraction failed: {str(e)}")
    
    @staticmethod
    def validate_pdf(file_buffer):
        """
        Validate if buffer is a valid PDF
        
        Args:
            file_buffer: File buffer/bytes
            
        Returns:
            bool: True if valid PDF
        """
        try:
            doc = fitz.open(stream=file_buffer, filetype='pdf')
            is_valid = len(doc) > 0
            doc.close()
            return is_valid
        except:
            return False
