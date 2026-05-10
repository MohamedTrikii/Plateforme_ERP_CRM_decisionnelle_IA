# TODO - ERP AI Agent (ai-service)

## Étape 1 — Analyse & base FastAPI
- [x] Vérifier `ai-service/main.py` et router existing (prediction)
- [ ] Mettre à jour `app/main.py` pour inclure `/chat` et health check

## Étape 2 — Models Pydantic
- [ ] Créer `models/chat_request.py`
- [ ] Créer `models/chat_response.py`
- [ ] Mettre à jour `models/__init__.py` si nécessaire

## Étape 3 — OpenAI service
- [ ] Créer `services/openai_service.py`
- [ ] Ajouter gestion erreurs API + timeout

## Étape 4 — ERP Agent principal
- [ ] Créer `agents/erp_agent.py`
- [ ] Logique intention + appels tools + prompt system

## Étape 5 — Tools ERP (REST)
- [ ] Créer `tools/stock_tool.py`
- [ ] Créer `tools/orders_tool.py`
- [ ] Créer `tools/analytics_tool.py`
- [ ] Gestion JWT Bearer + tenantId + timeouts

## Étape 6 — Mémoire conversation
- [ ] Créer `memory/chat_memory.py`
- [ ] Implémenter historique simple en mémoire (par session/user)

## Étape 7 — Prompt
- [ ] Créer `prompts/system_prompt.txt`

## Étape 8 — Routes
- [ ] Créer `routes/chat_routes.py`
- [ ] Enregistrer route dans `main.py`

## Étape 9 — Erreurs & mapping
- [ ] Ajouter gestion erreurs 401/403/500 + timeout

## Étape 10 — requirements & exécution
- [ ] Mettre à jour `requirements.txt`
- [ ] Ajouter exemple workflow côté code (docs ou endpoint)
- [ ] Lancer `uvicorn` pour valider

