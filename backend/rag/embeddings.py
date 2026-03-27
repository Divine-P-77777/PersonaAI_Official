import logging
from typing import List, Optional
from langchain_nomic import NomicEmbeddings
from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class PersonaNomicEmbeddings:
    """Nomic Embedding wrapper using the Cloud API.
    
    This class provides a singleton interface to the Nomic API.
    It adds specific prefixes for queries and documents as required by Nomic.
    """

    def __init__(self):
        try:
            if not settings.NOMIC_API_KEY:
                logger.warning("NOMIC_API_KEY not found in settings. API calls will fail.")
                
            logger.info(f"Initializing Nomic API embeddings with model: {settings.EMBEDDING_MODEL}")
            self.client = NomicEmbeddings(
                model=settings.EMBEDDING_MODEL,
                nomic_api_key=settings.NOMIC_API_KEY
            )
        except Exception as e:
            logger.error(f"Failed to initialize Nomic embeddings: {str(e)}")
            raise RuntimeError(f"Embedding initialization failed: {str(e)}")

    def embed_query(self, text: str) -> List[float]:
        """Embed search query with 'search_query: ' prefix."""
        try:
            return self.client.embed_query(f"search_query: {text}")
        except Exception as e:
            logger.error(f"Error embedding query: {str(e)}")
            raise

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed document chunks with 'search_document: ' prefix."""
        if not texts:
            return []
        try:
            prefixed_texts = [f"search_document: {t}" for t in texts]
            return self.client.embed_documents(prefixed_texts)
        except Exception as e:
            logger.error(f"Error embedding documents: {str(e)}")
            raise

_embeddings_instance: Optional[PersonaNomicEmbeddings] = None

def get_embeddings() -> PersonaNomicEmbeddings:
    """Get or create embeddings instance singleton."""
    global _embeddings_instance
    if _embeddings_instance is None:
        _embeddings_instance = PersonaNomicEmbeddings()
    return _embeddings_instance
