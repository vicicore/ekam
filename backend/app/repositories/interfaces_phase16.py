# Add these ports to repositories/interfaces.py.

from app.repositories.models import WebhookDeliveryRecord, IdempotencyRecord

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
