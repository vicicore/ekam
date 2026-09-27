"""Composition root. Every place in the codebase that needs a
repository, storage adapter, or connector asks here for one — never
constructs `LocalJsonApplicationRepository()` etc. directly. Adding a
Supabase-backed persistence_backend or an Appwrite storage_backend later
means adding one branch in each factory below; nothing that calls these
factories needs to change."""

from functools import lru_cache

from app.core.config import get_settings
from app.repositories.interfaces import (
    ApplicationRepository,
    AuditLogRepository,
    AuthRepository,
    CitizenRepository,
    ConnectorRequestRepository,
    DocumentRepository,
)
from app.repositories.local.application_repository import LocalJsonApplicationRepository
from app.repositories.local.audit_log_repository import LocalJsonAuditLogRepository
from app.repositories.local.auth_repository import LocalJsonAuthRepository
from app.repositories.local.citizen_repository import LocalJsonCitizenRepository
from app.repositories.local.connector_request_repository import LocalJsonConnectorRequestRepository
from app.repositories.local.document_repository import LocalJsonDocumentRepository
from app.repositories.local.phase17_repositories import (LocalJsonOfficerRepository, LocalJsonConnectorJobRepository, LocalJsonDeadLetterRepository, LocalJsonMetricEventRepository)
from app.repositories.supabase.core_repositories import (SupabaseApplicationRepository, SupabaseAuditLogRepository, SupabaseCitizenRepository, SupabaseDocumentRepository, SupabaseConnectorRequestRepository, SupabaseAuthRepository, SupabaseOfficerRepository, SupabaseConnectorJobRepository, SupabaseDeadLetterRepository, SupabaseMetricEventRepository)
from app.services.connectors.base import GovernmentConnector
from app.services.connectors.education import EducationMockConnector
from app.services.connectors.finance import FinanceMockConnector
from app.services.connectors.home_affairs import HomeAffairsMockConnector
from app.services.connectors.labour import LabourMockConnector
from app.services.connectors.revenue import RevenueMockConnector
from app.services.connectors.social_justice import SocialJusticeMockConnector
from app.services.connectors.urban_development import UrbanDevelopmentMockConnector
from app.services.auth_service import AuthService
from app.services.document_service import DocumentVaultService
from app.services.citizen_service import CitizenProfileService
from app.services.journey_service import JourneyService
from app.services.orchestrator import JourneyOrchestrator
from app.storage.interfaces import DocumentStoragePort
from app.storage.local_disk import LocalDiskDocumentStorage


@lru_cache
def get_application_repository() -> ApplicationRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonApplicationRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseApplicationRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no repository wired yet"
    )


@lru_cache
def get_audit_log_repository() -> AuditLogRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonAuditLogRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseAuditLogRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no audit repository wired yet"
    )


@lru_cache
def get_document_storage() -> DocumentStoragePort:
    settings = get_settings()
    if settings.storage_backend == "local":
        return LocalDiskDocumentStorage()
    raise NotImplementedError(
        f"storage_backend={settings.storage_backend!r} has no storage adapter wired yet"
    )


@lru_cache
def get_connector_request_repository() -> ConnectorRequestRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonConnectorRequestRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseConnectorRequestRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no connector-request repository wired yet"
    )


@lru_cache
def get_revenue_connector() -> RevenueMockConnector:
    """Connectors are now stateless wrappers over
    ConnectorRequestRepository (Phase 7) — kept as cached singletons for
    consistency with the other factories here, not because correctness
    depends on it anymore; a fresh instance would behave identically
    since all request state lives in the repository, surviving restarts."""
    return RevenueMockConnector(get_connector_request_repository())


@lru_cache
def _connector_registry() -> dict[str, GovernmentConnector]:
    repo = get_connector_request_repository()
    return {
        "Revenue": get_revenue_connector(),
        "Higher Education": EducationMockConnector(repo),
        "Social Justice": SocialJusticeMockConnector(repo),
        "Labour": LabourMockConnector(repo),
        "Urban Development": UrbanDevelopmentMockConnector(repo),
        "Finance": FinanceMockConnector(repo),
        "Home": HomeAffairsMockConnector(repo),
    }


def get_connector_for_department(department: str) -> GovernmentConnector:
    """Generic resolution used by the non-demo journeys API, so a second
    life event (or a third) never needs orchestrator or API changes —
    only a department -> connector mapping entry here. The /demo route's
    hardcoded get_revenue_connector() above is untouched on purpose: it
    backs the already-approved, deterministic College Admission flow."""
    try:
        return _connector_registry()[department]
    except KeyError as exc:
        raise ValueError(f"No connector registered for department {department!r}") from exc


@lru_cache
def get_journey_service() -> JourneyService:
    return JourneyService(
        orchestrator=JourneyOrchestrator(),
        application_repo=get_application_repository(),
        audit_repo=get_audit_log_repository(),
    )


@lru_cache
def get_citizen_repository() -> CitizenRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonCitizenRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseCitizenRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no citizen repository wired yet"
    )


@lru_cache
def get_document_repository() -> DocumentRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonDocumentRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseDocumentRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no document repository wired yet"
    )


@lru_cache
def get_citizen_profile_service() -> CitizenProfileService:
    return CitizenProfileService(get_citizen_repository())


@lru_cache
def get_document_vault_service() -> DocumentVaultService:
    return DocumentVaultService(
        get_document_repository(), get_document_storage(), get_audit_log_repository()
    )


@lru_cache
def get_officer_repository():
    if get_settings().persistence_backend == "supabase":
        return SupabaseOfficerRepository()
    return LocalJsonOfficerRepository()

@lru_cache
def get_connector_job_repository():
    if get_settings().persistence_backend == "supabase":
        return SupabaseConnectorJobRepository()
    return LocalJsonConnectorJobRepository()

@lru_cache
def get_dead_letter_repository():
    if get_settings().persistence_backend == "supabase":
        return SupabaseDeadLetterRepository()
    return LocalJsonDeadLetterRepository()

@lru_cache
def get_metric_event_repository():
    if get_settings().persistence_backend == "supabase":
        return SupabaseMetricEventRepository()
    return LocalJsonMetricEventRepository()


@lru_cache
def get_auth_repository() -> AuthRepository:
    settings = get_settings()
    if settings.persistence_backend == "local":
        return LocalJsonAuthRepository()
    if settings.persistence_backend == "supabase":
        return SupabaseAuthRepository()
    raise NotImplementedError(
        f"persistence_backend={settings.persistence_backend!r} has no auth repository wired yet"
    )


@lru_cache
def get_auth_service() -> AuthService:
    return AuthService(get_auth_repository())


# Phase 14/16 additive repositories
from app.repositories.local.phase14_repositories import (
    LocalJsonAssignmentRepository, LocalJsonNotificationRepository as Phase14NotificationRepository, LocalJsonAuditEventRepository,
)
from app.repositories.local.phase16_repositories import LocalJsonWebhookDeliveryRepository, LocalJsonIdempotencyRepository
from app.repositories.notification_repository import NotificationRepository as Phase22NotificationRepository

@lru_cache
def get_assignment_repository():
    return LocalJsonAssignmentRepository()

@lru_cache
def get_notification_repository():
    # Phase 22 is the canonical citizen notification API repository.
    return Phase22NotificationRepository(f"{get_settings().local_data_dir}/notifications-v2.json")

@lru_cache
def get_audit_event_repository():
    return LocalJsonAuditEventRepository()

@lru_cache
def get_webhook_delivery_repository():
    return LocalJsonWebhookDeliveryRepository()

@lru_cache
def get_idempotency_repository():
    return LocalJsonIdempotencyRepository()


@lru_cache
def get_grievance_repository():
    from app.repositories.local.grievance_repository import LocalJsonGrievanceRepository
    return LocalJsonGrievanceRepository()

@lru_cache
def get_phase14_notification_repository():
    return Phase14NotificationRepository()
