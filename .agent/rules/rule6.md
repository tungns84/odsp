---
trigger: always_on
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