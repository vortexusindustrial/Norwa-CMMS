# Norwa CMMS

Enterprise Computerized Maintenance Management System (CMMS) for a mobile-first, Frappe-native maintenance platform with direct ERPNext integration.

This repository originates from the project blueprint `CMMS_Software_Project_Blueprint_Ronald_Ambundo.pdf`, prepared by Ronald Ambundo, targeting the Frappe Framework and ERPNext ecosystem v15. A working Vue 3 frontend (`frontend/`) now implements the majority of the blueprint's product surface as an interactive prototype, ahead of the Frappe backend app (`cmms_app`) being scaffolded.

## Overview

Norwa CMMS is designed to bridge the gap between maintenance operations and core ERP workflows. Instead of running work orders, asset downtime, spare parts, labor logs, and accounting in separate systems, the platform is intended to share a unified Frappe/ERPNext data layer.

The target outcome is an open-source-driven, self-hostable CMMS that supports asset performance management, maintenance execution, inventory visibility, cost tracking, and field technician workflows from one operational system.

## Repository Layout

| Path | Status | Description |
| --- | --- | --- |
| `frontend/` | In progress (prototype) | Vue 3 SPA implementing the CMMS UI. See [Frontend Application](#frontend-application) below. |
| `cmms_app/` (Frappe app) | Not yet scaffolded | Planned Python backend, DocTypes, and ERPNext hooks. |
| `docs/FRONTEND_PRD.md` | Living document | Product requirements, screen-by-screen scope, and known gaps for the frontend. |

## Target Industries

- Manufacturing and heavy industrial plants
- Facilities and property management
- Fleet and heavy logistics infrastructure
- Water and utilities grids

## Core Objectives

- Track total cost of ownership across acquisition cost, depreciation, spare parts, and labor.
- Keep standard read/write API operations fast enough for field and operational workflows.
- Support offline technician workflows with local caching and queued synchronization.
- Reduce mean time to repair through better routing, asset state visibility, and predictive workflows.

## Planned Modules

### Assets and Physical Topology

Models asset hierarchies, locations, categories, and groups using tree-nested structures. Parent asset or location state changes should cascade operational impact to child equipment where appropriate.

### Work Orders and Maintenance Requests

Manages repair work, preventive maintenance, diagnostics, technician assignments, timers, work logs, and checklist-based completion rules.

Safety-critical workflows are expected to block work order completion when required inspections or Lockout-Tagout digital signatures are missing.

### Spare Parts Inventory and Procurement

Connects maintenance demand to ERPNext stock and procurement flows, including stock checks, component reservation, and purchase request triggers when inventory falls below safety thresholds.

### ERPNext Integration

The system is planned as a standalone Frappe app that runs alongside ERPNext modules while using native hooks and shared database records for stock, accounting, HR, and fixed asset integration.

### Industrial IoT

The blueprint includes a telemetry ingestion pipeline for pressure, temperature, vibration, and other edge-device metrics. Anomalies should update asset health, log telemetry exceptions, and trigger emergency corrective work orders.

## Frontend Application

`frontend/` is a Vue 3 single-page application built against the Frappe UI design system, implementing the CMMS product surface as an interactive prototype. It is designed to run standalone today (against mocked data) and to attach to a real Frappe/ERPNext backend once `cmms_app` exists, with minimal code changes.

### Stack

- Vue 3 (`<script setup>`), Vite 8, Vue Router 4, Pinia 3
- [`frappe-ui`](https://github.com/frappe/frappe-ui) component library and Tailwind preset (restricts the available color palette — see [Theming](#theming))
- `lucide-vue-next` for icons
- `@googlemaps/js-api-loader` for the project site map and address autocomplete

### Routing and mounting

The app is namespaced under `/cmms` rather than the site root, because Frappe reserves `/app`, `/login`, `/api`, `/desk`, `/assets`, `/files`, and `/private` for its own routing (`frontend/src/router/index.js`). Routes:

- `/cmms` — public landing page
- `/cmms/login` — sign-in
- `/cmms/app` (authenticated shell, `AppShellLayout.vue`) with children:
  - `/cmms/app` — Dashboard (role-specific)
  - `/cmms/app/projects` — Projects
  - `/cmms/app/bom` — Bill of Materials
  - `/cmms/app/assets` — Assets & Locations
  - `/cmms/app/work-orders` — Work Orders
  - `/cmms/app/procurement` — Store & Procurement
  - `/cmms/app/reports` — Cost & Reporting
  - `/cmms/app/admin` — Administration

A navigation guard (`router.beforeEach`) checks session state and gates each route by its `meta.section` against the role-based permission table below.

### Roles and permissions

`frontend/src/permissions.js` defines four roles matching the blueprint (`System Administrator`, `Maintenance Manager`, `Shift Supervisor`, `Field Technician`) and a `SECTION_ACCESS` map from section/sub-section keys to an access level (`full` / `scoped` / `view` / `none`) per role. `accessLevelFor(section, roles)` resolves the best level across a user's roles. The `usePermissions()` composable (`src/composables/usePermissions.js`) exposes `roles`, `accessLevel(section)`, `canView(section)`, and `isScoped(section)` to components.

This drives both navigation (the sidebar hides entire sections a role can't view) and in-page behavior (e.g. Technicians see only their own labor log rows; only Admins reach Administration; only Managers and Admins can raise purchase orders).

### App shell

- `AppShellLayout.vue` — fixed sidebar + topbar + scrollable content region
- `AppSidebar.vue` — nav links filtered live by `canView(section)`
- `AppTopbar.vue` — route-derived page title, current user, sign-out

### Feature areas

| Section | Key components | Notes |
| --- | --- | --- |
| **Dashboard** | `ManagementDashboard`, `SupervisorDashboard`, `TechnicianDashboard` | Picked by role. Only `TechnicianDashboard` currently reads live store data (the technician's assigned work orders); the manager and supervisor dashboards render static placeholder stats/actions pending real aggregation. |
| **Projects** | `ProjectList`, `ProjectListItem`, `ProjectDetailPanel`, `ProjectStatusTracker`, `ProjectsMap` | List/Map toggle; map renders Google Maps markers colored by project status (queued/assigned/in_progress/completed) via `@googlemaps/js-api-loader`, with graceful fallback if no API key is configured. |
| **Bill of Materials** | `BomProjectList`, `BomEditor`, `BomLineItemsTable`, `BomApprovalQueue`, `BomReconciliation` | Draft → submit → approve/reject workflow; reconciliation compares required BoM quantities against on-hand stock. |
| **Assets & Locations** | `AssetTree`, `AssetTreeNode`, `AssetDetailPanel`, `AssetHealthPanel`, `LocationRegistry`, `LocationTreeNode` | Two independent tree hierarchies (asset parent/child, and physical location). Health panel renders hand-drawn SVG sparklines per telemetry metric and surfaces active alerts. Deep-links out to the corresponding ERPNext Asset record. |
| **Work Orders** | `WorkOrderQueue`, `WorkOrderListItem`, `WorkOrderFilters`, `WorkOrderDetailPanel`, `AssignmentBoard`, `LaborLogLedger`, `LotoPanel`, `MaterialLoggingSection`, `MaterialAvailabilityPanel` | Queue / Assignment Board / Labor Log tabs. `WorkOrderDetailPanel` is the operational hub: timer, checklist-driven status completion, Lockout-Tagout sign-off (locks once signed), and materials logging with live stock lookups that deep-link to ERPNext's Material Request form when short. |
| **Store & Procurement** | `StockAvailabilityPanel`, `PurchaseRequestQueue`, `ComponentReservationTracker`, `VendorPoStatus`, `VendorManagement` | Purchase-request → PO workflow; PO status progresses draft → sent → acknowledged → partially_received → received. |
| **Reports** | `TcoDashboard`, `MttrTrendReport`, `ApprovalPendingQueue` | Per-asset total-cost-of-ownership (acquisition + materials + labor), monthly MTTR trend (hand-drawn SVG line chart), and a combined cross-domain approvals queue (BoM, purchase requests, work order closeout). |
| **Administration** | `UserRoleManagement`, `PermissionMatrix`, `SystemHealthPanel`, `AuditLogTable`, `GlobalSettingsForm` | Admin-only. `PermissionMatrix` visually renders the `SECTION_ACCESS` table itself; `SystemHealthPanel` shows ERPNext connection/sync status. |

Shared: `LocationAutocompleteInput.vue` wraps the Google Places `AutocompleteSuggestion` API (restricted to Kenya, `includedRegionCodes: ['ke']`) for address entry on projects and work orders.

### Data and state

- **Seed data** (`src/data/*.js`) — static, hand-authored mock datasets for projects, assets, BoMs, work orders, stock, procurement, and vendors, plus pure helper/derivation functions (e.g. `assetById`, `rolledUpStatus`, `lowStockParts`, `costInfoFor`). No file under `src/data/` performs a network call.
- **Pinia stores** (`src/stores/*.js`) — one store per domain (`workOrders`, `projects`, `procurement`, `vendors`, `bom`, `administration`, `auth`), initialized from the seed data.
- **Persistence** (`src/stores/persistPlugin.js`) — a small custom Pinia plugin (not a third-party package) that mirrors opted-in stores to `localStorage` on every mutation, so edits survive a page reload. Only `workOrders`, `projects`, `procurement`, and `vendors` opt in; `bom` and `administration` do not, and nothing is persisted server-side.
- **Currency** (`src/utils/currency.js`) — all money is formatted as Kenyan Shillings (`en-KE`, `KES`) via `Intl.NumberFormat`; not currently parameterized for other locales.

### Backend integration status

The frontend is currently a **fully self-contained prototype** — everything above runs against static seed data with no live backend. The scaffolding to attach a real Frappe/ERPNext backend already exists but is dormant:

- `src/utils/call.js` is a hand-rolled Frappe REST/RPC client (POSTs to `/api/method/<method>`, attaches the CSRF token, parses Frappe's `_server_messages` error format) — written deliberately instead of importing frappe-ui's bundled `call`, because that pulls in frappe-ui's whole component tree at dev time and breaks under native ESM.
- `src/stores/auth.js` calls real Frappe methods (`login`, `logout`, `frappe.auth.get_logged_user`, `frappe.client.get_list` against `Has Role`) on production builds. In dev (`import.meta.env.DEV`), login is mocked: any non-empty email/password signs in, and the role is inferred by keyword-matching the email (`admin`, `manager`, `supervisor`, else Field Technician). This mock path is what the app currently runs on.
- Rather than building CRUD UI for actions ERPNext already owns, the frontend deep-links out to ERPNext's own desk UI (e.g. `erpnextMaterialRequestUrl()` in `src/data/stock.js`, `erpnextUrl()` in `src/data/assets.js`) — these links assume an ERPNext instance exists at the same origin and are not yet validated against a live one.

### Theming

Tailwind is configured with `frappe-ui/tailwind` as the sole preset (`frontend/tailwind.config.js`) and no custom theme extension. This **replaces** Tailwind's default color palette rather than extending it — utility classes like `bg-indigo-500`, `text-sky-600`, or `bg-slate-100` silently do not exist in this app. Only the palette shipped by the frappe-ui preset is available (observed in use across components: `gray`, `red`, `amber`, `green`, `blue`, `violet`, `orange`).

### Running the frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server, mock auth enabled
npm run build      # production build
npm run preview    # preview a production build
```

Google Maps features (`ProjectsMap`, `LocationAutocompleteInput`) require `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` in `frontend/.env` — see `frontend/.env.example`. Without a key, the map degrades gracefully rather than erroring.

## Planned Architecture

- Frappe Framework app, expected package name: `cmms_app`
- ERPNext v15 ecosystem integration
- Python backend through Frappe/Gunicorn workers
- Node.js Socket.IO processes for real-time events
- Redis queues and workers for async jobs
- MariaDB as the transactional data store
- S3-compatible object storage for manuals, drawings, and proof-of-work media
- Docker and Kubernetes-ready deployment model for production environments

## Key DocTypes

Planned DocTypes from the blueprint include:

- `CMMS Asset`
- `CMMS Asset Location`
- `CMMS Asset Category`
- `CMMS Asset Group`
- `CMMS Work Order`
- `CMMS Maintenance Request`
- `CMMS Work Order Item`
- `CMMS Labor Log`

Example `CMMS Asset` fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `asset_name` | Data | Yes | Human-readable asset label |
| `parent_asset` | Link | No | Validated against cyclic references |
| `asset_location` | Link | Yes | Maps asset to the physical facility structure |
| `erpnext_asset` | Link | No | Links to ERPNext fixed assets |
| `status` | Select | Yes | Draft, Active, Down, or Decommissioned |

## Roles

- `System Administrator`: full platform control, excluding immutable audit log deletion.
- `Maintenance Manager`: asset, schedule, and work order management with approval authority.
- `Shift Supervisor`: team assignments and operational work log oversight.
- `Field Technician`: assigned mobile work queues, checklists, and material consumption logging.

## Roadmap

| Phase | Focus | Duration |
| --- | --- | --- |
| Phase 1 | Core app setup, role provisioning, base permissions | Weeks 1-2 |
| Phase 2 | Asset trees, spatial hierarchy, QR architecture | Weeks 3-5 |
| Phase 3 | Work orders, safety forms, timers engine | Weeks 5-6 |
| Phase 4 | ERPNext ledgers and inventory hooks | Weeks 7-9 |
| Phase 5 | Mobile PWA and offline storage | Weeks 10- |

## Expected Deliverables

- Production-ready Frappe app repository for `cmms_app`
- DocType JSON definitions with indexes and relationship constraints
- ERPNext hook integrations for stock, accounting, HR, and asset records
- OpenAPI 3.0 documentation for REST APIs
- Automated regression tests for asset hierarchy, work order validation, ledger rollups, and offline sync behavior

## Development Status

The frontend prototype (`frontend/`) covers the full navigational surface of the blueprint — dashboards, projects, BoM, assets, work orders, procurement, reports, and administration — against mocked data with role-based access control already implemented. See [`docs/FRONTEND_PRD.md`](docs/FRONTEND_PRD.md) for the detailed requirements this implements and the known gaps still open.

The Frappe backend app (`cmms_app`) has not been scaffolded yet. The next implementation steps are to:

1. Scaffold the Frappe app and commit the initial DocType, role, and permission structure.
2. Replace the frontend's mocked data stores with real `frappe-ui` resource calls against those DocTypes, activating the already-written production auth path in `src/stores/auth.js`.
3. Wire management/supervisor dashboard stats to live aggregates instead of hardcoded placeholder values.

## License

License information has not been defined yet.
