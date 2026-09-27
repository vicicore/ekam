from app.core.config import get_settings
from app.repositories.local.json_file_store import JsonFileStore
from app.repositories.models import AssignmentRecord, NotificationRecord, AuditEventRecord
from app.repositories.interfaces import AssignmentRepository, NotificationRepository, AuditEventRepository

class LocalJsonAssignmentRepository(AssignmentRepository):
    def __init__(self):
        self.store = JsonFileStore(f"{get_settings().local_data_dir}/assignments.json", default={})
    def create(self, r):
        self.store.mutate(lambda d: {**d, r.id: r.model_dump(mode="json")}); return r
    def get(self, i):
        raw=(self.store.read() or {}).get(i); return AssignmentRecord.model_validate(raw) if raw else None
    def save(self, r):
        self.store.mutate(lambda d: {**d, r.id: r.model_dump(mode="json")}); return r
    def list_for_application(self, application_id):
        return [AssignmentRecord.model_validate(x) for x in (self.store.read() or {}).values() if x.get("application_id")==application_id]
    def list_for_officer(self, officer_id):
        return [AssignmentRecord.model_validate(x) for x in (self.store.read() or {}).values() if x.get("officer_id")==officer_id]

class LocalJsonNotificationRepository(NotificationRepository):
    def __init__(self):
        self.store = JsonFileStore(f"{get_settings().local_data_dir}/notifications.json", default={})
    def create(self, r):
        self.store.mutate(lambda d: {**d, r.id: r.model_dump(mode="json")}); return r
    def list_for_recipient(self, recipient_id):
        return [NotificationRecord.model_validate(x) for x in (self.store.read() or {}).values() if x.get("recipient_id")==recipient_id]
    def save(self, r):
        self.store.mutate(lambda d: {**d, r.id: r.model_dump(mode="json")}); return r

class LocalJsonAuditEventRepository(AuditEventRepository):
    def __init__(self):
        self.store = JsonFileStore(f"{get_settings().local_data_dir}/audit_events.json", default={})
    def append(self, r):
        self.store.mutate(lambda d: {**d, r.id: r.model_dump(mode="json")}); return r
    def list(self, limit=100):
        rows=[AuditEventRecord.model_validate(x) for x in (self.store.read() or {}).values()]
        return sorted(rows, key=lambda x:x.created_at, reverse=True)[:limit]
