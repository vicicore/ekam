import hashlib
import hmac
from app.core.config import get_settings

def verify_hmac_signature(raw_body: bytes, signature: str | None) -> bool:
    secret = get_settings().n8n_webhook_secret
    if not secret:
        return False
    if not signature:
        return False
    supplied = signature.removeprefix("sha256=")
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(supplied, expected)
