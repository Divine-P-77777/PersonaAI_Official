import httpx
from bs4 import BeautifulSoup
import logging
import re

logger = logging.getLogger(__name__)

async def extract_text_from_url(url: str) -> str:
    """Scrape and extract main text from a URL."""
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove noisy elements
            for element in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
                element.decompose()
                
            # Get text and clean up whitespace
            text = soup.get_text(separator="\n", strip=True)
            
            # Normalize multiple newlines to max two (paragraphs)
            text = re.sub(r'\n{3,}', '\n\n', text)
            
            return text
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            raise Exception(f"Failed to scrape URL: {str(e)}")
