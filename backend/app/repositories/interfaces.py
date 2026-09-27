"""Repository ports. Anything above this line (API routes, the service
layer, JourneyOrchestrator) depends only on these interfaces — never on
a concrete storage technology. A Supabase-backed implementation is added
later by writing a new class that satisfies the same contract; nothing
above this line changes."""

from abc import ABC, abstractmethod
from datetime import datetime

from app.repositories.models import (
    AccountRecord,
    ApplicationRecord,
    AuditLogEntry,
    CitizenProfileRecord,
    ConnectorRequestRecord,
    DocumentRecord,
    SessionRecord,
)


class ApplicationRepository(ABC):
    @abstractmethod
    def create(self, record: ApplicationRecord) -> ApplicationRecord: ...

    @abstractmethod
    def get(self, application_id: str) -> ApplicationRecord | None: ...

    @abstractmethod
    def save(self, record: ApplicationRecord) -> ApplicationRecord: ...

    @abstractmethod
    def delete(self, application_id: str) -> None: ...

    @abstractmethod
    def list_for_citizen(self, citizen_id: str) -> list[ApplicationRecord]: ...

    @abstractmethod
    def list_all(self) -> list[ApplicationRecord]: ...

    @abstractmethod
    def find_by_step_external_reference(
        self, external_reference: str
    ) -> tuple[ApplicationRecord, str] | None:
        """Returns (record, service_code) for the step carrying this
        connector external_reference, or None. This is how a webhook —
        which only knows the reference a connector handed out — is
        routed back to the right application/step without the caller
        needing to know the application id up front."""
        ...


class AuditLogRepository(ABC):
    @abstractmethod
    def append(self, entry: AuditLogEntry) -> AuditLogEntry: ...

    @abstractmethod
    def list_for_application(self, application_id: str) -> list[AuditLogEntry]: ...

    @abstractmethod
    def list_all(self, limit: int = 100) -> list[AuditLogEntry]: ...


class CitizenRepository(ABC):
    @abstractmethod
    def get(self, citizen_id: str) -> CitizenProfileRecord | None: ...

    @abstractmethod
    def upsert(self, record: CitizenProfileRecord) -> CitizenProfileRecord: ...


class DocumentRepository(ABC):
    @abstractmethod
    def create(self, record: DocumentRecord) -> DocumentRecord: ...

    @abstractmethod
    def save(self, record: DocumentRecord) -> DocumentRecord: ...

    @abstractmethod
    def get(self, document_id: str) -> DocumentRecord | None: ...

    @abstractmethod
    def list_for_citizen(self, citizen_id: str) -> list[DocumentRecord]: ...

    @abstractmethod
    def delete(self, document_id: str) -> None: ...


class ConnectorRequestRepository(ABC):
    """Backs GovernmentConnector so its bookkeeping survives a backend
    restart — see ConnectorRequestRecord's docstring."""

    @abstractmethod
    def save(self, record: ConnectorRequestRecord) -> ConnectorRequestRecord: ...

    @abstractmethod
    def get(self, external_reference: str) -> ConnectorRequestRecord | None: ...


class AuthRepository(ABC):
    @abstractmethod
    def get_account_by_identifier(self, identifier: str) -> AccountRecord | None: ...

    @abstractmethod
    def create_account(self, record: AccountRecord) -> AccountRecord: ...

    @abstractmethod
    def create_session(self, record: SessionRecord) -> SessionRecord: ...

    @abstractmethod
    def get_session(self, token: str) -> SessionRecord | None: ...

    @abstractmethod
    def delete_session(self, token: str) -> None: ...

from app.repositories.models import OfficerProfileRecord, ConnectorJobRecord, DeadLetterRecord, MetricEventRecord

class OfficerRepository(ABC):
    @abstractmethod
    def create(self, record: OfficerProfileRecord) -> OfficerProfileRecord: ...
    @abstractmethod
    def get(self, officer_id: str) -> OfficerProfileRecord | None: ...
    @abstractmethod
    def list_for_department(self, department: str) -> list[OfficerProfileRecord]: ...
    @abstractmethod
    def save(self, record: OfficerProfileRecord) -> OfficerProfileRecord: ...

class ConnectorJobRepository(ABC):
    @abstractmethod
    def create(self, record: ConnectorJobRecord) -> ConnectorJobRecord: ...
    @abstractmethod
    def get(self, job_id: str) -> ConnectorJobRecord | None: ...
    @abstractmethod
    def save(self, record: ConnectorJobRecord) -> ConnectorJobRecord: ...
    @abstractmethod
    def due_jobs(self, now: datetime) -> list[ConnectorJobRecord]: ...
    @abstractmethod
    def list_all(self) -> list[ConnectorJobRecord]: ...

class DeadLetterRepository(ABC):
    @abstractmethod
    def create(self, record: DeadLetterRecord) -> DeadLetterRecord: ...
    @abstractmethod
    def list(self, limit: int = 100) -> list[DeadLetterRecord]: ...

class MetricEventRepository(ABC):
    @abstractmethod
    def create(self, record: MetricEventRecord) -> MetricEventRecord: ...
    @abstractmethod
    def list(self, limit: int = 500) -> list[MetricEventRecord]: ...


from app.repositories.models import AssignmentRecord, NotificationRecord, AuditEventRecord, WebhookDeliveryRecord, IdempotencyRecord

class AssignmentRepository(ABC):
    @abstractmethod
    def create(self, record: AssignmentRecord) -> AssignmentRecord: ...
    @abstractmethod
    def get(self, assignment_id: str) -> AssignmentRecord | None: ...
    @abstractmethod
    def save(self, record: AssignmentRecord) -> AssignmentRecord: ...
    @abstractmethod
    def list_for_application(self, application_id: str) -> list[AssignmentRecord]: ...
    @abstractmethod
    def list_for_officer(self, officer_id: str) -> list[AssignmentRecord]: ...

class NotificationRepository(ABC):
    @abstractmethod
    def create(self, record: NotificationRecord) -> NotificationRecord: ...
    @abstractmethod
    def list_for_recipient(self, recipient_id: str) -> list[NotificationRecord]: ...
    @abstractmethod
    def save(self, record: NotificationRecord) -> NotificationRecord: ...

class AuditEventRepository(ABC):
    @abstractmethod
    def append(self, record: AuditEventRecord) -> AuditEventRecord: ...
    @abstractmethod
    def list(self, limit: int = 100) -> list[AuditEventRecord]: ...


class WebhookDeliveryRepository(ABC):
    @abstractmethod
    def get_by_event_id(self, event_id: str) -> WebhookDeliveryRecord | None: ...
    @abstractmethod
    def create(self, record: WebhookDeliveryRecord) -> WebhookDeliveryRecord: ...
    @abstractmethod
    def save(self, record: WebhookDeliveryRecord) -> WebhookDeliveryRecord: ...

class IdempotencyRepository(ABC):
    @abstractmethod
    def get(self, key: str, operation: str) -> IdempotencyRecord | None: ...
    @abstractmethod
    def create(self, record: IdempotencyRecord) -> IdempotencyRecord: ...
