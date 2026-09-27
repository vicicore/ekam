from pathlib import Path
import json
from threading import Lock
from uuid import uuid4
from datetime import datetime, timezone
from app.schemas.notifications import NotificationCreate, NotificationRecord

class NotificationRepository:
    def __init__(self, path: str = "data/notifications.json"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        if not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")

    def _load(self):
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except Exception:
            return []

    def _save(self, rows):
        self.path.write_text(json.dumps(rows, indent=2, default=str), encoding="utf-8")

    def create(self, data: NotificationCreate) -> NotificationRecord:
        row = NotificationRecord(
            id=f"NTF-{uuid4().hex[:12].upper()}",
            created_at=datetime.now(timezone.utc),
            **data.model_dump(),
        )
        with self._lock:
            rows = self._load(); rows.append(row.model_dump(mode="json")); self._save(rows)
        return row

    def list_for_recipient(self, recipient_id: str, unread_only: bool = False, limit: int = 50):
        rows = self._load()
        rows = [NotificationRecord.model_validate(r) for r in rows if r.get("recipient_id") == recipient_id]
        if unread_only: rows = [r for r in rows if not r.read]
        return sorted(rows, key=lambda r: r.created_at, reverse=True)[:limit]

    def mark_read(self, notification_id: str, recipient_id: str):
        with self._lock:
            rows = self._load()
            for row in rows:
                if row.get("id") == notification_id and row.get("recipient_id") == recipient_id:
                    row["read"] = True
                    row["read_at"] = datetime.now(timezone.utc).isoformat()
                    self._save(rows)
                    return NotificationRecord.model_validate(row)
        return None
