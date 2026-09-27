from fastapi import APIRouter, Depends

from app.core.container import get_application_repository, get_audit_log_repository, get_document_repository
from app.core.security import get_current_session, require_admin
from app.repositories.models import SessionRecord
from app.schemas.analytics import AdminAnalytics
from app.services.admin_analytics import compute_analytics

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


@router.get("", response_model=AdminAnalytics)
def get_admin_analytics(session: SessionRecord = Depends(get_current_session)) -> AdminAnalytics:
    require_admin(session)
    applications = get_application_repository().list_all()
    documents = []
    # DocumentRepository has no list_all contract in the current architecture.
    # Keep analytics additive: document totals are populated by implementations
    # that expose list_all later; the base adapter remains compatible.
    repo = get_document_repository()
    if hasattr(repo, "list_all"):
        documents = repo.list_all()  # type: ignore[attr-defined]
    audit_events = get_audit_log_repository().list_all(limit=250)
    return compute_analytics(applications, documents, audit_events)
