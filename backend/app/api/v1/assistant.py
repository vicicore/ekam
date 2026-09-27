from fastapi import APIRouter
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.assistant_service import answer

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/ask", response_model=AssistantResponse)
def ask(payload: AssistantRequest):
    return answer(payload.message, payload.language)
