# SETU Judge Q&A

## What problem does SETU address?

SETU addresses fragmented citizen-service journeys by providing a common
interface for discovering services, managing reusable information, tracking
applications, handling grievances and navigating department workflows.

## What is the core innovation?

The architecture combines a citizen-facing service layer with reusable
profile/document context, journey orchestration, officer operations and a
standard connector boundary for external departments.

## How is it different from a simple portal?

The design is not limited to links/forms. It includes application state,
consent, workflow stages, officer assignment, integration status,
notifications, audit events and retry/idempotency foundations.

## Is it connected to every government department?

No. The architecture is integration-ready. A live department connection
requires an approved API contract, credentials, security requirements and
verified service metadata.

## How is security handled?

The project includes authentication, role boundaries, consent handling,
signed webhook verification, idempotency, rate limiting, input/upload
validation, secret separation, audit records and production hardening
guidance.

## How does multilingual access work?

The frontend has English, Hindi and Marathi localization infrastructure.
Official dynamic content should be maintained as verified multilingual
content rather than blindly machine-translated.

## What happens when an external department API fails?

The connector boundary records integration work, supports bounded retries and
dead-letter handling. Notification and audit layers preserve the operational
trace.

## Can it scale?

The architecture separates frontend, API, persistence, connector and worker
responsibilities. Production deployment can use managed PostgreSQL/Supabase,
a distributed queue and independently scaled application services.

## What is still required before real government deployment?

Official API access, production identity/authorization decisions, verified
service/scheme metadata, approved hosting/security controls, notification
providers, operational ownership and staging/production integration testing.
