from datetime import datetime, timezone

from app.repositories.models import ConnectorJobRecord, OfficerProfileRecord
from app.services.retry_policy import next_retry


def test_connector_job_serializes_for_json_or_postgres():
    now = datetime.now(timezone.utc)
    job = ConnectorJobRecord(
        operation="submit", department="Revenue", service_code="income-certificate",
        next_attempt_at=now, created_at=now, updated_at=now,
    )
    payload = job.model_dump(mode="json")
    assert payload["department"] == "Revenue"
    assert payload["status"] == "queued"
    assert payload["next_attempt_at"]


def test_officer_profile_is_department_scoped():
    now = datetime.now(timezone.utc)
    officer = OfficerProfileRecord(
        officer_id="off-1", display_name="Test Officer", department="Revenue",
        district="Pune", created_at=now, updated_at=now,
    )
    assert officer.department == "Revenue"


def test_retry_backoff_is_bounded():
    first = next_retry(1)
    fifth = next_retry(5)
    sixth = next_retry(6)
    assert (fifth - first).total_seconds() >= 200
    assert sixth > fifth
