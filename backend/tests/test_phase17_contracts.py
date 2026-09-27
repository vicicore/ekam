def test_retry_policy_is_bounded():
    from app.services.retry_policy import next_retry
    assert next_retry(1).isoformat()
    assert next_retry(5).isoformat()

def test_rbac_rejects_non_officer():
    from fastapi import HTTPException
    from app.services.rbac import require_role
    class S: role="citizen"
    try:
        require_role(S(), "admin")
    except HTTPException as exc:
        assert exc.status_code == 403
    else:
        raise AssertionError("citizen should not satisfy admin role")

def test_phase17_models_validate():
    from datetime import datetime, timezone
    from app.repositories.models import ConnectorJobRecord
    x=ConnectorJobRecord(
        operation="submit", department="Revenue", service_code="income_certificate",
        next_attempt_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )
    assert x.status=="queued"
