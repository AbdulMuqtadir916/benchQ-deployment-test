# BenchQ Hooks and API Adapters Report

## 1. Report scope

This report documents the custom hooks, Zustand store hooks, data hooks, feature hooks, and API adapter modules currently used by BenchQ.

There is no top-level `src/hooks` directory in this project. The hooks are organized in two main places:

- `src/lib/hooks/` — reusable data and application hooks.
- `src/components/` — feature-specific hooks colocated with the feature that owns them.

The report also covers the Zustand stores because `useSession`, `useUiStore`, and `useStudio` are hook-based state APIs used throughout the application.

React built-in hooks such as `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, and `useReducer` are used inside many components. They are not listed individually because they are implementation primitives rather than BenchQ-specific hooks. Their use is described where it is important to a custom hook's behavior.

## 2. Current data flow

```text
JSON seed files in src/data/
        |
        v
src/lib/local-data/store.ts
        |
        v
API adapter modules in src/lib/api/
        |
        v
TanStack Query hooks in src/lib/hooks/
        |
        v
Pages and feature components
        |
        v
BenchQ UI
```

The migrated runtime no longer uses MSW or backend HTTP requests for these data flows. The JSON files are imported into the local store, validated with Zod schemas, and copied into an in-memory state object. API adapters provide a stable interface between that store and the hooks.

## 3. Query system used by the hooks

### `src/lib/query/provider.tsx`

This file creates the application-wide TanStack Query client.

Responsibilities:

- Provides `QueryClientProvider` to the application.
- Gives queries a default `staleTime` of 30 seconds.
- Keeps unused query data for 5 minutes with `gcTime`.
- Disables refetching when the browser window regains focus.
- Retries normal query failures up to two times.
- Does not retry mutations.
- Does not retry errors with the `SCHEMA_MISMATCH` API error code.
- Enables React Query Devtools in development.

Every hook using `useQuery`, `useMutation`, or `useQueryClient` depends on this provider being mounted by the application providers.

## 4. Data hooks in `src/lib/hooks`

## 4.1 `src/lib/hooks/use-applications.ts`

This file manages applications and follow-up tasks.

### `useApplications(candidateId?: string)`

- Uses `useQuery`.
- Query key: `["applications", { candidateId }]`.
- Calls `applicationsApi.list()`.
- When `candidateId` is provided, only applications for that candidate are returned.
- When no candidate ID is provided, it returns the full application list.
- Used by dashboards, applications, jobs, candidates, outreach, analytics, focus mode, and the candidate workspace.

### `useApplication(id: string)`

- Uses `useQuery`.
- Query key: `["application", id]`.
- Calls `applicationsApi.byId(id)`.
- The query is disabled until an ID is available.
- Used by the application detail page.

### `useFollowups(userId?: string)`

- Uses `useQuery`.
- Query key: `["followups", { userId }]`.
- Calls `followupsApi.list()`.
- Can return all follow-ups or only follow-ups assigned to a particular user.
- Used by follow-up pages, dashboards, application boards, and candidate workspaces.

### `useUpdateApplicationStatus()`

- Uses `useMutation`.
- Calls `applicationsApi.updateStatus(id, { status, note })`.
- Performs an optimistic update against every cached `applications` list.
- Saves the previous lists so the cache can be restored if the mutation fails.
- Invalidates both the application list and the individual application query after completion.
- Used when an application moves between pipeline stages.

### Application data flow

```text
useApplications / useApplication / useFollowups
        -> applicationsApi or followupsApi
        -> localData.applications or localData.followups
        -> JSON-seeded in-memory state
```

## 4.2 `src/lib/hooks/use-candidates.ts`

This file manages candidate lists, candidate detail data, and candidate updates.

### `useCandidates()`

- Uses `useQuery`.
- Query key: `["candidates"]`.
- Calls `candidatesApi.list()`.
- Used by candidate lists, dashboards, jobs, applications, analytics, resumes, outreach, focus mode, the command palette, and new-resume creation.

### `useCandidate(id: string)`

- Uses `useQuery`.
- Query key: `["candidate", id]`.
- Calls `candidatesApi.byId(id)`.
- Disabled when the ID is empty.
- Used by candidate detail pages, application details, resume studio, and the candidate workspace.

### `useUpdateCandidate(id: string)`

- Uses `useMutation`.
- Accepts an `UpdateCandidate` patch.
- Calls `candidatesApi.update(id, patch)`.
- On success, updates the individual candidate cache immediately.
- Invalidates the full candidate list so list views receive the updated data.
- Used by the candidate overview submission-facts editor.

### Candidate data flow

```text
useCandidates / useCandidate / useUpdateCandidate
        -> candidatesApi
        -> localData.candidates
        -> src/data/candidates.json seed data
```

## 4.3 `src/lib/hooks/use-companies.ts`

This file provides company query hooks.

### `useCompanies()`

- Uses `useQuery`.
- Query key: `["companies"]`.
- Calls `companiesApi.list()`.
- Provides all companies.

### `useCompany(id: string)`

- Uses `useQuery`.
- Query key: `["company", id]`.
- Calls `companiesApi.byId(id)`.
- Disabled until an ID exists.

The adapter and hooks are available for company-backed screens. At the time of this report, the repository has fewer direct consumers of these two hooks than the candidate, job, and application hooks.

## 4.4 `src/lib/hooks/use-documents.ts`

This file manages candidate documents.

### `useCandidateDocuments(candidateId: string)`

- Uses `useQuery`.
- Query key: `["documents", candidateId]`.
- Calls `documentsApi.byCandidate(candidateId)`.
- Disabled until a candidate ID exists.
- Used by the candidate workspace and documents tab.

### `useUploadDocument(candidateId: string)`

- Uses `useMutation`.
- Accepts an `UploadDocument` body.
- Calls `documentsApi.upload(candidateId, body)`.
- On success, prepends the new document to the cached candidate document list.
- Used by the candidate document upload component.

### `useRemoveDocument(candidateId: string)`

- Uses `useMutation`.
- Accepts a document ID.
- Calls `documentsApi.remove(id)`.
- Immediately removes the document from the candidate cache in `onMutate`.
- Invalidates the candidate document query after the operation settles.
- Used by the candidate documents tab.

## 4.5 `src/lib/hooks/use-inbox.ts`

This file manages candidate mailbox connection state and messages.

### `useCandidateInbox(candidateId: string)`

- Uses `useQuery`.
- Query key: `["inbox", candidateId]`.
- Calls `inboxApi.byCandidate(candidateId)`.
- Disabled until a candidate ID exists.
- Returns connection information and candidate messages.

### `useConnectMailbox(candidateId: string)`

- Uses `useMutation`.
- Calls `inboxApi.connect(candidateId)`.
- Replaces the cached inbox with the returned connected inbox.
- The local adapter simulates the initial mailbox hand-off delay.

### `useDisconnectMailbox(candidateId: string)`

- Uses `useMutation`.
- Calls `inboxApi.disconnect(candidateId)`.
- Replaces the cached inbox with the disconnected result.

### `useMarkRead(candidateId: string)`

- Uses `useMutation`.
- Accepts a message ID.
- Calls `inboxApi.markRead(messageId)`.
- Immediately marks that message as read in the cached candidate inbox.

## 4.6 `src/lib/hooks/use-jobs.ts`

This file manages job list and job detail data.

### `useJobs(params?: { limit?: number; offset?: number })`

- Uses `useQuery`.
- Query key: `["jobs", params]`.
- Calls `jobsApi.list(params)`.
- Supports pagination-style limit and offset values.
- Used by jobs, dashboards, analytics, focus mode, command search, and the candidate workspace.

### `useJob(id: string)`

- Uses `useQuery`.
- Query key: `["job", id]`.
- Calls `jobsApi.byId(id)`.
- Disabled until a job ID exists.
- Used by job details and application details.

## 4.7 `src/lib/hooks/use-keyboard-shortcuts.ts`

### `useGlobalShortcuts()`

This is a browser interaction hook rather than a data hook.

It registers a global `keydown` listener and cleans it up when the component unmounts.

Supported shortcuts:

- `Cmd/Ctrl + K` opens the command palette.
- `Escape` closes the command palette and keyboard hint sheet.
- `?` opens the keyboard hint sheet.
- `g` followed by `d` navigates to the dashboard.
- `g` followed by `c` navigates to candidates.
- `g` followed by `j` navigates to jobs.
- `g` followed by `a` navigates to applications.
- `g` followed by `f` navigates to follow-ups.

The hook ignores character shortcuts while focus is inside an input, textarea, select, or contenteditable element. It uses the UI Zustand store for opening and closing overlays and Next navigation for route changes.

It is mounted by `src/components/layout/app-shell.tsx`.

## 4.8 `src/lib/hooks/use-ledger.ts`

### `useLedger(params?: { limit?: number; offset?: number })`

- Uses `useQuery`.
- Query key: `["ledger", params]`.
- Calls `ledgerApi.list(params)` from `src/lib/api/analytics.ts`.
- Used by the ledger page.

The file is named `use-ledger.ts`, while the adapter is located in `analytics.ts` because the ledger is part of the analytics/data reporting boundary.

## 4.9 `src/lib/hooks/use-records.ts`

### `useRecord(candidateId: string)`

- Uses `useQuery`.
- Query key: `["record", candidateId]`.
- Calls `recordsApi.byCandidate(candidateId)`.
- Disabled until a candidate ID exists.
- Used by candidate workspaces and resume studio flows.

Records contain the source evidence used when building or reviewing resumes.

## 4.10 `src/lib/hooks/use-resumes.ts`

This file provides resume list, candidate resume, and resume detail queries.

### `useAllResumes()`

- Uses `useQuery`.
- Query key: `["resumes"]`.
- Calls `resumesApi.list()`.
- Used by the resume library page.

### `useResumes(candidateId: string)`

- Uses `useQuery`.
- Query key: `["resumes", candidateId]`.
- Calls `resumesApi.byCandidate(candidateId)`.
- Disabled until a candidate ID exists.
- Used by application details and candidate workspaces.

### `useResume(id: string)`

- Uses `useQuery`.
- Query key: `["resume", id]`.
- Calls `resumesApi.byId(id)`.
- Disabled until a resume ID exists.
- Used when opening an existing resume in the resume studio.

## 4.11 `src/lib/hooks/use-team.ts`

### `useTeam()`

- Uses `useQuery`.
- Query key: `["team"]`.
- Calls `teamApi.list()`.
- Used by dashboards, analytics, settings, application boards, application detail, candidate pages, and candidate workspace derivations.

The returned users are used to resolve owner names, team information, and role-based displays.

## 5. Feature hooks in `src/components`

## 5.1 `src/components/app/ai/use-agent-run.ts`

### `useAgentRun(stageCount, options?)`

This hook controls the visual lifecycle of an AI-style operation. It does not call an LLM by itself.

Returned state and actions:

- `activeStage` — current stage index.
- `status` — `idle`, `running`, `complete`, or `fallback`.
- `elapsedMs` — elapsed run time.
- `start()` — begins the staged run.
- `reset()` — cancels timers and returns to idle.

Behavior:

- Creates a timer for each stage.
- Updates the active stage as timers complete.
- Uses a configurable fallback rate, defaulting to 5%.
- Tracks elapsed time with an interval.
- Clears timers and intervals on reset or unmount.

Used by:

- `src/components/app/resume-studio/tailor-run.tsx`.
- `src/app/(app)/jobs/[id]/page.tsx`.

The hook simulates the progress presentation. The actual local agent adapter is in `src/lib/api/agents.ts` and `src/lib/local-data/agents.ts`.

## 5.2 `src/components/app/candidate/use-candidate-workspace.ts`

### `useCandidateWorkspace(candidateId: string)`

This is the composition hook for the candidate detail screen. It loads most of the data needed by the candidate tabs and derives shared values in one place.

Queries composed by this hook:

- `useCandidate`
- `useApplications`
- `useRecord`
- `useResumes`
- `useJobs`
- `useCandidateInbox`
- `useCandidateDocuments`
- `useFollowups`
- `useTeam`

Derived values:

- Application status lookup by application ID.
- Inbox suggestions that can move an application to a new status.
- Pending and snoozed follow-ups related to this candidate.
- Upcoming interview or call events.
- Latest inbox signal for each application.
- Unread inbox count, excluding confirmation messages.
- Candidate statistics from `deriveCandidateStats`.
- Documents expiring within 60 days.
- The master resume and its export gate.
- Total and verified claim counts.
- Candidate owner and team-name lookup helpers.

The hook returns both the original query objects and the derived workspace data so child tabs can share one consistent data source.

## 5.3 `src/components/app/resume-studio/use-doc-actions.ts`

### `useDocActions()`

This hook provides a stable action object for editing the resume studio document.

It connects the resume editor to `useStudio` and `src/lib/resume-doc/ops.ts`.

Actions provided:

- `setTop` — edits top-level fields such as name and title.
- `patch` — partially updates a list entry.
- `add` — adds a structured list entry.
- `remove` — removes a list entry.
- `move` — moves an entry up or down.
- `setClaimHtml` — changes rich claim HTML.
- `setClaimState` — marks a claim verified, unverified, or another supported state.
- `addBullet` — adds a bullet to an experience entry.
- `removeBullet` — removes an experience bullet.

The returned object is memoized so editor components can use the same action interface in builder mode, viewer mode, paper preview, and the selection toolbar.

## 5.4 `src/components/app/resume-studio/open-resume.tsx`

### `useCloseStudio()`

Returns a navigation callback for closing the resume studio.

- Goes back in browser history when possible.
- Falls back to `/resumes` for a direct visit.

### `OpenResume`

`OpenResume` is a component that uses multiple hooks to load an existing resume:

- `useSession` for permissions.
- `useCloseStudio` for navigation.
- `useResume` for the resume record.
- `useCandidate` for the linked candidate.
- `useRecord` for source evidence.
- `useStudio` for loading the built document and setting the mode.

After all three queries are ready, it calls `buildResumeDocument`. When review mode is enabled, it finds the first blocking claim and asks the studio store to focus it.

## 5.5 `src/components/app/resume-studio/tailor-run.tsx`

### `useTailorRun()`

This hook combines `useAgentRun` with the resume studio store.

When the staged run completes, it:

- Creates an AI-tailored summary.
- Creates draft experience bullets.
- Marks new content as `UNVERIFIED`.
- Adds content to the active resume document.
- Opens the summary and experience sections.
- Expands the first experience entry.
- Flashes the first new claim.
- Shows an AI notification.

It returns:

- `isRunning`.
- `start()`.
- A rendered progress panel.

This hook is intentionally a local UX flow. It does not currently call `agentsApi.tailorResume`; the direct adapter is used by the development showcase described below.

## 5.6 `src/components/app/resume-studio/print-export.tsx`

### `usePrintExport(doc)`

This hook handles browser print-to-PDF export.

Behavior:

- Tracks whether printing is active.
- Temporarily changes the document title.
- Renders a clean `ResumePaper` copy through a portal into `document.body`.
- Calls `window.print()` on the next animation frame.
- Restores the document title and removes the print state.

It returns:

- `print()` to start printing.
- `portal`, which the parent renders into the page.

## 5.7 `src/components/command/command-palette.tsx`

### `useCommandPalette()`

This is a small convenience hook that exposes the command palette open and close actions from `useUiStore`.

The main `CommandPalette` component additionally uses:

- `useCandidates` to create dynamic candidate commands.
- `useJobs` to create dynamic job commands.
- `useRouter` for navigation.
- `useState` for the search text and active command.
- `useMemo` to filter and group commands.

Static commands include navigation and creation actions. Dynamic commands are generated from the current local data and route to candidate or job detail pages.

## 5.8 `src/components/app/jobs/job-match-intro.tsx`

### `useMatchStats(candidate, jobs, applications)`

This is a file-local hook used by `JobMatchIntro`.

It derives:

- Number of active, non-duplicate jobs.
- Jobs eligible for the candidate's work authorization.
- Jobs the candidate has already applied to.
- Number of strong matches with a score of 70 or higher.
- Highest-scoring eligible job.

It uses `deriveMatchScore` and memoizes the result from the candidate, jobs, and applications inputs.

## 6. Zustand store hooks

## 6.1 `src/lib/stores/session-store.ts`

### `useSession`

This Zustand hook stores the current demo session and active role.

State includes:

- Current user.
- Current firm.
- `setRole(role)` for changing the active demo role.

The supported roles are `OWNER`, `MANAGER`, `BDE`, and `VIEWER`.

The role switcher and many page-level permission checks use this store.

Important distinction: `src/lib/api/session.ts` exposes a JSON-backed `sessionApi.current()` adapter, but the current UI commonly reads from `useSession` directly. The store still initializes from its `DEFAULT_USER` and `DEFAULT_FIRM` constants rather than calling `sessionApi`. If the session name or firm name should be controlled by JSON everywhere, this store is one of the remaining places to connect to the local data adapter.

## 6.2 `src/lib/stores/ui-store.ts`

### `useUiStore`

This Zustand hook controls global UI state.

State and actions include:

- Sidebar collapsed state.
- Sidebar toggle and setter.
- Table density: compact, default, or comfortable.
- Command palette open and close state.
- Keyboard hint sheet open and close state.
- Hydration status.

Sidebar collapse and density are persisted manually in `localStorage` using safe read and write helpers. The command palette and hint sheet states are session-only UI state.

## 6.3 `src/components/app/resume-studio/studio-store.ts`

### `useStudio`

This Zustand hook owns the active resume studio session.

State includes:

- Active resume document.
- Build or view mode.
- Zoom level.
- Template gallery state.
- Open resume sections.
- Open experience/list entries.
- Last saved timestamp.
- Page count.
- Current notice.
- Recently changed claim ID.
- Focus request for a claim.

Actions include:

- `load` a resume document.
- `setMode` between build and view.
- `update` the document through an immutable updater function.
- `setTemplate`.
- `setZoom`.
- `setGalleryOpen`.
- `toggleSection` and `toggleEntry`.
- `jumpToClaim`.
- `flash` a claim temporarily.
- `requestFocus` on a claim.
- `setPageCount`.
- `notify` with info, AI, or danger tone.

This store is local editor state. It is separate from the JSON data store and does not persist resume edits back into `src/data/resumes.json`.

## 7. API adapter modules in `src/lib/api`

API adapters are intentionally thin. Their purpose is to give pages and hooks one stable interface. The current implementation delegates to `localData` or `localAgents`. A future real backend can replace the adapter internals without forcing every component to change.

## 7.1 `src/lib/api/client.ts`

This file no longer contains a fetch client.

### `ApiError`

Shared error class containing:

- Human-readable message.
- Application error code.
- Numeric status.

The local data store uses it for not-found and session errors. TanStack Query can then handle adapter errors consistently.

### `arrayOf(schema)`

A small Zod helper that creates an array schema. It is used while parsing JSON seed files in the local data store.

## 7.2 `src/lib/api/agents.ts`

Exports `agentsApi`.

### `agentsApi.rewrite(input, signal?)`

- Delegates to `localAgents.rewrite`.
- Accepts rewrite text and an action such as improve, concise, quantify, or grammar.
- Supports `AbortSignal`.
- Returns a `RewriteResult`.

### `agentsApi.tailorResume(input, signal?)`

- Delegates to `localAgents.tailorResume`.
- Accepts a resume version ID and job ID.
- Supports `AbortSignal`.
- Returns an `AgentDraft` with stages and unverified claims.

Consumers:

- `src/components/app/resume-studio/selection-toolbar.tsx` calls `rewrite`.
- `src/components/dev/stage-one-showcase.tsx` calls `tailorResume`.

The actual deterministic behavior is implemented in `src/lib/local-data/agents.ts`, including simulated delays and unverified AI notes.

## 7.3 `src/lib/api/analytics.ts`

Exports `ledgerApi`.

### `ledgerApi.list(params?)`

- Accepts optional `limit` and `offset`.
- Delegates to `localData.ledger.list(params)`.
- Returns `LedgerEntry[]`.
- Consumed by `useLedger`.

Other dashboard analytics are currently derived from candidate, job, and application data through files under `src/lib/derive/` rather than through separate API adapter methods.

## 7.4 `src/lib/api/applications.ts`

Exports `applicationsApi` and `followupsApi`.

### `applicationsApi.list(params?)`

- Optional filter: `candidateId`.
- Delegates to `localData.applications.list`.
- Returns `Application[]`.

### `applicationsApi.byId(id)`

- Delegates to `localData.applications.byId`.
- Returns one `Application`.

### `applicationsApi.updateStatus(id, body)`

- Validates the status update in the local store.
- Adds an application event.
- Updates status and relevant timestamps.
- Returns the updated application.

### `followupsApi.list(params?)`

- Optional filter: assigned user ID.
- Delegates to `localData.followups.list`.
- Returns `FollowUpTask[]`.

## 7.5 `src/lib/api/candidates.ts`

Exports `candidatesApi`.

### `candidatesApi.list()`

- Delegates to `localData.candidates.list`.
- Returns all candidates.

### `candidatesApi.byId(id)`

- Delegates to `localData.candidates.byId`.
- Returns one candidate or an `ApiError` with `NOT_FOUND`.

### `candidatesApi.update(id, body)`

- Delegates to `localData.candidates.update`.
- Validates the patch with `UpdateCandidateSchema`.
- Updates the candidate's `updatedAt` value.
- Returns the validated updated candidate.

## 7.6 `src/lib/api/companies.ts`

Exports `companiesApi`.

### `companiesApi.list()`

- Delegates to `localData.companies.list`.
- Returns all companies.

### `companiesApi.byId(id)`

- Delegates to `localData.companies.byId`.
- Returns one company or a not-found error.

## 7.7 `src/lib/api/documents.ts`

Exports `documentsApi`.

### `documentsApi.byCandidate(candidateId)`

- Delegates to `localData.documents.byCandidate`.
- Returns documents belonging to one candidate.

### `documentsApi.upload(candidateId, body)`

- Validates the upload body.
- Creates a local document ID.
- Adds upload time and current user information.
- Creates a local share URL.
- Adds the document to the in-memory store.

### `documentsApi.remove(id)`

- Removes a document from the in-memory store.
- Returns the removed document.
- Throws an `ApiError` if the document does not exist.

## 7.8 `src/lib/api/inbox.ts`

Exports `inboxApi`.

### `inboxApi.byCandidate(candidateId)`

- Delegates to the local inbox projection.
- Returns a mailbox connection and candidate messages.
- Returns an empty/disconnected inbox when no connection exists.

### `inboxApi.connect(candidateId)`

- Validates that the candidate exists.
- Waits for a simulated mailbox connection delay.
- Adds a connection timestamp.
- Returns the connected inbox.

### `inboxApi.disconnect(candidateId)`

- Removes the candidate's connection state.
- Returns the disconnected inbox.

### `inboxApi.markRead(messageId)`

- Finds the message in the local message list.
- Sets `isRead` to `true`.
- Returns the updated message.

## 7.9 `src/lib/api/jobs.ts`

Exports `jobsApi`.

### `jobsApi.list(params?)`

- Supports optional `limit` and `offset`.
- Delegates to `localData.jobs.list`.
- Returns a sliced list of jobs.

### `jobsApi.byId(id)`

- Delegates to `localData.jobs.byId`.
- Returns one job or a not-found error.

## 7.10 `src/lib/api/records.ts`

Exports `recordsApi`.

### `recordsApi.byCandidate(candidateId)`

- Delegates to `localData.records.byCandidate`.
- Returns the candidate's source record.
- The record is used by candidate pages and resume creation/opening flows.

## 7.11 `src/lib/api/resumes.ts`

Exports `resumesApi`.

### `resumesApi.list()`

- Delegates to `localData.resumes.list`.
- Returns all resumes.

### `resumesApi.byCandidate(candidateId)`

- Filters the local resume list by candidate ID.
- Used in candidate and application views.

### `resumesApi.byId(id)`

- Returns one resume for the resume studio.
- Throws a not-found `ApiError` if the ID is unknown.

Resume editing inside the studio is currently local studio state. The adapter reads the initial resume, but the studio does not yet write edits back to the JSON-backed store.

## 7.12 `src/lib/api/session.ts`

Exports `sessionApi`.

### `sessionApi.current()`

- Delegates to `localData.session()`.
- Returns the current user, firm, seat counts, and candidate counts.
- The local store builds this response from `firm.json` and the other loaded JSON collections.

This adapter exists, but the main UI currently uses `useSession` from the Zustand session store for immediate role switching and permission checks.

## 7.13 `src/lib/api/team.ts`

Exports `teamApi`.

### `teamApi.list()`

- Delegates to `localData.team()`.
- Returns the users loaded from `src/data/firm.json`.
- Used by `useTeam` for owner names, team lists, and role-related displays.

## 8. Local data implementation behind the adapters

### `src/lib/local-data/store.ts`

This is the current replacement for the old MSW/backend-like data layer.

It imports these JSON files:

- `src/data/firm.json`
- `src/data/candidates.json`
- `src/data/companies.json`
- `src/data/jobs.json`
- `src/data/records.json`
- `src/data/resumes.json`
- `src/data/applications.json`
- `src/data/followups.json`
- `src/data/documents.json`
- `src/data/inbox.json`
- `src/data/ledger.json`

At module initialization it:

1. Parses the JSON through the matching Zod schemas.
2. Copies the result into mutable in-memory state.
3. Creates connection timestamps for initially connected inboxes.
4. Exposes read and mutation methods.

### `src/lib/local-data/delay.ts`

Provides the asynchronous behavior used by the local adapters.

- `wait` simulates latency and supports cancellation.
- `localResult` waits and returns a structured clone of the value.
- The default local delay is short and can be adjusted with `NEXT_PUBLIC_LOCAL_DATA_DELAY_MS`.

### `src/lib/local-data/agents.ts`

Contains the deterministic local replacement for the previous AI fixture behavior.

- Rewrites text for improve, concise, quantify, and grammar actions.
- Produces review notes for each action.
- Produces resume tailoring drafts with `UNVERIFIED` claims.
- Supports cancellation through `AbortSignal`.

## 9. Adapter and hook mapping table

| Hook file | Hook | Adapter | Local data source |
| --- | --- | --- | --- |
| `src/lib/hooks/use-applications.ts` | `useApplications`, `useApplication`, `useUpdateApplicationStatus` | `applicationsApi` | `applications.json` |
| `src/lib/hooks/use-applications.ts` | `useFollowups` | `followupsApi` | `followups.json` |
| `src/lib/hooks/use-candidates.ts` | `useCandidates`, `useCandidate`, `useUpdateCandidate` | `candidatesApi` | `candidates.json` |
| `src/lib/hooks/use-companies.ts` | `useCompanies`, `useCompany` | `companiesApi` | `companies.json` |
| `src/lib/hooks/use-documents.ts` | `useCandidateDocuments`, `useUploadDocument`, `useRemoveDocument` | `documentsApi` | `documents.json` |
| `src/lib/hooks/use-inbox.ts` | `useCandidateInbox`, `useConnectMailbox`, `useDisconnectMailbox`, `useMarkRead` | `inboxApi` | `inbox.json` plus connection state |
| `src/lib/hooks/use-jobs.ts` | `useJobs`, `useJob` | `jobsApi` | `jobs.json` |
| `src/lib/hooks/use-ledger.ts` | `useLedger` | `ledgerApi` | `ledger.json` |
| `src/lib/hooks/use-records.ts` | `useRecord` | `recordsApi` | `records.json` |
| `src/lib/hooks/use-resumes.ts` | `useAllResumes`, `useResumes`, `useResume` | `resumesApi` | `resumes.json` |
| `src/lib/hooks/use-team.ts` | `useTeam` | `teamApi` | `firm.json` users |
| `src/components/app/ai/use-agent-run.ts` | `useAgentRun` | None directly | Local timers |
| `src/components/app/resume-studio/selection-toolbar.tsx` | Component-level flow | `agentsApi.rewrite` | Local agent logic |
| `src/components/app/resume-studio/tailor-run.tsx` | `useTailorRun` | None directly | Local resume studio state |
| `src/components/app/resume-studio/open-resume.tsx` | `useCloseStudio` and `OpenResume` flow | `resumesApi`, `candidatesApi`, `recordsApi` through hooks | Resume, candidate, and record JSON |

## 10. What happens when JSON changes

For data that is loaded through an adapter and hook:

1. Change a valid value in the relevant file under `src/data/`.
2. Restart the development server if the module is not hot-reloaded.
3. Refresh the page.
4. The local store validates and loads the updated JSON.
5. The corresponding adapter returns the updated value.
6. The React Query hook exposes the updated value to the UI.

Example:

```text
src/data/candidates.json
        -> localData.candidates.list()
        -> candidatesApi.list()
        -> useCandidates()
        -> candidate page or dashboard
```

If a UI value is owned by a Zustand store or hardcoded in a component, changing JSON will not automatically change it. The most important current example is the demo session: `useSession` uses `DEFAULT_USER` and `DEFAULT_FIRM`, while `sessionApi.current()` is JSON-backed but not the primary session hook.

## 11. Current limitations and next migration opportunities

- Local mutations are in memory and reset after a full page or server restart.
- Resume studio edits update `useStudio`, not `src/data/resumes.json`.
- `useSession` still initializes from hardcoded defaults instead of loading through `sessionApi`.
- Some feature simulations, such as the staged AI theatre in `useAgentRun`, intentionally use timers instead of a persistent service.
- Full repository lint still reports unrelated existing `any` errors in older UI files.

Recommended next steps if persistent local behavior is required:

1. Add a persistence layer using `localStorage` or IndexedDB around `localData`.
2. Connect `useSession` initialization to `sessionApi.current()` while preserving role switching.
3. Add a resume save adapter so studio edits can persist to the local data store.
4. Add focused tests for each adapter mutation and each important query cache update.

## 12. Complete file inventory

### Data hook files

- `src/lib/hooks/use-applications.ts`
- `src/lib/hooks/use-candidates.ts`
- `src/lib/hooks/use-companies.ts`
- `src/lib/hooks/use-documents.ts`
- `src/lib/hooks/use-inbox.ts`
- `src/lib/hooks/use-jobs.ts`
- `src/lib/hooks/use-keyboard-shortcuts.ts`
- `src/lib/hooks/use-ledger.ts`
- `src/lib/hooks/use-records.ts`
- `src/lib/hooks/use-resumes.ts`
- `src/lib/hooks/use-team.ts`

### Feature hook files

- `src/components/app/ai/use-agent-run.ts`
- `src/components/app/candidate/use-candidate-workspace.ts`
- `src/components/app/resume-studio/use-doc-actions.ts`
- `src/components/app/resume-studio/open-resume.tsx`
- `src/components/app/resume-studio/tailor-run.tsx`
- `src/components/app/resume-studio/print-export.tsx`
- `src/components/command/command-palette.tsx`
- `src/components/app/jobs/job-match-intro.tsx`

### Zustand hook files

- `src/lib/stores/session-store.ts`
- `src/lib/stores/ui-store.ts`
- `src/components/app/resume-studio/studio-store.ts`

### API adapter files

- `src/lib/api/client.ts`
- `src/lib/api/agents.ts`
- `src/lib/api/analytics.ts`
- `src/lib/api/applications.ts`
- `src/lib/api/candidates.ts`
- `src/lib/api/companies.ts`
- `src/lib/api/documents.ts`
- `src/lib/api/inbox.ts`
- `src/lib/api/jobs.ts`
- `src/lib/api/records.ts`
- `src/lib/api/resumes.ts`
- `src/lib/api/session.ts`
- `src/lib/api/team.ts`
