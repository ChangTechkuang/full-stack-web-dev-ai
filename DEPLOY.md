# Deploying TaskFlow for free

This walk-through deploys the project across three free-tier providers:

| Layer    | Provider | Free tier reality                                                   |
| -------- | -------- | ------------------------------------------------------------------- |
| Database | **Neon** | 0.5 GB Postgres, branches, auto-suspend when idle                   |
| Backend  | **Render** | 512 MB / 0.1 CPU container, **sleeps after 15 min idle** (~30-60 s cold start) |
| Frontend | **Vercel** | Hobby plan, Next.js native, automatic deploys                       |

Total cost: **$0**. Expected cold-start latency on the first request after idle: **30–90 s** (Render wakes the JVM, Neon wakes the DB). Subsequent requests are fast.

---

## 0. Prerequisites

- The repo pushed to **GitHub** (Render and Vercel both pull from it).
- Free accounts on [neon.tech](https://neon.tech), [render.com](https://render.com), [vercel.com](https://vercel.com) — all three accept GitHub OAuth, no credit card needed.

> If the project is not yet on GitHub:
> ```powershell
> gh repo create taskflow --public --source . --remote origin --push
> ```

---

## 1. Database — Neon

1. Sign in to Neon → **New Project**.
2. Name it `taskflow`, region close to your Render region (Singapore if you keep the default `render.yaml`).
3. Postgres version: **16** (or whatever is default — Flyway scripts are version-agnostic for our schema).
4. After creation, open **Dashboard → Connection Details**. Copy the **JDBC connection string** (the dropdown lets you switch from `postgresql://` to JDBC form). It looks like:

   ```
   jdbc:postgresql://ep-cool-name-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Note the **username** and **password** shown alongside — you'll paste them into Render in the next step.

> Neon's auto-suspend kicks in after ~5 min of inactivity. The first query after that adds ~1 s of "cold start" — harmless for a demo.

---

## 2. Backend — Render

1. Sign in to Render with GitHub → **New +** → **Blueprint**.
2. Pick the `task-flow-dev` repo. Render reads [`render.yaml`](render.yaml) at the root and proposes the `taskflow-backend` service.
3. Render will prompt for the **sync: false** env vars (the secrets):
   - `DB_URL` → the JDBC string from Neon
   - `DB_USERNAME` → Neon username
   - `DB_PASSWORD` → Neon password
   - `APP_CORS_ALLOWED_ORIGINS` → leave blank for now (we'll fill it after Vercel gives us a URL)
4. Click **Apply**. First build takes ~5–8 min (Gradle download + JAR build + Docker layer push).
5. When the service is **Live**, hit `https://<your-service-name>.onrender.com/actuator/health` — you should see `{"status":"UP"}`.

> If the build fails with OOM during `bootJar`, bump down parallelism temporarily by adding `org.gradle.workers.max=1` to `backend/gradle.properties`. The current settings already work on Render's 512 MB free tier.

---

## 3. Frontend — Vercel

1. Sign in to Vercel with GitHub → **Add New… → Project** → import `task-flow-dev`.
2. Configure:
   - **Root Directory:** `frontend` *(critical — the repo has both apps in subfolders)*
   - **Framework Preset:** Next.js *(auto-detected)*
   - **Build Command:** `next build` *(default)*
   - **Output Directory:** *(leave default)*
3. **Environment Variables** → add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-service>.onrender.com`
4. Click **Deploy**. First build takes ~1–2 min.
5. After it's live, copy the production URL (e.g. `https://task-flow-dev.vercel.app`).

---

## 4. Close the loop — lock CORS to Vercel

Back in Render → your service → **Environment**:

1. Set `APP_CORS_ALLOWED_ORIGINS` to your Vercel URL:
   ```
   https://task-flow-dev.vercel.app
   ```
   To also allow Vercel **preview** deployments (PR-scoped subdomains), use:
   ```
   https://task-flow-dev.vercel.app,https://task-flow-dev-*.vercel.app
   ```
2. Render redeploys automatically (~2 min).

---

## 5. Smoke test

1. Open `https://task-flow-dev.vercel.app`.
2. Log in with the seeded manager account:
   - Email: `manager@taskflow.local`
   - Password: `Manager@123`
3. **First request hangs for ~30–60 s** — that's Render waking the JVM. Subsequent requests are instant.
4. Create a work request, transition its status — confirm everything round-trips.

---

## Operations cheat sheet

| Task                                  | Where                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------- |
| View backend logs                     | Render dashboard → service → **Logs**                                      |
| View frontend logs                    | Vercel dashboard → project → **Deployments → Functions Logs**              |
| Manually trigger a backend rebuild    | Render dashboard → **Manual Deploy → Deploy latest commit**                |
| Rotate `JWT_SECRET`                   | Render dashboard → **Environment** → edit `JWT_SECRET` → save (auto-redeploys) — invalidates every refresh token |
| Inspect the DB                        | Neon dashboard → **SQL Editor**                                            |
| Wipe & reseed the DB                  | Neon → drop & recreate the database, then Render auto-restarts → Flyway + seeder rebuild it |
| Disable seeding (for real users)      | Render env → set `APP_SEED_ENABLED=false`                                  |

---

## Free-tier caveats

- **Render free dynos sleep** after 15 min with no traffic. Cold start adds ~30-60 s for Spring Boot. Acceptable for a portfolio; not acceptable for a live product. Upgrading to Render's $7/month "Starter" plan removes sleep.
- **Neon free Postgres** auto-suspends after ~5 min idle. First query after that takes ~1 s extra.
- **Neon's free tier deletes inactive projects** after some months — log in occasionally or back up.
- **Vercel's hobby plan** has no sleep but does have a 100 GB/month bandwidth cap. A portfolio site won't approach it.
- **Refresh tokens are stored in Postgres**. If Neon auto-suspends mid-refresh, the very first refresh after wake-up may take a beat.

---

## Local development still works the same

None of these changes affect local development. The defaults in `application.yml` and `frontend/.env.example` still point at localhost. Just run:

```powershell
# Backend
cd backend
./gradlew bootRun

# Frontend (in another shell)
cd frontend
npm run dev
```

---

## What lives where

| File                                    | Purpose                                          |
| --------------------------------------- | ------------------------------------------------ |
| [`render.yaml`](render.yaml)            | Render Blueprint — service + env stubs           |
| [`backend/Dockerfile`](backend/Dockerfile) | Multi-stage JDK 17 → JRE 17 image                |
| [`backend/.dockerignore`](backend/.dockerignore) | Keeps build context minimal             |
| [`backend/.env.example`](backend/.env.example) | Documents every backend env var          |
| [`frontend/.env.example`](frontend/.env.example) | Documents every frontend env var       |
