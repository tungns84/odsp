---
trigger: always_on
---

## 📚 Rule 4: Repository Pattern

### MANDATORY Structure

Every aggregate MUST have:

1. **Domain repository interface** in `{context}.domain.repository`
2. **JPA implementation** in `{context}.infrastructure.persistence`

### Domain Repository Interface

```java
package com.gs.dsp.{context}.domain.repository;

// NOT a Spring interface - pure domain
public interface {AggregateName}Repository {
    Optional<{AggregateName}> findById({AggregateName}Id id);
    List<{AggregateName}> findByTenantId(String tenantId);
    Optional<{AggregateName}> findByIdAndTenantId({AggregateName}Id id, String tenantId);
    {AggregateName} save({AggregateName} entity);
    void delete({AggregateName} entity);
    boolean existsById({AggregateName}Id id);
}
```

### JPA Repository Implementation

```java
package com.gs.dsp.{context}.infrastructure.persistence;

@Repository
public interface Jpa{AggregateName}Repository 
    extends JpaRepository<{AggregateName}, {AggregateName}Id>, 
            {AggregateName}Repository {
    // Spring Data auto-implements most methods
    // Only add custom query methods if needed
}
```

### Rule Enforcement

✅ **CORRECT**:
```java
// Domain layer
package com.gs.dsp.reporting.domain.repository;
public interface ReportRepository { }

// Infrastructure layer
package com.gs.dsp.reporting.infrastructure.persistence;
@Repository
public interface JpaReportRepository 
    extends JpaRepository<Report, ReportId>, ReportRepository { }
```

❌ **INCORRECT**:
```java
// ❌ Spring Data interface in domain layer
package com.gs.dsp.reporting.domain;
@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> { }
```