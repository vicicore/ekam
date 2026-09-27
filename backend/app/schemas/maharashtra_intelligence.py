from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional


class DepartmentSummary(BaseModel):
    id: str
    name: str
    division: str
    service_count: int


class DistrictSummary(BaseModel):
    id: str
    name: str
    division: str
    department_count: int


class ServiceSummary(BaseModel):
    id: str
    name: str
    department_id: str
    department_name: str
    category: str
    district_id: Optional[str] = None
    application_route: str


class DistrictIntelligence(BaseModel):
    district: DistrictSummary
    departments: List[DepartmentSummary]
    services: List[ServiceSummary]


class MaharashtraIntelligence(BaseModel):
    districts: List[DistrictSummary]
    departments: List[DepartmentSummary]
    services: List[ServiceSummary]
