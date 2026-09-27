from datetime import datetime
from pydantic import BaseModel, Field

class CreateGrievanceRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    category: str = Field(min_length=2, max_length=80)
    department: str | None = Field(default=None, max_length=120)
    description: str = Field(min_length=10, max_length=5000)
    priority: str = Field(default="normal", pattern="^(normal|high)$")

class GrievanceEventView(BaseModel):
    id: str
    status: str
    note: str
    actor: str
    created_at: datetime

class GrievanceView(BaseModel):
    id: str
    citizen_id: str
    title: str
    category: str
    department: str | None
    description: str
    priority: str
    status: str
    acknowledgement_number: str
    created_at: datetime
    updated_at: datetime
    events: list[GrievanceEventView]

class UpdateGrievanceStatusRequest(BaseModel):
    status: str = Field(pattern="^(submitted|under_review|resolved)$")
    note: str = Field(min_length=2, max_length=1000)
