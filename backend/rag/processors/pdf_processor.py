import io
import logging
import asyncio
from typing import Optional
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

async def extract_text_from_pdf(
    file_content: bytes, 
    on_progress: Optional[callable] = None
) -> str:
    """Extract text from PDF using Tesseract OCR with parallel page processing."""
    doc = fitz.open(stream=file_content, filetype="pdf")
    total_pages = len(doc)
    processed_count = 0
    
    # Use a semaphore to limit concurrency (e.g., 4 pages at a time)
    semaphore = asyncio.Semaphore(4)
    
    async def process_page(page_num: int):
        nonlocal processed_count
        async with semaphore:
            page = doc[page_num]
            # 1. Try native text extraction first
            page_text = page.get_text().strip()
            
            # 2. If no text found, use OCR
            if not page_text:
                logger.info(f"[PDF_OCR] 📷 Page {page_num+1}/{total_pages} appears to be an image. Triggering OCR fallback...")
                pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))
                img_bytes = pix.tobytes("png")
                
                page_text = await perform_ocr_with_fallback(
                    img_bytes, 
                    source_id=f"pdf_page_{page_num+1}", 
                    timeout=30.0
                )
            
            processed_count += 1
            if on_progress:
                await on_progress(processed_count, total_pages)
            
            return page_num, page_text

    # Run extraction for all pages in parallel (respecting semaphore)
    tasks = [process_page(i) for i in range(total_pages)]
    results = await asyncio.gather(*tasks)
    
    # Ensure pages are in the correct order
    results.sort(key=lambda x: x[0])
    full_text = [r[1] for r in results]

    doc.close()
    return "\n\n".join(full_text)
