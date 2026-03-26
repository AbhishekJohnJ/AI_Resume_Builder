/**
 * PDF Text Extractor
 * Extracts text from PDF files using Python PyMuPDF (fitz)
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class PDFExtractor {
  /**
   * Extract text from PDF buffer using Python PyMuPDF
   */
  static async extractText(file) {
    return new Promise((resolve, reject) => {
      try {
        if (!file) {
          throw new Error('No file provided');
        }

        const { buffer, originalname } = file;
        
        if (!buffer) {
          throw new Error('No file buffer provided');
        }

        console.log(`\n📄 [PDF EXTRACTOR] Processing: ${originalname}`);
        console.log(`   Buffer size: ${buffer.length} bytes`);

        // Create temporary file with safe name
        const tempDir = os.tmpdir();
        const tempFilename = `resume_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
        const tempPath = path.join(tempDir, tempFilename);

        console.log(`   Temp file: ${tempPath}`);

        // Write buffer to temporary file
        fs.writeFileSync(tempPath, buffer);
        console.log(`✅ [PDF EXTRACTOR] Temp file created`);

        // Get path to Python script
        const pythonScriptPath = path.join(__dirname, '..', '..', 'ai', 'pdf_extractor.py');
        
        console.log(`🐍 [PDF EXTRACTOR] Running Python extraction`);
        console.log(`   Script: ${pythonScriptPath}`);

        // Spawn Python process
        const pythonProcess = spawn('python', [pythonScriptPath, tempPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        // Capture stdout
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        // Capture stderr (debug logs)
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.log(`   [PYTHON] ${data.toString().trim()}`);
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          // Clean up temp file
          try {
            fs.unlinkSync(tempPath);
            console.log(`🗑️  [PDF EXTRACTOR] Temp file cleaned up`);
          } catch (e) {
            console.warn(`⚠️  [PDF EXTRACTOR] Could not delete temp file: ${e.message}`);
          }

          if (code !== 0) {
            console.error(`❌ [PDF EXTRACTOR] Python process exited with code ${code}`);
            console.error(`   stderr: ${stderr}`);
            reject(new Error(`PDF extraction failed: ${stderr || 'Unknown error'}`));
            return;
          }

          try {
            const result = JSON.parse(stdout);

            if (!result.success) {
              console.error(`❌ [PDF EXTRACTOR] Extraction failed: ${result.error}`);
              reject(new Error(`Failed to extract PDF: ${result.error}`));
              return;
            }

            const text = result.text.trim();

            if (!text || text.length === 0) {
              console.error(`❌ [PDF EXTRACTOR] Extracted text is empty`);
              reject(new Error('Extracted text is empty'));
              return;
            }

            console.log(`✅ [PDF EXTRACTOR] Success`);
            console.log(`   Pages: ${result.pages}`);
            console.log(`   Text length: ${text.length} characters`);
            console.log(`   Preview: ${text.substring(0, 100)}...`);

            resolve({
              text: text,
              filename: originalname,
              pages: result.pages || 0,
              length: text.length,
              preview: text.substring(0, 300)
            });

          } catch (parseError) {
            console.error(`❌ [PDF EXTRACTOR] Failed to parse Python output`);
            console.error(`   Error: ${parseError.message}`);
            console.error(`   stdout: ${stdout}`);
            reject(new Error(`Failed to parse extraction result: ${parseError.message}`));
          }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
          console.error(`❌ [PDF EXTRACTOR] Process error: ${error.message}`);
          
          // Clean up temp file
          try {
            fs.unlinkSync(tempPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          reject(new Error(`PDF extraction process failed: ${error.message}`));
        });

      } catch (error) {
        console.error(`❌ [PDF EXTRACTOR] Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        reject(new Error(`Failed to extract PDF: ${error.message}`));
      }
    });
  }
}

module.exports = PDFExtractor;
