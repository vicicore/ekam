# Phase 14 additive records.
# Merge these records into backend/app/repositories/models.py; keep existing records.

from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class AssignmentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    application_id: str
    service_code: str
    department: str
    officer_id: str
    status: str = "assigned"
    created_at: datetime
    updated_at: datetime

class NotificationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    recipient_id: str
    type: str
    title: str
    message: str
    resource_type: str | None = None
    resource_id: str | None = None
    read: bool = False
    created_at: datetime

class AuditEventRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    actor_id: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: str | None = None
    department: str | None = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
