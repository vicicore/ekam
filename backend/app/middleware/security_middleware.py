from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4

from app.services.security_config import get_security_config
from app.services.rate_limiter import InMemoryRateLimiter

_cfg = get_security_config()
_limiter = InMemoryRateLimiter(_cfg.rate_limit_requests, _cfg.rate_limit_window_seconds)

class SetuSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        client = request.client.host if request.client else "unknown"
        key = f"{client}:{request.url.path}"
        allowed, retry_after = _limiter.allow(key)
        if not allowed:
            response = JSONResponse({"detail": "Rate limit exceeded", "request_id": request_id}, status_code=429)
            response.headers["Retry-After"] = str(retry_after)
            response.headers["X-Request-ID"] = request_id
            return response

        if _cfg.require_https and request.url.scheme != "https" and request.url.path != "/health":
            return JSONResponse({"detail": "HTTPS is required", "request_id": request_id}, status_code=400)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; base-uri 'self'"
        return response
