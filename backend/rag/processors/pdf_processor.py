import io
import logging
import fitz  # PyMuPDF
import pytesseract
import numpy as np
from PIL import Image

from backend.core.config import get_settings
from backend.rag.processors.ocr_fallback import perform_ocr_with_fallback

logger = logging.getLogger(__name__)
settings = get_settings()
# Local tesseract is still used as fallback, so we keep the path config in case of direct library usage
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

async def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using Tesseract OCR page-by-page."""
    doc = fitz.open(stream=file_content, filetype="pdf")
    full_text = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # 1. Try native text extraction first
        page_text = page.get_text().strip()
        
        # 2. If no text found, use OCR
        if not page_text:
            logger.info(f"[PDF_OCR] 📷 Page {page_num+1} appears to be an image. Triggering OCR fallback...")
            # Increase resolution for better OCR
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_bytes = pix.tobytes("png")  # Convert to PNG bytes for the OCR utility
            
            # Use the unified fallback (Worker or Local)
            page_text = await perform_ocr_with_fallback(img_bytes, source_id=f"pdf_page_{page_num+1}", timeout=5.0)
        
        full_text.append(page_text)

    doc.close()
    return "\n\n".join(full_text)
