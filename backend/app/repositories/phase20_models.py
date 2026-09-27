from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class IntegrationDispatchRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    application_id: str
    service_code: str
    department: str
    connector: str
    external_reference: str | None = None
    status: str = "queued"  # queued|submitted|acknowledged|completed|failed
    attempt_count: int = 0
    last_error: str | None = None
    created_at: datetime
    updated_at: datetime

class CitizenNotificationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    citizen_id: str
    title: str
    message: str
    notification_type: str = "application"
    application_id: str | None = None
    read: bool = False
    created_at: datetime

class IntegrationEvent(BaseModel):
    event_id: str
    event_type: str
    application_id: str
    service_code: str
    external_reference: str | None = None
    status: str
    message: str | None = None
    occurred_at: datetime
