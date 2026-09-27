from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.container import (
    get_application_repository,
    get_grievance_repository,
    get_journey_service,
    get_connector_for_department,
)
from app.core.security import get_current_session, require_admin
from app.repositories.models import SessionRecord
from app.schemas.admin_operations import (
    AdminApplicationView,
    AdminApplicationStepView,
    AdminGrievanceView,
    AdminStatusUpdate,
)
from app.services import journey_narrative
from app.services.orchestrator import OrchestrationError
from app.services.sla import compute_sla_status
from app.services.dependency_graph import get_graph

router = APIRouter(prefix="/admin", tags=["admin-operations"])

@router.get("/applications", response_model=list[AdminApplicationView])
def list_applications(
    department: str | None = Query(default=None),
    status: str | None = Query(default=None),
    session: SessionRecord = Depends(get_current_session),
) -> list[AdminApplicationView]:
    require_admin(session)
    repo = get_application_repository()
    service = get_journey_service()
    result: list[AdminApplicationView] = []

    for record in repo.list_all():
        journey = service.get_journey(record.id)
        if journey is None:
            continue
        steps: list[AdminApplicationStepView] = []
        for code, step in journey.steps.items():
            graph = get_graph(record.life_event_code)
            dept = graph.department_of(code)
            if department and dept.lower() != department.lower():
                continue
            if status and step.status.value != status:
                continue
            steps.append(AdminApplicationStepView(
                service_code=code,
                display_name=graph.display_name_of(code),
                department=dept,
                status=step.status.value,
                external_reference=step.external_reference,
                submitted_at=step.submitted_at,
                sla_due_at=step.sla_due_at,
                sla_status=compute_sla_status(step.sla_due_at, step.submitted_at).value
                    if compute_sla_status(step.sla_due_at, step.submitted_at) else None,
            ))
        if department and not steps:
            continue
        result.append(AdminApplicationView(
            application_id=record.id,
            citizen_id=record.citizen_id,
            life_event_code=record.life_event_code,
            created_at=record.created_at,
            updated_at=record.updated_at,
            is_complete=journey.is_complete(),
            current_blocker=journey_narrative.current_blocker(journey),
            steps=steps,
        ))

    return sorted(result, key=lambda x: x.updated_at, reverse=True)

@router.post("/applications/{application_id}/steps/{service_code}/approve",
             response_model=AdminApplicationView)
def approve_application_step(
    application_id: str,
    service_code: str,
    session: SessionRecord = Depends(get_current_session),
) -> AdminApplicationView:
    require_admin(session)
    service = get_journey_service()
    journey = service.get_journey(application_id)
    if journey is None:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        step = journey.step(service_code)
        if step.external_reference is None:
            raise HTTPException(status_code=409, detail="Service has not been submitted")
        department = journey.graph.department_of(service_code)
        connector = get_connector_for_department(department)
        connector.simulate_approval(step.external_reference)
        service.receive_connector_event(
            application_id, service_code, event_status="approved"
        )
        journey = service.get_journey(application_id)
        assert journey is not None
    except OrchestrationError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return _application_view(journey)

def _application_view(journey) -> AdminApplicationView:
    steps = []
    for code, step in journey.steps.items():
        dept = journey.graph.department_of(code)
        sla = compute_sla_status(step.sla_due_at, step.submitted_at)
        steps.append(AdminApplicationStepView(
            service_code=code,
            display_name=journey.graph.display_name_of(code),
            department=dept,
            status=step.status.value,
            external_reference=step.external_reference,
            submitted_at=step.submitted_at,
            sla_due_at=step.sla_due_at,
            sla_status=sla.value if sla else None,
        ))
    return AdminApplicationView(
        application_id=journey.id,
        citizen_id=journey.citizen_id,
        life_event_code=journey.life_event_code,
        created_at=journey.created_at,
        updated_at=journey.updated_at,
        is_complete=journey.is_complete(),
        current_blocker=journey_narrative.current_blocker(journey),
        steps=steps,
    )

@router.get("/grievances", response_model=list[AdminGrievanceView])
def list_grievances(
    status: str | None = Query(default=None),
    department: str | None = Query(default=None),
    session: SessionRecord = Depends(get_current_session),
) -> list[AdminGrievanceView]:
    require_admin(session)
    records = get_grievance_repository().list_all()
    result = []
    for g in records:
        if status and g.status != status:
            continue
        if department and (g.department or "").lower() != department.lower():
            continue
        result.append(AdminGrievanceView(
            id=g.id,
            citizen_id=g.citizen_id,
            title=g.title,
            category=g.category,
            department=g.department,
            priority=g.priority,
            status=g.status,
            acknowledgement_number=g.acknowledgement_number,
            created_at=g.created_at,
            updated_at=g.updated_at,
            event_count=len(g.events),
        ))
    return sorted(result, key=lambda x: x.updated_at, reverse=True)

@router.patch("/grievances/{grievance_id}/status", response_model=AdminGrievanceView)
def update_grievance(
    grievance_id: str,
    request: AdminStatusUpdate,
    session: SessionRecord = Depends(get_current_session),
) -> AdminGrievanceView:
    require_admin(session)
    repo = get_grievance_repository()
    record = repo.get(grievance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Grievance not found")

    allowed = {"submitted", "under_review", "resolved"}
    if request.status not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported grievance status")

    from datetime import datetime, timezone
    from app.repositories.models import GrievanceEventRecord
    now = datetime.now(timezone.utc)
    record.status = request.status
    record.updated_at = now
    record.events.append(GrievanceEventRecord(
        grievance_id=record.id,
        status=request.status,
        note=request.note.strip(),
        actor=session.citizen_id,
        created_at=now,
    ))
    record = repo.save(record)

    return AdminGrievanceView(
        id=record.id,
        citizen_id=record.citizen_id,
        title=record.title,
        category=record.category,
        department=record.department,
        priority=record.priority,
        status=record.status,
        acknowledgement_number=record.acknowledgement_number,
        created_at=record.created_at,
        updated_at=record.updated_at,
        event_count=len(record.events),
    )
