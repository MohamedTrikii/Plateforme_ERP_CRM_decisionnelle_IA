# TODO - Intégration Chatbot IA (Angular 17) — Implémentation

## Étape 0 — Vériﬁcation backend/frontend
- [x] Confirmer absence de `POST /chat` dans `ai-service`
- [x] Repérer l’architecture Angular (Shell + authGuard + sidebar)

## Étape 1 — Backend FastAPI (ai-service)
- [ ] Ajouter modèles Pydantic pour le chat: `ChatRequest`, `AIMessage`, `ChatResponse`
- [ ] Ajouter agent stub: `agents/erp_agent.py`
- [ ] Ajouter `routes/chat_routes.py` exposant `POST /chat`
- [ ] Enregistrer le router dans `ai-service/main.py` (prefix `/api/v1/ai`)

## Étape 2 — Frontend Angular
- [ ] Ajouter feature module `features/ai-agent/`
- [ ] Ajouter route protégée dans `app-routing.module.ts`: `path: 'ai'`
- [ ] Ajouter item “AI” dans `layout/sidebar/sidebar.component.ts`
- [ ] Créer `AIAgentService` appelant `POST {backend}/api/v1/ai/chat`
- [ ] Construire UI: chat-window, message-list (si besoin), message-bubble, prompt-box
- [ ] Ajouter UX: Enter vs Shift+Enter, auto-scroll, typing spinner, clear chat

## Étape 3 — Contrat & tests
- [ ] Tester manuellement: `POST /api/v1/ai/chat` avec tenantId
- [ ] Tester l’UI: navigation /ai + rendu réponse + erreurs

