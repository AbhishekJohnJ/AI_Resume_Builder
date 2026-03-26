"""
PDF Text Extractor using PyMuPDF (fitz)
Extracts text from PDF files reliably
"""
import sys
import json
import fitz  # PyMuPDF
import os


def extract_text_from_pdf(pdf_path):
    """
    Extract text from PDF file using PyMuPDF
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        dict: Contains extracted text, page count, and metadata
    """
    try:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        if not pdf_path.lower().endswith('.pdf'):
            raise ValueError(f"File is not a PDF: {pdf_path}")
        
        print(f"📄 [PDF EXTRACTOR] Opening: {pdf_path}", file=sys.stderr)
        
        # Open PDF
        doc = fitz.open(pdf_path)
        text = ""
        page_count = len(doc)
        
        print(f"📖 [PDF EXTRACTOR] Pages: {page_count}", file=sys.stderr)
        
        # Extract text from each page
        for page_num, page in enumerate(doc, 1):
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
            print(f"   Page {page_num}/{page_count}: {len(page_text)} chars", file=sys.stderr)
        
        # Close document
        doc.close()
        
        # Clean up text
        text = text.strip()
        
        if not text or len(text) == 0:
            raise ValueError("No text extracted from PDF")
        
        print(f"✅ [PDF EXTRACTOR] Success", file=sys.stderr)
        print(f"   Total text: {len(text)} characters", file=sys.stderr)
        print(f"   Preview: {text[:100]}...", file=sys.stderr)
        
        return {
            "success": True,
            "text": text,
            "pages": page_count,
            "length": len(text),
            "preview": text[:300]
        }
        
    except FileNotFoundError as e:
        print(f"❌ [PDF EXTRACTOR] File not found: {e}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "error_type": "FileNotFoundError"
        }
    except ValueError as e:
        print(f"❌ [PDF EXTRACTOR] Invalid PDF: {e}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "error_type": "ValueError"
        }
    except Exception as e:
        print(f"❌ [PDF EXTRACTOR] Error: {e}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }


if __name__ == "__main__":
    """
    Command line usage:
    python ai/pdf_extractor.py <pdf_path>
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No PDF path provided",
            "usage": "python ai/pdf_extractor.py <pdf_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = extract_text_from_pdf(pdf_path)
    print(json.dumps(result))
