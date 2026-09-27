# SETU Phase 18 Workers

`python -m scripts.run_workers` starts the connector and notification worker processes.

The SIH build keeps delivery provider-neutral and does not call real government APIs.
For production, run workers separately from FastAPI under a supervisor/container platform,
and replace the polling repository with a managed queue if scale requires it.
