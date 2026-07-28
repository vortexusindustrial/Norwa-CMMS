# Norwa CMMS — Frontend PRD

Status: living document, reflects `frontend/` as of 2026-07-28. This describes what the Vue 3 prototype currently implements, the requirements each screen is meant to satisfy, and the gaps that remain before it can run against a real Frappe/ERPNext backend.

## 1. Purpose and scope

The frontend is the field- and office-facing surface of Norwa CMMS: dashboards, asset registry, work order execution, procurement, cost reporting, and administration, for four roles (System Administrator, Maintenance Manager, Shift Supervisor, Field Technician). It is being built ahead of the Frappe backend app (`cmms_app`) as a clickable, role-aware prototype over static seed data, so that workflow and permission decisions can be validated before backend schema is locked in.

Out of scope for the frontend alone: DocType schema, server-side validation, ERPNext ledger postings, IoT telemetry ingestion, offline sync engine. Those are backend/`cmms_app` concerns per the root `README.md`.

## 2. Roles and access model

Four roles, defined in `frontend/src/permissions.js`:

| Role | Summary |
| --- | --- |
| System Administrator | Full platform control; only role with Administration access. |
| Maintenance Manager | Full asset/work order/BoM/procurement authority, approval rights. |
| Shift Supervisor | Scoped operational oversight — assignment, work order execution, limited procurement visibility. |
| Field Technician | Execution-only — assigned work, own labor log, material logging; no admin, BoM, or procurement authority. |

Access is expressed per section **and** per sub-section (e.g. `workOrders` vs. `workOrders.assignmentBoard` vs. `workOrders.myAssigned`) as one of `full`, `scoped`, `view`, `none`. `accessLevelFor()` takes the best level across a user's roles. This is the mechanism product/engineering should extend when adding a new screen or action — every new interactive surface must get a `SECTION_ACCESS` entry rather than relying on ad-hoc `v-if`s on role name.

Requirement: no page or action should assume a single role check (`role === 'Field Technician'`) — it must go through `usePermissions()` so the matrix in `PermissionMatrix.vue` (Administration) stays a true reflection of enforced access, not just documentation.

## 3. Screen-by-screen requirements

### 3.1 Landing & Login
- Public landing page communicates product positioning (industries, objectives) and funnels to sign-in.
- Login must support role-based redirect after auth and preserve a `redirect` query param for deep links.
- **Gap**: dev-mode login infers role from keyword in the email address. This is explicitly a placeholder — before connecting to a real backend, `mockLogin` must be removed or fully isolated behind a build flag so it can never ship to production by accident.

### 3.2 Dashboard (role-routed)
- Each role lands on a dashboard summarizing what's relevant to them today.
- Technician dashboard: today's assigned work orders, quick actions into work order detail. **Implemented against live store state.**
- Manager/Supervisor dashboards: operational KPIs (open work orders, overdue PM, low stock, pending approvals) and team activity.
- **Gap**: Manager and Supervisor dashboards currently render hardcoded literal numbers/lists, not derived from the underlying stores, and several quick-action buttons have no handler wired. This is the single highest-priority frontend gap — these are the two roles who need dashboards to reflect real state, and today they don't.

### 3.3 Projects
- List and map views of client projects; each project has a site address, assigned technician, and status (queued → assigned → in_progress → completed).
- Map view must plot project sites with status-colored markers and degrade gracefully with no Google Maps key.
- Technician assignment is editable only by roles with `full`/`scoped` access to `projects.assignment` (Manager, Admin, Supervisor); Technicians get `scoped` (their own projects only).

### 3.4 Bill of Materials
- Per-project BoM authoring in `draft` status, submission for approval, Manager/Admin approve-or-reject-with-reason, and reconciliation against on-hand stock to surface shortfalls before procurement is triggered.
- Only Admin/Manager have any access to this section — Supervisors and Technicians must not see it at all (confirmed in current `SECTION_ACCESS`).

### 3.5 Assets & Locations
- Two independent hierarchies: asset parent/child (equipment nesting) and physical location (site/building/room). Both must support search-to-expand navigation.
- Asset detail must roll up child status (a healthy parent asset with a critical child must visibly flag it) and link out to the corresponding ERPNext fixed-asset record.
- Health panel shows telemetry trend + active alerts per asset, sourced (eventually) from the IoT ingestion pipeline described in the root README; today this is static per-asset mock telemetry.
- **Gap**: telemetry is static seed data with no live update path — acceptable for the prototype, but the health panel's data contract (metric name, unit, trend array, alert thresholds) should be treated as the spec for whatever the IoT ingestion backend eventually emits.

### 3.6 Work Orders
- Central execution surface. A work order must support: technician assignment, a running timer, a completion checklist that gates status transitions, Lockout-Tagout (LOTO) sign-off, and material consumption logging.
- **Safety requirement carried over from the root blueprint**: a work order must not be completable while a required LOTO sign-off or checklist item is outstanding. The current `LotoPanel` implements this by locking the whole panel once signed off and gating sign-off on ≥1 isolation point logged — this must be preserved (not relaxed) when wiring to a real backend, since it's a named safety-critical requirement.
- Material logging must show live stock status per line and provide a path to raise a request when short (currently a deep link to ERPNext's Material Request form).
- Assignment Board: bulk technician reassignment across the queue, visible to Managers/Supervisors; Technicians must not see it.
- Labor Log: cross-work-order ledger; Technicians can only see/edit their own entries, others see everything.

### 3.7 Store & Procurement
- Stock availability view sorted by proximity to reorder point, so low-stock parts surface first.
- Purchase request → PO workflow: requests raised (manually or from a BoM shortfall/reorder trigger), Manager/Admin batch-select approved requests into a PO against a vendor, PO status then progresses `draft → sent → acknowledged → partially_received → received` (or cancelled).
- Component reservation tracking so parts already promised to one work order aren't double-counted as available.
- Vendor management is Admin-only; vendor PO status visibility is Manager/Admin only.
- **Gap**: purchase request vendor is currently a free-text field, not linked to the `vendors` store — a request can reference a vendor name that doesn't exist in Vendor Management. Should be a proper link once there's a backend Vendor doctype to validate against.

### 3.8 Reports
- Total Cost of Ownership per asset (acquisition + materials + labor), ranked.
- MTTR trend over time.
- A single combined approval queue surfacing BoM approvals, purchase request approvals, and work-order closeout approvals in one place for Managers/Admins, so approvers don't have to visit three separate sections to clear their queue.
- Supervisors get `scoped`/partial access (MTTR only); Technicians have no access to Reports.

### 3.9 Administration
- Admin-only. User/role management, a read-only visualization of the permission matrix itself (`PermissionMatrix.vue`), system health (ERPNext connection/sync status), an audit log (view-only — audit entries must never be deletable, per the root README's role description), and global settings (org name, currency, timezone, low-stock buffer, notification email, session timeout).
- **Requirement carried over from root README**: even System Administrator must not be able to delete audit log entries. Current `AuditLogTable.vue` has no delete action at all, which satisfies this — must not regress if edit/delete is added later.

## 4. Cross-cutting requirements

- **Currency**: all monetary values render as KES via `Intl.NumberFormat('en-KE', ...)`. If multi-currency support becomes a requirement (e.g. serving non-Kenyan sites), `src/utils/currency.js` needs to become configurable rather than hardcoded.
- **Theming**: the app must only use colors available in the `frappe-ui/tailwind` preset (`gray`, `red`, `amber`, `green`, `blue`, `violet`, `orange` observed in use). Do not introduce `indigo`/`sky`/`slate`/etc. utility classes — they resolve to nothing under this preset.
- **Persistence**: `workOrders`, `projects`, `procurement`, and `vendors` stores persist to `localStorage` via the custom `persistPlugin` so a reload doesn't lose demo edits. This is explicitly a prototype convenience, not a substitute for backend persistence, and should be removed (or left as an offline-cache layer, if that becomes a deliberate PWA requirement per the root roadmap's Phase 5) once real API calls are wired in.
- **Routing namespace**: all app routes live under `/cmms` because Frappe reserves the site root's top-level paths. Any new route must stay under this prefix.

## 5. Known gaps before backend integration

Ordered roughly by priority:

1. **Manager/Supervisor dashboards are not store-driven.** Highest priority — these are the two roles most dependent on dashboards reflecting real operational state.
2. **Mock auth path (`mockLogin`) must not reach production.** Currently gated by `import.meta.env.DEV`/dead-code elimination, but there is no test asserting this; worth an explicit build-time check once CI exists.
3. **No real backend is wired anywhere except `auth.js`'s production branch**, which has never been exercised against a live Frappe site. Treat `src/utils/call.js` and the production login path as unverified until tested against a real `cmms_app` bench.
4. **Vendor references in procurement are free text**, not linked records — will need to become a real Link field once a Vendor doctype exists server-side.
5. **ERPNext deep links (`erpnextUrl()`, `erpnextMaterialRequestUrl()`) are unvalidated** — built to a guessed URL shape and never tested against a running ERPNext instance.
6. **No automated frontend tests exist** (no test runner is configured in `package.json`). Given the safety-critical LOTO gating and permission-matrix logic, these are the two areas most worth covering first.
7. **Telemetry/health data is static** — fine for the prototype, but the shape of `AssetHealthPanel`'s expected data (metrics, trend arrays, alerts) should be reconciled with whatever the IoT ingestion pipeline actually emits once that's built, rather than assumed.

## 6. Non-goals (explicitly deferred to backend/other phases)

- Offline technician sync/queueing (root roadmap Phase 5) — no offline storage exists in the frontend today beyond the localStorage convenience cache described above.
- IoT telemetry ingestion — the frontend only renders whatever telemetry shape it's given.
- OpenAPI documentation, DocType schema, ERPNext ledger hooks — backend (`cmms_app`) responsibilities per the root README.
