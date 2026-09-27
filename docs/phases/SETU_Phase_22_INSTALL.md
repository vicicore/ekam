# SETU Phase 22 — Complete Notification System

Phase 22 adds a persistent, provider-neutral notification layer for citizen and officer workflows. It is additive and keeps Phase 16 signed webhooks, Phase 17 operations, Phase 18 persistence and Phase 21 security boundaries intact.

## Included

- Persistent local notification repository (`data/notifications.json`)
- Notification schema with type, priority, entity, link, read state and delivery state
- Citizen notification API
- Admin notification creation API for event producers
- Recipient ownership protection when marking notifications read
- Event helper functions for application updates, document requests and SLA alerts
- Provider-neutral notification dispatcher foundation
- Citizen `/notifications` page
- Responsive notification UI with all/unread filtering
- Environment template for future email/SMS/WhatsApp providers

## 1. Backend files

Copy:

- `backend/app/schemas/notifications.py`
- `backend/app/repositories/notification_repository.py`
- `backend/app/services/notification_service.py`
- `backend/app/services/notification_events.py`
- `backend/app/services/notification_dispatcher.py`
- `backend/app/api/v1/notifications.py`

Register the router in `backend/app/api/v1/router.py`:

```python
from app.api.v1.notifications import router as notifications_router
router.include_router(notifications_router)
```

For production, move the repository into the existing repository/container abstraction and use the Phase 18 PostgreSQL/Supabase adapter rather than JSON storage.

## 2. Event integration

When an application changes status, a document is requested, a grievance changes state, an officer is assigned, or an SLA threshold is reached, call the appropriate helper in `notification_events.py`.

Example:

```python
from app.services.notification_events import application_updated
application_updated(notification_repo, citizen_id, application_id,
                    "Application updated", "Your application has moved to department review.")
```

Do not place passwords, tokens, government identifiers or document contents in notification text.

## 3. Frontend

Copy:

- `frontend/src/lib/notificationApi.ts`
- `frontend/src/app/notifications/page.tsx`
- `frontend/src/app/globals-phase22.css`

Import `globals-phase22.css` from the application's global stylesheet/layout according to the existing Next.js setup.

Add a Notifications link/bell to the existing `NavBar.tsx`. A badge can use `notificationApi.list(true)` to display the unread count.

## 4. Delivery channels

Phase 22 deliberately keeps outbound delivery provider-neutral. `notification_dispatcher.py` defines the boundary for future email/SMS/WhatsApp adapters.

Do not commit provider API keys. Configure them through deployment secrets. Before production delivery, add:

- provider retry/backoff
- delivery receipts/webhooks
- per-channel opt-in/consent
- template/version management
- rate limits
- dead-letter handling
- audit events

## 5. Officer notifications

The schema supports `officer` and `admin` recipients. The current `/me` route uses the authenticated session identity. If the Phase 18/19 officer session uses a distinct officer-profile ID, map that identity explicitly before exposing officer notifications; do not use a citizen ID as a substitute.

## 6. Production notes

The local JSON repository is for development/SIH demo continuity. Production should use the Phase 18 PostgreSQL/Supabase persistence adapter. For multi-instance deployments, notification creation and delivery should be idempotent and dispatched through the Phase 17 worker/queue foundation.

Phase 22 does not claim live SMS, email, WhatsApp or Maharashtra department messaging integration. Those require approved provider credentials/API contracts and should be connected through the dispatcher boundary.
