# Render Free: current platform notes for BenchQ

Checked 2026-11-01 against official Render documentation and the current repository. This is research for a deployment guide, not a deployment, tested configuration or change to the approved architecture. No account or dashboard was accessed; UI labels below are those in current official documentation and may vary slightly in the live dashboard.

## Scope

The user's requested free Render deployment is a temporary **synthetic-data demo** because of its database lifecycle, resource limits and the application's remaining security/integration gaps. The user already accepted Singapore hosting, superseding the earlier India-only hosting requirement. Use invented resumes and fake mailboxes, no existing production database. This guide does not claim that a free service can support 10–15 real BDEs or the application's browser/AI workloads. [Regions](https://render.com/docs/regions).

## Verified free limits

Free web services: idle shutdown after 15 minutes; waking takes about a minute. All free web services share **750 running hours/workspace/calendar month**, not 750 per service. Files are ephemeral. Free services cannot receive private-network traffic, but can connect to same-region datastores. No shell/SSH, one-off jobs, persistent disks or horizontal scaling. Private services, workers and cron do not offer Free instances. SMTP ports 25/465/587 are unavailable. High outbound traffic can trigger suspension. Bandwidth/build overages can incur charges with a payment method; without one services/builds can be suspended.

Free Postgres: one per workspace, **1 GB storage**, expires after **30 days**, inaccessible during a 14-day upgrade grace period, then deleted. No managed backup/recovery or managed pooling. [Free limits](https://render.com/docs/free).

The compute tables list free web as **0.1 CPU / 512 MB RAM** and free Postgres as **0.1 CPU / 256 MB RAM**, with up to 100 DB connections. Omitted plans default to paid compute; select Free explicitly. [Blueprint reference](https://render.com/docs/blueprint-spec).

Two continuously running services consume approximately 1,440 hours in a 30-day month, exceeding the shared allowance. Idle sleep reduces consumption; artificial keep-alive traffic is unsuitable for this plan.

## Database dashboard sequence

1. Dashboard **+ New > Postgres** (or the documented [database creation form](https://dashboard.render.com/new/database)).
2. Set a unique name; choose **Singapore**; keep PostgreSQL at the repo's tested major version (local Compose uses PostgreSQL 16; check it before choosing).
3. Explicitly choose **Free**, storage 1 GB; do not enable paid upgrades or storage autoscaling. Click **Create Database** and wait for **Available**.
4. Database page, top-right **Connect** menu: copy its **internal URL** for the backend. Copy external URL only for a controlled local bootstrap/backup.
5. Database **Info > Networking**: external access defaults to `0.0.0.0/0`. Replace it with your current IP `/32` while bootstrapping, then remove external access. Internal same-region connections remain possible. Use `sslmode=require` for local external connections. [Creating and connecting Postgres](https://render.com/docs/postgresql-creating-connecting).

## Backend dashboard fields

Create **New > Web Service**, connect the BenchQ GitHub repo and select the branch containing the intended code. Choose **Language: Docker**, region Singapore, **Free**, and a unique service name.

| Field | BenchQ value / reason |
|---|---|
| Root Directory | Leave blank: `Dockerfile.backend` copies `backend/...` from the repository root. |
| Dockerfile Path | `Dockerfile.backend` |
| Docker Build Context Directory | `.` (if shown; repo root) |
| Docker Command | Leave blank to use the image's existing `CMD`, or use the explicit override below. |
| Health Check Path | `/health` |
| Environment | `DATABASE_URL` = internal DB URL; `BENCHQ_ENV=production`; `SESSION_COOKIE_SECURE=true`; `ALLOWED_ORIGINS` = exact frontend HTTPS origin, no path/trailing slash. |

The existing image uses `sh backend/scripts/start.sh`, which migrates then starts one Uvicorn process on `0.0.0.0:8000`. Render can detect a listening port. For an explicit default-port deployment, **Advanced > Docker Command** can override `CMD` with:

```sh
/bin/sh -c 'python -m backend.scripts.db_upgrade && exec uvicorn backend.main:app --host 0.0.0.0 --port "$PORT"'
```

Do not fill a native Build Command for Docker. Render builds the image with its Dockerfile; custom Docker Command replaces runtime `CMD`, not Docker build steps. Keep one Uvicorn worker because this repo's scheduler lives in the API process. [Docker configuration](https://render.com/docs/docker), [port binding](https://render.com/docs/web-services).

The pre-deploy command is paid-only. This repo already migrates during container startup, so do not depend on a free pre-deploy hook. [Deploy lifecycle](https://render.com/docs/deploys).

## Frontend dashboard fields

Create a second **Web Service**, same repo and branch, **Language: Node**, Singapore, **Free**, and leave Root Directory blank. This app needs SSR/session checks/proxying, so use a web service rather than static export. [Next.js deployment](https://render.com/docs/deploy-nextjs-app).

| Field | Proposed BenchQ value |
|---|---|
| Build Command | `corepack enable && pnpm install --frozen-lockfile --prod=false && pnpm build` |
| Start Command | `pnpm start --hostname 0.0.0.0 --port $PORT` |
| `NODE_VERSION` | `22` (repo `.nvmrc` is 22) |
| `BACKEND_URL` | The backend's **public HTTPS** `https://<actual-backend-name>.onrender.com`, without trailing slash. Free backend cannot receive private requests. |
| `NEXT_PUBLIC_LIVE_MODULES` | Only modules already implemented in this checkout; do not invent completed integrations. |
| Dev route flag | Leave `NEXT_PUBLIC_SHOW_DEV_ROUTES` unset. |

The repo pins `pnpm@12.5.1` in `packageManager`. Corepack selects that version. The build explicitly includes dev dependencies because TypeScript/Tailwind build tools are there. If Corepack is missing or its shim is broken, current Render guidance uses `npm install -g corepack && corepack enable` before invoking the pinned package manager; do not solve it by dropping the lockfile or switching package managers. [Corepack/version guidance](https://render.com/articles/pinning-nodejs-python-ruby-versions).

Explicit Node 22 overrides Render's current default major, which is 24 for new services. `.nvmrc` is also supported. [Node version precedence](https://render.com/docs/node-version).

Render defaults `NODE_ENV=production` **at runtime only** for native Node services; manually setting it for the build can otherwise omit needed build dependencies. [Default environment variables](https://render.com/docs/environment-variables).

The root `.dockerignore` excludes frontend files, but native Node deployment does not use that Docker build context. Root Directory settings affect available source files, so do not set the frontend root to `src` or the Docker backend root to `backend`. [Monorepo behavior](https://render.com/docs/monorepo-support).

## Bootstrap and ordering catches

Use the actual frontend Render URL in the backend's `ALLOWED_ORIGINS`. If names are allocated during creation, deploy backend first, record its URL, deploy frontend, record its URL, then update backend origins and redeploy. Authentication cannot work until those values match.

The repo's first Super Admin is created by `python -m backend.scripts.create_platform_admin --email ... --name ...`, which prompts twice for a password. Free Render has no interactive service shell. Run that existing command **locally** in the project's Python environment or Docker image with `DATABASE_URL` temporarily set to the Render **external** DB URL using TLS. Wait for backend migrations to finish first. Avoid putting database credentials/passwords in committed files, command arguments, deploy commands or logs. Restrict local external access during bootstrap and close it afterward. Every other account joins by invite; production rejects `seed_demo`.

This repo's full Docker image installs Chromium and several AI CLIs. Successful image build does not establish that the Python process plus browser can fit 512 MB. The embedded scheduler also cannot guarantee jobs while the service sleeps. Expect to keep the demo to lightweight navigation/auth/CRUD and test heavier features individually; do not claim end-to-end feature readiness from `/health` alone.

## Existing-service changes and redeploys

Current docs place source/build/root settings on service **Settings**, with Root Directory under **Build & Deploy**. Environment values have their own service configuration surface. Changes to frontend build-time values require rebuilding.

From service **Deploys**, use **Manual Deploy > Deploy latest commit**. **Clear build cache & deploy** is a recovery option for stale build state; **Restart service** reuses the existing commit and user-defined environment. Under Settings, Auto-Deploy options are **On Commit**, **After CI Checks Pass** or **Off**. The CI-gated option requires detected checks; zero detected checks does not pass. [Manual/automatic deploys](https://render.com/docs/deploys).

After setup, verify direct backend `/health`, frontend `/health`, sign-in, cookie persistence, one synthetic firm/invite/candidate flow, sign-out, cross-firm denial and the deployed commit. No such feature checks have been run as part of this research.
