# SETU Phase 18 — Production Persistence + Worker Foundation

## What this phase adds

1. **Supabase/PostgreSQL persistence adapter** for the existing core repository contracts:
   - applications
   - audit logs
   - citizen profiles
   - documents
   - connector requests
   - accounts/sessions
2. Supabase adapters for Phase 17 operational records:
   - officers
   - connector jobs
   - dead letters
   - metric events
3. **Department officer account provisioning** through the admin operations API.
4. Separate **connector + notification worker processes** so background work is no longer tied to the FastAPI request process.
5. Retry/dead-letter and telemetry contracts from Phase 17 wired to the persistence layer.
6. Supabase SQL migration.
7. Contract/integration tests for the Phase 18 boundary.

## Files

Copy the files from this package into the matching paths in your Phase 17 SETU repository.
These are additive/replace files; do not replace the whole repository.

## Supabase setup

1. Open Supabase SQL Editor.
2. Run `infra/supabase/phase18.sql`.
3. Configure backend environment variables:
   - `PERSISTENCE_BACKEND=supabase`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...` (backend only)
   - `SUPABASE_ANON_KEY=...`
4. Install backend dependencies from `backend/requirements.txt`.
5. Start FastAPI and verify existing routes.

The service-role key must never be exposed to the frontend.

## Officer authentication

Phase 18 keeps the existing opaque-session authentication model so the SIH demo remains safe and deterministic.
An admin can create an officer profile and then call:

`POST /api/v1/ops/officers/{officer_id}/link-account`

with an identifier. The resulting account has role `department_officer` and uses the existing login endpoint to create a session.

This is a production seam, not a claim of Aadhaar/real-government identity integration.

## Workers

From `backend/`:

`python -m scripts.run_workers`

Run this as a separate process/container in production. The current build deliberately does **not** call real department APIs or external notification providers. Replace the provider-neutral worker hooks with approved adapters when those integrations are available.

## Important

- Existing local JSON mode remains available for the SIH demo.
- No real Maharashtra government API is claimed by this phase.
- RLS policies should be finalized before browser clients access Supabase tables directly. The backend service-role client is intended for trusted server-side operations.
