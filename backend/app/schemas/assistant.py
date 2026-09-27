from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class AssistantSource(BaseModel):
    title: str
    source_type: str
    route: Optional[str] = None


class AssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: str = Field(default="en", pattern="^(en|hi|mr)$")


class AssistantResponse(BaseModel):
    answer: str
    sources: List[AssistantSource] = []
    suggested_actions: List[dict] = []
    grounded: bool = True
