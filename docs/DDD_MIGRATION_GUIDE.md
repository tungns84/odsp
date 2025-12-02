# DDD Migration Guide - Connectivity Context (Phase 3)

> **Document Version:** 1.0.0  
> **Last Updated:** 2025-12-02  
> **Language:** Vietnamese

---

## Tổng quan

Phase 3 của dự án chuyển đổi **Connector aggregate** từ mô hình anemic (nghèo nàn logic) sang mô hình Domain-Driven Design (DDD) phong phú, theo đúng pattern đã được thiết lập ở Phase 2 (IAM Context) với Tenant và ApiKey.

### Mục tiêu

1. **Tách biệt rõ ràng**: Domain, Application, và Infrastructure layers
2. **Business logic trong domain**: Không còn anemic model
3. **Dễ test**: Mock domain repository thay vì Spring Data JPA
4. **Loose coupling**: Giữa các bounded contexts
5. **Nhất quán**: Toàn bộ codebase follow cùng một pattern

---

## Kiến trúc Bounded Context

### Cấu trúc Package Mới

```
com.gs.dsp.connectivity/
├── domain/
│   ├── model/
│   │   ├── Connector.java           (Aggregate Root)
│   │   ├── ConnectorId.java         (Value Object)
│   │   ├── ConnectorStatus.java     (Enum)
│   │   ├── ConnectorType.java       (Value Object)
│   │   └── ConnectionConfig.java    (Value Object)
│   └── repository/
│       └── ConnectorRepository.java (Domain Interface)
├── application/
│   └── service/
│       └── ConnectorApplicationService.java
└── infrastructure/
    └── persistence/
        └── JpaConnectorRepository.java (implements domain repository)
```

### So sánh với IAM Context (Phase 2)

| Phase 2 (IAM) | Phase 3 (Connectivity) |
|---------------|------------------------|
| `iam.domain.model.Tenant` | `connectivity.domain.model.Connector` |
| `iam.domain.model.TenantId` | `connectivity.domain.model.ConnectorId` |
| `iam.domain.model.TenantStatus` | `connectivity.domain.model.ConnectorStatus` |
| `iam.application.service.TenantApplicationService` | `connectivity.application.service.ConnectorApplicationService` |

---

## Chi tiết các thành phần

### 1. Value Objects (Domain Layer)

#### ConnectorId

**Mục đích**: Strongly-typed identifier cho Connector aggregate.

**Đặc điểm**:
- Sử dụng UUID thay vì primitive type
- Immutable (không thể thay đổi sau khi tạo)
- Có validation trong constructor
- Implements `ValueObject` marker interface
- `@Embeddable` để JPA embedding

**Ví dụ**:
```java
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class ConnectorId implements ValueObject, Serializable {
    private UUID id;
    
    public ConnectorId(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Connector ID cannot be null");
        }
        this.id = id;
    }
    
    public static ConnectorId generate() {
        return new ConnectorId(UUID.randomUUID());
    }
}
```

#### ConnectorType

**Mục đích**: Thay thế `String type` với type-safe value object.

**Đặc điểm**:
- Validation cho các loại connector hợp lệ (DATABASE, REST_API)
- Immutable
- Factory methods cho common types
- Có thể mở rộng dễ dàng khi thêm loại connector mới

**Ví dụ**:
```java
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class ConnectorType implements ValueObject, Serializable {
    public static final String DATABASE = "DATABASE";
    public static final String REST_API = "REST_API";
    
    private String type;
    
    public ConnectorType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Connector type cannot be blank");
        }
        if (!DATABASE.equals(type) && !REST_API.equals(type)) {
            throw new IllegalArgumentException("Invalid connector type: " + type);
        }
        this.type = type;
    }
    
    public static ConnectorType database() {
        return new ConnectorType(DATABASE);
    }
    
    public static ConnectorType restApi() {
        return new ConnectorType(REST_API);
    }
}
```

#### ConnectionConfig

**Mục đích**: Encapsulate connection configuration với type safety.

**Đặc điểm**:
- Bọc `Map<String, Object>` với validation
- Type-safe accessors cho các fields phổ biến
- Validation dựa trên connector type
- Immutable

**Ví dụ**:
```java
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class ConnectionConfig implements ValueObject, Serializable {
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config;
    
    public ConnectionConfig(Map<String, Object> config, ConnectorType type) {
        if (config == null || config.isEmpty()) {
            throw new IllegalArgumentException("Connection config cannot be empty");
        }
        validateConfig(config, type);
        this.config = new HashMap<>(config); // Defensive copy
    }
    
    public String getHost() {
        return (String) config.get("host");
    }
    
    public Integer getPort() {
        return (Integer) config.get("port");
    }
    
    // ... more type-safe accessors
}
```

---

### 2. Connector Aggregate Root

#### Chuyển đổi từ Anemic Model sang Rich Domain Model

**Trước (Anemic Model)**:
```java
@Entity
@Data  // Có tất cả setters
@Builder
public class Connector {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String type;
    private Map<String, Object> config;
    private String tenantId;
    private ConnectorStatus status;
    private boolean isActive;
    
    // Không có business logic
}
```

**Sau (Rich Domain Model)**:
```java
@Entity
@Table(name = "connectors")
@Getter
@NoArgsConstructor
public class Connector extends AggregateRoot<ConnectorId> {
    
    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private ConnectorId id;
    
    @Column(nullable = false)
    private String name;
    
    @Embedded
    private ConnectorType type;
    
    @Embedded
    private ConnectionConfig config;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectorStatus status;
    
    @Column(name = "is_active")
    private boolean isActive;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<TableMetadata> registeredTables;
    
    // Factory method
    public static Connector create(
            ConnectorId id,
            String name,
            ConnectorType type,
            ConnectionConfig config,
            String tenantId) {
        Connector connector = new Connector();
        connector.id = id;
        connector.name = name;
        connector.type = type;
        connector.config = config;
        connector.tenantId = tenantId;
        connector.status = ConnectorStatus.INIT;
        connector.isActive = false;
        return connector;
    }
    
    // Business methods thay vì setters
    public void approve() {
        if (this.status == ConnectorStatus.APPROVED) {
            return; // Idempotent
        }
        if (this.status == ConnectorStatus.REJECTED) {
            throw new IllegalStateException("Cannot approve a rejected connector");
        }
        this.status = ConnectorStatus.APPROVED;
        this.isActive = true;
    }
    
    public void reject() {
        if (this.status == ConnectorStatus.REJECTED) {
            return; // Idempotent
        }
        this.status = ConnectorStatus.REJECTED;
        this.isActive = false;
    }
    
    public void updateDetails(
            String name,
            ConnectionConfig config,
            List<TableMetadata> registeredTables) {
        this.name = name;
        this.config = config;
        this.registeredTables = registeredTables;
    }
    
    public void activate() {
        if (this.status != ConnectorStatus.APPROVED) {
            throw new IllegalStateException("Can only activate approved connectors");
        }
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public String getIdValue() {
        return id != null ? id.getId().toString() : null;
    }
}
```

#### Lợi ích của Rich Domain Model

1. **Business logic tập trung**: Tất cả rules về approval, rejection nằm trong aggregate
2. **Encapsulation**: Không thể set status tùy tiện từ bên ngoài
3. **Validation**: Không thể approve một connector đã bị rejected
4. **Idempotency**: Gọi `approve()` nhiều lần không gây side effects
5. **Self-documenting**: Code rõ ràng hơn khi đọc `connector.approve()` thay vì `connector.setStatus(APPROVED)`

---

### 3. Repository Pattern

#### Domain Repository Interface

```java
package com.gs.dsp.connectivity.domain.repository;

public interface ConnectorRepository {
    Optional<Connector> findById(ConnectorId id);
    List<Connector> findByTenantId(String tenantId);
    Optional<Connector> findByIdAndTenantId(ConnectorId id, String tenantId);
    Connector save(Connector connector);
    void delete(Connector connector);
    boolean existsById(ConnectorId id);
}
```

**Đặc điểm**:
- Không phụ thuộc vào Spring Data
- Sử dụng `ConnectorId` thay vì `UUID`
- Domain layer interface

#### Infrastructure Implementation

```java
package com.gs.dsp.connectivity.infrastructure.persistence;

@Repository
public interface JpaConnectorRepository 
    extends JpaRepository<Connector, ConnectorId>, 
            ConnectorRepository {
    // Spring Data tự động implement các methods từ domain interface
    // Chỉ cần khai báo methods không standard
}
```

**Lợi ích**:
- Domain layer không biết gì về JPA
- Dễ thay đổi persistence technology
- Dễ mock trong unit tests

---

### 4. Application Service

`ConnectorApplicationService` là orchestration layer, điều phối các use cases.

```java
@Service
@RequiredArgsConstructor
public class ConnectorApplicationService {
    
    private final ConnectorRepository connectorRepository;
    private final ConnectorInfrastructureService infrastructureService;
    
    @Transactional
    public Connector createConnector(
            String name,
            String type,
            Map<String, Object> config,
            String tenantId) {
        
        ConnectorId id = ConnectorId.generate();
        ConnectorType connectorType = new ConnectorType(type);
        ConnectionConfig connectionConfig = new ConnectionConfig(config, connectorType);
        
        Connector connector = Connector.create(
            id, name, connectorType, connectionConfig, tenantId
        );
        
        return connectorRepository.save(connector);
    }
    
    @Transactional
    public Connector approveConnector(String id, String tenantId) {
        ConnectorId connectorId = new ConnectorId(UUID.fromString(id));
        Connector connector = connectorRepository
            .findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Connector not found"));
        
        connector.approve(); // Domain method
        
        return connectorRepository.save(connector);
    }
    
    // ... other use cases
}
```

**Vai trò**:
- Điều phối các domain objects
- Transaction boundary
- Chuyển đổi DTOs ↔ Domain models
- Error handling

---

### 5. Infrastructure Service

Đổi tên `ConnectorService` → `ConnectorInfrastructureService`

```java
@Service
public class ConnectorInfrastructureService {
    
    private final DataSourceFactory dataSourceFactory;
    private final MetadataInferenceService metadataInferenceService;
    
    public List<TableMetadata> fetchTables(Connector connector) {
        return testConnectionAndFetchTables(connector.getConfig().getConfig());
    }
    
    public List<TableMetadata> testConnectionAndFetchTables(Map<String, Object> config) {
        // Infrastructure logic: database connection, metadata extraction
        // ...
    }
}
```

**Lý do đổi tên**:
- Phân biệt rõ domain logic vs infrastructure logic
- `ConnectorApplicationService` = use cases (domain logic)
- `ConnectorInfrastructureService` = kỹ thuật (infrastructure concerns)

---

## Migration Process

### Bước 1: Tạo cấu trúc package
- Tạo `connectivity` bounded context
- Tạo các sub-packages: domain, application, infrastructure

### Bước 2: Implement Value Objects
- `ConnectorId`
- `ConnectorType`
- `ConnectionConfig`

### Bước 3: Migrate Connector Aggregate
- Move `Connector` sang package mới
- Remove `@Data`, use `@Getter`
- Add factory method
- Add business methods

### Bước 4: Repository Layer
- Tạo domain repository interface
- Implement JPA repository

### Bước 5: Application Service
- Tạo `ConnectorApplicationService`
- Migrate logic từ controller

### Bước 6: Update Controller
- Inject `ConnectorApplicationService`
- Simplify endpoints

### Bước 7: Cleanup
- Xóa old files
- Update imports
- Run tests

---

## Best Practices

### 1. Immutability
- Value Objects phải immutable
- Sử dụng defensive copying khi cần

### 2. Validation
- Validate trong constructor của Value Objects
- Fail fast với clear error messages

### 3. Factory Methods
- Sử dụng static factory methods thay vì constructors
- Tên method rõ ràng: `Connector.create()`, `ConnectorId.generate()`

### 4. Business Methods
- Đặt tên theo business language
- Ví dụ: `approve()`, `reject()` thay vì `setStatus()`

### 5. Idempotency
- Business methods nên idempotent khi có thể
- Check current state trước khi thay đổi

---

## Testing Strategy

### Unit Tests
```java
@Test
void shouldApproveConnector() {
    // Given
    Connector connector = Connector.create(
        ConnectorId.generate(),
        "Test DB",
        ConnectorType.database(),
        someConfig,
        "tenant-1"
    );
    
    // When
    connector.approve();
    
    // Then
    assertThat(connector.getStatus()).isEqualTo(ConnectorStatus.APPROVED);
    assertThat(connector.isActive()).isTrue();
}

@Test
void shouldNotApproveRejectedConnector() {
    // Given
    Connector connector = createConnector();
    connector.reject();
    
    // When & Then
    assertThatThrownBy(() -> connector.approve())
        .isInstanceOf(IllegalStateException.class);
}
```

### Integration Tests
- Test với real database
- Verify tenant isolation
- Test approval workflow end-to-end

---

## References

- **IAM Context (Phase 2)**: Xem `iam` package để tham khảo pattern
- **DDD Patterns**: Eric Evans - Domain-Driven Design
- **Value Objects**: Martin Fowler - Patterns of Enterprise Application Architecture

---

## Glossary

- **Aggregate Root**: Entity chính điều phối một nhóm objects liên quan
- **Value Object**: Object được định nghĩa bởi attributes, không có identity
- **Bounded Context**: Ranh giới rõ ràng trong đó một domain model được định nghĩa
- **Anemic Model**: Model chỉ có data, không có behavior
- **Rich Domain Model**: Model có cả data và business logic

---

*Document này được tạo để hướng dẫn migration Connector sang DDD architecture trong Phase 3 của dự án Open Data Integration Platform.*
