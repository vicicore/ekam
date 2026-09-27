import json
from pathlib import Path
from threading import Lock
from datetime import datetime
from .phase20_models import IntegrationDispatchRecord, CitizenNotificationRecord

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
_lock = Lock()

def _load(path):
    if not path.exists(): return []
    try: return json.loads(path.read_text(encoding="utf-8"))
    except Exception: return []

def _save(path, rows):
    path.write_text(json.dumps(rows, default=lambda x: x.isoformat() if isinstance(x, datetime) else x, indent=2), encoding="utf-8")

class IntegrationDispatchRepository:
    def __init__(self, path=DATA_DIR/"integration_dispatches.json"): self.path=Path(path)
    def create(self, record):
        with _lock:
            rows=_load(self.path); rows.append(record.model_dump(mode="json")); _save(self.path, rows)
        return record
    def save(self, record):
        with _lock:
            rows=_load(self.path)
            for i,x in enumerate(rows):
                if x["id"]==record.id: rows[i]=record.model_dump(mode="json"); break
            _save(self.path, rows)
        return record
    def get(self, record_id):
        return next((IntegrationDispatchRecord(**x) for x in _load(self.path) if x["id"]==record_id), None)
    def list_for_application(self, application_id):
        return [IntegrationDispatchRecord(**x) for x in _load(self.path) if x["application_id"]==application_id]

class CitizenNotificationRepository:
    def __init__(self, path=DATA_DIR/"citizen_notifications.json"): self.path=Path(path)
    def create(self, record):
        with _lock:
            rows=_load(self.path); rows.append(record.model_dump(mode="json")); _save(self.path, rows)
        return record
    def list_for_citizen(self, citizen_id, limit=50):
        rows=[CitizenNotificationRecord(**x) for x in _load(self.path) if x["citizen_id"]==citizen_id]
        rows.sort(key=lambda x:x.created_at, reverse=True); return rows[:limit]
    def mark_read(self, notification_id, citizen_id):
        with _lock:
            rows=_load(self.path); found=None
            for i,x in enumerate(rows):
                if x["id"]==notification_id and x["citizen_id"]==citizen_id:
                    x["read"]=True; found=CitizenNotificationRecord(**x); rows[i]=x; break
            _save(self.path, rows)
        return found
