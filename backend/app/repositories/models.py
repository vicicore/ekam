"""Serializable persistence records for the journey aggregate. Kept
distinct from the in-memory domain objects in app/services/orchestrator.py
— those carry a live DependencyGraph reference and are not meant to be
serialized directly. app/services/journey_mapper.py converts between the
two. This separation is what lets a JSON-file adapter and a future
Supabase adapter both produce/consume the same domain Journey."""

from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field

from app.schemas.enums import ApplicationStepStatus, DocumentStatus


class StepRecord(BaseModel):
    service_code: str
    status: ApplicationStepStatus
    blocked_reason: str | None = None
    external_reference: str | None = None
    submitted_at: datetime | None = None
    sla_due_at: datetime | None = None
    updated_at: datetime


class ConsentRecord(BaseModel):
    service_code: str
    recipient_department: str
    purpose: str
    granted_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None


class ApplicationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    citizen_id: str
    life_event_code: str
    steps: dict[str, StepRecord]
    consents: dict[str, ConsentRecord] = Field(default_factory=dict)
    timeline: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class CitizenProfileRecord(BaseModel):
    citizen_id: str
    full_name: str
    dob: str | None = None
    district: str | None = None
    taluka: str | None = None
    phone: str | None = None
    email: str | None = None
    preferred_language: str = "en"
    created_at: datetime
    updated_at: datetime


class DocumentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    citizen_id: str
    doc_type: str
    issuer: str | None = None
    storage_key: str
    original_filename: str
    mime_type: str
    size_bytes: int
    status: DocumentStatus = DocumentStatus.UPLOADED
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class ConnectorRequestRecord(BaseModel):
    """Persisted mirror of a connector's own bookkeeping. Before Phase 7
    this lived only in the connector object's Python-process memory
    (`GovernmentConnector._requests`), so a backend restart between
    submit and approve/reject lost it — `simulate_approval` would
    KeyError even though the JourneyStep itself (external_reference,
    status=IN_PROGRESS) survived fine via the application repository.
    Persisting this closes that gap using the same repository
    abstraction, not a second state store."""

    external_reference: str
    department: str
    service_code: str
    status: str
    submitted_at: datetime
    sla_deadline: datetime
    payload: dict = Field(default_factory=dict)


class AuditLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    application_id: str | None = None
    actor: str
    action: str
    resource_type: str
    resource_id: str | None = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime


class AccountRecord(BaseModel):
    """The authentication identity — deliberately separate from
    CitizenProfileRecord (name/district/etc., citizen-editable). Not
    Aadhaar-backed: `identifier` is a demo-safe stand-in (a phone number
    or any string the citizen provides), matching the "safe demonstrable
    identity model" requirement for a SIH prototype. When Supabase Auth
    is wired, this becomes a thin cache of `auth.users`, not a duplicate
    identity store."""

    citizen_id: str
    identifier: str
    role: str = "citizen"  # "citizen" | "admin"
    created_at: datetime


class SessionRecord(BaseModel):
    token: str
    citizen_id: str
    role: str
    created_at: datetime
    expires_at: datetime

# Phase 17/18 operational records
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


# Phase 14 — officer assignment / audit boundary
class AssignmentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    application_id: str
    service_code: str
    department: str
    officer_id: str
    status: str = "assigned"
    note: str | None = None
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

# Phase 16 — signed webhook / idempotency boundary
class WebhookDeliveryRecord(BaseModel):
    event_id: str
    external_reference: str
    event_type: str
    status: str = "received"
    error: str | None = None
    received_at: datetime
    processed_at: datetime | None = None

class IdempotencyRecord(BaseModel):
    key: str
    operation: str
    response_status: int = 200
    response_body: dict = Field(default_factory=dict)
    created_at: datetime


class GrievanceEventRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    grievance_id: str
    status: str
    note: str
    actor: str
    created_at: datetime

class GrievanceRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    citizen_id: str
    title: str
    category: str
    department: str | None = None
    description: str
    priority: str = "normal"
    status: str = "submitted"
    acknowledgement_number: str
    created_at: datetime
    updated_at: datetime
    events: list[GrievanceEventRecord] = Field(default_factory=list)
