from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.chat_models import ChatRequest, ChatResponse
from agents.erp_agent import ErpAgent


router = APIRouter()
_agent = ErpAgent()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        result = _agent.chat(tenant_id=request.tenantId, message=request.message)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(
        response=result.get("response", ""),
        metadata=result.get("metadata") or {},
        tools_used=result.get("tools_used") or [],
        conversationId=result.get("conversationId"),
    )

