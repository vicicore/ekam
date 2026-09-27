import re

SENSITIVE_KEYS = {"aadhaar", "pan", "password", "token", "access_token", "refresh_token", "secret"}

def redact(value):
    if isinstance(value, dict):
        return {k: ("[REDACTED]" if k.lower() in SENSITIVE_KEYS else redact(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, str):
        value = re.sub(r"\b\d{12}\b", "[REDACTED-ID]", value)
        return value
    return value
