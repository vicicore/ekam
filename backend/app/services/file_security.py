from pathlib import Path
import hashlib

ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}

class UnsafeUpload(ValueError):
    pass

def validate_upload(filename: str, content_type: str, content: bytes, max_bytes: int) -> dict:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise UnsafeUpload("Unsupported file extension")
    if content_type.lower() not in ALLOWED_MIME_TYPES:
        raise UnsafeUpload("Unsupported content type")
    if len(content) > max_bytes:
        raise UnsafeUpload("File exceeds configured size limit")
    if not content:
        raise UnsafeUpload("Empty file")
    return {"sha256": hashlib.sha256(content).hexdigest(), "size": len(content), "extension": suffix}
