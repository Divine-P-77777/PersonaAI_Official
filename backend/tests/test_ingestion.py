"""
Tests for the RAG ingestion pipeline.
"""
import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.rag.chunking import chunk_text
from backend.rag.embeddings import get_embeddings, NomicEmbeddings
from backend.rag.ingestion import ingest_document
from backend.database.queries import (
    get_b