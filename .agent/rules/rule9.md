---
trigger: always_on
---

## 🔍 Rule 9: Naming Conventions

### Mandatory Naming

| Component | Pattern | Example |
|-----------|---------|---------|
| Bounded Context | lowercase, single word | `iam`, `connectivity`, `reporting` |
| Aggregate Root | PascalCase, domain term | `Tenant`, `Connector`, `Report` |
| Value Object (ID) | `{Aggregate}Id` | `TenantId`, `ConnectorId`, `ReportId` |
| Value Object (Other) | PascalCase, domain term | `Email`, `ConnectorType`, `ReportStatus` |
| Domain Repository Interface | `{Aggregate}Repository` | `TenantRepository`, `ConnectorRepository` |
| JPA Repository | `Jpa{Aggregate}Repository` | `JpaTenantRepository`, `JpaConnectorRepository` |
| Application Service | `{Aggregate}ApplicationService` | `TenantApplicationService`, `ReportApplicationService` |
| Controller | `{Aggregate}Controller` | `TenantController`, `ReportController` |
| DTO | `{Purpose}DTO` or `{Purpose}Request/Response` | `TenantDTO`, `CreateReportRequest` |