---
trigger: always_on
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