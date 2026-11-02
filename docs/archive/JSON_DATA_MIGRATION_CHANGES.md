# JSON Data Migration — Changes Made

## Overview

The application was changed from using MSW and backend-style API requests to using local JSON seed data with a local in-memory data store.

The existing frontend pages, components, hooks, and most data access interfaces were preserved so the UI can continue using the same workflows.

## Removed

### MSW runtime

- Removed `public/mockServiceWorker.js`.
- Removed `src/mocks/browser.ts`.
- Removed `src/mocks/server.ts`.
- Removed the MSW handler files.
- Removed the old generated fixture files.
- Removed MSW startup from `src/app/providers.tsx`.
- Removed the `msw` dependency from `package.json`.

### Backend-style runtime requests

- Removed runtime use of `fetch()` and the backend HTTP client from the API adapters.
- The frontend no longer depends on `/api/...` requests for the migrated data flows.

## Added

### JSON seed data

Initial application data is now stored in `src/data/` as JSON files:

- `applications.json`
- `candidates.json`
- `companies.json`
- `documents.json`
- `firm.json`
- `followups.json`
- `inbox.json`
- `jobs.json`
- `ledger.json`
- `records.json`
- `resumes.json`

These files are the starting dataset for the application. Updating a valid value in the relevant JSON file will update the corresponding data shown in the frontend after a reload.

### Local data store

Added `src/lib/local-data/store.ts`.

This module:

- Loads and validates the JSON data.
- Keeps the application data in memory while the app is running.
- Provides read operations for the existing application data.
- Provides mutation operations for supported user actions.
- Returns application-style errors for missing records.

### Local data helpers

Added `src/lib/local-data/delay.ts` to simulate a small asynchronous data delay.

Added `src/lib/local-data/agents.ts` to keep the local resume and AI-style rewrite behavior without using the old fixture implementation.

## Updated

All API adapters in `src/lib/api/` now use the local data modules instead of backend requests. This includes adapters for:

- Applications
- Candidates
- Companies
- Documents
- Inbox
- Jobs
- Records
- Resumes
- Session
- Team
- Analytics
- Agents

Supported local mutations include:

- Updating candidate information.
- Changing application status.
- Adding and removing documents.
- Connecting and disconnecting inbox data.
- Marking inbox messages as read.

## Current data flow

```text
JSON files in src/data/
        ↓
Local data store
        ↓
API adapters in src/lib/api/
        ↓
Existing hooks and frontend components
        ↓
Frontend UI
```

## Important current limitation

The local store is currently in memory. Changes made through the UI will work during the current session but will reset when the page or development server is restarted.

The JSON files provide the initial data. Persistent browser storage such as `localStorage` or IndexedDB has not yet been added.

## Verification completed

- TypeScript check passed.
- Vitest tests passed: 5 tests.
- Next production build passed.
- Lint passed for the changed migration files.

The full repository lint still contains unrelated existing `any` errors in older UI files.
