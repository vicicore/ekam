from fastapi import HTTPException
from app.repositories.models import SessionRecord, OfficerProfileRecord

def require_role(session: SessionRecord, *roles: str) -> None:
    if session.role not in roles:
        raise HTTPException(status_code=403, detail="Required role not granted")

def require_department_officer(
    session: SessionRecord,
    officer: OfficerProfileRecord,
) -> None:
    if session.role not in {"admin", "department_officer"}:
        raise HTTPException(status_code=403, detail="Department officer access required")
    if session.role == "department_officer" and session.citizen_id != officer.officer_id:
        raise HTTPException(status_code=403, detail="Officer identity mismatch")


def require_department_access(requested_department: str, officer_department: str) -> bool:
    return requested_department.strip().lower() == officer_department.strip().lower()
