# Norwa CMMS

Enterprise Computerized Maintenance Management System (CMMS) blueprint for a mobile-first, Frappe-native maintenance platform with direct ERPNext integration.

This repository is currently at the project blueprint stage. The source blueprint is `CMMS_Software_Project_Blueprint_Ronald_Ambundo.pdf`, prepared by Ronald Ambundo, targeting the Frappe Framework and ERPNext ecosystem v15.

## Overview

Norwa CMMS is designed to bridge the gap between maintenance operations and core ERP workflows. Instead of running work orders, asset downtime, spare parts, labor logs, and accounting in separate systems, the platform is intended to share a unified Frappe/ERPNext data layer.

The target outcome is an open-source-driven, self-hostable CMMS that supports asset performance management, maintenance execution, inventory visibility, cost tracking, and field technician workflows from one operational system.

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
| Phase 1 | Core app setup, role provisioning, base permissions | Weeks 1-4 |
| Phase 2 | Asset trees, spatial hierarchy, QR architecture | Weeks 5-8 |
| Phase 3 | Work orders, safety forms, timers engine | Weeks 9-14 |
| Phase 4 | ERPNext ledgers and inventory hooks | Weeks 15-18 |
| Phase 5 | Mobile PWA and offline storage | Weeks 19-24 |

## Expected Deliverables

- Production-ready Frappe app repository for `cmms_app`
- DocType JSON definitions with indexes and relationship constraints
- ERPNext hook integrations for stock, accounting, HR, and asset records
- OpenAPI 3.0 documentation for REST APIs
- Automated regression tests for asset hierarchy, work order validation, ledger rollups, and offline sync behavior

## Development Status

No application source files have been added yet. The next implementation step is to scaffold the Frappe app and commit the initial DocType, role, and permission structure.

## License

License information has not been defined yet.
