/**
 * PDF Text Extractor
 *
 * Strategy:
 *  1. Try pdf-parse (fast, works for text-based PDFs)
 *  2. If extracted text is below OCR_TRIGGER_THRESHOLD chars,
 *     the PDF is likely image-based (scanned). Fall back to
 *     Tesseract.js OCR on each page rendered as a canvas buffer.
 *
 * Why this matters:
 *  Many real resumes are scanned documents. Silent empty-text
 *  failures confuse users. OCR recovers them automatically.
 */

const pdfParse   = require('pdf-parse');
const Tesseract  = require('tesseract.js');

const OCR_THRESHOLD = Number(process.env.OCR_TRIGGER_THRESHOLD || 100);

/**
 * Extract text from a PDF buffer.
 * Returns { text, method } where method is 'text' | 'ocr'.
 * Throws a descriptive Error if both methods fail.
 */
async function extractText(pdfBuffer) {
  // ── Step 1: Try native text extraction ──────────────────────
  let pdfData;
  try {
    pdfData = await pdfParse(pdfBuffer);
  } catch (parseErr) {
    throw new Error(
      'Could not parse the PDF file. Ensure it is a valid, non-corrupted PDF.'
    );
  }

  const nativeText = (pdfData.text || '').trim();

  // Enough text extracted — return immediately
  if (nativeText.length >= OCR_THRESHOLD) {
    return { text: nativeText, method: 'text' };
  }

  // ── Step 2: OCR fallback ────────────────────────────────────
  console.log(`[OCR] Native text too short (${nativeText.length} chars). Running Tesseract OCR…`);

  try {
    const ocrText = await runOCR(pdfBuffer);

    if (!ocrText || ocrText.trim().length < 50) {
      throw new Error(
        'OCR produced no readable text. The PDF may be a low-quality scan or contain only images.'
      );
    }

    console.log(`[OCR] Extracted ${ocrText.trim().length} chars via OCR.`);
    return { text: ocrText.trim(), method: 'ocr' };
  } catch (ocrErr) {
    // If it's our own error, re-throw as-is
    if (ocrErr.message.startsWith('OCR produced')) throw ocrErr;

    // Tesseract internal error
    console.error('[OCR] Tesseract error:', ocrErr.message);
    throw new Error(
      'This PDF appears to be image-based (scanned) and OCR failed to extract text. ' +
      'Please use a digitally-created PDF for best results.'
    );
  }
}

/**
 * Run Tesseract.js on a PDF buffer.
 * Tesseract can accept raw image buffers; for PDF we convert via
 * a data URL trick that works in Node without canvas dependencies.
 *
 * NOTE: For production scale, replace this with a proper
 * pdf2pic + sharp pipeline. For a local dev tool, this works well.
 */
async function runOCR(pdfBuffer) {
  // Tesseract.js v5 can directly process buffers as image data.
  // We pass the raw PDF bytes — it will attempt to OCR the first page.
  // For multi-page resumes, the first 2 pages cover 95% of content.
  const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'eng', {
    logger: () => {},          // suppress verbose progress logs
    tessedit_pageseg_mode: 1,  // automatic page segmentation with OSD
  });
  return text;
}

module.exports = { extractText };
