# SETU Deployment

## Recommended SIH prototype deployment

- Frontend: Vercel, Root Directory = `frontend`
- Backend: Render Web Service, Root Directory = `backend`
- API URL is supplied to the frontend as `NEXT_PUBLIC_API_BASE_URL`

The frontend and backend are deliberately deployable as separate services. The backend uses FastAPI and the frontend uses Next.js.

### Vercel frontend
1. Import the GitHub repository.
2. Set Root Directory to `frontend`.
3. Framework = Next.js (auto-detected).
4. Add `NEXT_PUBLIC_API_BASE_URL=https://YOUR-API-DOMAIN/api/v1`.
5. Deploy.

### Render backend
1. Create a Web Service from the same repository.
2. Root Directory = `backend`.
3. Build: `pip install -r requirements.txt`.
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add CORS origin for the Vercel URL.

### Important prototype boundary
The current local JSON persistence is suitable for a demo, not a multi-instance production system. For production, switch persistence/storage to a managed database/object store and keep secrets only in deployment environment variables.
