from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class AssignmentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    application_id: str
    service_code: str
    department: str
    officer_id: str
    assigned_by: str
    status: str = "assigned"  # assigned|accepted|completed|reassigned
    note: str | None = None
    created_at: datetime
    updated_at: datetime

class OfficerNotificationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    officer_id: str
    title: str
    message: str
    notification_type: str = "workflow"
    resource_id: str | None = None
    read: bool = False
    created_at: datetime

class OfficerDecisionRequest(BaseModel):
    decision: str  # approve|reject|request_info
    note: str | None = None

class AssignmentRequest(BaseModel):
    officer_id: str
    note: str | None = None
