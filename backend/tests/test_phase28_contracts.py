from app.services.retry_policy import RetryPolicy
from app.services.rbac import require_department_access


def test_retry_policy_is_bounded():
    policy = RetryPolicy(max_attempts=5, base_delay_seconds=30)
    assert policy.delay_for_attempt(1) == 30
    assert policy.delay_for_attempt(2) == 60
    assert policy.delay_for_attempt(5) == 480
    assert policy.delay_for_attempt(6) is None


def test_department_access_same_department():
    assert require_department_access("Revenue", "Revenue") is True


def test_department_access_rejects_cross_department():
    assert require_department_access("Revenue", "Labour") is False
