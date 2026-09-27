# SETU Phase 29 — Production Deployment + CI/CD

## Goal

Phase 29 packages SETU for a controlled production deployment workflow:

- Docker images
- production environment separation
- GitHub Actions CI
- deployment gate example
- health checks
- reverse-proxy example
- backup/restore runbook
- production readiness checklist

This phase does NOT claim that SETU has been deployed to a real government
production environment.

## 1. Backend Docker image

The root file `Dockerfile.backend` builds the FastAPI backend.

From repository root:

```bash
docker build -f Dockerfile.backend -t setu-backend .
```

## 2. Frontend Docker image

The frontend image expects Next.js standalone output.

Merge `frontend/next.config.phase29.mjs` into the existing
`frontend/next.config.mjs` and preserve any existing project configuration.

Then:

```bash
docker build -t setu-frontend ./frontend
```

## 3. Local production-like stack

Copy `.env.production.example` to `.env.production`, fill values through
your secure environment mechanism, then:

```bash
docker compose -f docker-compose.phase29.yml up --build
```

Do not commit `.env.production`.

## 4. CI

`/.github/workflows/ci.yml` runs:

Backend:
- dependency installation
- pytest

Frontend:
- npm ci
- TypeScript check
- lint
- production build

## 5. Deployment

`deploy.yml.example` is intentionally a provider-neutral gate. Connect it only
to the approved deployment provider and use repository/environment secrets.

Do not place cloud credentials in the workflow file.

## 6. Reverse proxy

`infra/nginx.setu.conf.example` shows the intended boundary:

Citizen browser
  -> HTTPS reverse proxy
      -> Next.js
      -> FastAPI

Use the approved infrastructure's TLS configuration.

## 7. Health checks

`infra/healthcheck.sh` verifies the existing backend health endpoint.

A production platform should also monitor:
- frontend availability
- database connectivity
- worker health
- connector health
- queue depth

## 8. Database

Use the Phase 18 PostgreSQL/Supabase persistence path for production.

Before applying migrations:
1. backup
2. review migration
3. test on staging
4. apply during the approved release window
5. run smoke tests

## 9. Documents

Production citizen documents should use private, encrypted object storage with
controlled access. Do not use the application container filesystem as durable
document storage.

## 10. Rollback

Use the runbook:
`infra/backup-restore-runbook.md`

Prefer immutable application artifacts and forward-compatible database
migrations.

## 11. Final gate

Complete:
`infra/production-readiness.md`

and all Phase 28 release checks before production approval.

## Important

The repository's actual hosting provider, domain, TLS certificate authority,
cloud account, database project and notification providers are deployment
decisions. This package provides provider-neutral configuration and does not
pretend those resources already exist.
