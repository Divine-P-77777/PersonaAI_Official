import io
import fitz  # PyMuPDF
import pytesseract
import numpy as np
from PIL import Image

from backend.core.config import get_settings

settings = get_settings()
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
            # Increase resolution for better OCR
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_data = pix.tobytes("ppm")
            img = Image.open(io.BytesIO(img_data))

            # Use Tesseract for OCR
            page_text = pytesseract.image_to_string(img)
        
        full_text.append(page_text)

    doc.close()
    return "\n\n".join(full_text)
