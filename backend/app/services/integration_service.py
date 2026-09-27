from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.container import get_application_repository
from app.repositories.phase20_models import IntegrationDispatchRecord, CitizenNotificationRecord
from app.repositories.phase20_repositories import IntegrationDispatchRepository, CitizenNotificationRepository
from app.services.department_adapters import get_adapter

class IntegrationService:
    def __init__(self, dispatches=None, notifications=None):
        self.dispatches=dispatches or IntegrationDispatchRepository()
        self.notifications=notifications or CitizenNotificationRepository()

    def dispatch(self, application_id: str, service_code: str, department: str):
        app=get_application_repository().get(application_id)
        if not app: raise HTTPException(404,"Application not found")
        step=app.steps.get(service_code)
        if not step: raise HTTPException(404,"Service step not found")
        if step.status not in ("submitted","in_progress","completed"):
            raise HTTPException(409,f"Step is not dispatchable from status {step.status}")
        existing=[x for x in self.dispatches.list_for_application(application_id) if x.service_code==service_code and x.status in ("submitted","acknowledged","completed")]
        if existing: return existing[-1]
        now=datetime.now(timezone.utc)
        rec=IntegrationDispatchRecord(application_id=application_id,service_code=service_code,department=department,connector=get_adapter(department).name,created_at=now,updated_at=now)
        self.dispatches.create(rec)
        try:
            adapter=get_adapter(department)
            payload={"citizen_id":app.citizen_id,"life_event_code":app.life_event_code,"service_code":service_code,"timeline":app.timeline}
            result=adapter.submit(application_id=application_id,service_code=service_code,payload=payload)
            rec.external_reference=result.external_reference; rec.status=result.status; rec.attempt_count=1; rec.updated_at=datetime.now(timezone.utc)
            self.dispatches.save(rec)
            self.notifications.create(CitizenNotificationRecord(citizen_id=app.citizen_id,title="Application sent to department",message=f"Your {service_code} application has been acknowledged by the {department} integration.",application_id=application_id,created_at=rec.updated_at))
            return rec
        except Exception as exc:
            rec.status="failed"; rec.last_error=str(exc)[:500]; rec.attempt_count+=1; rec.updated_at=datetime.now(timezone.utc); self.dispatches.save(rec); raise HTTPException(502,"Department connector submission failed")

    def status(self, dispatch_id: str):
        rec=self.dispatches.get(dispatch_id)
        if not rec: raise HTTPException(404,"Integration dispatch not found")
        if not rec.external_reference: return rec
        result=get_adapter(rec.department).get_status(external_reference=rec.external_reference)
        rec.status=result.status; rec.updated_at=datetime.now(timezone.utc); rec.last_error=None; self.dispatches.save(rec)
        return rec
