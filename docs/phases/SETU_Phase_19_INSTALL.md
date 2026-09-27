# SETU Phase 19 — Officer Operations Workspace

## Purpose
Phase 19 adds the officer-facing operational layer on top of the Phase 18 persistence/worker foundation.

### Added
- Department Officer Dashboard: `/officer`
- Department Queue: `/officer/queue`
- Officer Notifications: `/officer/notifications`
- Department-scoped queue visibility
- Application assignment and reassignment records
- Officer decision actions: approve / reject / request information
- Officer-specific notifications
- Officer/admin RBAC boundary
- Supabase SQL tables for assignments and notifications

## Backend installation
Copy:
- `backend/app/repositories/phase19_models.py`
- `backend/app/repositories/phase19_repositories.py`
- `backend/app/services/officer_rbac.py`
- `backend/app/api/v1/phase19.py`

Then update `backend/app/api/v1/router.py` using `router_phase19_snippet.txt`.

Phase 19's assignment/notification repository currently uses local JSON files so the SIH demo remains runnable. The SQL migration is provided for the production Supabase adapter boundary.

## Frontend installation
Copy:
- `frontend/src/lib/officerApi.ts`
- `frontend/src/app/officer/page.tsx`
- `frontend/src/app/officer/queue/page.tsx`
- `frontend/src/app/officer/notifications/page.tsx`
- `frontend/src/app/officer/officer.css`

## Officer login
Phase 18 creates officer accounts with role `department_officer`. Use the existing login endpoint with the officer identifier. The session must be stored as `setu-auth-token` by the existing frontend auth flow.

## Supabase
Run `infra/supabase/phase19.sql` after the Phase 18 migration.

The current API still uses the local repository implementation for assignments and notifications. For production, implement Supabase repositories behind the same methods before switching these records to durable shared persistence.

## Important boundaries
- Department filtering is based on the officer profile's department and the application's consent recipient department.
- Cross-department assignment is denied for department officers; admins can assign across departments.
- Decision actions require the application to be actively assigned to the logged-in officer.
- No real Maharashtra department API is claimed.
- No Aadhaar or government identity integration is claimed.
- The officer decision endpoint updates the SETU application workflow; an external department adapter should be connected before treating an action as an official government decision.

## Verification
1. Start FastAPI.
2. Log in using a Phase 18 officer account.
3. Open `/officer`.
4. Verify queue counts and officer department.
5. Open `/officer/queue` and review an assigned application.
6. Use a decision action and verify the application's persisted workflow state.
7. Open `/officer/notifications` and mark notifications read.
