# BenchQ JSON Data Migration Status

Last updated: 2026-10-01

## Overall Status

**Core migration complete. Persistence and final lint cleanup remain.**

The application now loads its runtime data from JSON through a local in-memory data store. MSW, its handlers, the TypeScript fixture layer, and runtime `/api/*` requests have been removed.

## Desired Result

The target architecture is:

```text
User action
  → React component
  → TanStack Query hook
  → typed local adapter
  → local data store
  → JSON seed data
  → UI response
```

There should be no real backend, no MSW worker, and no `/api/*` network requests.

## Completed

### Repository review

- [x] Inspected the repository structure.
- [x] Confirmed this repository is frontend-only.
- [x] Confirmed there is no backend server or database implementation in this folder.
- [x] Traced the existing API adapters in `src/lib/api/`.
- [x] Traced the existing TanStack Query hooks in `src/lib/hooks/`.
- [x] Traced the MSW setup in `src/mocks/` and `src/app/providers.tsx`.
- [x] Reviewed the TypeScript fixtures and their domain relationships.
- [x] Identified existing read operations and mutation operations.
- [x] Identified direct fixture imports that will need updating.

### Planning

- [x] Recommended multiple JSON files instead of one large JSON file.
- [x] Defined the proposed `src/data/` structure.
- [x] Defined the proposed `src/lib/local-data/` structure.
- [x] Defined the local in-memory store approach.
- [x] Documented how candidate, application, document, and inbox mutations should work.
- [x] Documented how local agent behavior should replace MSW agent handlers.
- [x] Documented the MSW removal checklist.
- [x] Documented testing and completion criteria.
- [x] Created the implementation plan: [JSON_DATA_MIGRATION_PLAN.md](./JSON_DATA_MIGRATION_PLAN.md)

### Implementation

- [x] Exported the current fixture data into domain-based JSON files under `src/data/`.
- [x] Added Zod validation for all JSON seed data.
- [x] Added the local data store under `src/lib/local-data/`.
- [x] Added local read selectors for all existing domains.
- [x] Added local mutation functions for candidates, applications, documents, and inbox data.
- [x] Moved agent rewrite and tailoring behavior out of MSW.
- [x] Replaced all API adapter `fetch()` calls with local store calls.
- [x] Removed MSW startup logic from `src/app/providers.tsx`.
- [x] Removed the MSW browser worker, server, handlers, and generated worker file.
- [x] Removed the `msw` dependency from `package.json` and the lockfile importer.
- [x] Updated tests and the design-system page to stop importing deleted fixture modules.
- [x] Fixed the App Router parallel-layout type error so the production build passes.

## Not Yet Completed

### JSON data conversion

- [x] Create `src/data/`.
- [x] Convert the existing TypeScript fixtures into JSON.
- [x] Preserve all IDs and relationships.
- [x] Convert runtime-only values such as `Set` into JSON-compatible arrays.
- [x] Preserve valid ISO date values in the generated seed data.
- [x] Validate every JSON file with its matching Zod schema.

### Local data store

- [x] Create `src/lib/local-data/store.ts`.
- [x] Create read selectors for all domains.
- [x] Create local mutation functions.
- [x] Add consistent local errors for missing records and invalid updates.
- [x] Add optional simulated delays for loading states.
- [x] Use in-memory state for the current browser session.
- [ ] Add browser persistence with `localStorage` or IndexedDB if refresh persistence is required.

### API adapter migration

- [x] Replace `fetch()` calls in `src/lib/api/` with local store calls.
- [x] Keep the existing adapter method names and return types.
- [x] Keep Zod validation at the store boundary.
- [x] Confirm all TanStack Query hooks continue working without component changes.

### Mutation migration

- [x] Replace candidate update behavior.
- [x] Replace application status update behavior.
- [x] Replace document upload metadata behavior.
- [x] Replace document removal behavior.
- [x] Replace inbox connect behavior.
- [x] Replace inbox disconnect behavior.
- [x] Replace inbox mark-read behavior.
- [x] Confirm resume studio behavior remains functional through Zustand.

### Agent migration

- [x] Move rewrite simulation out of MSW.
- [x] Move resume tailoring simulation out of MSW.
- [x] Preserve simulated latency and cancellation behavior.
- [x] Preserve the rule that generated claims remain `UNVERIFIED`.

### MSW removal

- [x] Remove MSW startup code from `src/app/providers.tsx`.
- [x] Delete `src/mocks/browser.ts`.
- [x] Delete `src/mocks/server.ts`.
- [x] Delete `src/mocks/handlers/`.
- [x] Delete `public/mockServiceWorker.js`.
- [x] Remove `msw` from `package.json`.
- [x] Remove the MSW configuration from `package.json`.
- [x] Remove runtime references to MSW environment variables.
- [ ] Rewrite historical MSW examples in the documentation files.

### Reference cleanup

- [x] Update `src/app/(app)/design-system/page.tsx` so it no longer imports fixture utilities.
- [x] Update `src/lib/derive/derive.test.ts` so tests no longer import deleted fixture modules.
- [x] Confirm no component imports from `src/mocks/fixtures/`.
- [x] Confirm no runtime code uses `fetch('/api/...')`.

### Verification

- [x] Run TypeScript typecheck — passes.
- [ ] Run lint — existing unrelated `any` errors remain in UI files.
- [x] Run Vitest — 5 tests pass.
- [x] Run Next production build — passes.
- [x] Verify JSON files load during the production build.
- [x] Verify local read and mutation paths compile and validate.
- [x] Verify no MSW worker starts.
- [x] Verify no runtime `/api/*` request is made.
- [ ] Perform a full manual browser walkthrough of every mutation screen.

## Current Files Added by the Migration Work

- [JSON_DATA_MIGRATION_PLAN.md](./JSON_DATA_MIGRATION_PLAN.md) — full implementation plan.
- [JSON_DATA_MIGRATION_STATUS.md](./JSON_DATA_MIGRATION_STATUS.md) — current progress and checklist.

### Implementation files

- `src/data/*.json` — JSON seed data.
- `src/lib/local-data/store.ts` — validated local data and mutations.
- `src/lib/local-data/agents.ts` — local deterministic agent behavior.
- `src/lib/local-data/delay.ts` — optional local response delay and cancellation.

## Current Files Not Modified by the Migration

The following existing worktree changes were not made by this migration planning work:

- `package.json` is already modified in the worktree.
- `.codex/` is untracked.
- `BACKEND_API_FEATURES.md` is untracked.

These files should be reviewed separately before implementation changes are made.

## Next Recommended Step

The next optional step is adding `localStorage` or IndexedDB persistence. The current implementation intentionally resets mutations when the browser is refreshed because JSON is being used as seed data, not as a writable database.
