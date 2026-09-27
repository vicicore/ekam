from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DepartmentSubmission:
    external_reference: str
    department: str
    status: str
    submitted_at: datetime
    sla_deadline: datetime

class DepartmentConnector(ABC):
    """Phase 14 boundary for real department integrations.

    Production adapters can implement HTTP/API gateway calls here. Existing
    GovernmentConnector remains the deterministic prototype adapter.
    """

    department: str

    @abstractmethod
    def submit(self, service_code: str, payload: dict) -> DepartmentSubmission: ...

    @abstractmethod
    def get_status(self, external_reference: str) -> dict: ...

    @abstractmethod
    def approve(self, external_reference: str) -> dict: ...

    @abstractmethod
    def reject(self, external_reference: str, reason: str) -> dict: ...
