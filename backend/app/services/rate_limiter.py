from collections import defaultdict, deque
from time import monotonic
from threading import Lock

class InMemoryRateLimiter:
    """Demo-safe limiter. Replace with Redis/distributed limiter in production."""
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self._hits = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str) -> tuple[bool, int]:
        now = monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] >= self.window:
                q.popleft()
            if len(q) >= self.limit:
                retry_after = max(1, int(self.window - (now - q[0])))
                return False, retry_after
            q.append(now)
            return True, 0
