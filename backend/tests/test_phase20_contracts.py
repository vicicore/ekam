from datetime import datetime, timezone
from app.repositories.phase20_models import IntegrationDispatchRecord, IntegrationEvent, CitizenNotificationRecord

def test_models_validate():
    now=datetime.now(timezone.utc)
    d=IntegrationDispatchRecord(application_id="a",service_code="s",department="Revenue",connector="sandbox",created_at=now,updated_at=now)
    assert d.status=="queued"
    e=IntegrationEvent(event_id="e",event_type="status.changed",application_id="a",service_code="s",status="completed",occurred_at=now)
    assert e.status=="completed"
    n=CitizenNotificationRecord(citizen_id="c",title="x",message="y",created_at=now)
    assert not n.read
