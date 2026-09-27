# SETU — Seamless Exchange & Transformative Ubiquity

SETU is a prototype citizen-service orchestration platform for Maharashtra. It demonstrates how a citizen-facing layer can organize government services, schemes, reusable profile/document information, consent, cross-department journeys, grievance tracking, notifications, officer operations, integration adapters and grounded assistance without requiring existing departmental systems to be replaced.

## What is included

- Citizen service discovery and service detail flows
- My SETU profile/dashboard
- Document Vault and consent-aware reuse
- Application Journey Tracker
- Maharashtra district → department → service intelligence
- Government scheme discovery
- Grievance registration and tracking
- SETU Assistant with a grounded knowledge layer
- English / Hindi / Marathi language foundation
- Accessibility controls and responsive/mobile support
- Officer workspace and department queues
- Assignment, decision and audit boundaries
- Connector job/retry/dead-letter foundation
- Signed webhook verification and idempotency boundary
- Notification system
- Admin operations and command center analytics
- Generic department integration boundary with sandbox + HTTPS adapter
- Security middleware, request IDs, rate limiting and upload validation
- Automated backend tests and frontend smoke/a11y test assets
- Docker / CI/CD / deployment configuration
- SIH demo script, judge Q&A, final PPT content and submission checklist
- SETU patent-style specification and mentor presentation under `docs/submission-assets/`

## Repository structure

```text
setu/
├── frontend/                  # Next.js + React + TypeScript
├── backend/                   # FastAPI + Python
├── infra/                     # n8n, deployment and infrastructure assets
├── docs/                      # architecture, testing, deployment, SIH material
├── Dockerfile.backend
├── docker-compose.phase29.yml
├── render.yaml                # Render backend deployment blueprint
└── .github/workflows/ci.yml   # CI checks
```

## Local development

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows
# cp .env.example .env # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

Backend API: `http://localhost:8000/api/v1`  
Swagger: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

Set `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Tests

Backend tests:

```bash
cd backend
pytest -q
```

The merged backend currently passes the local test suite used during assembly.

Frontend checks:

```bash
cd frontend
npm ci
npx tsc --noEmit
npm run lint
npm run build
```

Playwright assets are under `frontend/tests/` and are configured in `frontend/playwright.config.ts`.

## Deployment

### Frontend — Vercel

Import this GitHub repository into Vercel and set **Root Directory** to `frontend`. Vercel will detect Next.js automatically.

Add:

```env
NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND-DOMAIN/api/v1
```

Then deploy.

### Backend — Render

The repository contains `render.yaml` and the backend can be deployed as a Render Web Service with:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check: /api/v1/health
```

After Render gives you the API URL, put that URL into Vercel's `NEXT_PUBLIC_API_BASE_URL` and redeploy the frontend.

See `docs/DEPLOYMENT.md` for the step-by-step flow.

## Production boundary

The project is an integration-ready prototype. The included department adapters are deliberately sandbox/generic unless an approved external API contract and credentials are supplied. The Maharashtra service/district metadata in the prototype is navigation/demo metadata and must be replaced or verified against authoritative sources before production use.

For production, use managed PostgreSQL/Supabase and private object storage rather than local JSON/file persistence, plus distributed rate limiting, malware scanning, encryption, signed document URLs, secret management, monitoring and security/privacy review.

## SIH material

The final demo and submission material is in `docs/`, including:

- `PHASE_30_FINAL_DEMO_SCRIPT.md`
- `PHASE_30_FINAL_PPT_CONTENT.md`
- `PHASE_30_JUDGE_QA.md`
- `PHASE_30_SUBMISSION_CHECKLIST.md`
- `PHASE_30_VIDEO_SHOT_LIST.md`
- `submission-assets/Project_SETU_Patent_Specification_REBUILT.docx`
- `submission-assets/MahaSetu_SIH2026_Mentor_Presentation.pptx`

## Important

Never commit real API keys, service-role keys, passwords, OTPs, government identifiers or populated production `.env` files.
