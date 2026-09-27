from __future__ import annotations
from collections import defaultdict
from .maharashtra_data import DISTRICTS, DEPARTMENTS, SERVICES


class MaharashtraIntelligenceService:
    def all(self):
        return {
            "districts": DISTRICTS,
            "departments": DEPARTMENTS,
            "services": SERVICES,
        }

    def district(self, district_id: str):
        district = next((x for x in DISTRICTS if x["id"] == district_id), None)
        if not district:
            return None

        departments = []
        seen = set()
        services = []
        for service in SERVICES:
            if service.get("district_id") not in (None, district_id):
                continue
            dept_id = service["department_id"]
            if dept_id not in seen:
                dept = next((x for x in DEPARTMENTS if x["id"] == dept_id), None)
                if dept:
                    departments.append(dept)
                    seen.add(dept_id)
            services.append(service)

        return {"district": district, "departments": departments, "services": services}

    def search(self, q: str = "", district_id: str | None = None,
               department_id: str | None = None, category: str | None = None):
        q = q.strip().lower()
        result = []
        for service in SERVICES:
            if district_id and service.get("district_id") not in (None, district_id):
                continue
            if department_id and service["department_id"] != department_id:
                continue
            if category and service["category"].lower() != category.lower():
                continue
            haystack = " ".join([
                service["name"], service["department_name"],
                service["category"], service["id"]
            ]).lower()
            if q and q not in haystack:
                continue
            result.append(service)
        return result
