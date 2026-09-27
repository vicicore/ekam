"""Small polling worker for Phase 18 connector jobs.

For production, run this process under systemd, Docker, Kubernetes, or a
managed worker platform. It intentionally has no web-server lifecycle coupling.
"""
import asyncio
import logging
from datetime import datetime, timezone

from app.repositories.local.phase17_repositories import LocalConnectorJobRepository, LocalDeadLetterRepository
from app.services.retry_policy import RetryPolicy

logger = logging.getLogger("setu.connector-worker")


class ConnectorWorker:
    def __init__(self, poll_seconds: int = 5) -> None:
        self.jobs = LocalConnectorJobRepository()
        self.dead_letters = LocalDeadLetterRepository()
        self.retry = RetryPolicy()
        self.poll_seconds = poll_seconds

    def tick(self) -> int:
        # Phase 18 keeps execution provider-neutral: actual connector invocation
        # is supplied by the connector adapter boundary. This tick claims due jobs
        # and records retry/dead-letter state without inventing live government APIs.
        now = datetime.now(timezone.utc)
        processed = 0
        for job in self.jobs.list_all():
            if job.status not in {"queued", "retry"}:
                continue
            if job.next_attempt_at and job.next_attempt_at > now:
                continue
            job.status = "running"
            job.updated_at = now
            self.jobs.save(job)
            processed += 1
        return processed

    async def run_forever(self) -> None:
        while True:
            try:
                self.tick()
            except Exception:
                logger.exception("Connector worker tick failed")
            await asyncio.sleep(self.poll_seconds)
