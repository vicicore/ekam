from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_session
from app.core.container import get_application_repository, get_officer_repository
from app.repositories.models import SessionRecord
from app.repositories.phase19_models import AssignmentRequest, OfficerDecisionRequest, AssignmentRecord, OfficerNotificationRecord
from app.repositories.phase19_repositories import AssignmentRepository, NotificationRepository
from app.services.officer_rbac import require_officer

router=APIRouter(prefix="/officer", tags=["phase19-officer"])
assignments=AssignmentRepository(); notifications=NotificationRepository()

def _profile(session):
    officer=get_officer_repository().get(session.citizen_id)
    if not officer: raise HTTPException(status_code=404, detail="Officer profile not found")
    return officer

def _queue(session):
    officer=_profile(session); apps=get_application_repository().list_all(); out=[]
    for app in apps:
        for code,step in app.steps.items():
            if step.status not in ("submitted","in_progress"):
                continue
            # Department is represented by consent recipient where available; otherwise service code prefix.
            consent=app.consents.get(code)
            department=consent.recipient_department if consent else "Unassigned"
            if department != officer.department and session.role != "admin": continue
            active=assignments.get_active(app.id, code)
            out.append({"application_id":app.id,"citizen_id":app.citizen_id,"life_event_code":app.life_event_code,"service_code":code,"status":step.status,"sla_due_at":step.sla_due_at,"department":department,"assignment":active.model_dump(mode="json") if active else None,"updated_at":step.updated_at})
    return out

@router.get("/me")
def me(session:SessionRecord=Depends(get_current_session)):
    require_officer(session); officer=_profile(session); q=_queue(session)
    return {"officer":officer,"queue_count":len(q),"unread_notifications":sum(1 for n in notifications.list_for_officer(session.citizen_id) if not n.read)}

@router.get("/queue")
def queue(status:str|None=Query(None),session:SessionRecord=Depends(get_current_session)):
    require_officer(session); q=_queue(session)
    if status: q=[x for x in q if x["status"]==status]
    return q

@router.post("/applications/{application_id}/assign",response_model=AssignmentRecord)
def assign(application_id:str, request:AssignmentRequest, session:SessionRecord=Depends(get_current_session)):
    require_officer(session); officer=_profile(session)
    if session.role!="admin" and request.officer_id==session.citizen_id: target=officer
    else:
        target=get_officer_repository().get(request.officer_id)
        if not target: raise HTTPException(status_code=404, detail="Target officer not found")
        if session.role!="admin" and target.department!=officer.department: raise HTTPException(status_code=403, detail="Cross-department assignment denied")
    app=get_application_repository().get(application_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    service_code=next((c for c,s in app.steps.items() if s.status in ("submitted","in_progress")), None)
    if not service_code: raise HTTPException(status_code=409, detail="No actionable step found")
    old=assignments.get_active(application_id, service_code)
    if old: old.status="reassigned"; old.updated_at=datetime.now(timezone.utc); assignments.save(old)
    now=datetime.now(timezone.utc)
    rec=AssignmentRecord(application_id=application_id,service_code=service_code,department=target.department,officer_id=target.officer_id,assigned_by=session.citizen_id,note=request.note,created_at=now,updated_at=now)
    assignments.create(rec)
    notifications.create(OfficerNotificationRecord(officer_id=target.officer_id,title="New application assigned",message=f"Application {application_id[:8]}… requires review.",resource_id=application_id,created_at=now))
    return rec

@router.post("/applications/{application_id}/decision")
def decision(application_id:str, request:OfficerDecisionRequest, session:SessionRecord=Depends(get_current_session)):
    require_officer(session); officer=_profile(session); app=get_application_repository().get(application_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    active=None
    for code,step in app.steps.items():
        candidate=assignments.get_active(application_id,code)
        if candidate and candidate.officer_id==session.citizen_id: active=(code,candidate,step); break
    if not active: raise HTTPException(status_code=403, detail="Application is not assigned to this officer")
    code, assignment, step=active
    decision=request.decision
    if decision=="approve": step.status="completed"; assignment.status="completed"
    elif decision=="reject": step.status="rejected"; assignment.status="completed"
    elif decision=="request_info": step.status="blocked"; step.blocked_reason=request.note or "Additional information requested"; assignment.status="accepted"
    else: raise HTTPException(status_code=400, detail="Unsupported decision")
    step.updated_at=datetime.now(timezone.utc); app.updated_at=step.updated_at
    app.timeline.append(f"Officer {session.citizen_id}: {decision} for {code}" + (f" — {request.note}" if request.note else ""))
    get_application_repository().save(app); assignments.save(assignment)
    return {"application_id":application_id,"service_code":code,"decision":decision,"status":step.status,"note":request.note}

@router.get("/notifications")
def notification_list(session:SessionRecord=Depends(get_current_session)):
    require_officer(session); return notifications.list_for_officer(session.citizen_id)

@router.post("/notifications/{notification_id}/read")
def notification_read(notification_id:str,session:SessionRecord=Depends(get_current_session)):
    require_officer(session); item=notifications.mark_read(notification_id,session.citizen_id)
    if not item: raise HTTPException(status_code=404, detail="Notification not found")
    return item
