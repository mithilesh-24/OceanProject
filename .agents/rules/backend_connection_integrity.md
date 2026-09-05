# Rule: Strict Backend-Frontend Live Connection & Zero Silent Fallback

## 1. Zero Silent Fallbacks (Real Data First)
- Never silently catch API fetch errors and return synthetic/mock data as if the backend succeeded.
- If an API request fails or the backend is offline:
  - Throw or propagate the error so the UI displays an authentic `ErrorState` with a clear "Backend Offline — Start FastAPI Server on port 8000" message and a "Retry" button.
  - Never fake successful responses when real data cannot be fetched.

## 2. Transparent Vite Proxy & API Routing
- All frontend API calls must use relative paths (e.g. `/api/v1/...`) routed through Vite's dev proxy in `vite.config.ts` pointing to `http://127.0.0.1:8000`.
- Do not use hardcoded absolute external server URLs in frontend component logic.

## 3. Real Backend Service Verification
- Every feature, explorer, and analysis page must query live FastAPI + Database endpoints.
- Provide explicit backend health status indicators in the Header and Status Bar showing real-time connectivity to FastAPI and SQLite/PostgreSQL.
