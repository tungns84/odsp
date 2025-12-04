# Remaining Tasks for DDD Migration

> **Last Updated:** 2025-12-03
> **Current Status:** Phase 3 (Connectivity) Complete - Manual Verification Pending

## ✅ Phase 3.1: Fix Build & Verify (COMPLETE)

All compilation errors have been resolved:
- ✅ `DataEndpoint.java` import updated to use `com.gs.dsp.connectivity.domain.model.Connector`
- ✅ `mvn clean compile` - Successful (17.9s)
- ✅ `mvn test` - All tests passing (79s)
- ✅ Backend application starts without errors

### Manual Verification Recommended
- [ ] Test Connector creation API via Postman/curl
- [ ] Test "Test Connection" functionality
- [ ] Test Connector approval workflow (INIT → APPROVED)
- [ ] Verify tenant isolation with different X-Tenant-ID headers

## 🛡️ Architecture & Quality Assurance

- [ ] **Implement ArchUnit Tests**
  - [ ] Create `ArchitectureTest.java`
  - [ ] Define rules to enforce DDD layer boundaries (Domain should not depend on Infrastructure)
  - [ ] Define rules for naming conventions (Repositories, Services)
  - [ ] Define rules for Aggregate Root and Value Object usage
- [ ] **Code Cleanup**
  - [ ] Remove any unused DTOs or utility classes from the old structure

## 🚀 Phase 4: Data Access Context (Next Major Phase)

Migrate `DataEndpoint` to a proper DDD Bounded Context.

- [ ] **Design**
  - [ ] Define `dataaccess` package structure
  - [ ] Design `DataEndpoint` as Aggregate Root
  - [ ] Design `QueryDefinition` as Value Object
- [ ] **Implementation**
  - [ ] Create `DataEndpointId` value object
  - [ ] Move `DataEndpoint` to `com.gs.dsp.dataaccess.domain.model`
  - [ ] Create `DataEndpointRepository` (Domain & Infrastructure)
  - [ ] Create `DataEndpointApplicationService`
  - [ ] Refactor `DynamicQueryService` to be a Domain Service or Infrastructure Service within this context

## 📊 Phase 5: Reporting Context (Future)

- [ ] **Design & Implementation**
  - [ ] Create `reporting` bounded context
  - [ ] Migrate `Report` entity to Aggregate Root
  - [ ] Implement Report generation logic as Domain Service
