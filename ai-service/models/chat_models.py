from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AIMessage(BaseModel):
    """A single chat message."""

    id: str
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    """Incoming chat request."""

    message: str
    tenantId: str


class ChatResponse(BaseModel):
    """Outgoing chat response."""

    response: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tools_used: List[str] = Field(default_factory=list)

    # Optional future-proof fields
    conversationId: Optional[str] = None
    aiMessages: Optional[List[AIMessage]] = None

