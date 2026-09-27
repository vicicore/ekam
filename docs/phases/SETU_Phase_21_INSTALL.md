# SETU Phase 21 — Security Hardening & Privacy

Phase 21 adds an additive security layer without replacing the existing authentication, connector, webhook, or officer architecture.

## Included

- Security configuration from environment variables
- API rate limiting foundation
- Security response headers
- Request ID propagation
- Optional HTTPS enforcement
- Upload extension/MIME/size validation
- SHA-256 file fingerprint for document integrity workflows
- Sensitive-field redaction helper for logs/audit payloads
- Authenticated security policy endpoint
- Security contract tests
- Frontend security-header constants

## Integration

### 1. Middleware
In `backend/app/main.py` (or the FastAPI application factory), add:

```python
from app.middleware.security_middleware import SetuSecurityMiddleware
app.add_middleware(SetuSecurityMiddleware)
```

Keep the existing middleware stack and CORS configuration. Configure CORS from `SETU_ALLOWED_ORIGINS` rather than `*` in production.

### 2. Security router
In `backend/app/api/v1/router.py`:

```python
from app.api.v1.security import router as security_router
router.include_router(security_router)
```

### 3. Uploads
Before persisting any citizen document, call `validate_upload(...)` from `app.services.file_security` and pass the configured maximum size.

### 4. Privacy
Use `redact(...)` before writing arbitrary request payloads into logs or audit metadata. Do not log passwords, bearer tokens, government IDs, or document contents.

### 5. Environment
Copy values from `infra/security.env.example` into the backend environment. In production set `SETU_REQUIRE_HTTPS=true` and list only trusted frontend origins.

## Important production notes

The included limiter is intentionally in-memory so local/SIH demos work without Redis. For multiple backend instances, replace it with a Redis/distributed implementation; otherwise each instance has an independent limit.

The upload validator checks extension, declared MIME type, size, and hashes content. Production file handling should additionally perform actual content/magic-byte inspection, malware scanning, private object storage, encryption at rest, and signed download URLs.

CSP may need to be expanded to match the deployed frontend's required assets/API hosts. Do not blindly add `unsafe-eval` or broad wildcard sources.

HTTPS enforcement should normally be handled at the reverse proxy/load balancer as well as at application level.

Phase 21 does not claim that SETU is fully security-certified. It provides a concrete hardening foundation that must still undergo penetration testing, dependency scanning, infrastructure review, and privacy/legal review before production use.
