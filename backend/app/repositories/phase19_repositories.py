import json
from pathlib import Path
from threading import Lock
from datetime import datetime
from .phase19_models import AssignmentRecord, OfficerNotificationRecord

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
_lock = Lock()

def _load(path):
    if not path.exists(): return []
    try: return json.loads(path.read_text(encoding="utf-8"))
    except Exception: return []

def _save(path, rows):
    path.write_text(json.dumps(rows, default=lambda x: x.isoformat() if isinstance(x, datetime) else x, indent=2), encoding="utf-8")

class AssignmentRepository:
    def __init__(self, path=DATA_DIR/"assignments.json"): self.path=Path(path)
    def create(self, record):
        with _lock:
            rows=_load(self.path); rows.append(record.model_dump(mode="json")); _save(self.path, rows)
        return record
    def list_for_officer(self, officer_id): return [AssignmentRecord(**x) for x in _load(self.path) if x["officer_id"]==officer_id and x.get("status") not in ("completed","reassigned")]
    def list_for_application(self, application_id): return [AssignmentRecord(**x) for x in _load(self.path) if x["application_id"]==application_id]
    def get_active(self, application_id, service_code):
        rows=self.list_for_application(application_id)
        for r in reversed(rows):
            if r.service_code==service_code and r.status not in ("completed","reassigned"): return r
        return None
    def save(self, record):
        with _lock:
            rows=_load(self.path)
            for i,x in enumerate(rows):
                if x["id"]==record.id: rows[i]=record.model_dump(mode="json"); break
            _save(self.path, rows)
        return record

class NotificationRepository:
    def __init__(self, path=DATA_DIR/"officer_notifications.json"): self.path=Path(path)
    def create(self, record):
        with _lock:
            rows=_load(self.path); rows.append(record.model_dump(mode="json")); _save(self.path, rows)
        return record
    def list_for_officer(self, officer_id, limit=50):
        rows=[OfficerNotificationRecord(**x) for x in _load(self.path) if x["officer_id"]==officer_id]
        rows.sort(key=lambda x:x.created_at, reverse=True); return rows[:limit]
    def mark_read(self, notification_id, officer_id):
        with _lock:
            rows=_load(self.path); found=None
            for i,x in enumerate(rows):
                if x["id"]==notification_id and x["officer_id"]==officer_id:
                    x["read"]=True; found=OfficerNotificationRecord(**x); rows[i]=x; break
            _save(self.path, rows)
        return found
