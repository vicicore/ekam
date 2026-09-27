from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_session, require_admin
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notifications import NotificationCreate, NotificationRecord, NotificationReadResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])
_repo = NotificationRepository()

@router.get("/me", response_model=list[NotificationRecord])
def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    session=Depends(get_current_session),
):
    return _repo.list_for_recipient(session.citizen_id, unread_only, limit)

@router.post("", response_model=NotificationRecord)
def create_notification(data: NotificationCreate, session=Depends(require_admin)):
    return _repo.create(data)

@router.post("/{notification_id}/read", response_model=NotificationReadResponse)
def mark_notification_read(notification_id: str, session=Depends(get_current_session)):
    row = _repo.mark_read(notification_id, session.citizen_id)
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"id": row.id, "read": row.read, "read_at": row.read_at}
