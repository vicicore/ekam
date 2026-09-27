from pydantic import BaseModel, Field


class AnalyticsSeriesPoint(BaseModel):
    label: str
    value: int


class AnalyticsDepartment(BaseModel):
    department: str
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    rejected: int = 0
    sla_at_risk: int = 0
    sla_breached: int = 0


class AnalyticsSummary(BaseModel):
    total_applications: int = 0
    active_applications: int = 0
    completed_applications: int = 0
    blocked_applications: int = 0
    total_steps: int = 0
    pending_steps: int = 0
    completed_steps: int = 0
    rejected_steps: int = 0
    sla_at_risk: int = 0
    sla_breached: int = 0
    total_documents: int = 0
    total_audit_events: int = 0


class AdminAnalytics(BaseModel):
    summary: AnalyticsSummary
    departments: list[AnalyticsDepartment] = Field(default_factory=list)
    application_status: list[AnalyticsSeriesPoint] = Field(default_factory=list)
    document_status: list[AnalyticsSeriesPoint] = Field(default_factory=list)
    recent_activity: list[dict] = Field(default_factory=list)
