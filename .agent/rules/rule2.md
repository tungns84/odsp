---
trigger: always_on
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