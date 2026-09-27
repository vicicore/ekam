from datetime import datetime
from pydantic import BaseModel

class AdminApplicationStepView(BaseModel):
    service_code: str
    display_name: str
    department: str
    status: str
    external_reference: str | None
    submitted_at: datetime | None
    sla_due_at: datetime | None
    sla_status: str | None

class AdminApplicationView(BaseModel):
    application_id: str
    citizen_id: str
    life_event_code: str
    created_at: datetime
    updated_at: datetime
    is_complete: bool
    current_blocker: str | None
    steps: list[AdminApplicationStepView]

class AdminGrievanceView(BaseModel):
    id: str
    citizen_id: str
    title: str
    category: str
    department: str | None
    priority: str
    status: str
    acknowledgement_number: str
    created_at: datetime
    updated_at: datetime
    event_count: int

class AdminStatusUpdate(BaseModel):
    status: str
    note: str
