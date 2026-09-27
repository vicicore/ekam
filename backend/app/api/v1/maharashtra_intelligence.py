from fastapi import APIRouter, HTTPException, Query
from app.services.maharashtra_intelligence import MaharashtraIntelligenceService

router = APIRouter(prefix="/maharashtra-intelligence", tags=["maharashtra-intelligence"])
service = MaharashtraIntelligenceService()


@router.get("")
def overview():
    return service.all()


@router.get("/districts/{district_id}")
def district(district_id: str):
    result = service.district(district_id)
    if result is None:
        raise HTTPException(status_code=404, detail="District not found")
    return result


@router.get("/services")
def search_services(
    q: str = Query("", max_length=100),
    district_id: str | None = None,
    department_id: str | None = None,
    category: str | None = None,
):
    return {"items": service.search(q, district_id, department_id, category)}
