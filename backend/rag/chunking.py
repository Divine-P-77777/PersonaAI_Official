from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.core.config import get_settings

settings = get_settings()

def chunk_text(text: str, chunk_size: int = None, chunk_overlap: int = None) -> list[str]:
    """Split text into overlapping chunks using RecursiveCharacterTextSplitter.
    
    This function processes the raw text with a split strategy that aims to
    keep paragraphs and sentences together.
    """
    chunk_size = chunk_size or settings.CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ".", " ", ""],
        is_separator_regex=False,
    )
    
    # Text cleaning: reduce multiple newlines
    cleaned_text = "\n".join([line.strip() for line in text.splitlines() if line.strip()])
    
    return splitter.split_text(cleaned_text)
