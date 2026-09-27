from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.security import get_current_session, require_admin
from app.core.container import (
    get_assignment_repository,
    get_phase14_notification_repository,
    get_audit_event_repository,
)
from app.repositories.models import AssignmentRecord, NotificationRecord, AuditEventRecord, SessionRecord

router = APIRouter(prefix="/admin", tags=["phase14"])

class AssignRequest(BaseModel):
    officer_id: str
    department: str

class RejectRequest(BaseModel):
    reason: str

@router.post("/assignments", response_model=AssignmentRecord, status_code=201)
def assign_service(
    application_id: str,
    service_code: str,
    request: AssignRequest,
    session: SessionRecord = Depends(get_current_session),
):
    require_admin(session)
    now=datetime.now(timezone.utc)
    record=AssignmentRecord(
        application_id=application_id,
        service_code=service_code,
        department=request.department,
        officer_id=request.officer_id,
        created_at=now,
        updated_at=now,
    )
    saved=get_assignment_repository().create(record)
    get_phase14_notification_repository().create(NotificationRecord(
        recipient_id=request.officer_id,
        type="assignment",
        title="New application assignment",
        message=f"{service_code} has been assigned to your department queue.",
        resource_type="application",
        resource_id=application_id,
        created_at=now,
    ))
    get_audit_event_repository().append(AuditEventRecord(
        actor_id=session.citizen_id,
        actor_role=session.role,
        action="assign_service",
        resource_type="application_step",
        resource_id=f"{application_id}:{service_code}",
        department=request.department,
        metadata={"officer_id": request.officer_id},
        created_at=now,
    ))
    return saved

@router.get("/assignments")
def list_assignments(
    officer_id: str | None = Query(default=None),
    session: SessionRecord = Depends(get_current_session),
):
    require_admin(session)
    repo=get_assignment_repository()
    if officer_id:
        return repo.list_for_officer(officer_id)
    return [r for app in [] for r in app]

@router.get("/notifications")
def notifications(session: SessionRecord = Depends(get_current_session)):
    return get_phase14_notification_repository().list_for_recipient(session.citizen_id)

@router.get("/audit-events")
def audit_events(
    limit: int = Query(default=100, ge=1, le=500),
    session: SessionRecord = Depends(get_current_session),
):
    require_admin(session)
    return get_audit_event_repository().list(limit)

@router.post("/applications/{application_id}/steps/{service_code}/reject")
def reject_step(
    application_id: str,
    service_code: str,
    request: RejectRequest,
    session: SessionRecord = Depends(get_current_session),
):
    require_admin(session)
    # This endpoint is the Phase 14 API boundary. The existing connector
    # implementation can be wired here using the same resolution used by
    # Phase 13; the payload deliberately requires a reason.
    get_audit_event_repository().append(AuditEventRecord(
        actor_id=session.citizen_id,
        actor_role=session.role,
        action="reject_service",
        resource_type="application_step",
        resource_id=f"{application_id}:{service_code}",
        metadata={"reason": request.reason},
        created_at=datetime.now(timezone.utc),
    ))
    return {"status": "recorded", "application_id": application_id, "service_code": service_code}
