# TODO - Intégration Chatbot IA (Angular 17)

## Étape 1 — Préparation planifiée (routes + architecture)
- [ ] Ajouter feature module `features/ai-agent/` (standalone components si possible)
- [ ] Ajouter route lazy-load protégée : `/app/ai` (via routing Shell)

## Étape 2 — Data models
- [ ] Créer `AIMessage` (`id`, `role`, `content`, `timestamp`)
- [ ] Créer `AIResponse` (`response`, `metadata`, `tools_used`)

## Étape 3 — Service Angular
- [ ] Créer `AIAgentService` avec : `sendMessage()`, `getConversation()`, `clearConversation()`
- [ ] Appeler `POST http://localhost:8000/chat` avec body `{ message, tenantId }`
- [ ] JWT Bearer automatique via `jwtInterceptor`
- [ ] Gestion erreurs: network, timeout, token expiré, IA indisponible

## Étape 4 — UI ChatGPT
- [ ] Components : `chat-window`, `message-list`, `message-bubble`, `prompt-box`
- [ ] UI : typing indicator / spinner, auto-scroll, animation, dark mode
- [ ] UX : Enter envoyer, Shift+Enter nouvelle ligne, clear chat
- [ ] Historique conversation (mémoire + futur-ready sidebar)

## Étape 5 — Intégration route + navigation
- [ ] Ajouter item “AI” dans `sidebar.component.ts` (optionnel)
- [ ] Vérifier accès protégé par `authGuard`

## Étape 6 — Backend contract check (bloquant)
- [ ] S’assurer que FastAPI expose bien `POST /chat`
- [ ] Ajuster contrat si nécessaire

