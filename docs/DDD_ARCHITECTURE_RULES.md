# DDD Architecture Rules - Mandatory Compliance

> **Document Version:** 1.0.0  
> **Last Updated:** 2025-12-02  
> **Status:** MANDATORY - All features MUST comply with these rules

---

## 🎯 Purpose

This document defines **non-negotiable architectural rules** for the Open Data Integration Platform backend. All new features, refactoring, and code changes MUST strictly follow these rules.

**Violation of these rules will result in code rejection during review.**

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

---

## 🏗️ Rule 2: Aggregate Root Design

### MANDATORY Requirements

All aggregate roots MUST:

1. **Extend** `AggregateRoot<ID>` from shared domain
2. **Use** `@EmbeddedId` with strongly-typed ID value object
3. **Use** `@Getter` ONLY (NO `@Data`, NO `@Setter`)
4. **Provide** static factory method named `create()`
5. **Use** business methods instead of setters
6. **Be** in `{context}.domain.model` package

### Template

```java
package com.gs.dsp.{context}.domain.model;

@Entity
@Table(name = "{table_name}")
@Getter
@NoArgsConstructor  // For JPA only
public class {AggregateName} extends AggregateRoot<{AggregateName}Id> {
    
    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private {AggregateName}Id id;
    
    // Other fields with domain value objects where appropriate
    
    // Factory method - REQUIRED
    public static {AggregateName} create(...) {
        {AggregateName} entity = new {AggregateName}();
        // Initialize fields
        return entity;
    }
    
    // Business methods - NOT setters
    public void {businessAction}() {
        // Business logic here
        // Update internal state
    }
    
    // Getter for ID value - REQUIRED
    public String getIdValue() {
        return id != null ? id.toString() : null;
    }
}
```

### Rule Enforcement

✅ **CORRECT**:
```java
@Entity
@Getter
@NoArgsConstructor
public class Report extends AggregateRoot<ReportId> {
    @EmbeddedId
    private ReportId id;
    
    public static Report create(ReportId id, String name) { }
    public void publish() { }
    public void archive() { }
}
```

❌ **INCORRECT**:
```java
@Entity
@Data  // ❌ Exposes setters
public class Report {
    @Id
    @GeneratedValue
    private UUID id;  // ❌ Not using ReportId value object
    
    // ❌ No factory method
    // ❌ No business methods
}
```

---

## 🔷 Rule 3: Value Objects

### MANDATORY Requirements

All value objects MUST:

1. **Implement** `ValueObject` marker interface
2. **Be** `@Embeddable` (if used in entities)
3. **Be** immutable (final fields, no setters)
4. **Have** validation in constructor
5. **Override** `equals()` and `hashCode()` (use `@EqualsAndHashCode`)
6. **Implement** `Serializable`

### ID Value Objects

All aggregate IDs MUST follow this pattern:

```java
package com.gs.dsp.{context}.domain.model;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor  // For JPA
public class {AggregateName}Id implements ValueObject, Serializable {
    
    private UUID id;  // or String, depending on business needs
    
    public {AggregateName}Id(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("{AggregateName} ID cannot be null");
        }
        this.id = id;
    }
    
    public static {AggregateName}Id generate() {
        return new {AggregateName}Id(UUID.randomUUID());
    }
    
    @Override
    public String toString() {
        return id.toString();
    }
}
```

### Other Value Objects

```java
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class {ValueObjectName} implements ValueObject, Serializable {
    
    private String value;  // or appropriate type
    
    public {ValueObjectName}(String value) {
        // Validation
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("...");
        }
        this.value = value;
    }
}
```

### Rule Enforcement

✅ **CORRECT**:
```java
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class Email implements ValueObject, Serializable {
    private String email;
    
    public Email(String email) {
        if (!isValid(email)) {
            throw new IllegalArgumentException("Invalid email");
        }
        this.email = email;
    }
}
```

❌ **INCORRECT**:
```java
@Data  // ❌ Has setters - not immutable
public class Email {
    private String email;  // ❌ No validation
    // ❌ Not @Embeddable
    // ❌ Not implementing ValueObject
}
```

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

---

## 🎮 Rule 6: Controller Layer

### MANDATORY Requirements

Controllers MUST:

1. **Depend ONLY on** application services (NOT repositories, NOT infrastructure services)
2. **Use** `TenantContext.getTenantId()` for multi-tenancy
3. **NOT contain** business logic
4. **Handle** DTOs ↔ Domain model conversion if needed
5. **Be** thin coordination layer

### Template

```java
@RestController
@RequestMapping("/api/v1/{resources}")
@RequiredArgsConstructor
public class {AggregateName}Controller {
    
    private final {AggregateName}ApplicationService applicationService;
    
    @GetMapping
    public List<{AggregateName}> getAll() {
        return applicationService.getAll{AggregateName}s(TenantContext.getTenantId());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<{AggregateName}> getById(@PathVariable String id) {
        return applicationService.get{AggregateName}ById(id, TenantContext.getTenantId())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public {AggregateName} create(@RequestBody {CreateRequest} request) {
        return applicationService.create{AggregateName}(
            request.getName(),
            // ... other params
            TenantContext.getTenantId()
        );
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<{AggregateName}> update(
            @PathVariable String id,
            @RequestBody {UpdateRequest} request) {
        try {
            {AggregateName} updated = applicationService.update{AggregateName}(
                id,
                // ... params from request
                TenantContext.getTenantId()
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            applicationService.delete{AggregateName}(id, TenantContext.getTenantId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

### Rule Enforcement

✅ **CORRECT**:
```java
@RestController
@RequiredArgsConstructor
public class ReportController {
    private final ReportApplicationService applicationService;
    
    @PostMapping
    public Report create(@RequestBody CreateReportRequest request) {
        return applicationService.createReport(
            request.getName(),
            TenantContext.getTenantId()
        );
    }
}
```

❌ **INCORRECT**:
```java
@RestController
public class ReportController {
    @Autowired
    private ReportRepository repository;  // ❌ Inject application service
    
    @Autowired
    private SomeInfrastructureService service;  // ❌ Don't inject infrastructure
    
    @PostMapping
    public Report create(@RequestBody CreateReportRequest request) {
        // ❌ Business logic in controller
        Report report = new Report();
        report.setName(request.getName());
        report.setStatus("DRAFT");
        report.setTenantId(TenantContext.getTenantId());
        return repository.save(report);
    }
}
```

---

## 🚫 Rule 7: What NOT to Do

### FORBIDDEN Practices

❌ **DO NOT** use `@Data` on aggregate roots or value objects
- Use `@Getter` instead
- Business invariants must be protected

❌ **DO NOT** expose setters on domain entities
- Use business methods with meaningful names
- Example: `approve()` NOT `setStatus(APPROVED)`

❌ **DO NOT** use primitive types as IDs
- Always use typed value objects (e.g., `ReportId`, NOT `UUID`)

❌ **DO NOT** inject JPA repositories in controllers
- Controllers depend on application services ONLY

❌ **DO NOT** put business logic in controllers or services
- Business logic belongs in domain model

❌ **DO NOT** mix Spring Framework into domain layer
- Domain layer should be framework-agnostic
- NO `@Autowired`, `@Service`, etc. in domain model

❌ **DO NOT** create circular dependencies between bounded contexts
- Contexts should be loosely coupled
- Use String IDs for cross-context references (e.g., `tenantId` as String in Connector)

❌ **DO NOT** skip validation in value object constructors
- Always validate, fail fast with clear messages

❌ **DO NOT** return null from domain methods
- Use `Optional<>` or throw exceptions

---

## 📁 Rule 8: Shared Kernel

### Location

All shared code MUST be in:
```
com.gs.dsp.shared/
├── domain/
│   └── model/
│       ├── AggregateRoot.java
│       ├── ValueObject.java
│       └── DomainEvent.java
├── kernel/
│   └── constants/
│       ├── ErrorMessages.java
│       ├── FieldNames.java
│       └── AppConstants.java
└── infrastructure/
    └── web/
        ├── GlobalExceptionHandler.java
        └── ErrorResponse.java
```

### What Goes in Shared Kernel

✅ **Allowed**:
- Base classes (AggregateRoot, ValueObject)
- Marker interfaces
- Common constants
- Infrastructure utilities (exception handlers, etc.)

❌ **NOT Allowed**:
- Business logic specific to one context
- Domain entities
- Application services

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

---

## ✅ Rule 10: Code Review Checklist

Before submitting code, verify:

- [ ] Is the code in the correct bounded context?
- [ ] Does the aggregate extend `AggregateRoot<ID>`?
- [ ] Is there a typed ID value object?
- [ ] Are all value objects immutable?
- [ ] Does the aggregate use `@Getter` (NOT `@Data`)?
- [ ] Is there a `create()` factory method?
- [ ] Are there business methods instead of setters?
- [ ] Is there a domain repository interface in `domain.repository`?
- [ ] Is there a JPA implementation in `infrastructure.persistence`?
- [ ] Is there an application service in `application.service`?
- [ ] Does the controller only depend on application service?
- [ ] Is tenant isolation properly implemented?
- [ ] Are all names following the conventions?
- [ ] Is validation present in value object constructors?
- [ ] Are there unit tests for domain logic?

---

## 🎓 Enforcement

### Development Time

- **IDE Setup**: Configure workspace rules based on this document
- **Code Templates**: Use templates provided in this document
- **Linting**: Setup architectural rules validation

### Review Time

- **Mandatory Review**: All PRs must be reviewed against these rules
- **Automated Checks**: CI/CD pipeline checks for violations
- **Rejection**: Code violating these rules will be rejected

### Exceptions

- Exceptions to these rules require approval from tech lead
- Exception must be documented with clear justification
- Temporary violations must have refactoring tickets

---

## 📚 Related Documents

- [DDD_MIGRATION_GUIDE.md](file:///d:/projects/ldop-demo/docs/DDD_MIGRATION_GUIDE.md) - Detailed guide with examples
- [ARCHITECTURE.md](file:///d:/projects/ldop-demo/docs/ARCHITECTURE.md) - Overall system architecture
- [PROJECT_STRUCTURE.md](file:///d:/projects/ldop-demo/docs/PROJECT_STRUCTURE.md) - Project organization

---

**Last Updated:** 2025-12-02  
**Maintained By:** Architecture Team  
**Review Cycle:** Quarterly or when new patterns emerge
