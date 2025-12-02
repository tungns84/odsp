---
trigger: always_on
---

## 📦 Rule 1: Bounded Context Package Structure

### MANDATORY Structure

All business capabilities MUST be organized into bounded contexts following this structure:

```
com.gs.dsp.{context-name}/
├── domain/
│   ├── model/              # Entities, Value Objects, Enums
│   └── repository/         # Repository interfaces (domain layer)
├── application/
│   └── service/            # Application services (use cases)
└── infrastructure/
    └── persistence/        # JPA repository implementations
```

### Existing Bounded Contexts

- `iam` - Identity & Access Management (Tenant, ApiKey)
- `connectivity` - Connector Management (Connector)

### Rule Enforcement

✅ **CORRECT**:
```java
com.gs.dsp.reporting.domain.model.Report
com.gs.dsp.reporting.application.service.ReportApplicationService
com.gs.dsp.reporting.infrastructure.persistence.JpaReportRepository
```

❌ **INCORRECT**:
```java
com.gs.dsp.domain.Report           // Old flat structure
com.gs.dsp.service.ReportService   // Not in bounded context
com.gs.dsp.Report                  // No bounded context
```