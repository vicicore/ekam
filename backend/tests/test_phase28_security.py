import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    # Adjust import to the project's existing FastAPI app factory if needed.
    from app.main import app
    return TestClient(app)


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_unknown_route_returns_not_found(client):
    response = client.get("/api/v1/__phase28_unknown__")
    assert response.status_code == 404
