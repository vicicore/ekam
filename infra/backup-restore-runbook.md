# SETU Backup & Restore Runbook

## Before production

- Configure automated database backups with the selected PostgreSQL/Supabase provider.
- Define retention and recovery objectives with the deployment owner.
- Keep backups encrypted and access-controlled.
- Never store database dumps in the Git repository.

## Backup verification

A backup is not considered valid until a restore test succeeds.

Recommended staging procedure:

1. Create an isolated restore target.
2. Restore the latest backup.
3. Run database migrations required by the restored version.
4. Start backend against the restored database.
5. Run health checks and Phase 28 smoke tests.
6. Verify citizen, officer, notification and audit records.
7. Record restore duration and result.

## Rollback

Application rollback:
1. Stop traffic to the new version.
2. Deploy the previous known-good application artifact.
3. Verify health endpoints.
4. Run smoke tests.
5. Re-enable traffic.

Database rollback:
- Prefer forward-compatible migrations.
- Do not automatically reverse destructive migrations.
- For destructive changes, use an explicit migration/restore plan approved
  before deployment.

## Incident evidence

Preserve:
- deployment version
- migration version
- application logs
- connector/job failures
- audit events
- webhook delivery IDs
- relevant request IDs
