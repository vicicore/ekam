from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_session
from app.core.container import get_notification_repository
from app.repositories.models import SessionRecord

router=APIRouter(prefix="/notifications",tags=["notifications"])

@router.get("/me")
def my_notifications(session:SessionRecord=Depends(get_current_session)):
    rows=get_notification_repository().list_for_recipient(session.citizen_id)
    return sorted(rows,key=lambda x:x.created_at,reverse=True)

@router.post("/{notification_id}/read")
def mark_read(notification_id:str,session:SessionRecord=Depends(get_current_session)):
    repo=get_notification_repository()
    rows=repo.list_for_recipient(session.citizen_id)
    record=next((x for x in rows if x.id==notification_id),None)
    if record is None:
        raise HTTPException(status_code=404,detail="Notification not found")
    record.read=True
    repo.save(record)
    return record
