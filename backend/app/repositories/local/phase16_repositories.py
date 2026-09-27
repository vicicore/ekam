from app.core.config import get_settings
from app.repositories.local.json_file_store import JsonFileStore
from app.repositories.models import WebhookDeliveryRecord, IdempotencyRecord
from app.repositories.interfaces import WebhookDeliveryRepository, IdempotencyRepository

class LocalJsonWebhookDeliveryRepository(WebhookDeliveryRepository):
    def __init__(self):
        self.store=JsonFileStore(f"{get_settings().local_data_dir}/webhook_deliveries.json", default={})
    def get_by_event_id(self,event_id):
        raw=(self.store.read() or {}).get(event_id)
        return WebhookDeliveryRecord.model_validate(raw) if raw else None
    def create(self,r):
        self.store.mutate(lambda d:{**d,r.event_id:r.model_dump(mode="json")}); return r
    def save(self,r):
        self.store.mutate(lambda d:{**d,r.event_id:r.model_dump(mode="json")}); return r

class LocalJsonIdempotencyRepository(IdempotencyRepository):
    def __init__(self):
        self.store=JsonFileStore(f"{get_settings().local_data_dir}/idempotency.json", default={})
    def get(self,key,operation):
        raw=(self.store.read() or {}).get(f"{operation}:{key}")
        return IdempotencyRecord.model_validate(raw) if raw else None
    def create(self,r):
        self.store.mutate(lambda d:{**d,f"{r.operation}:{r.key}":r.model_dump(mode="json")}); return r
