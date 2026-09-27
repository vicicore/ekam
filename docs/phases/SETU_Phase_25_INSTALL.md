# SETU Phase 25 — Grounded SETU Assistant

## Purpose

Phase 25 upgrades the Assistant route from a deterministic UI demo into a
backend-backed, grounded retrieval layer.

The implementation uses a small, explicit SETU knowledge base and lexical
retrieval. It does NOT claim to be a production LLM or RAG deployment.

## Backend

Copy:

- `backend/app/schemas/assistant.py`
- `backend/app/services/assistant_knowledge.py`
- `backend/app/services/assistant_service.py`
- `backend/app/api/v1/assistant.py`

Register the assistant router in `backend/app/api/v1/router.py`.

Endpoint:

POST `/api/v1/assistant/ask`

Example body:

{
  "message": "How do I track my application?",
  "language": "en"
}

## Frontend

Copy:

- `frontend/src/lib/assistantApi.ts`
- replace/merge `frontend/src/app/assistant/page.tsx`
- load the CSS from `frontend/src/app/assistant/assistant.css` according to
  your existing global CSS setup.

If the project uses one global stylesheet, append the CSS there.

## Grounding

The Assistant retrieves from `KNOWLEDGE_BASE` and returns source links.
When no knowledge item matches, it explicitly says it could not find a
grounded SETU answer rather than inventing one.

## Production RAG upgrade

For production, replace the lexical `retrieve()` implementation with:

1. verified official SETU/government content ingestion
2. document chunking
3. embeddings/vector storage
4. metadata filters (language, department, effective date, service)
5. retrieval
6. LLM generation constrained to retrieved context
7. citations/source links
8. stale-content/version controls
9. evaluation and hallucination tests

The knowledge base should carry source URL, authority, effective date and
last verified date.

## Multilingual

English, Hindi and Marathi response shells are included. The underlying
knowledge content is currently compact and mostly English; this phase does
not claim full translation coverage.

## Safety / privacy

Do not send Aadhaar numbers, passwords, OTPs or other secrets into an
assistant prompt. The production assistant should enforce PII redaction and
authorization before exposing citizen-specific application information.

## Compatibility

Phase 25 is additive and preserves the existing:
- `/assistant`
- services
- schemes
- journeys
- vault
- grievance
- Maharashtra intelligence
- officer workspace
- notification
- security
- analytics
architecture.
