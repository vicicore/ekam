from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.core.security import get_current_session, require_admin
from app.core.container import (
    get_officer_repository,
    get_connector_job_repository,
    get_dead_letter_repository,
    get_metric_event_repository,
)
from app.repositories.models import OfficerProfileRecord, ConnectorJobRecord, DeadLetterRecord, MetricEventRecord, SessionRecord
from app.services.retry_policy import next_retry

router=APIRouter(prefix="/ops",tags=["phase17"])

class OfficerCreate(BaseModel):
    officer_id:str
    display_name:str
    department:str
    district:str|None=None

class JobCreate(BaseModel):
    operation:str
    department:str
    service_code:str
    external_reference:str|None=None
    payload:dict={}

@router.post("/officers",response_model=OfficerProfileRecord)
def create_officer(request:OfficerCreate,session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    now=datetime.now(timezone.utc)
    return get_officer_repository().create(OfficerProfileRecord(
        officer_id=request.officer_id,display_name=request.display_name,
        department=request.department,district=request.district,
        created_at=now,updated_at=now))

@router.get("/officers")
def officers(department:str|None=Query(default=None),session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    if department:
        return get_officer_repository().list_for_department(department)
    return []

@router.post("/connector-jobs",response_model=ConnectorJobRecord,status_code=201)
def enqueue_job(request:JobCreate,session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    now=datetime.now(timezone.utc)
    return get_connector_job_repository().create(ConnectorJobRecord(
        operation=request.operation,department=request.department,
        service_code=request.service_code,external_reference=request.external_reference,
        payload=request.payload,next_attempt_at=now,created_at=now,updated_at=now))

@router.post("/connector-jobs/{job_id}/retry",response_model=ConnectorJobRecord)
def retry_job(job_id:str,session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    repo=get_connector_job_repository()
    job=repo.get(job_id)
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404,detail="Connector job not found")
    job.attempts += 1
    job.status = "queued"
    job.next_attempt_at = next_retry(job.attempts)
    job.updated_at=datetime.now(timezone.utc)
    return repo.save(job)

@router.get("/dead-letters")
def dead_letters(limit:int=Query(default=100,ge=1,le=500),session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    return get_dead_letter_repository().list(limit)

@router.get("/metrics")
def metrics(limit:int=Query(default=500,ge=1,le=1000),session:SessionRecord=Depends(get_current_session)):
    require_admin(session)
    events=get_metric_event_repository().list(limit)
    counts={}
    for e in events:
        counts[e.name]=counts.get(e.name,0)+e.value
    return {"events":counts,"sample_size":len(events)}

class OfficerAccountLink(BaseModel):
    identifier: str

@router.post("/officers/{officer_id}/link-account")
def link_officer_account(officer_id: str, request: OfficerAccountLink, session: SessionRecord = Depends(get_current_session)):
    require_admin(session)
    officer = get_officer_repository().get(officer_id)
    if not officer:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Officer profile not found")
    auth = __import__("app.core.container", fromlist=["get_auth_repository"]).get_auth_repository()
    if auth.get_account_by_identifier(request.identifier):
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail="Identifier already has an account")
    from app.repositories.models import AccountRecord
    from app.services.identity import derive_citizen_id
    account = AccountRecord(citizen_id=officer_id, identifier=request.identifier.strip(), role="department_officer", created_at=datetime.now(timezone.utc))
    auth.create_account(account)
    return {"officer_id": officer_id, "identifier": request.identifier, "role": "department_officer"}
