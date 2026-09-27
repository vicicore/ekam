# SETU Phase 28 — End-to-End Testing & QA

## Goal

Phase 28 establishes a repeatable quality gate across the SETU citizen,
officer, admin, integration, notification, security, multilingual and
responsive workflows.

This phase adds tests and QA documentation. It does not claim that all
tests pass automatically against every environment.

## Backend tests

Copy:
- `backend/tests/test_phase28_security.py`
- `backend/tests/test_phase28_contracts.py`
- `backend/tests/test_phase28_models.py`

Run from `backend/`:

```bash
pytest -q
```

If the project uses a different FastAPI app import path, adjust the fixture
in `test_phase28_security.py` to the existing app factory.

## Frontend Playwright

Install Playwright in the frontend project if it is not already installed:

```bash
npm install -D @playwright/test
npx playwright install
```

Run:

```bash
npx playwright test
```

For a running deployed/local server:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

Windows PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
npx playwright test
```

## Files

- `frontend/playwright.config.ts`
- `frontend/tests/phase28-smoke.spec.ts`
- `frontend/tests/phase28-a11y.spec.ts`
- `frontend/tests/phase28-ui-checklist.md`
- `docs/PHASE_28_TEST_MATRIX.md`
- `docs/PHASE_28_RELEASE_CHECKLIST.md`

## Test philosophy

Automated tests should verify contracts and critical paths.
Manual QA is still required for:
- visual consistency
- multilingual wording
- screen readers
- real mobile devices
- government-content accuracy
- real department API behavior

## Recommended CI order

1. Install dependencies
2. Lint
3. Type-check
4. Backend unit/contract tests
5. Build frontend
6. Start application
7. Playwright smoke tests
8. Accessibility scan
9. Package deployment artifact

## Production rule

Do not treat a green smoke test as proof of production readiness.
Real department connectors, official service metadata, notification providers
and infrastructure must be tested in their respective staging environments.
