from datetime import datetime, timezone
from app.core.container import get_metric_event_repository
from app.repositories.models import MetricEventRecord


def record_metric(name: str, value: float = 1, **labels) -> None:
    get_metric_event_repository().create(MetricEventRecord(
        name=name, value=value, labels=labels, created_at=datetime.now(timezone.utc)
    ))
