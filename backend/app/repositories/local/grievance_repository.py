from app.core.config import get_settings
from app.repositories.interfaces import GrievanceRepository
from app.repositories.local.json_file_store import JsonFileStore
from app.repositories.models import GrievanceRecord

class LocalJsonGrievanceRepository(GrievanceRepository):
    def __init__(self, data_dir: str | None = None) -> None:
        settings = get_settings()
        base = data_dir or settings.local_data_dir
        self._store = JsonFileStore(f"{base}/grievances.json", default={})

    def create(self, record: GrievanceRecord) -> GrievanceRecord:
        payload = record.model_dump(mode="json")
        def mutate(data: dict) -> dict:
            data[record.id] = payload
            return data
        self._store.mutate(mutate)
        return record

    def get(self, grievance_id: str) -> GrievanceRecord | None:
        data = self._store.read() or {}
        raw = data.get(grievance_id)
        return GrievanceRecord.model_validate(raw) if raw else None

    def save(self, record: GrievanceRecord) -> GrievanceRecord:
        payload = record.model_dump(mode="json")
        def mutate(data: dict) -> dict:
            data[record.id] = payload
            return data
        self._store.mutate(mutate)
        return record

    def list_for_citizen(self, citizen_id: str) -> list[GrievanceRecord]:
        data = self._store.read() or {}
        return [
            GrievanceRecord.model_validate(raw)
            for raw in data.values()
            if raw.get("citizen_id") == citizen_id
        ]

    def list_all(self) -> list[GrievanceRecord]:
        data = self._store.read() or {}
        return [GrievanceRecord.model_validate(raw) for raw in data.values()]
