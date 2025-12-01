# PROJECT SPECIFICATION: Open Data Integration Platform

> **Document Version:** 2.1.0  
> **Last Updated:** 2025-11-28  

---

## 1. Technology Stack & Constraints
*(Existing content remains unchanged)*

---

## 2. Key Features
### 2.1 Multi-Tenant Architecture
- **Tenant Management**: Centralized CRUD for tenants.
- **API Key Authentication**: Secure access via `X-API-Key`.
- Tenant isolation via `X-Tenant-ID` (internal) or derived from API Key.

*(Rest of section 2 remains unchanged)*

---

## 3. Database Schema (System Metadata)

### Tenant & Security Schema (NEW)

```sql
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'acme-corp'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL, -- BCrypt hash of the key
    prefix VARCHAR(10) NOT NULL, -- First few chars for display (e.g., 'ldop_sk_')
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_key_hash (key_hash),
    INDEX idx_tenant_api (tenant_id)
);
```

### Connector Schema
*(Existing content remains unchanged)*

---

## 4. Architecture Components

### 4.1 Backend Services

#### TenantService (NEW)
- Manages Tenant lifecycle.
- Validates tenant status during request processing.

#### ApiKeyService (NEW)
- Generates secure random keys (e.g., `SecureRandom`).
- Hashes keys using BCrypt before storage.
- Validates keys and caches results (short TTL) for performance.

*(Rest of section 4 remains unchanged)*

---

## 5. Data Flow

### 5.3 API Key Authentication Flow (NEW)

```
1. Client → Request with header `X-API-Key: ldop_sk_123...`
   ↓
2. TenantInterceptor:
   - Extracts key.
   - Calls ApiKeyService.validate(key).
   - Hashes key and looks up in DB (or Cache).
   - Checks Status=ACTIVE and Not Expired.
   ↓
3. If Valid:
   - Retrieves `tenant_id` from ApiKey entity.
   - Sets `TenantContext.setTenantId(tenantId)`.
   - Updates `last_used_at` (async).
   - Proceeds to Controller.
   ↓
4. If Invalid:
   - Returns 401 Unauthorized.
```

---

*(Rest of document remains unchanged)*