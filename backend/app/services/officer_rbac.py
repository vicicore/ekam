from fastapi import HTTPException
from app.repositories.models import SessionRecord

def require_officer(session: SessionRecord):
    if session.role not in ("department_officer", "admin"):
        raise HTTPException(status_code=403, detail="Department officer access required")
    return session

def require_admin_or_officer(session: SessionRecord):
    if session.role not in ("department_officer", "admin"):
        raise HTTPException(status_code=403, detail="Officer or admin access required")
    return session
