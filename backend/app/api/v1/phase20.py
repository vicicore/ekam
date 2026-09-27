from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_session, require_admin
from app.repositories.models import SessionRecord
from app.repositories.phase20_models import IntegrationEvent
from app.repositories.phase20_repositories import IntegrationDispatchRepository, CitizenNotificationRepository
from app.services.integration_service import IntegrationService
from app.services.officer_rbac import require_officer
from app.core.container import get_application_repository

router=APIRouter(prefix="/integration", tags=["phase20-integration"])
service=IntegrationService()

def _admin_or_officer(session):
    if session.role=="admin": return
    require_officer(session)

class DispatchRequest(BaseModel):
    application_id:str
    service_code:str
    department:str

@router.post("/dispatch")
def dispatch(req:DispatchRequest, session:SessionRecord=Depends(get_current_session)):
    _admin_or_officer(session); return service.dispatch(req.application_id,req.service_code,req.department)

@router.get("/dispatch/{dispatch_id}")
def dispatch_status(dispatch_id:str, session:SessionRecord=Depends(get_current_session)):
    _admin_or_officer(session); return service.status(dispatch_id)

@router.get("/application/{application_id}")
def application_integrations(application_id:str, session:SessionRecord=Depends(get_current_session)):
    app=get_application_repository().get(application_id)
    if not app: raise HTTPException(404,"Application not found")
    if session.role!="admin" and session.citizen_id!=app.citizen_id: require_officer(session)
    return IntegrationDispatchRepository().list_for_application(application_id)

@router.post("/events")
def receive_event(event:IntegrationEvent, session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    app=get_application_repository().get(event.application_id)
    if not app: raise HTTPException(404,"Application not found")
    step=app.steps.get(event.service_code)
    if not step: raise HTTPException(404,"Service step not found")
    step.status=event.status; step.updated_at=datetime.now(timezone.utc)
    app.updated_at=step.updated_at; app.timeline.append(f"Department event {event.event_type}: {event.status}" + (f" — {event.message}" if event.message else ""))
    get_application_repository().save(app)
    dispatches=IntegrationDispatchRepository().list_for_application(event.application_id)
    for d in dispatches:
        if d.service_code==event.service_code:
            d.status=event.status; d.external_reference=event.external_reference or d.external_reference; d.updated_at=step.updated_at; IntegrationDispatchRepository().save(d)
    CitizenNotificationRepository().create(__import__('app.repositories.phase20_models',fromlist=['CitizenNotificationRecord']).CitizenNotificationRecord(citizen_id=app.citizen_id,title="Application status updated",message=event.message or f"Your application status is now {event.status}.",application_id=app.id,created_at=step.updated_at))
    return {"accepted":True,"application_id":event.application_id,"status":step.status}

notify_router=APIRouter(prefix="/notifications", tags=["phase20-notifications"])
@notify_router.get("/me")
def notifications(session:SessionRecord=Depends(get_current_session)):
    return CitizenNotificationRepository().list_for_citizen(session.citizen_id)
@notify_router.post("/{notification_id}/read")
def notification_read(notification_id:str, session:SessionRecord=Depends(get_current_session)):
    item=CitizenNotificationRepository().mark_read(notification_id,session.citizen_id)
    if not item: raise HTTPException(404,"Notification not found")
    return item
