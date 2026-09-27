from app.services.rate_limiter import InMemoryRateLimiter
from app.services.file_security import validate_upload, UnsafeUpload


def test_rate_limiter_blocks_after_limit():
    limiter = InMemoryRateLimiter(2, 60)
    assert limiter.allow("x")[0]
    assert limiter.allow("x")[0]
    assert limiter.allow("x")[0] is False


def test_upload_validation():
    result = validate_upload("doc.pdf", "application/pdf", b"abc", 10)
    assert result["size"] == 3


def test_upload_rejects_extension():
    try:
        validate_upload("script.exe", "application/octet-stream", b"abc", 10)
        assert False
    except UnsafeUpload:
        assert True
