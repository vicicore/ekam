# SETU Phase 20 — Real Department Integration & End-to-End Workflow

## Purpose
Phase 20 connects the officer workflow to a formal department-integration boundary and closes the loop back to the citizen. It supports a safe sandbox adapter by default and an HTTPS adapter when a verified department API contract is configured.

## Add these files
- `backend/app/repositories/phase20_models.py`
- `backend/app/repositories/phase20_repositories.py`
- `backend/app/services/department_adapters.py`
- `backend/app/services/integration_service.py`
- `backend/app/api/v1/phase20.py`
- `frontend/src/lib/integrationApi.ts`
- `frontend/src/app/notifications/page.tsx`
- `frontend/src/app/integrations/page.tsx`
- `infra/supabase/phase20.sql`

## Backend router
Open `backend/app/api/v1/router.py` and add the two lines in `backend/app/api/v1/router_phase20_snippet.txt`.

## Dependency
The generic HTTP adapter uses `httpx`. If not already present in `backend/requirements.txt`, add:
`httpx>=0.27,<1`

## How the flow works
1. Citizen submits an application.
2. Officer reviews/assigns it in Phase 19.
3. Authorized officer/admin calls `POST /api/v1/integration/dispatch`.
4. SETU selects a department adapter.
5. Without external configuration, the sandbox adapter acknowledges the hand-off.
6. With a verified API configuration, the HTTPS adapter submits to the department API.
7. The dispatch reference/status is persisted.
8. Citizen receives a notification.
9. A verified department event can be accepted at `POST /api/v1/integration/events` (admin-protected in this phase) and updates the SETU application step + citizen notification.
10. `GET /api/v1/integration/dispatch/{id}` refreshes the external status.

## Real department configuration
Do not invent department URLs or credentials. After the department publishes/approves an API contract, configure environment variables such as:
`SETU_CONNECTOR_REVENUE_URL=https://approved.example.gov`
`SETU_CONNECTOR_REVENUE_API_KEY=<secret>`

The adapter converts the SETU request into the generic contract. Department-specific payload mapping should be implemented only after the official API specification is available.

## Supabase
Run `infra/supabase/phase20.sql` after the Phase 18/19 migrations.

## Frontend
- `/notifications` — citizen notifications.
- `/integrations` — authorized integration-status lookup.

## Security notes
- Never commit API keys.
- Use HTTPS for external department endpoints.
- Keep webhook/event ingestion behind the signed webhook boundary from Phase 16 in production; the Phase 20 `/integration/events` endpoint is intentionally admin-protected as a controlled bridge.
- Add event-id idempotency before exposing external callbacks directly.
- Replace JSON repositories with the Phase 18 Supabase adapters for production.

## What this phase does NOT claim
It does not claim a live connection to any Maharashtra government department. The generic adapter is the integration boundary; real department connectivity requires an approved API specification, credentials, network allowlisting where applicable, and department-side testing.
