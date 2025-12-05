# Open Data Sharing Platform - Project Roadmap

> **Last Updated:** 2025-12-04
> **Current Status:** Phase 3 Complete, Phase 4 In Progress

---

## 📋 Project Overview

**Open Data Sharing Platform (ODSP)** is a centralized web platform to integrate, query, and share data from multiple dynamic sources with multi-tenant architecture.

| Component | Technology |
|-----------|------------|
| Backend | Spring Boot (Java 21), PostgreSQL, JDBI |
| Frontend | React (Vite + TypeScript), TailwindCSS |
| Architecture | Hexagonal + DDD (Domain-Driven Design) |

---

## 🏗️ Bounded Contexts

| Context | Status | Description |
|---------|--------|-------------|
| **IAM** | ✅ Complete | Tenant, ApiKey management |
| **Connectivity** | ✅ Complete | Connector management, metadata fetching |
| **DataAccess** | 🔄 In Progress | DataEndpoint, Dynamic Query |
| **Reporting** | 📋 Planned | Report generation |

---

## 🎯 Phase 1: Foundation (COMPLETE ✅)

- [x] Project setup (Spring Boot + Vite React)
- [x] Multi-tenant architecture with `X-Tenant-ID`
- [x] API Key authentication with `X-API-Key`
- [x] PostgreSQL + Liquibase migrations
- [x] Global exception handling with traceId
- [x] Logging with MDC (traceId, userId)

---

## 🎯 Phase 2: IAM Context (COMPLETE ✅)

- [x] Tenant aggregate root with TenantId, TenantStatus
- [x] ApiKey aggregate root with secure key generation
- [x] TenantApplicationService, ApiKeyApplicationService
- [x] Repository pattern (domain + JPA implementation)
- [x] Frontend: Tenant & API Key management UI

---

## 🎯 Phase 3: Connectivity Context (COMPLETE ✅)

- [x] Connector aggregate root with ConnectorId, ConnectorStatus
- [x] ConnectionConfig, ConnectorType value objects
- [x] ConnectorApplicationService
- [x] ConnectorMetadataService (fetch tables from source DB)
- [x] Test Connection optimization (reuse existing connector)
- [x] GlobalExceptionHandler for connection timeouts
- [x] Frontend: Connector CRUD, Wizard, Details View

---

## 🎯 Phase 4: DataAccess Context (IN PROGRESS 🔄)

### Backend
- [ ] Refactor `DataEndpoint` as aggregate root
- [ ] Create `DataEndpointId` value object
- [ ] Create `QueryDefinition` value object
- [ ] Create `DataEndpointRepository` interface
- [ ] Create `DataEndpointApplicationService`
- [ ] Refactor `DynamicQueryService` to infrastructure

### Frontend
- [ ] Improve Data Endpoint creation wizard
- [ ] Data masking configuration UI
- [ ] Query preview with real data
- [ ] Data Endpoint status management

---

## 🎯 Phase 5: Data Explorer (PLANNED 📋)

### Backend
- [ ] Dynamic query execution API
- [ ] Pagination and filtering
- [ ] Export to CSV/Excel

### Frontend
- [ ] Data Explorer UI with table browser
- [ ] SQL query builder
- [ ] Chart visualization

---

## 🎯 Phase 6: Reporting Context (PLANNED 📋)

- [ ] Report aggregate root
- [ ] Scheduled report generation
- [ ] Report templates
- [ ] Export formats (PDF, Excel)

---

## 🎯 Phase 7: Security & Quality (ONGOING 🔄)

### Security
- [ ] OAuth2/OIDC integration
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Data encryption at rest

### Quality
- [x] ArchUnit tests for DDD architecture
- [ ] Integration tests with Testcontainers
- [ ] E2E tests with Playwright
- [ ] Performance benchmarking

---

## 🎯 Phase 8: DevOps & Production (PLANNED 📋)

- [ ] Docker containerization
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Log aggregation (ELK Stack)

---

## 📊 Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: IAM | ✅ Complete | 100% |
| Phase 3: Connectivity | ✅ Complete | 100% |
| Phase 4: DataAccess | 🔄 In Progress | 30% |
| Phase 5: Data Explorer | 📋 Planned | 0% |
| Phase 6: Reporting | 📋 Planned | 0% |
| Phase 7: Security & Quality | 🔄 Ongoing | 40% |
| Phase 8: DevOps | 📋 Planned | 0% |

---

## 🔜 Next Actions

1. **Immediate**: Complete DataAccess context DDD migration
2. **Short-term**: Data Explorer feature implementation
3. **Mid-term**: Reporting context and security enhancements
4. **Long-term**: Production deployment and monitoring
