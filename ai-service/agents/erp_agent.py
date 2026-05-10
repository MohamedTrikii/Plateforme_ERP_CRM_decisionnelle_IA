from __future__ import annotations

from typing import Any, Dict, List
import uuid


class ErpAgent:
    """Stub agent.

    This implementation is deterministic and safe for early integration.
    Later we can replace its internals with a real LLM + tool routing.
    """

    def __init__(self) -> None:
        self._name = "erp-agent-stub"

    def chat(self, *, tenant_id: str, message: str) -> Dict[str, Any]:
        # Minimal placeholder response to validate the end-to-end flow.
        response_text = (
            f"[Agent stub] Tenant={tenant_id}. I received: {message!r}. "
            "(LLM/tooling not enabled yet.)"
        )
        return {
            "response": response_text,
            "metadata": {
                "agent": self._name,
                "tenantId": tenant_id,
            },
            "tools_used": [],
            "conversationId": str(uuid.uuid4()),
        }

