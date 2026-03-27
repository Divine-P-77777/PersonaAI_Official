from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime
from backend.database.models import SourceType, IngestionStatus

class DataSourceCreate(BaseModel):
    """Schema for a single data source upload."""
    type: SourceType
    title: str
    content: Optional[str] = None
    url: Optional[str] = None
    # file_base64: Optional[str] = None # Or use form-data for files

class BatchIngestionRequest(BaseModel):
    """Multiple data sources submitted as one batch (array support)."""
    sources: List[DataSourceCreate]

class DataSourceResponse(BaseModel):
    id: UUID
    bot_id: UUID
    batch_id: Optional[UUID] = None
    type: SourceType
    title: str
    status: IngestionStatus
    created_at: datetime

class BatchStatusResponse(BaseModel):
    id: UUID
    bot_id: UUID
    status: IngestionStatus
    total_files: int
    processed_files: int
    data_sources: List[DataSourceResponse] = []
    error_log: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
