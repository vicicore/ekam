#!/usr/bin/env sh
set -eu

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000/api/v1/health}"

python - <<'PY'
import os, urllib.request
url = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000/api/v1/health")
with urllib.request.urlopen(url, timeout=5) as response:
    if response.status != 200:
        raise SystemExit(f"Health check failed: HTTP {response.status}")
print("SETU backend health: OK")
PY
