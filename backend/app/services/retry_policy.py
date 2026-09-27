from datetime import datetime, timedelta, timezone

def next_retry(attempt: int) -> datetime:
    # 30s, 60s, 120s, 240s, 480s with a hard max handled by the caller.
    delay = min(30 * (2 ** max(attempt - 1, 0)), 480)
    return datetime.now(timezone.utc) + timedelta(seconds=delay)


class RetryPolicy:
    def __init__(self, max_attempts: int = 5, base_delay_seconds: int = 30):
        self.max_attempts = max_attempts
        self.base_delay_seconds = base_delay_seconds

    def delay_for_attempt(self, attempt: int):
        if attempt < 1 or attempt > self.max_attempts:
            return None
        return min(self.base_delay_seconds * (2 ** (attempt - 1)), 480)
