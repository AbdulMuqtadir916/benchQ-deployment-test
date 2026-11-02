# Deployment platform research

Researched 2026-10-30; decision and budget updated 2026-10-31 after the user accepted Singapore hosting. This supports the [deployment plan](./deployment-plan.md). No infrastructure has been provisioned and no billing/schema contracts are changed here.

**2026-11-01 update:** free compute is the user's immediate choice. Use the [free deployment guide](./render-free-deployment.md) and [verified free-tier notes](./render-free-platform-notes.md); the prices below describe the later paid option.

## Current decision

**Use Render in Singapore for the first client with 10–15 BDEs.** The user rejected the larger AWS budget and explicitly accepted Singapore instead of the previous India-only hosting requirement. Start with a Hobby workspace and paid frontend, backend and PostgreSQL compute. OpenRouter is the intended AI provider. AWS Mumbai is no longer the current recommendation; revisit an Indian platform only if the location requirement returns.

Render currently lists Singapore among its regions and has no India region. Keep app/API/database in the same workspace and region for private communication. [Regions](https://render.com/docs/regions), [private networking](https://render.com/docs/private-network).

## Initial cost and limits

| Component | Starting proposal | Monthly compute |
|---|---|---:|
| Workspace | Hobby; one hosting administrator | $0 |
| Next.js | Paid 512 MB service; load-test and increase if necessary | $7 |
| FastAPI | Paid 2 GB service; one process/replica initially | $25 |
| PostgreSQL | Paid 1 GB RAM compute; additional storage | $19 |
| **Base** | | **$51** |
| Optional separate worker | Paid 2 GB service, after a durable job handoff exists | +$25 |
| **Base with worker** | | **$76** |

These are published starting prices, not a complete vendor quote or proven capacity. Database/object storage, bandwidth, build overages, cron, taxes, domain/email and AI are additional. A 2 GB Next.js service adds $18 over the proposed 512 MB size. Pro adds a $25/month workspace fee when its features are needed. Confirm current checkout pricing before provisioning. [Pricing](https://render.com/pricing), [Render published examples](https://render.com/articles/render-vs-netlify).

Hobby workspace membership is for hosting administration, not application customers/BDEs. Pro provides additional hosting collaborators, autoscaling and environment network isolation. A paid workspace is not necessary merely to run paid compute. Keep synthetic staging separate from production, and do not claim isolated environments on Hobby. [Workspace features](https://render.com/docs/platform-features-by-plan).

Use paid services for the customer pilot. Free web services spin down after inactivity; free Postgres expires after 30 days and provides no backups. [Free service limits](https://render.com/docs/free).

## Runtime and storage findings

- **Private services:** Next.js can proxy browser requests to private FastAPI, preserving the existing cookie-session design. Restrict external database access and use the internal URL. [Private network](https://render.com/docs/private-network), [Postgres connections](https://render.com/docs/postgresql-creating-connecting).
- **Singleton constraint:** BenchQ currently embeds APScheduler, an in-memory job registry and throttle state in the API process. Keep one API process/replica until these are separated. Adding a worker service does not automatically migrate that code. Source: `backend/main.py`, `backend/job_monitor.py`, `backend/auth/throttle.py`.
- **Durable work:** Essential long jobs need persisted ownership, tenant context, retries and idempotency. A PostgreSQL-backed job queue is a proposed low-cost starting point; it is not implemented by this review. Render supports continuously running background workers. [Workers](https://render.com/docs/background-workers).
- **Cron:** Once scheduling is extracted, short cron tasks should enqueue work and exit. They have UTC schedules, separate billing and execution limits. Do not run both the old API scheduler and new cron for the same work. [Cron](https://render.com/docs/cronjobs).
- **Backups:** Paid PostgreSQL provides three days of PITR on Hobby and seven days on Pro. Recovery creates another database instance; validate and switch connections. Keep longer-retention encrypted exports if required. [Backups](https://render.com/docs/postgresql-backups).
- **Files:** Parsed originals currently live as binary data in PostgreSQL, while the Documents adapter is mocked. Render application filesystems are ephemeral; persistent service disks prevent horizontal scaling and zero-downtime deploys. Private object storage is the proposed destination for live Documents, with firm/user authorization before temporary links. [Disks](https://render.com/docs/disks), [S3 signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).
- **Scaling:** Pro supports CPU/memory autoscaling, but application process state must be fixed first. Neither a plan upgrade nor the proposed sizes guarantee capacity for a given number of accounts. Measure night-shift concurrency, browser memory and job age. [Scaling](https://render.com/docs/scaling).

## OpenRouter and data handling

OpenRouter is the user's selected provider. Singapore hosting does not constrain the processing locations of OpenRouter and downstream model providers. The user's Singapore acceptance should not be represented as a guarantee that candidate AI also stays in Singapore. Record actual routing/retention and client-facing data handling before release.

Prefer suitable zero-retention endpoints, disable optional prompt/completion logging, deny provider data collection where appropriate and restrict fallbacks to the chosen policy. ZDR is a retention control, not a geography guarantee, and its policy has exceptions. Keep keys in the backend, minimize candidate content and avoid PII in logs. [ZDR](https://openrouter.ai/docs/guides/features/zdr), [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection).

AI spend is additional to hosting. Track per-feature tokens and firm/BDE spend, cap key usage and concurrency, and bound output/retries. Monthly candidate allowances must not imply unlimited AI calls.

If an India-only processing requirement returns, OpenRouter's documented US/EU regional routing does not establish an India-only route. Direct Bedrock Mumbai/in-region or verified India geographic profiles are alternatives to evaluate at that time; do not use global/APAC fallbacks under such a requirement. [OpenRouter regional routing](https://openrouter.ai/blog/announcements/us-in-region-routing/), [Bedrock regional model compatibility](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html).

## Billing and application readiness

For an Indian merchant serving Indian staffing firms, evaluate Razorpay Subscriptions subject to merchant approval and actual recurring-method/currency requirements. Stripe India new accounts remain invite-only. Application seat/monthly candidate entitlements must be enforced transactionally in the backend; the payment gateway does not enforce them. Validate raw-body webhook signatures, deduplicate events and handle retries/out-of-order delivery. [Razorpay subscriptions](https://razorpay.com/docs/payments/subscriptions/), [webhook validation](https://razorpay.com/docs/webhooks/validate-test/), [Stripe India](https://support.stripe.com/questions/stripe-accounts-are-invite-only-in-india).

The hosting decision does not close the repository's mock integrations, documented isolation exceptions, unavailable admin writes, monthly quota implementation or backend export gate. The [deployment plan](./deployment-plan.md) retains these launch blockers and the original verification results. No clean build or load-test result is claimed by this decision update.
