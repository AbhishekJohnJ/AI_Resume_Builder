/**
 * PDF Text Extractor — pure Node.js using pdf-parse (no Python required)
 */
const pdfParse = require('pdf-parse');

class PDFExtractor {
  static async extractText(file) {
    if (!file || !file.buffer) throw new Error('No file buffer provided');

    console.log(`\n📄 [PDF EXTRACTOR] Processing: ${file.originalname} (${file.buffer.length} bytes)`);

    const result = await pdfParse(file.buffer);

    const text = (result?.text || '').trim();
    if (!text) throw new Error('Extracted text is empty — PDF may be image-based or locked');

    const pages = result?.numpages || 0;
    console.log(`✅ [PDF EXTRACTOR] Success — ${text.length} chars, ${pages} pages`);

    return {
      text,
      filename: file.originalname,
      pages,
      length: text.length,
      preview: text.substring(0, 300),
    };
  }
}

module.exports = PDFExtractor;
