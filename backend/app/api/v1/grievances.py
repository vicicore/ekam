from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.core.container import get_grievance_repository
from app.core.security import get_current_session, require_admin, require_owner_or_admin
from app.repositories.models import GrievanceEventRecord, GrievanceRecord, SessionRecord
from app.schemas.grievance import (
    CreateGrievanceRequest,
    GrievanceView,
    UpdateGrievanceStatusRequest,
)

router = APIRouter(prefix="/grievances", tags=["grievances"])

def _view(record: GrievanceRecord) -> GrievanceView:
    return GrievanceView(**record.model_dump())

def _ack_number(record_id: str) -> str:
    compact = record_id.replace("-", "").upper()[:10]
    return f"SETU-GRV-{datetime.now(timezone.utc).year}-{compact}"

@router.post("", response_model=GrievanceView, status_code=201)
def create_grievance(
    request: CreateGrievanceRequest,
    session: SessionRecord = Depends(get_current_session),
) -> GrievanceView:
    now = datetime.now(timezone.utc)
    record = GrievanceRecord(
        citizen_id=session.citizen_id,
        title=request.title.strip(),
        category=request.category.strip(),
        department=request.department.strip() if request.department else None,
        description=request.description.strip(),
        priority=request.priority,
        status="submitted",
        acknowledgement_number="pending",
        created_at=now,
        updated_at=now,
    )
    record.acknowledgement_number = _ack_number(record.id)
    record.events = [
        GrievanceEventRecord(
            grievance_id=record.id,
            status="submitted",
            note="Grievance registered successfully.",
            actor="citizen",
            created_at=now,
        )
    ]
    return _view(get_grievance_repository().create(record))

@router.get("/me", response_model=list[GrievanceView])
def list_my_grievances(
    session: SessionRecord = Depends(get_current_session),
) -> list[GrievanceView]:
    records = get_grievance_repository().list_for_citizen(session.citizen_id)
    return [_view(r) for r in sorted(records, key=lambda r: r.updated_at, reverse=True)]

@router.get("/{grievance_id}", response_model=GrievanceView)
def get_grievance(
    grievance_id: str,
    session: SessionRecord = Depends(get_current_session),
) -> GrievanceView:
    record = get_grievance_repository().get(grievance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    require_owner_or_admin(record.citizen_id, session)
    return _view(record)

@router.patch("/{grievance_id}/status", response_model=GrievanceView)
def update_status(
    grievance_id: str,
    request: UpdateGrievanceStatusRequest,
    session: SessionRecord = Depends(get_current_session),
) -> GrievanceView:
    require_admin(session)
    repo = get_grievance_repository()
    record = repo.get(grievance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    now = datetime.now(timezone.utc)
    record.status = request.status
    record.updated_at = now
    record.events.append(
        GrievanceEventRecord(
            grievance_id=record.id,
            status=request.status,
            note=request.note.strip(),
            actor=session.citizen_id,
            created_at=now,
        )
    )
    return _view(repo.save(record))
