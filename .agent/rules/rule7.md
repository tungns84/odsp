---
trigger: always_on
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