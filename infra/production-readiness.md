# SETU Production Readiness

## Infrastructure

- [ ] Production domain configured
- [ ] HTTPS/TLS configured
- [ ] Reverse proxy configured
- [ ] Frontend and backend separated appropriately
- [ ] Database is managed PostgreSQL/Supabase
- [ ] Redis/queue configured if workers are enabled
- [ ] Persistent object storage configured for documents
- [ ] Backups enabled

## Secrets

- [ ] No production secrets in Git
- [ ] Secrets stored in deployment secret manager
- [ ] Service-role database keys restricted to backend
- [ ] Webhook signing secret rotated before go-live
- [ ] Admin identifiers reviewed

## Application

- [ ] APP_ENV=production
- [ ] CORS allowlist verified
- [ ] FORCE_HTTPS enabled
- [ ] Rate limiting configured
- [ ] Upload security configured
- [ ] Error responses do not expose secrets
- [ ] Request IDs/log correlation enabled

## Observability

- [ ] Structured application logs
- [ ] Health check monitored
- [ ] Error monitoring
- [ ] Database metrics
- [ ] Worker queue metrics
- [ ] Connector failure metrics
- [ ] Notification delivery metrics
- [ ] Alert ownership defined

## Release

- [ ] Phase 28 automated tests pass
- [ ] Staging smoke test passes
- [ ] Database migration reviewed
- [ ] Backup/restore test passes
- [ ] Rollback plan tested
- [ ] Production approval recorded
