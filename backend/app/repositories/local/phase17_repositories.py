from datetime import datetime
from app.core.config import get_settings
from app.repositories.local.json_file_store import JsonFileStore
from app.repositories.models import OfficerProfileRecord, ConnectorJobRecord, DeadLetterRecord, MetricEventRecord
from app.repositories.interfaces import OfficerRepository, ConnectorJobRepository, DeadLetterRepository, MetricEventRepository

class LocalJsonOfficerRepository(OfficerRepository):
    def __init__(self): self.store = JsonFileStore(f"{get_settings().local_data_dir}/officers.json", default={})
    def create(self,r): self.store.mutate(lambda d:{**d,r.officer_id:r.model_dump(mode="json")}); return r
    def get(self,i):
        x=(self.store.read() or {}).get(i); return OfficerProfileRecord.model_validate(x) if x else None
    def list_for_department(self,department): return [OfficerProfileRecord.model_validate(x) for x in (self.store.read() or {}).values() if x.get("department")==department and x.get("active",True)]
    def save(self,r): self.store.mutate(lambda d:{**d,r.officer_id:r.model_dump(mode="json")}); return r

class LocalJsonConnectorJobRepository(ConnectorJobRepository):
    def __init__(self): self.store=JsonFileStore(f"{get_settings().local_data_dir}/connector_jobs.json",default={})
    def create(self,r): self.store.mutate(lambda d:{**d,r.id:r.model_dump(mode="json")}); return r
    def get(self,i):
        x=(self.store.read() or {}).get(i); return ConnectorJobRecord.model_validate(x) if x else None
    def save(self,r): self.store.mutate(lambda d:{**d,r.id:r.model_dump(mode="json")}); return r
    def due_jobs(self,now): return [ConnectorJobRecord.model_validate(x) for x in (self.store.read() or {}).values() if x.get("status") in {"queued","retry"} and x.get("next_attempt_at","") <= now.isoformat()]
    def list_all(self): return [ConnectorJobRecord.model_validate(x) for x in (self.store.read() or {}).values()]

class LocalJsonDeadLetterRepository(DeadLetterRepository):
    def __init__(self): self.store=JsonFileStore(f"{get_settings().local_data_dir}/dead_letters.json",default={})
    def create(self,r): self.store.mutate(lambda d:{**d,r.id:r.model_dump(mode="json")}); return r
    def list(self,limit=100):
        rows=[DeadLetterRecord.model_validate(x) for x in (self.store.read() or {}).values()]
        return sorted(rows,key=lambda x:x.created_at,reverse=True)[:limit]

class LocalJsonMetricEventRepository(MetricEventRepository):
    def __init__(self): self.store=JsonFileStore(f"{get_settings().local_data_dir}/metric_events.json",default={})
    def create(self,r): self.store.mutate(lambda d:{**d,r.id:r.model_dump(mode="json")}); return r
    def list(self,limit=500):
        rows=[MetricEventRecord.model_validate(x) for x in (self.store.read() or {}).values()]
        return sorted(rows,key=lambda x:x.created_at,reverse=True)[:limit]
