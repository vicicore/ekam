# SETU Phase 24 — Maharashtra District → Department → Service Intelligence

## Purpose
Phase 24 adds a structured intelligence/navigation layer connecting:
District → Department → Service → Application route.

It complements the existing `/maharashtra` experience and does not claim
live government integration.

## Files

Backend:
- `backend/app/schemas/maharashtra_intelligence.py`
- `backend/app/services/maharashtra_data.py`
- `backend/app/services/maharashtra_intelligence.py`
- `backend/app/api/v1/maharashtra_intelligence.py`

Frontend:
- `frontend/src/lib/maharashtraIntelligenceApi.ts`
- `frontend/src/app/maharashtra/intelligence/page.tsx`
- `frontend/src/app/maharashtra/intelligence/page.module.css`

## Integration

1. Copy the backend files into the corresponding directories.
2. Register the new router in `backend/app/api/v1/router.py`.
3. Copy the frontend API helper.
4. Copy the new `/maharashtra/intelligence` route.
5. Confirm your Next.js path alias supports `@/`.
6. Start backend and frontend and open:
   `/maharashtra/intelligence`

## API

GET `/api/v1/maharashtra-intelligence`
GET `/api/v1/maharashtra-intelligence/districts/{district_id}`
GET `/api/v1/maharashtra-intelligence/services?q=&district_id=&department_id=&category=`

## Data caution

The dataset in this phase is curated navigation/demo metadata. It is NOT a
verified catalogue of every Maharashtra government service and must not be
presented as authoritative eligibility, department ownership, SLA or live
availability.

Before production, replace/augment it with verified government metadata and
version it with effective dates/source references.

## Design direction

The UI intentionally stays restrained and government-service oriented:
white surfaces, navy text, subtle borders, restrained saffron accent,
responsive cards and no decorative claims.

## Compatibility

Phase 24 is additive. It does not replace the Phase 6 Maharashtra page,
Phase 7 schemes, Phase 19 officer workspace, Phase 20 connector boundary,
Phase 21 security layer or Phase 23 analytics command center.
