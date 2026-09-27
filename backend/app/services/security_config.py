from dataclasses import dataclass
import os

@dataclass(frozen=True)
class SecurityConfig:
    allowed_origins: tuple[str, ...]
    rate_limit_requests: int
    rate_limit_window_seconds: int
    max_upload_bytes: int
    require_https: bool


def get_security_config() -> SecurityConfig:
    origins = tuple(x.strip() for x in os.getenv("SETU_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if x.strip())
    return SecurityConfig(
        allowed_origins=origins,
        rate_limit_requests=int(os.getenv("SETU_RATE_LIMIT_REQUESTS", "120")),
        rate_limit_window_seconds=int(os.getenv("SETU_RATE_LIMIT_WINDOW_SECONDS", "60")),
        max_upload_bytes=int(os.getenv("SETU_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024))),
        require_https=os.getenv("SETU_REQUIRE_HTTPS", "false").lower() == "true",
    )
