"""Phase 20 department integration boundary.

The adapter contract deliberately contains no Maharashtra-specific API assumptions.
Each department can provide an adapter implementing the same contract once its
verified API specification, credentials, and environment are available.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol, Any
import os
import httpx

@dataclass
class ConnectorSubmission:
    external_reference: str
    status: str
    message: str | None = None

@dataclass
class ConnectorStatus:
    external_reference: str
    status: str
    message: str | None = None

class DepartmentAdapter(Protocol):
    name: str
    department: str
    def submit(self, *, application_id: str, service_code: str, payload: dict[str, Any]) -> ConnectorSubmission: ...
    def get_status(self, *, external_reference: str) -> ConnectorStatus: ...

class SandboxDepartmentAdapter:
    """Safe local adapter for demos and integration tests."""
    name = "sandbox"
    def __init__(self, department: str): self.department = department
    def submit(self, *, application_id, service_code, payload):
        return ConnectorSubmission(external_reference=f"SETU-{application_id[:8]}-{service_code[:12]}", status="acknowledged", message="Sandbox department acknowledgement")
    def get_status(self, *, external_reference):
        return ConnectorStatus(external_reference=external_reference, status="acknowledged", message="Sandbox status")

class HttpDepartmentAdapter:
    """Generic HTTPS adapter. Configure only with an approved department API contract."""
    name = "http"
    def __init__(self, department: str, base_url: str, api_key: str):
        self.department, self.base_url, self.api_key = department, base_url.rstrip("/"), api_key
    def submit(self, *, application_id, service_code, payload):
        with httpx.Client(timeout=20.0) as client:
            r=client.post(f"{self.base_url}/applications", json={"application_id":application_id,"service_code":service_code,"payload":payload}, headers={"Authorization":f"Bearer {self.api_key}","X-SETU-Source":"SETU"})
            r.raise_for_status(); data=r.json()
        return ConnectorSubmission(external_reference=data["external_reference"], status=data.get("status","submitted"), message=data.get("message"))
    def get_status(self, *, external_reference):
        with httpx.Client(timeout=20.0) as client:
            r=client.get(f"{self.base_url}/applications/{external_reference}", headers={"Authorization":f"Bearer {self.api_key}","X-SETU-Source":"SETU"})
            r.raise_for_status(); data=r.json()
        return ConnectorStatus(external_reference=external_reference, status=data["status"], message=data.get("message"))

def get_adapter(department: str) -> DepartmentAdapter:
    prefix="SETU_CONNECTOR_" + department.upper().replace(" ","_").replace("&","AND")
    url=os.getenv(prefix + "_URL")
    key=os.getenv(prefix + "_API_KEY")
    if url and key: return HttpDepartmentAdapter(department, url, key)
    return SandboxDepartmentAdapter(department)
