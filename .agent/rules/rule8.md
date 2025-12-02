---
trigger: always_on
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