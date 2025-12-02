---
trigger: always_on
---

## 🎯 Rule 5: Application Services

### MANDATORY Requirements

Application services MUST:

1. **Be** in `{context}.application.service` package
2. **Be** named `{AggregateName}ApplicationService`
3. **Be** annotated with `@Service` and `@RequiredArgsConstructor`
4. **Use** `@Transactional` for write operations
5. **Depend on** domain repositories (NOT JPA repositories)
6. **Call** domain methods (NOT setters)
7. **Handle** orchestration and transaction boundaries

### Template

```java
package com.gs.dsp.{context}.application.service;

@Service
@RequiredArgsConstructor
public class {AggregateName}ApplicationService {
    
    private final {AggregateName}Repository repository;
    // Other dependencies (other repositories, infrastructure services)
    
    public List<{AggregateName}> getAll{AggregateName}s(String tenantId) {
        return repository.findByTenantId(tenantId);
    }
    
    public Optional<{AggregateName}> get{AggregateName}ById(String id, String tenantId) {
        {AggregateName}Id entityId = new {AggregateName}Id(UUID.fromString(id));
        return repository.findByIdAndTenantId(entityId, tenantId);
    }
    
    @Transactional
    public {AggregateName} create{AggregateName}(...) {
        {AggregateName}Id id = {AggregateName}Id.generate();
        
        // Use factory method
        {AggregateName} entity = {AggregateName}.create(id, ...);
        
        return repository.save(entity);
    }
    
    @Transactional
    public {AggregateName} update{AggregateName}(String id, ..., String tenantId) {
        {AggregateName}Id entityId = new {AggregateName}Id(UUID.fromString(id));
        {AggregateName} entity = repository.findByIdAndTenantId(entityId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Not found"));
        
        // Use domain methods
        entity.updateDetails(...);
        
        return repository.save(entity);
    }
    
    @Transactional
    public void delete{AggregateName}(String id, String tenantId) {
        {AggregateName}Id entityId = new {AggregateName}Id(UUID.fromString(id));
        {AggregateName} entity = repository.findByIdAndTenantId(entityId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Not found"));
        
        repository.delete(entity);
    }
}
```

### Rule Enforcement

✅ **CORRECT**:
```java
@Service
@RequiredArgsConstructor
public class ReportApplicationService {
    private final ReportRepository repository;  // Domain interface
    
    @Transactional
    public Report publishReport(String id) {
        Report report = repository.findById(new ReportId(id))
            .orElseThrow();
        report.publish();  // Domain method
        return repository.save(report);
    }
}
```

❌ **INCORRECT**:
```java
@Service
public class ReportService {  // ❌ Wrong naming
    @Autowired  // ❌ Use constructor injection
    private JpaReportRepository repository;  // ❌ Use domain interface
    
    public Report publishReport(String id) {  // ❌ No @Transactional
        Report report = repository.findById(UUID.fromString(id));  // ❌ Not using ReportId
        report.setStatus("PUBLISHED");  // ❌ Using setter, not domain method
        return repository.save(report);
    }
}
```