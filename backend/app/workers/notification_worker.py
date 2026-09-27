"""Provider-neutral notification dispatcher seam.

Records remain durable; delivery providers (SMS/email/push) are intentionally
adapter-based so a provider can be changed without touching workflow logic.
"""
import asyncio
import logging

logger = logging.getLogger("setu.notification-worker")


class NotificationWorker:
    def __init__(self, poll_seconds: int = 5) -> None:
        self.poll_seconds = poll_seconds

    def tick(self) -> int:
        # Delivery adapter is wired in the deployment layer. No external
        # provider call is made by the SIH/demo build.
        return 0

    async def run_forever(self) -> None:
        while True:
            try:
                self.tick()
            except Exception:
                logger.exception("Notification worker tick failed")
            await asyncio.sleep(self.poll_seconds)
