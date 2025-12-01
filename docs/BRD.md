# Business Requirements Document (BRD)
> **Project:** Open Data Integration Platform
> **Version:** 1.2
> **Date:** 2025-11-28

## 1. Feature: Connector Table Registration
*(Existing content remains unchanged)*

## 2. Feature: Tenant Management
### 2.1 Overview
To support a multi-tenant architecture effectively, the platform requires a centralized system to manage tenants. This allows administrators to onboard new organizations, manage their lifecycle, and ensure data isolation.

### 2.2 User Stories
*   **As a Platform Admin**, I want to create new tenants, so that I can onboard new customers or teams.
*   **As a Platform Admin**, I want to view a list of all tenants and their status, so that I can monitor platform usage.
*   **As a Platform Admin**, I want to deactivate a tenant, so that I can suspend access for non-payment or security reasons.

### 2.3 Functional Requirements
#### FR-05: Tenant CRUD Operations
*   **Create:** Input Name, Description. System generates a unique `tenant_id`.
*   **Read:** List all tenants with pagination and filtering by status.
*   **Update:** Modify Name, Description, Status (ACTIVE/INACTIVE).
*   **Delete:** Soft delete or deactivate (hard delete requires safeguards).

## 3. Feature: API Key Management
### 3.1 Overview
To enable secure programmatic access to the platform's data endpoints, tenants need to generate and manage API Keys. These keys will serve as the primary authentication mechanism for external applications consuming the data.

### 3.2 User Stories
*   **As a Tenant Admin**, I want to generate a new API Key, so that I can connect my external application to the platform.
*   **As a Tenant Admin**, I want to revoke an API Key, so that I can rotate credentials or block compromised keys.
*   **As a Tenant Admin**, I want to see a list of active API Keys and their last used date, so that I can audit access.

### 3.3 Functional Requirements
#### FR-06: API Key Generation
*   **Input:** Key Name (e.g., "Marketing Dashboard"), Expiry Date (optional).
*   **Output:** A secure, random API Key string (e.g., `ldop_sk_...`). **Displayed only once.**
*   **Storage:** Store the hash of the key, not the plain text.

#### FR-07: API Key Validation
*   **Mechanism:** Middleware/Interceptor checks `X-API-Key` header.
*   **Logic:**
    1.  Lookup key hash in database.
    2.  Check if key is Active and not Expired.
    3.  Identify associated Tenant.
    4.  Set Tenant Context for the request.

#### FR-08: API Key Revocation
*   **Action:** User clicks "Revoke" on a key.
*   **System:** Marks key status as REVOKED. Immediate effect on next request.

## 4. Assumptions & Constraints
*(Existing content remains unchanged)*
