# Add these records to repositories/models.py.

from datetime import datetime
from pydantic import BaseModel, Field
from uuid import uuid4

class WebhookDeliveryRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_id: str
    external_reference: str
    event_type: str
    status: str = "received"
    attempts: int = 1
    error: str | None = None
    received_at: datetime
    processed_at: datetime | None = None

class IdempotencyRecord(BaseModel):
    key: str
    operation: str
    response_json: dict
    created_at: datetime
