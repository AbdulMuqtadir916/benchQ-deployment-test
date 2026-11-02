# Jobs explorer redesign QA

## Comparison target

- Source visual truth:
  - `/var/folders/n1/830_38_x0p7cblj2qnzf70n80000gn/T/TemporaryItems/NSIRD_screencaptureui_kmJjtZ/Screenshot 2026-09-26 at 1.03.13 AM.png`
  - `/var/folders/n1/830_38_x0p7cblj2qnzf70n80000gn/T/TemporaryItems/NSIRD_screencaptureui_UhsvYO/Screenshot 2026-09-26 at 1.03.30 AM.png`
  - Browser Comment 1 attached candidate-overview capture with “Best new
    matches” selected.
- Implementation captures: in-app browser captures attached to this task from
  `cua://iab/tab/4` (`/jobs`) and `cua://iab/tab/6`
  (`/candidates/cand_01`, Jobs selected), plus `cua://iab/tab/9`
  (`/candidates/cand_01`, Overview selected).
- Source pixels: 2568 × 1498 and 2108 × 790; supplied comparison previews were
  normalized to 2048 × 1195 and 2048 × 768.
- Implementation viewport and pixels: 1512 × 785 CSS pixels at device scale 1.
- State: light theme, BDE role, expanded sidebar, first job selected; candidate
  comparison uses Rajesh Venkataraman with the Jobs tab selected.

## Full-view comparison evidence

The source establishes a dense master-detail job browser: a scrolling job
list, selected row, persistent job header, actions, source identity, and a
large preview region. The implementation reproduces that composition inside
BenchQ's existing frosted shell and opaque workspace. Per the latest annotated
review, the standalone Jobs page keeps its search and matching controls above
the browser while removing the toolbar's background, border, padding, radius,
and shadow. The right pane uses
a reliable source snapshot instead of an iframe that would be
blank for portals with `X-Frame-Options`; original listings remain one click
away in a new tab.

The candidate detail capture confirms the added Jobs tab uses the same
master-detail structure while filtering to profile-relevant roles, hiding
already-applied jobs, checking work authorization, and sorting by match score.

## Focused comparison evidence

- Header/actions: selected job title, company, location, work mode, rate,
  source, age, primary action, external action, and overflow menu are visible
  without competing with the page heading.
- Global header: the notification bell aligns with the existing Search and
  theme controls, keeps a compact unread badge, and opens a surfaced dropdown
  without changing the top-bar height.
- Job rows: portal logo, company, location, rate, source, freshness, optional
  match score ring, save, hide, and selected state remain readable at compact
  density. The ring keeps the score visible without competing with the title.
- Preview: source identity and URL sit above the job content; company favicon,
  description hierarchy, requirements, and direct source link are preserved.
- Portal assets: LinkedIn, Indeed, Dice, and Glassdoor use real brand assets;
  company-site rows use the company favicon with an icon fallback.

## Required fidelity surfaces

- **Fonts and typography:** BenchQ's Host Grotesk and JetBrains Mono are used
  intentionally instead of the reference serif. Heading, body, caption, and
  metadata hierarchy match the current design system without clipping.
- **Spacing and layout rhythm:** the list/detail split, compact 32px controls,
  fine dividers, 12px radii, inset preview, and internal pane scrolling retain
  the reference density while fitting the BenchQ frame.
- **Colors and visual tokens:** all surfaces, boundaries, text, semantic tags,
  selected rows, gradients, and shadows use existing BenchQ CSS tokens. Color
  is accompanied by text or icon labels.
- **Image quality and asset fidelity:** portal marks are true sourced assets,
  not text or CSS approximations. Company favicons are requested at 64px and
  rendered in compact 16–40px slots with an offline fallback.
- **Copy and content:** labels reflect bench-sales language: candidate context,
  match score, work mode, rate, work authorization, source, apply/tailor, and
  original listing.

## Primary interactions tested

- Selecting a job row updates the persistent detail and source preview panes.
- Job search narrowed the feed to Java roles and removed unrelated ServiceNow
  rows; clearing it restored the feed.
- The overflow menu opened and exposed copy-link, open-original, and hide-job
  actions.
- Candidate Jobs tab opened and showed profile-matched roles scored for Rajesh.
- Candidate Overview keeps “Best new matches” as the first right-rail card;
  all three visible rows loaded their company logos and retain working job links.
- Standalone `/jobs` was rechecked with its search/filter controls intact and
  the annotated toolbar surface chrome removed.
- Computed-style verification on the toolbar wrapper reports a transparent
  background, 0px border width and radius, no shadow, and 0px padding while all
  five controls remain rendered.
- Job-list match scores were rechecked at 1159 × 785: all 22 visible scores use
  a 32 × 32px circular, two-pixel semantic-color ring with centered numerals;
  the detail-pane score bar remains unchanged.
- The notification bell opened a 340px dropdown at 1159 × 785 with three
  relevant updates, readable timestamps, destination links, and an unobstructed
  “Mark all read” action. Marking all read updated the summary and removed the
  unread badge; reloading restored the initial prototype state.
- The Jobs-page `Capture job` action opens an in-context 760px modal, supports
  internal scrolling at the 1159 × 785 verification viewport, and closes via
  Cancel, close button, backdrop, or Escape.
- Entering a Dice URL automatically selected Dice as the source; the source,
  work-mode, employment, pay-period, eligibility, skills, and description
  controls remained keyboard accessible.
- Browser console checked on the refreshed `/jobs` tab and candidate-detail
  tabs: no errors.
- Candidate Inbox was rechecked at 1159 × 785: the Google connection state now
  shows the canonical multicolor Google mark in both its identity tile and CTA;
  both image instances loaded successfully and the connection flow remains
  available.
- Candidate Jobs was rechecked at 1159 × 785: the filter toolbar retains all
  four controls while its wrapper computes to a transparent background, 0px
  border, radius and padding, no shadow, and no match for the prior bordered
  selector.
- No Next.js runtime overlay was present.

## Findings and comparison history

- Earlier [P1] single-column feed did not provide the reference's persistent
  detail/source context. **Fix:** replaced it with a responsive master-detail
  explorer and internal scrolling.
- Earlier [P1] source identity used generic provenance labels. **Fix:** added
  real LinkedIn, Indeed, Dice, Glassdoor, and company-site branding in rows,
  filters, headers, and preview surfaces.
- Earlier [P2] candidate detail lacked a dedicated job-matching section.
  **Fix:** added a Jobs tab with profile score, work-auth, duplicate, and
  already-applied filtering.
- Earlier [P2] third-party pages could leave the right pane empty when embedding
  was blocked. **Fix:** render a structured source snapshot with a direct
  `Open original` action.
- Latest toolbar annotation [P2] requested removing the background container
  without removing its controls. **Fix:** the current route renders the complete
  `JobExplorer` toolbar with `toolbarBordered={false}`; the refreshed `/jobs`
  capture shows search and all matching filters intact without the outer
  background, border, padding, radius, or shadow. Candidate-profile toolbars
  retain their standard surfaced treatment.
- Latest `Capture job` annotation [P1] requested an in-context modal and more
  complete job intake. **Fix:** replaced the page-link action with a native modal
  trigger and added source URL/portal/reference, company, location, work mode,
  employment type, experience, compensation, eligibility, skills, and job
  description fields. A direct `/jobs/capture` fallback remains available.
- Latest match-score annotation [P2] requested a ring treatment in the job
  list. **Fix:** added a reusable `ring` variant to `MatchScore` and applied it
  only to job rows. Post-fix computed styles confirm a 32 × 32px circle with a
  two-pixel semantic-color border and centered score text.
- Latest top-bar annotation [P2] requested a notification option beside the
  utility controls. **Fix:** added a compact bell with unread count and an
  accessible, animated notification menu with relevant job, follow-up, and
  outreach updates, click-outside dismissal, Escape handling, and mark-all-read.
- Latest candidate-overview annotation [P2] requested that “Best new matches”
  stay at the top and include relevant logos. **Fix:** promoted the card to the
  first right-rail position and added favicon-backed company marks with the
  existing building fallback. Post-fix browser evidence confirms the card is
  first and all three logos loaded successfully.
- Latest candidate-inbox annotation [P2] requested Google identity on the
  account connection state. **Fix:** replaced the generic mail marks with the
  canonical multicolor Google logo while retaining an offline-safe fallback.
  Post-fix browser evidence confirms both marks loaded at their natural width,
  the connect action remains present, and the console is clear.
- Latest candidate-Jobs annotation [P2] requested removing the filter toolbar's
  background container. **Fix:** reused the existing borderless toolbar variant
  for the profile Jobs tab. Post-fix browser evidence confirms the search and
  three filters remain intact with no wrapper background, border, padding,
  radius, or shadow.
- Post-fix evidence: both screens render at 1512 × 785 with no actionable P0,
  P1, or P2 mismatch in the scoped implementation.

## Implementation checklist

- [x] Responsive master-detail Jobs layout.
- [x] Functional search, candidate, source, work-mode, score, and sort controls.
- [x] Selected, saved, hidden, menu-open, loading, and empty states.
- [x] Branded source identity and source preview.
- [x] Circular match-score indicators in job rows.
- [x] Functional top-bar notification menu with unread state.
- [x] Top-priority candidate matches card with company logos.
- [x] Google-branded candidate inbox connection state.
- [x] Borderless candidate Jobs filter toolbar.
- [x] Candidate-specific Jobs tab.
- [x] Responsive Capture job modal with complete intake fields and direct-page fallback.
- [x] Typecheck, scoped ESLint, browser interactions, runtime overlay, and console checks.

## Follow-up polish

- [P3] A future backend can persist saved/hidden state and supply captured HTML
  snapshots; the prototype currently keeps those interaction states in memory.

final result: passed
