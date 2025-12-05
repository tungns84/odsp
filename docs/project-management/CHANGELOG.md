# 📜 Changelog

> **Project:** Open Data Sharing Platform

---

## [Sprint 5] - 2025-12-04

### Added
- Real Test Connection API (`POST /api/v1/connectors/{id}/test-connection`)
- Connection exception handler in GlobalExceptionHandler
- Project management framework (PMP-style)

### Changed
- Optimized test connection logic to reuse existing connector
- Refactored ConnectorMetadataServiceImpl with shared method

### Fixed
- GlobalExceptionHandler now catches connection timeout exceptions

---

## [Sprint 4] - 2025-12-08

### Added
- Connector Details View with tabs (Configuration, Registered Tables)
- Lazy loading for registered tables

### Changed
- `getTables` endpoint now returns registered tables instead of re-fetching

---

## [Sprint 3] - 2025-12-01

### Added
- ArchUnit tests for DDD architecture enforcement
- Hexagonal architecture package structure

### Changed
- Migrated Connectivity context to DDD
- Migrated IAM context to DDD

---

## [Sprint 2] - 2025-11-30

### Added
- Connector Wizard (multi-step creation)
- Table metadata fetching from source database
- Approval workflow (INIT → APPROVED/REJECTED)

---

## [Sprint 1] - 2025-11-15

### Added
- Project foundation (Spring Boot + React)
- Multi-tenant architecture
- API Key authentication
- Tenant and API Key management UI
