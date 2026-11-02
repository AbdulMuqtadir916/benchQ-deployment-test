# BenchQ JSON Data Migration Plan

## Goal

Remove the current backend-like layer and MSW setup from BenchQ.

After the migration, clicking a button or opening a screen should read data from local JSON through the existing typed hooks. The UI should behave as if it is receiving responses from a backend, but there should be:

- no real backend server;
- no HTTP requests to `/api/*`;
- no MSW browser worker;
- no MSW request handlers;
- no direct fixture imports inside UI components.

The intended flow is:

```text
User click
  → React component
  → TanStack Query hook
  → typed API adapter
  → local JSON data store
  → Zod validation
  → UI response
```

The existing hooks and components should remain mostly unchanged.

## Current State

This repository does not contain a real backend. Its backend-like behavior is currently provided by:

- `src/lib/api/client.ts` — fetch wrapper;
- `src/lib/api/*` — typed endpoint adapters;
- `src/mocks/handlers/*` — fake API endpoints;
- `src/mocks/fixtures/*` — generated TypeScript data;
- `src/mocks/browser.ts` — MSW browser worker;
- `src/app/providers.tsx` — MSW startup logic;
- `public/mockServiceWorker.js` — generated MSW worker file.

The current flow is:

```text
Component → Hook → fetch('/api/...') → MSW handler → TypeScript fixture
```

## Target State

The target flow is:

```text
Component → Hook → typed adapter → local data store → JSON file
```

The adapter layer should stay in place so the UI does not need to know whether data comes from JSON today or a real backend in the future.

## Data Module Structure

Use multiple JSON files organized by domain instead of one large JSON file.

```text
src/data/
├── firm.json
├── candidates.json
├── records.json
├── companies.json
├── jobs.json
├── resumes.json
├── applications.json
├── followups.json
├── documents.json
├── inbox.json
├── ledger.json
└── agent-results.json

src/lib/local-data/
├── store.ts
├── selectors.ts
├── mutations.ts
├── errors.ts
└── delay.ts
```

### Why multiple JSON files

- The current fixtures are already divided by domain.
- Individual domains are easier to edit and review.
- Candidate, job, and application data can be changed independently.
- Smaller files reduce merge conflicts.
- Each file can be validated against its matching Zod schema.
- The data relationships will still use IDs, just as they do now.

A single `benchq.json` file is technically possible, but it will become harder to maintain as jobs, applications, and candidate records grow.

## Module 1 — Export Existing Fixture Data

### Objective

Convert the current generated TypeScript fixtures into static JSON while preserving the existing IDs and relationships.

### Source files

- `src/mocks/fixtures/firm.ts`
- `src/mocks/fixtures/candidates.ts`
- `src/mocks/fixtures/records.ts`
- `src/mocks/fixtures/companies.ts`
- `src/mocks/fixtures/jobs.ts`
- `src/mocks/fixtures/resumes.ts`
- `src/mocks/fixtures/applications.ts`
- `src/mocks/fixtures/documents.ts`
- `src/mocks/fixtures/inbox.ts`
- generated ledger data from `src/mocks/handlers/ledger.ts`

### Requirements

- Preserve every existing ID.
- Preserve foreign-key relationships such as `candidateId`, `jobId`, `resumeId`, and `applicationId`.
- Preserve all enum values exactly.
- Preserve `null` values.
- Replace runtime-only structures such as `Set` with JSON arrays.
- Convert generated dates to valid ISO strings.
- Do not store derived dashboard counters in JSON.

### Important conversion note

The current fixture files contain both data and behavior. The following behavior must move into the local data store:

- seeded random generation;
- date generation using `Date.now()`;
- helper functions such as `getJobById()`;
- filtering and pagination;
- mutation logic;
- simulated errors and delays;
- AI rewrite and tailoring behavior.

## Module 2 — Create the Local Data Store

### Objective

Load JSON once and provide asynchronous functions that behave like backend calls.

The store should:

- import the JSON files from `src/data`;
- validate them with existing Zod schemas;
- clone initial data into mutable in-memory state;
- expose read selectors;
- expose mutation functions;
- return Promises so TanStack Query continues to work;
- optionally simulate a small delay for loading states.

### Initial state

JSON files are the seed data. The runtime store is the current session state.

```text
JSON files
  → validated initial state
  → in-memory local store
  → query results
```

Use cloning when initializing the store so imported JSON is never mutated directly.

### Persistence decision

The first version may use in-memory state only. In that case, edits reset on browser refresh.

If edits must survive refreshes, add persistence later using `localStorage` or IndexedDB. The browser should not write directly to JSON files.

## Module 3 — Replace API Adapter Implementations

### Objective

Keep the public adapter methods but replace their `fetch()` calls with local store calls.

The following adapter modules should remain:

- `src/lib/api/session.ts`
- `src/lib/api/candidates.ts`
- `src/lib/api/companies.ts`
- `src/lib/api/jobs.ts`
- `src/lib/api/records.ts`
- `src/lib/api/resumes.ts`
- `src/lib/api/applications.ts`
- `src/lib/api/documents.ts`
- `src/lib/api/inbox.ts`
- `src/lib/api/analytics.ts`
- `src/lib/api/agents.ts`
- `src/lib/api/team.ts`

Their function names and return types should remain stable.

Example target behavior:

```text
candidatesApi.byId(id)
  → localDataStore.getCandidate(id)
  → CandidateSchema validation
  → Promise<Candidate>
```

This means components and hooks do not need to be rewritten.

## Module 4 — Implement Read Operations

The local store must support the existing read behavior.

| Domain | Required behavior |
|---|---|
| Session | Return the current firm and user session |
| Candidates | List candidates and retrieve one by ID |
| Companies | List companies and retrieve one by ID |
| Jobs | List jobs with `limit` and `offset`; retrieve one by ID |
| Records | Retrieve a candidate record |
| Resumes | List all, list by candidate, retrieve one by ID |
| Applications | List all, filter by candidate, retrieve one by ID |
| Follow-ups | List all, filter by assigned user |
| Documents | List documents by candidate |
| Inbox | Return the candidate inbox and messages |
| Ledger | Return ledger entries with pagination |
| Team | Return users |
| Agents | Return deterministic local rewrite or tailoring results |

All returned data should pass through the existing schemas in `src/lib/schemas`.

## Module 5 — Implement Local Mutations

JSON itself is static, so mutations must update the in-memory store.

### Candidate updates

Replace the current MSW `PATCH /api/candidates/:id` behavior with a local function that:

- validates the patch with `UpdateCandidateSchema`;
- finds the candidate by ID;
- applies the patch;
- updates `updatedAt`;
- returns the updated candidate.

### Application status updates

Replace the current MSW status handler with a local function that:

- validates the status update;
- changes the application status;
- appends an application event;
- updates response, interview, offer, or closed timestamps;
- returns the updated application.

### Document uploads and removals

The current upload is metadata-only. The local store should:

- validate document metadata;
- create a local document ID;
- add the document to the in-memory list;
- support removal by ID.

Actual file bytes are not currently stored by this application.

### Inbox connection and read state

The local store should maintain:

- connected candidate mailbox IDs;
- connection timestamps;
- message read state.

The existing `Set` used by the MSW handler should become an array in JSON and a `Set` or lookup map in runtime memory.

### Resume editing

Resume studio edits are already handled by the Zustand studio store. They do not currently need a backend replacement unless resume edits must be persisted across refreshes.

## Module 6 — Replace Agent Mock Behavior

The agent endpoints are not normal JSON reads because they accept user input.

Keep local deterministic functions for:

- rewrite actions;
- resume tailoring;
- simulated latency;
- simulated failures;
- `UNVERIFIED` generated claims.

Move this behavior out of MSW handlers into a local agent adapter or `src/lib/local-data/agents.ts`.

No LLM or external service should be called.

## Module 7 — Remove MSW and Fetch

After all adapters use the local data store:

1. Remove the MSW startup effect from `src/app/providers.tsx`.
2. Delete `src/mocks/browser.ts`.
3. Delete `src/mocks/server.ts`.
4. Delete `src/mocks/handlers/`.
5. Remove `public/mockServiceWorker.js`.
6. Remove the `msw` dependency from `package.json`.
7. Remove the `msw` configuration from `package.json`.
8. Remove or replace `src/lib/api/client.ts` if no adapters use it anymore.
9. Remove MSW-specific comments and environment variables from the documentation.

Do not delete the typed adapter directory. It remains the boundary between the UI and data source.

## Module 8 — Update Direct Fixture Imports

The UI should not import fixtures directly.

Update these known direct imports:

- `src/app/(app)/design-system/page.tsx`
- `src/lib/derive/derive.test.ts`

Tests should import the JSON-backed data store or dedicated test data instead of importing deleted fixture modules.

## Module 9 — Loading, Error, and Empty States

The UI already expects asynchronous queries and error states.

The local adapters should continue returning Promises and should preserve:

- loading states;
- empty results;
- not-found errors;
- validation errors;
- mutation errors;
- optional simulated latency.

This allows the existing skeleton and error components to continue working after MSW is removed.

## Module 10 — Validation and Testing

Run the following after migration:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Verify manually:

- dashboard data loads from JSON;
- candidate list and detail pages work;
- job pagination works;
- application filtering works;
- application status changes update the UI;
- candidate edits update the UI;
- document metadata can be added and removed;
- inbox connect, disconnect, and mark-read work;
- agent actions still return local results;
- refresh behavior is documented;
- no request is sent to `/api/*`;
- no MSW worker starts;
- no component imports a fixture directly.

## Definition of Done

- [ ] All runtime data comes from JSON seed files.
- [ ] No backend server is required to run the app.
- [ ] No MSW dependency remains.
- [ ] No `fetch('/api/...')` calls remain in the data flow.
- [ ] Existing TanStack Query hooks still work.
- [ ] Existing UI components do not need domain-level rewrites.
- [ ] JSON is validated through Zod schemas.
- [ ] Local mutations work during the current browser session.
- [ ] Derived statistics remain computed in `src/lib/derive`.
- [ ] Agent behavior remains local and deterministic.
- [ ] Tests, lint, typecheck, and build pass.

## Future Backend Replacement

When a real backend is introduced later, only the adapter implementation should change again:

```text
Current:
API adapter → local data store → JSON

Future:
API adapter → real backend
```

The components, hooks, schemas, and derived calculations should remain unchanged.
