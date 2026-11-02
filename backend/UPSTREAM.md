# Upstream

`backend/` is a copy of the `backend/` package from **JobNavigator**
(https://github.com/vesaias/JobNavigator, MIT — see `LICENSE` in this folder).

| | |
|---|---|
| Upstream commit | `cdc7273d4951fdda182a5c00598eb0995ec24708` (`main`) |
| Copied on | 2026-10-06 |
| Also copied to the repo root | `Dockerfile.backend`, `pytest.ini`, `docker-compose.yml` (frontend + Caddy services removed) |
| Not copied | JobNavigator's `frontend/`, `extension/`, `Caddyfile`, root `tests/` (e2e for its own UI), `docs/` |

To pull in an upstream fix, diff the upstream `backend/` at a newer commit against this folder
and apply what applies; then update the commit above.
