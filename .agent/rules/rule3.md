---
trigger: always_on
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