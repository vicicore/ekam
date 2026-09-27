from fastapi import APIRouter
from app.core.security import get_current_session
from app.services.security_config import get_security_config

router = APIRouter(prefix="/security", tags=["security"])

@router.get("/policy")
def security_policy(_session=__import__("fastapi").Depends(get_current_session)):
    cfg = get_security_config()
    return {
        "max_upload_bytes": cfg.max_upload_bytes,
        "rate_limit_requests": cfg.rate_limit_requests,
        "rate_limit_window_seconds": cfg.rate_limit_window_seconds,
        "require_https": cfg.require_https,
    }
