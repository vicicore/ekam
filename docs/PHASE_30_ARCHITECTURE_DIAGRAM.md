# SETU Final Architecture

```text
                         ┌─────────────────────────┐
                         │       CITIZEN WEB       │
                         │ Services / Schemes      │
                         │ My SETU / Vault         │
                         │ Journeys / Grievance    │
                         │ Assistant / Maharashtra │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       AUTH + RBAC       │
                         │ Citizen / Officer/Admin │
                         │ Consent / Sessions      │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             ┌────────────┐    ┌────────────┐    ┌────────────┐
             │  SERVICES  │    │  JOURNEYS  │    │ GRIEVANCE  │
             └─────┬──────┘    └─────┬──────┘    └─────┬──────┘
                   │                 │                 │
                   └─────────────────┼─────────────────┘
                                     ▼
                         ┌─────────────────────────┐
                         │   WORKFLOW / SERVICE    │
                         │   ORCHESTRATION LAYER   │
                         └────────────┬────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
          ┌────────────┐      ┌────────────┐      ┌────────────┐
          │   OFFICER  │      │ CONNECTORS │      │NOTIFICATION│
          │ OPERATIONS │      │ / WEBHOOKS │      │   LAYER    │
          └────────────┘      └─────┬──────┘      └────────────┘
                                    │
                                    ▼
                         ┌─────────────────────────┐
                         │ APPROVED EXTERNAL APIs  │
                         │ Department Integrations │
                         └─────────────────────────┘

        ┌────────────────────────────────────────────────────┐
        │ PostgreSQL/Supabase • Audit • Metrics • Jobs       │
        │ Retry • Dead Letter • Idempotency • Object Storage │
        └────────────────────────────────────────────────────┘
```
