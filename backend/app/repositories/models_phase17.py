# Phase 17 additive records. Merge into repositories/models.py.

from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class OfficerProfileRecord(BaseModel):
    officer_id: str
    display_name: str
    department: str
    district: str | None = None
    active: bool = True
    created_at: datetime
    updated_at: datetime

class ConnectorJobRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    operation: str
    department: str
    service_code: str
    external_reference: str | None = None
    payload: dict = Field(default_factory=dict)
    status: str = "queued"
    attempts: int = 0
    max_attempts: int = 5
    next_attempt_at: datetime
    last_error: str | None = None
    created_at: datetime
    updated_at: datetime

class DeadLetterRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    job_id: str
    reason: str
    attempts: int
    payload: dict = Field(default_factory=dict)
    created_at: datetime

class MetricEventRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    value: float = 1
    labels: dict = Field(default_factory=dict)
    created_at: datetime
