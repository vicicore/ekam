from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

NotificationType = Literal[
    "application_update", "document_request", "sla_alert", "grievance_update",
    "assignment", "system", "integration_update"
]

class NotificationRecord(BaseModel):
    id: str
    recipient_id: str
    recipient_type: Literal["citizen", "officer", "admin"]
    type: NotificationType
    title: str
    message: str
    link: str | None = None
    entity_id: str | None = None
    priority: Literal["low", "normal", "high", "urgent"] = "normal"
    read: bool = False
    created_at: datetime
    read_at: datetime | None = None
    delivery_status: Literal["queued", "in_app", "failed"] = "in_app"

class NotificationCreate(BaseModel):
    recipient_id: str = Field(min_length=1)
    recipient_type: Literal["citizen", "officer", "admin"]
    type: NotificationType
    title: str = Field(min_length=1, max_length=180)
    message: str = Field(min_length=1, max_length=2000)
    link: str | None = None
    entity_id: str | None = None
    priority: Literal["low", "normal", "high", "urgent"] = "normal"

class NotificationReadResponse(BaseModel):
    id: str
    read: bool
    read_at: datetime | None
