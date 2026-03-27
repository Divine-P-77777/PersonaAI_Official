import cloudinary
import cloudinary.uploader
import httpx
import logging
from typing import Optional
from backend.core.config import get_settings
from backend.database.connection import get_supabase_client

settings = get_settings()
logger = logging.getLogger(__name__)

# Initialize Cloudinary if credentials are provided
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

async def upload_to_cloudinary(file_bytes: bytes, folder: str = "ingestion") -> Optional[str]:
    """Upload file to Cloudinary and return the secure URL."""
    try:
        if not settings.CLOUDINARY_CLOUD_NAME:
            logger.warning("Cloudinary not configured. Skipping upload.")
            return None
            
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=f"personabot/{folder}",
            resource_type="auto"
        )
        return result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise Exception(f"Failed to upload to Cloudinary: {str(e)}")

async def upload_to_supabase(file_bytes: bytes, file_name: str, bucket: str = None, token: str = None) -> Optional[str]:
    """
    Upload file to Supabase Storage via direct httpx call.
    
    NOTE: supabase-py v2's storage client does NOT inherit auth from
    client.postgrest.auth(). We use httpx directly so we can set the
    user's Bearer token — which makes auth.uid() resolve in Storage RLS.
    """
    bucket_name = bucket or settings.SUPABASE_AVATAR_BUCKET
    upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{file_name}"
    
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}" if token else f"Bearer {settings.SUPABASE_ANON_KEY}",
        "Content-Type": "image/jpeg",  # Storage requires explicit content type
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                upload_url,
                headers=headers,
                content=file_bytes,
                params={"upsert": "true"},
            )
            
            if response.status_code not in (200, 201):
                raise Exception(f"Storage upload failed: {response.text}")
        
        # Build and return the public URL
        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_name}"
        logger.info(f"Uploaded to Supabase Storage: {public_url}")
        return public_url
    except Exception as e:
        logger.error(f"Supabase storage upload failed: {str(e)}")
        raise Exception(f"Failed to upload to Supabase Storage: {str(e)}")
