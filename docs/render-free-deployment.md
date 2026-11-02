# BenchQ: deploy a free Render demo

Verified against the repository and official Render documentation on **2026-11-01**. The user chose free compute for now and previously accepted Singapore hosting. This is the current demo plan; the paid sizing in [deployment-plan.md](./deployment-plan.md) remains an upgrade path. No service has been created, no database changed, and no deployment tested while writing this guide.

## 1. What you will create

| Resource | Render type | Region | Plan |
|---|---|---|---|
| `benchq-db-demo` | PostgreSQL 16 | Singapore | Free |
| `benchq-api-demo` | Web Service, Docker | Singapore | Free |
| `benchq-web-demo` | Web Service, Node | Singapore | Free |

Names are examples: use the actual URLs assigned by Render, including any generated suffix. All resources belong to the same Hobby workspace. No Pro workspace, worker, Redis, cron, custom domain or paid disk is required for this demo.

```text
Browser → public Next.js HTTPS URL → public FastAPI HTTPS URL → internal PostgreSQL URL
```

The backend must be a **Web Service**, not a Private Service: free backend compute cannot receive private-network requests. `BACKEND_URL` must therefore be the public HTTPS backend URL. The backend can still connect to the database using its internal URL. The browser continues to call the frontend's `/api/...` proxy, so its session cookie stays on the frontend origin. [Private-network/free restrictions](https://render.com/docs/free), [Postgres connections](https://render.com/docs/postgresql-creating-connecting).

## 2. Understand the free boundary

Use synthetic candidates for this temporary demo because of the application's open isolation/integration gaps and free database lifecycle. Singapore itself is accepted; it is not the reason for this synthetic-data restriction.

- Each free app has **512 MB RAM / 0.1 CPU**. The free database has **256 MB RAM / 0.1 CPU**. Chromium plus this backend may exceed those limits. [Compute specifications](https://render.com/docs/compute-plans), [Blueprint specifications](https://render.com/docs/blueprint-spec).
- App services sleep after 15 idle minutes and need about a minute to wake. They share **750 running hours per workspace per calendar month**. Two always-running services use 1,440 hours in a 30-day month. Do not add keep-alive pings. [Free limits](https://render.com/docs/free).
- Free PostgreSQL has **1 GB storage** and expires after **30 days**. It then becomes inaccessible, with a 14-day upgrade grace period before deletion. Export while it is accessible; there are no managed backups. Free app filesystems are ephemeral. [Free limits](https://render.com/docs/free).
- Free compute has no service shell/SSH, one-off jobs, persistent disks or horizontal scaling. Private services, workers and cron are not free options. Startup migrations work; a paid pre-deploy hook is unnecessary here. [Free limits](https://render.com/docs/free), [deployment lifecycle](https://render.com/docs/deploys).

This can demonstrate sign-in, firms, invites and lightweight candidate CRUD. It does not establish capacity for 15 concurrent BDEs, reliable scheduled jobs, durable billing webhooks or browser-heavy features. OpenRouter calls can incur AI charges even when Render compute is free.

## 3. Prepare the repository and local tools

1. Use the GitHub repository containing this project, including `backend/`. Deploy an agreed commit on `main`; do not publish a dirty developer checkout or secrets.
2. Keep `.env.local` and `backend/.env` untracked. Do not upload them as public files.
3. Install/use Node **22**, pnpm **12.5.1**, and Docker Desktop locally. The project versions come from `.nvmrc` and `package.json`.
4. Check the release commit with `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build`, plus the backend checks in `docs/integration/README.md`. The earlier review passed typecheck/lint but could not start tests/build because of a local Node/native dependency mismatch; that is not a verified deployment build. Follow `docs/troubleshooting.md` if it recurs.
5. Do not convert the frontend to static export. Its server session checks and backend rewrites require a Node server. [Render Next.js guide](https://render.com/docs/deploy-nextjs-app).

No application source change is required merely to attempt this deployment. The existing Docker backend already runs migrations and one Uvicorn process. Heavy-runtime/OOM fixes, isolation fixes and unfinished feature integrations remain separate implementation work.

## 4. Create the database first

1. Sign in at [Render Dashboard](https://dashboard.render.com/) and select a **Hobby** workspace.
2. Click **+ New → Postgres**.
3. Enter these values:

   | Field | Value |
   |---|---|
   | Name | `benchq-db-demo` or another unique name |
   | Database / User | Let Render generate them, or choose your own once |
   | Region | Singapore |
   | PostgreSQL Version | **16**, matching this repo's Compose/CI |
   | Compute / Instance Type | **Free**, explicitly selected |
   | Storage | Free allocation, 1 GB |

4. Click **Create Database** and wait for **Available**.
5. Open **Connect** at the top-right of the database page. Save the **Internal Database URL** in your password manager for the backend, and the **External Database URL** for local bootstrap/export. Do not paste either into chat or commit them.
6. Under the database's networking/IP access controls, replace public external access with your current public IP as a `/32` while bootstrapping. Same-region internal database access is separate. After bootstrap, remove external access again. Temporarily re-add your IP for later exports or administrative commands. [Database setup and connections](https://render.com/docs/postgresql-creating-connecting).

Do not select a paid storage upgrade. Note the database's actual expiration date immediately and put an export/upgrade deadline before it.

## 5. Bootstrap locally before the API starts

This step initializes the hosted database, turns off the seeded scheduler jobs, and creates the first Super Admin. It avoids dependence on Render's unavailable free service shell. Run it only against the new demo database.

In your **Mac zsh terminal**, from this repository:

```sh
cd "/Users/abdulmuqtadir/Desktop/AbMuqtadir FL/benchQ-ui/BenchQ"
docker build -f Dockerfile.backend -t benchq-backend:render-free .
```

Docker must be running. This existing image is large because it installs Chromium and subscription AI CLIs; those installed tools do not mean you must log into them. The intended runtime AI provider is OpenRouter.

Enter the external database URL without placing its value in shell history:

```sh
read -r -s "DATABASE_URL?Paste Render EXTERNAL database URL (hidden): "
printf '\n'
export DATABASE_URL
docker run --rm -it --env DATABASE_URL --env BENCHQ_ENV=production benchq-backend:render-free sh
```

The input should use `postgresql://` and require TLS: add `?sslmode=require` when the URL has no query string, or `&sslmode=require` when it already has other query parameters. Do not replace it with the internal URL: your laptop is outside Render's private network.

You are now in a local container shell, connected to the hosted demo database. Run these individually:

```sh
python -m backend.scripts.db_upgrade
python -c 'from backend.seed import run_seeds; run_seeds()'
```

The first command applies Alembic migrations. The second inserts application defaults; it also inserts legacy sample/reference data into the Default firm. It does **not** create the demo user passwords. Do not run `seed_demo` or set development mode on the public server.

Next, disable recurring jobs and reduce supported concurrency. Paste this block in the same container shell:

```sh
python - <<'PY'
from backend.models.db import SessionLocal, Setting

values = {
    "scrape_interval_minutes": "0",
    "email_check_interval_minutes": "0",
    "backup_cron": "",
    "digest_cron": "",
    "h1b_cron": "",
    "cleanup_cron": "",
    "reject_cron": "",
    "telegram_enabled": "false",
    "scoring_max_concurrent": "1",
    "tailoring_max_concurrent": "1",
    "on_save_action": "off",
    "tailor_auto_quick_score": "off",
}
with SessionLocal() as db:
    for key, value in values.items():
        row = db.get(Setting, key)
        if row is None:
            raise RuntimeError(f"Missing seeded setting: {key}")
        row.value = value
    db.commit()
print("Demo schedules disabled; supported concurrency reduced.")
PY
```

These are **database settings**, not environment variables. Setting `SCRAPE_INTERVAL_MINUTES=0` in Render would not configure this code. Scheduled work cannot be reliable while a free service sleeps, and local `/app/backups` files would not be durable.

Create your first Super Admin using the existing script:

```sh
python -m backend.scripts.create_platform_admin --email you@example.com --name "Your Name"
```

Replace the example email/name. Enter a strong unique password at its two hidden prompts; the script requires at least eight characters. It writes the account and audit entry. Do not put passwords in startup commands or make a public bootstrap endpoint.

If an account already exists, do not delete/recreate it. For a forgotten password the existing administrative command is:

```sh
python -m backend.scripts.reset_password --email you@example.com
```

## 6. Optional: configure OpenRouter through the current backend mechanism

Do this in the same local container, or skip it to keep the first demo to manual candidate entry. Your OpenRouter account needs usable credit/model access; free Render does not supply AI credits.

The current backend reads `llm_provider`, `llm_model` and `llm_api_key` from the `settings` table. It does **not** read an `OPENROUTER_API_KEY` environment variable. The AI presets/settings UI is unfinished, so do not rely on a nonexistent dashboard form.

Use this interactive command. It asks for a real vendor/model slug from your OpenRouter account and reads the API key without echoing it:

```sh
python -c '
import getpass
from backend.models.db import SessionLocal, Setting

model = input("OpenRouter model slug (vendor/model): ").strip()
key = getpass.getpass("OpenRouter API key: ").strip()
if not model or not key:
    raise SystemExit("Model and key required; nothing changed.")
values = {
    "llm_provider": "openrouter", "llm_model": model,
    "llm_api_key": key, "llm_effort": "",
    "llm_fallback_provider": "", "llm_fallback_model": "",
    "llm_fallback_api_key": "", "llm_fallback_effort": "",
}
for prefix in ("scoring", "email", "cv_tailor", "cover_letter", "autofill"):
    for suffix in ("provider", "model", "api_key", "effort"):
        values[f"{prefix}_llm_{suffix}"] = ""
with SessionLocal() as db:
    for name, value in values.items():
        row = db.get(Setting, name)
        if row is None:
            raise RuntimeError(f"Missing seeded setting: {name}")
        row.value = value
    db.commit()
print("OpenRouter primary configured; feature overrides cleared; fallback disabled.")
'
```

This uses the application's current DB-backed key storage, not an encryption upgrade; database credentials and dumps must be protected. Configure provider/key spending and privacy/retention in OpenRouter. Candidate parsing sends content to the selected provider; hosting in Singapore does not constrain its processing region. Use synthetic documents for this demo. [OpenRouter privacy controls](https://openrouter.ai/docs/guides/features/zdr).

Exit the container and clear the local shell variable:

```sh
exit
unset DATABASE_URL
```

Remove your external database IP access after bootstrap. Keep its internal URL for the backend service below.

## 7. Create the backend Web Service

1. In Render, click **+ New → Web Service**.
2. Choose **Git Provider**, connect GitHub, and select this repository.
3. Fill the creation form:

   | Field | Value |
   |---|---|
   | Name | `benchq-api-demo` or unique name |
   | Region | Singapore |
   | Branch | `main` / the approved release branch |
   | Language | **Docker** |
   | Root Directory | **Blank** — repository root |
   | Dockerfile Path | `Dockerfile.backend` |
   | Docker Build Context Directory, if shown | `.` |
   | Instance Type / Compute | **Free** |
   | Docker Command | **Blank**, use the existing Dockerfile `CMD` |
   | Pre-Deploy Command | Blank |
   | Health Check Path | `/health` |
   | Auto-Deploy | **Off** initially |

Do not set Root Directory to `backend`: the Dockerfile uses `COPY backend/...`, and Python imports expect the package to be available from `/app`. Do not use a native Python build command for this Docker service. Render supports a custom Dockerfile and command override, but none is needed for this route. [Docker service setup](https://render.com/docs/docker), [monorepo roots](https://render.com/docs/monorepo-support).

4. Add backend environment variables under the creation form's **Environment Variables / Advanced** controls:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Actual **Internal Database URL**, with `sslmode=require` added correctly |
   | `BENCHQ_ENV` | `production` |
   | `SESSION_COOKIE_SECURE` | `true` |
   | `PORT` | `8000` |
   | `ALLOWED_ORIGINS` | Temporary `https://setup.invalid` until the real frontend URL is assigned |

The existing start script binds to `0.0.0.0:8000`; setting `PORT=8000` makes Render's expected port explicit. It runs migrations before one Uvicorn worker. Do not add `--reload` or extra workers. [Web-service port binding](https://render.com/docs/web-services).

Do not copy local `DATABASE_URL` values referring to `db`/`localhost`, Docker Compose secrets, `TEST_DATABASE_URL`, Gmail tokens or personal CLI authentication files.

5. Click **Create Web Service**. Watch **Deploys / Events** and **Logs**. Expect Docker downloads and migrations; the log should show successful startup. Check that the scheduler reports no scheduled jobs because bootstrap disabled them.
6. Copy the actual public URL, for example `https://benchq-api-demo-xxxx.onrender.com`.
7. Open its `/health` URL. Wait for any free-service wake-up page to finish, then confirm JSON with `status: ok`. This endpoint does not test database readiness; verify DB-backed sign-in later.

If the API process exceeds 512 MB during startup, the full current backend may not fit free compute. Check the memory/OOM log; no frontend setting can solve backend OOM. Stop at that point and either scope a lighter backend implementation or upgrade compute. Do not claim Chromium features work merely because the image built.

## 8. Create the frontend Web Service

1. Click **+ New → Web Service**, connect the same repository and branch.
2. Set:

   | Field | Value |
   |---|---|
   | Name | `benchq-web-demo` or unique name |
   | Region | Singapore |
   | Language | **Node** |
   | Root Directory | **Blank** |
   | Instance Type / Compute | **Free** |
   | Health Check Path | `/sign-in` |
   | Auto-Deploy | **Off** initially |

3. Enter this **Build Command**:

   ```sh
   npx --yes pnpm@12.5.1 install --frozen-lockfile --prod=false && npx --yes pnpm@12.5.1 build
   ```

   This uses the repository's pinned pnpm version, includes TypeScript/Tailwind build dependencies, and does not need globally installed package-manager shims. Do not use `npm install`, switch to Yarn, remove the lockfile or upload local `node_modules`.

4. Enter this **Start Command**:

   ```sh
   node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port $PORT
   ```

   This runs the installed Next.js production server directly, so waking the service does not depend on `npx` downloading anything.

5. Set frontend environment variables **before the build**:

   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `BACKEND_URL` | Actual **public HTTPS backend URL**, no final slash and no `/api` suffix |
   | `NEXT_PUBLIC_LIVE_MODULES` | `candidates` |
   | `NEXT_PUBLIC_MOCK_DELAY_MS` | `0` |

   Leave `NEXT_PUBLIC_SHOW_DEV_ROUTES` unset. Leave `PORT` at Render's frontend default (`10000`). Do not add any API key or DB credential to `NEXT_PUBLIC_*`. Render's `.nvmrc` support also selects Node 22, but the explicit variable avoids the current new-service Node 24 default. [Node versions](https://render.com/docs/node-version).

   `candidates` is a real integration flag in this checkout. Sessions, team/invites, admin reads/create-firm and ledger are always live. Jobs, applications, resumes, records, inbox, Documents and AI editor adapters remain partly or fully mocked; adding their names to a flag cannot implement them. Verify modules again if deploying a later commit.

6. Click **Create Web Service** and wait for the build/deploy. Copy its actual public URL, e.g. `https://benchq-web-demo-yyyy.onrender.com`.

Use a Web Service, not a Static Site. The frontend is deployed with Node and does not use the backend-only `.dockerignore`. It needs no frontend Dockerfile for this route. [Next.js on Render](https://render.com/docs/deploy-nextjs-app).

Use `/sign-in` for frontend health checks so a sleeping backend does not cause Next.js health failures/restart loops. The separate manual frontend `/health` check below verifies proxy connectivity. [Health-check configuration](https://render.com/docs/health-checks).

## 9. Connect the final origin and redeploy

1. Open the **backend service → Environment**.
2. Replace `ALLOWED_ORIGINS` with the exact actual frontend origin:

   ```text
   https://benchq-web-demo-yyyy.onrender.com
   ```

   No `/sign-in`, wildcard, path or trailing slash. Do not use the backend URL here. Use a comma-separated list only if you actually have multiple intended frontend origins.
3. Save and deploy the backend environment change. If no deploy was triggered, open **Deploys → Manual Deploy → Deploy latest commit**.
4. Verify that frontend `BACKEND_URL` still matches the actual backend public URL. If it changes, **rebuild the frontend** using Manual Deploy. Restart alone is insufficient for build-time rewrites or `NEXT_PUBLIC_*` changes. [Manual deploy controls](https://render.com/docs/deploys).

The app is then used through the **frontend URL only**. The backend remains publicly reachable on free compute, so its own auth/access checks remain essential. Using a public backend URL does not require loosening authorization or changing the browser to cross-origin API calls.

## 10. Smoke-test the actual deployed commit

1. Open backend `/health` first and allow it to wake completely.
2. Open frontend `/sign-in` and allow that service to wake.
3. Open frontend `/health`; it should return the backend JSON through the rewrite.
4. On the frontend, sign in using the newly created Super Admin. In browser developer tools, confirm `bq_session` is set for the frontend with Secure/HttpOnly attributes. Reload `/admin` to exercise the server-side session read.
5. Create **one synthetic firm** through `/admin/firms/new` using the available plan and an owner address you control. Copy the returned invite link. No email delivery is implemented; do not wait for an automatic invitation email.
6. Accept the owner invite in an incognito/separate browser session. Sign in as OWNER, invite one MANAGER and one BDE, and assign the BDE to that manager. The current hierarchy requires a manager before candidate assignment.
7. As OWNER/MANAGER, create one invented candidate manually. Reload and sign back in to confirm the candidate persisted. With OpenRouter configured, optionally parse a small synthetic resume separately and inspect both API logs and provider usage. BDEs currently do not create candidates.
8. Test logout and verify a signed-out request to frontend `/api/auth/me` returns 401 after wake-up. Verify firm users cannot access `/admin`, and another firm's candidate URL is denied.
9. Check Render memory/error logs and the deployed commit IDs. Test browser/PDF features only individually; do not assume all routes fit 512 MB.
10. Recheck the app after an idle period. A sleeping backend may cause the first proxied request to time out; explicitly open backend `/health`, wait, then retry the frontend. This expected limitation is not solved by disabling secure cookies.

The default plan is currently 10 BDE seats, not the proposed 15-seat monthly subscription. Live admin plan/limit edits, payments and monthly candidate metering are unfinished. Hosting this checkout does not enable them. The wider isolation/export/mock blockers remain in [deployment-plan.md](./deployment-plan.md).

## 11. Operating and exporting the free demo

- Watch workspace **Billing/usage** for free hours, pipeline minutes and bandwidth. A $0 workspace alone does not guarantee a $0 bill if you select paid compute or exceed billable usage with a payment method. OpenRouter is separately billed.
- Do not run scheduled scraping, email polling or automated billing on sleeping services. In-memory jobs and throttle state reset with restarts. Do not use artificial pings to make this an always-on setup.
- Keep the database tiny: originals are stored in PostgreSQL, and 1 GB is storage, not 1 GB per candidate. At 2 MB per original, even 500 originals would approach 1 GB before all other data/indexes. Use only a few synthetic records.
- Export before expiration and before a risky migration; free Render has no managed backup. Use PostgreSQL 16 client tools to match the server. Restore into a separate empty database and verify it; do not test restore by overwriting the live demo.

For an export, temporarily allow your IP again, set the external TLS `DATABASE_URL` using the hidden zsh prompt from step 5, and run:

```sh
mkdir -p "$HOME/BenchQ-backups"
docker run --rm --env DATABASE_URL postgres:16-alpine sh -c 'exec pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-acl' > "$HOME/BenchQ-backups/benchq-free-2026-11-01.dump"
unset DATABASE_URL
```

Choose a new dated filename on each export rather than overwriting an old copy. Check Docker/`pg_dump` exited successfully; an empty or partial file is not a backup. Protect/encrypt the resulting file outside Git: it contains password hashes, sessions, candidate data and any configured AI key. Close external database access afterward. The command is manual user-side administration; it was not run during this review.

Keep Auto-Deploy **Off** initially and deploy reviewed commits manually. This repo's GitHub workflow currently runs on pull requests, not pushes to `main`. Render's **After CI Checks Pass** does not deploy commits with zero detected checks; do not select it until CI runs on the deployed commit or its behavior is verified for your merge workflow. **Clear build cache & deploy** can help stale build state; it does not fix missing source, a wrong root directory or memory limits. [Deployment controls](https://render.com/docs/deploys).

## 12. Troubleshooting

| Symptom | Check / correction |
|---|---|
| `Could not import backend` / Docker COPY missing | Backend root must be blank, Docker context `.` and Dockerfile Path `Dockerfile.backend` |
| `No open ports detected` | Backend `PORT=8000` matches its existing script; frontend start binds `0.0.0.0:$PORT` |
| Backend database host `db` not found | Replace local Compose URL with Render's internal URL |
| Local bootstrap cannot resolve DB / connection refused | Use external URL, TLS, current public-IP allowlist and an unexpired Available database |
| SQLAlchemy rejects `postgres://` | Use equivalent `postgresql://`; retain encoded username/password and query parameters |
| Sign-in says `Cross-origin request refused` | Backend `ALLOWED_ORIGINS` must equal the actual frontend HTTPS origin; save/deploy |
| Sign-in credentials invalid | Create/reset the remote Super Admin; local demo accounts are not the hosted accounts |
| Frontend cannot reach backend | Wake backend, verify public `BACKEND_URL`, then rebuild frontend if changed |
| First request is HTML/loading or timeout | Wait for the directly opened backend to wake, then retry; both apps can sleep |
| `next`/TypeScript/Tailwind missing during build | Use pinned pnpm install with `--prod=false`; do not omit dev dependencies |
| Free-service OOM / exit 137 | Check which process exceeded RAM; reduce released workloads or use larger compute; no capacity guarantee |
| Parse still uses Anthropic / missing API key | Set DB-backed primary OpenRouter configuration and clear unintended feature overrides; an unused env key will not work |
| Work disappears after restart | Distinguish mocked browser state and ephemeral files from real DB-backed candidates |
| API healthy but feature fails | `/health` only proves API process liveness; check actual DB/permission/integration/provider response |
| No auto deploy after merge | Current CI is PR-only; use reviewed Manual Deploy or implement deploy-commit CI separately |
| Data unavailable after ~30 days | Check free DB expiry; export before expiry or upgrade; redeploying app does not renew its DB |

## 13. First paid upgrades

Before a real client relies on this, close the documented application security/integration gaps and complete billing entitlements. Upgrade the database before its expiry and upgrade app compute when memory, availability or free hours demand it. Add durable worker execution before relying on heavy jobs, and remove singleton process state before multiple API replicas. The previous $51/$76 paid starting proposal is retained in the main deployment plan; it is not required to create this free demo.

Current facts and additional citations: [Render Free platform notes](./render-free-platform-notes.md). The steps were checked against source and documentation; no dashboard or deployment was operated and no live smoke/load tests were performed.
