from datetime import datetime
from typing import Any

from app.repositories.interfaces import (
    ApplicationRepository, AuditLogRepository, AuthRepository,
    CitizenRepository, ConnectorRequestRepository, DocumentRepository,
)
from app.repositories.models import (
    AccountRecord, ApplicationRecord, AuditLogEntry, CitizenProfileRecord,
    ConnectorRequestRecord, DocumentRecord, SessionRecord, StepRecord, ConsentRecord,
)
from app.repositories.supabase.base import SupabaseTable


def _dt(value: Any) -> datetime:
    return value if isinstance(value, datetime) else datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def _application(row: dict) -> ApplicationRecord:
    return ApplicationRecord(
        id=row["id"], citizen_id=row["citizen_id"], life_event_code=row["life_event_code"],
        steps={k: StepRecord.model_validate(v) for k, v in (row.get("steps") or {}).items()},
        consents={k: ConsentRecord.model_validate(v) for k, v in (row.get("consents") or {}).items()},
        timeline=row.get("timeline") or [], created_at=_dt(row["created_at"]), updated_at=_dt(row["updated_at"]),
    )


class SupabaseApplicationRepository(ApplicationRepository):
    table = SupabaseTable("applications")
    def create(self, record):
        self.table.insert(record.model_dump(mode="json")); return record
    def get(self, application_id):
        row = self.table.one("id", application_id); return _application(row) if row else None
    def save(self, record):
        self.table.upsert(record.model_dump(mode="json")); return record
    def delete(self, application_id): self.table.delete("id", application_id)
    def list_for_citizen(self, citizen_id): return [_application(r) for r in self.table.many("citizen_id", citizen_id)]
    def list_all(self): return [_application(r) for r in self.table.many()]
    def find_by_step_external_reference(self, external_reference):
        for row in self.table.many():
            record = _application(row)
            for service_code, step in record.steps.items():
                if step.external_reference == external_reference:
                    return record, service_code
        return None


class SupabaseAuditLogRepository(AuditLogRepository):
    table = SupabaseTable("audit_logs")
    def append(self, entry): self.table.insert(entry.model_dump(mode="json")); return entry
    def list_for_application(self, application_id):
        return [AuditLogEntry.model_validate(r) for r in self.table.many("application_id", application_id)]
    def list_all(self, limit=100):
        return [AuditLogEntry.model_validate(r) for r in self.table.many(limit=limit)]


class SupabaseCitizenRepository(CitizenRepository):
    table = SupabaseTable("citizen_profiles")
    def get(self, citizen_id):
        row = self.table.one("citizen_id", citizen_id); return CitizenProfileRecord.model_validate(row) if row else None
    def upsert(self, record): self.table.upsert(record.model_dump(mode="json")); return record


class SupabaseDocumentRepository(DocumentRepository):
    table = SupabaseTable("documents")
    def create(self, record): self.table.insert(record.model_dump(mode="json")); return record
    def save(self, record): self.table.upsert(record.model_dump(mode="json")); return record
    def get(self, document_id):
        row = self.table.one("id", document_id); return DocumentRecord.model_validate(row) if row else None
    def list_for_citizen(self, citizen_id): return [DocumentRecord.model_validate(r) for r in self.table.many("citizen_id", citizen_id)]
    def delete(self, document_id): self.table.delete("id", document_id)


class SupabaseConnectorRequestRepository(ConnectorRequestRepository):
    table = SupabaseTable("connector_requests")
    def save(self, record): self.table.upsert(record.model_dump(mode="json")); return record
    def get(self, external_reference):
        row = self.table.one("external_reference", external_reference); return ConnectorRequestRecord.model_validate(row) if row else None


class SupabaseAuthRepository(AuthRepository):
    accounts = SupabaseTable("accounts")
    sessions = SupabaseTable("sessions")
    def get_account_by_identifier(self, identifier):
        row = self.accounts.one("identifier", identifier); return AccountRecord.model_validate(row) if row else None
    def create_account(self, record): self.accounts.upsert(record.model_dump(mode="json")); return record
    def create_session(self, record): self.sessions.upsert(record.model_dump(mode="json")); return record
    def get_session(self, token):
        row = self.sessions.one("token", token); return SessionRecord.model_validate(row) if row else None
    def delete_session(self, token): self.sessions.delete("token", token)

from app.repositories.models import OfficerProfileRecord, ConnectorJobRecord, DeadLetterRecord, MetricEventRecord
from app.repositories.interfaces import OfficerRepository, ConnectorJobRepository, DeadLetterRepository, MetricEventRepository

class SupabaseOfficerRepository(OfficerRepository):
    table = SupabaseTable("officers")
    def create(self, r): self.table.upsert(r.model_dump(mode="json")); return r
    def get(self, i):
        row=self.table.one("officer_id",i); return OfficerProfileRecord.model_validate(row) if row else None
    def list_for_department(self, d): return [OfficerProfileRecord.model_validate(r) for r in self.table.many("department",d)]
    def save(self, r): self.table.upsert(r.model_dump(mode="json")); return r

class SupabaseConnectorJobRepository(ConnectorJobRepository):
    table = SupabaseTable("connector_jobs")
    def create(self,r): self.table.insert(r.model_dump(mode="json")); return r
    def get(self,i):
        row=self.table.one("id",i); return ConnectorJobRecord.model_validate(row) if row else None
    def save(self,r): self.table.upsert(r.model_dump(mode="json")); return r
    def due_jobs(self,now): return [ConnectorJobRecord.model_validate(r) for r in self.table.many() if r.get("status") in {"queued","retry"} and r.get("next_attempt_at","") <= now.isoformat()]
    def list_all(self): return [ConnectorJobRecord.model_validate(r) for r in self.table.many()]

class SupabaseDeadLetterRepository(DeadLetterRepository):
    table = SupabaseTable("dead_letters")
    def create(self,r): self.table.insert(r.model_dump(mode="json")); return r
    def list(self,limit=100): return [DeadLetterRecord.model_validate(r) for r in self.table.many(limit=limit)]

class SupabaseMetricEventRepository(MetricEventRepository):
    table = SupabaseTable("metric_events")
    def create(self,r): self.table.insert(r.model_dump(mode="json")); return r
    def list(self,limit=500): return [MetricEventRecord.model_validate(r) for r in self.table.many(limit=limit)]
