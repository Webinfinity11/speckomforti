# SK — სპეცკომფორტი

Next.js 15 site with its own admin panel (`/admin`).

- Local: `npm install`, `npm run dev` → http://localhost:3050 (embedded PGlite DB in `./.data`, seeded on first start).
- Env: see `.env.example` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `DATABASE_URL`, `UPLOAD_DIR`).
- Production: Railway (Postgres + volume at `/data` for uploads). Push to `main` deploys.
