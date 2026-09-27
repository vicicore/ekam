# SETU Phase 23 — Analytics & Admin Command Center

## Purpose
Adds a production-oriented admin analytics API and a responsive command-center UI. Metrics are derived from persisted SETU application/audit state rather than decorative placeholder counters.

## Backend files
Copy:
- `backend/app/schemas/analytics.py`
- `backend/app/services/admin_analytics.py`
- `backend/app/api/v1/analytics.py`

### Router registration
In `backend/app/api/v1/router.py` add `analytics` to the import:

```python
from app.api.v1 import admin, analytics, auth, citizens, demo, eligibility, health, journeys, life_events, vault, webhooks
```

Then add:

```python
api_router.include_router(analytics.router)
```

The endpoint is `GET /api/v1/admin/analytics` and is admin-only.

## Frontend files
Copy:
- `frontend/src/lib/adminAnalyticsApi.ts`
- `frontend/src/app/admin/command-center/page.tsx`
- `frontend/src/app/admin/command-center/globals-phase23.css`

Import the Phase 23 stylesheet from the command-center page or your global stylesheet. If your project uses a single global CSS file, append its contents there. A simple page-local import is also possible if your Next.js setup permits global CSS only at the root; in that case move/append the CSS to `frontend/src/app/globals.css`.

Open:
`/admin/command-center`

## Important compatibility note
The base `DocumentRepository` in the current architecture exposes `list_for_citizen()` but not `list_all()`. The analytics endpoint therefore treats the document total as optional until the repository contract is expanded. Do not silently fabricate document counts.

## Data semantics
- Applications, steps, department workload, SLA risk/breach and audit activity are calculated from persisted records.
- Department names are resolved through the same DependencyGraph used by the existing admin metrics service.
- No live external-government connectivity is claimed.
- For a multi-instance production deployment, analytics should eventually use SQL aggregation/materialized views rather than scanning JSON records.
