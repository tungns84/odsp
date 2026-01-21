# 📜 Changelog

> **Project:** Open Data Sharing Platform

---

## [Sprint 7] - 2025-12-06
### Backend
#### Changed

- Migrated manual TraceIdFilter to Micrometer Tracing
- Updated GlobalExceptionHandler to use Tracer
- Configured Logback to include spanId in logs
#### Added
- Integrated **Flowable Workflow Engine** (7.0.1)
- Implemented Data Publishing Workflow (BPMN)
- Added Workflow REST API for process/task management


## [beta-0.0.1] - 2025-12-05

> 🎉 **First Beta Release** - DDD Migration & Code Quality Improvements

### Backend
#### Added
- DataEndpoint DDD migration (Aggregate Root, Value Objects, Repository pattern)
- `MaskingConfig` and `FieldDefinition` domain models
- `MaskingService` for centralized data masking logic
- `SqlBuilder` component for SQL query construction
- `TestQueryResult` DTO for query execution results
- `MaskingServiceTest` unit tests

#### Changed
- Refactored `DynamicQueryService` to orchestration layer
- Updated SQL Dialect implementations to use new domain models
- Updated cache configuration for new `FieldDefinition` type

#### Fixed
- ConnectorControllerTest alignment with lazy-loading design
- Test discovery issues in Maven Surefire

### Frontend
#### Added
- Improved Data Masking UI with preset patterns (ShowFirst4, ShowLast4, Email)
- Live masking preview in configuration
- Visual icons for masking types (🔒 Full Mask, 🔓 Partial Mask)
- Tables loading indicator with spinner

#### Changed
- Optimized tables loading (lazy load on step navigation, not connector click)
- Expandable card UI for masking rules

### Tests
- ✅ 116 tests passing
- ✅ ArchUnit DDD rules enforced

### Project Management
- Sprint 5 completed: 29 story points (100%)
- Overall project progress: 68%

---

## [Sprint 6] - 2025-12-05

### Frontend
#### Added
- Query result pagination component
- Error Boundaries for graceful error handling
- Reusable custom hooks (useConnectors, useDataQuery, etc.)

#### Changed
- Refactored shared type definitions for better type safety
- Cleaned up project structure

### Backend
#### Added
- Structured logging to 4 application services (Connector, DataEndpoint, Tenant, ApiKey)
- INFO logs for CREATE/UPDATE operations with business context
- WARN logs for destructive operations (DELETE, REVOKE)
- Security-conscious API key masking in logs

#### Fixed
- Connector creation API now accepts and saves `registeredTables` parameter

### Tests
- ✅ All connector tests passing (6/6)

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
