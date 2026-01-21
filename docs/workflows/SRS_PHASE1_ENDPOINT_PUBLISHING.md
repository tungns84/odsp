# Software Requirements Specification (SRS)
# Workflow Management - Phase 1: Endpoint Publishing

**Version:** 1.0  
**Date:** 2026-01-21  
**Author:** DSP Development Team  
**Status:** Implemented

---

## 1. Introduction

### 1.1 Purpose

Document mô tả chi tiết các yêu cầu phần mềm cho Phase 1 của hệ thống Workflow Management trong DSP (Data Service Platform). Phase 1 tập trung vào workflow "Data Endpoint Publishing" - quy trình duyệt và publish các data endpoints.

### 1.2 Scope

**In Scope:**
- Backend API endpoints cho workflow management (generic)
- Frontend UI cho Task Inbox (workflow-specific)
- Integration với Flowable workflow engine
- Role-based access control (Admin/User)

**Out of Scope:**
- Multiple workflow types (Phase 2+)
- Advanced task assignment/delegation
- Workflow analytics/reporting
- BPMN diagram visualization

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Workflow** | Một BPMN process definition xác định luồng công việc |
| **Process Instance** | Một instance cụ thể của workflow đang chạy |
| **Task** | Một bước trong workflow yêu cầu user action |
| **Endpoint** | Data Endpoint - API endpoint để truy cập dữ liệu |

### 1.4 References

- Flowable Documentation: https://www.flowable.com/open-source/docs/bpmn
- DSP Data Endpoint API Specification
- DSP Authentication & Authorization Guide

---

## 2. Overall Description

### 2.1 Product Perspective

```
┌─────────────────────────────────────────────────────────────┐
│                     DSP Platform                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Tenant    │  │  Connector  │  │   Data Endpoint     │  │
│  │ Management  │  │ Management  │  │   Management        │  │
│  └─────────────┘  └─────────────┘  └─────────┬───────────┘  │
│                                              │               │
│                                              ▼               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Workflow Management (Phase 1)            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │  Flowable   │  │  Task API   │  │  Task Inbox  │   │  │
│  │  │   Engine    │◄─┤  (Backend)  │◄─┤  (Frontend)  │   │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions

1. **Request Publish** - User yêu cầu publish một data endpoint
2. **View Pending Tasks** - Admin xem danh sách tasks cần duyệt
3. **Approve Task** - Admin duyệt và hoàn thành một task
4. **Auto-Activate Endpoint** - Hệ thống tự động activate endpoint sau khi được duyệt

### 2.3 User Classes and Characteristics

| User Class | Description | Permissions |
|------------|-------------|-------------|
| **User** | End user tạo và quản lý data endpoints | Request Publish |
| **Admin** | Administrator có quyền duyệt | View Tasks, Approve Tasks |

### 2.4 Operating Environment

- **Backend:** Java 17+, Spring Boot 3.x, Flowable 7.2.0
- **Frontend:** React 19, TypeScript, Vite
- **Database:** PostgreSQL 15+
- **Browser:** Chrome, Firefox, Safari, Edge (latest 2 versions)

### 2.5 Design and Implementation Constraints

- Phải sử dụng Flowable workflow engine (đã cài đặt)
- API phải tuân theo RESTful conventions
- Frontend phải responsive và accessible (WCAG 2.1 AA)
- Phải hỗ trợ multi-tenancy thông qua `X-Tenant-ID` header

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR-001: Start Publishing Workflow

| Attribute | Value |
|-----------|-------|
| **ID** | FR-001 |
| **Title** | Start Publishing Workflow |
| **Priority** | HIGH |
| **Actor** | User |

**Description:**  
User có thể khởi tạo quy trình publish cho một data endpoint đang ở trạng thái INACTIVE.

**Pre-conditions:**
- User đã đăng nhập
- Data endpoint tồn tại và thuộc tenant của user
- Data endpoint có status = INACTIVE

**Post-conditions:**
- Process instance được tạo trong Flowable
- Task "Approve Publication" được tạo cho admin group
- User nhận thông báo thành công

**Input:**
```json
{
  "endpointId": "string (UUID)",
  "tenantId": "string"
}
```

**Output:**
```json
{
  "processInstanceId": "string",
  "status": "STARTED"
}
```

**Business Rules:**
- BR-001: Một endpoint chỉ có thể có một pending publish request tại một thời điểm
- BR-002: Chỉ endpoint owner hoặc admin có thể request publish

---

#### FR-002: List Pending Tasks

| Attribute | Value |
|-----------|-------|
| **ID** | FR-002 |
| **Title** | List Pending Tasks |
| **Priority** | HIGH |
| **Actor** | Admin |

**Description:**  
Admin có thể xem danh sách tất cả các tasks đang chờ duyệt.

**Pre-conditions:**
- User có role Admin

**Post-conditions:**
- Danh sách tasks được hiển thị
- Tasks được sắp xếp theo thời gian tạo (mới nhất trước)

**Output:**
```json
[
  {
    "id": "string",
    "name": "Approve Publication",
    "processDefinitionKey": "endpoint-publishing",
    "processInstanceId": "string",
    "variables": {
      "endpointId": "string",
      "tenantId": "string"
    },
    "assignee": null,
    "createTime": "ISO 8601 datetime"
  }
]
```

**Business Rules:**
- BR-003: Chỉ hiển thị tasks thuộc candidate group của user
- BR-004: Tasks được auto-refresh mỗi 30 giây

---

#### FR-003: Complete Task (Approve)

| Attribute | Value |
|-----------|-------|
| **ID** | FR-003 |
| **Title** | Complete Task |
| **Priority** | HIGH |
| **Actor** | Admin |

**Description:**  
Admin approve một task, triggering workflow tiếp tục và endpoint được activate.

**Pre-conditions:**
- Task tồn tại và chưa được complete
- User có quyền complete task (thuộc candidate group)

**Post-conditions:**
- Task được đánh dấu complete
- Workflow tiến đến step tiếp theo (Service Task: Publish Endpoint)
- Endpoint status chuyển thành ACTIVE
- Process instance kết thúc

**Input:**
- Path parameter: `taskId`

**Output:**
- HTTP 200 OK (no body)

**Business Rules:**
- BR-005: Một task chỉ có thể được complete một lần
- BR-006: Complete task sẽ trigger PublishEndpointDelegate

---

#### FR-004: Auto-Activate Endpoint

| Attribute | Value |
|-----------|-------|
| **ID** | FR-004 |
| **Title** | Auto-Activate Endpoint |
| **Priority** | HIGH |
| **Actor** | System |

**Description:**  
Sau khi Admin approve, hệ thống tự động chuyển endpoint sang trạng thái ACTIVE.

**Pre-conditions:**
- Task "Approve Publication" đã được complete
- Endpoint tồn tại

**Post-conditions:**
- Endpoint.status = ACTIVE
- Process instance terminates

**Business Rules:**
- BR-007: Activation xảy ra trong cùng transaction với task completion
- BR-008: Nếu activation fail, toàn bộ transaction rollback

---

#### FR-005: View Current User Info

| Attribute | Value |
|-----------|-------|
| **ID** | FR-005 |
| **Title** | View Current User Info |
| **Priority** | MEDIUM |
| **Actor** | Any User |

**Description:**  
Frontend có thể lấy thông tin user hiện tại bao gồm role để hiển thị UI phù hợp.

**Output:**
```json
{
  "id": "string",
  "username": "string",
  "role": "ADMIN | USER"
}
```

**Implementation Note (Phase 1):**
- Hardcoded trả về ADMIN role
- Phase 2+ sẽ integrate với IAM system

---

### 3.2 Non-Functional Requirements

#### NFR-001: Performance

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 500ms |
| Task List Load Time | < 2s |
| Concurrent Users | 50 |
| Tasks per Tenant | 1000 |

#### NFR-002: Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Data Consistency | 100% (ACID transactions) |
| Error Rate | < 0.1% |

#### NFR-003: Usability

| Metric | Target |
|--------|--------|
| Time to Complete Task | < 10 seconds |
| Click Count (Request Publish) | 2 clicks |
| Click Count (Approve Task) | 2 clicks |
| Accessibility | WCAG 2.1 AA |

#### NFR-004: Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | API Key / Session-based |
| Authorization | Role-based (Admin/User) |
| Tenant Isolation | X-Tenant-ID header |
| Data Encryption | TLS 1.3 in transit |

#### NFR-005: Maintainability

| Requirement | Implementation |
|-------------|----------------|
| Code Coverage | > 70% |
| Documentation | API docs, inline comments |
| Logging | Structured JSON logs with traceId |

---

## 4. External Interface Requirements

### 4.1 API Endpoints

#### 4.1.1 Start Process

```
POST /api/workflow/process-instance/{processKey}

Path Parameters:
  - processKey: BPMN process definition key (e.g., "endpoint-publishing")

Headers:
  - Content-Type: application/json
  - X-Tenant-ID: string

Request Body:
  {
    "endpointId": "string",
    "tenantId": "string"
  }

Response 200:
  {
    "processInstanceId": "string",
    "status": "STARTED"
  }

Response 400:
  {
    "code": "INVALID_REQUEST",
    "message": "string",
    "traceId": "string"
  }

Response 404:
  {
    "code": "PROCESS_NOT_FOUND",
    "message": "Process definition not found: {processKey}",
    "traceId": "string"
  }
```

#### 4.1.2 List Tasks

```
GET /api/workflow/tasks

Query Parameters:
  - group: Candidate group filter (default: "admin")

Headers:
  - X-Tenant-ID: string

Response 200:
  [
    {
      "id": "string",
      "name": "string",
      "processDefinitionKey": "string",
      "processInstanceId": "string",
      "variables": { ... },
      "assignee": "string | null",
      "createTime": "string (ISO 8601)"
    }
  ]
```

#### 4.1.3 Complete Task

```
POST /api/workflow/tasks/{taskId}/complete

Path Parameters:
  - taskId: Task ID from Flowable

Headers:
  - X-Tenant-ID: string

Response 200: (empty body)

Response 404:
  {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found: {taskId}",
    "traceId": "string"
  }
```

#### 4.1.4 Get Current User

```
GET /api/me

Response 200:
  {
    "id": "string",
    "username": "string",
    "role": "ADMIN | USER"
  }
```

### 4.2 User Interface Specifications

#### 4.2.1 Task Inbox Page

**URL:** `/workflow/tasks`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ▶️ Endpoint Approval                         [🔄 Refresh]  │
│  Approve data endpoints for publication                     │
├─────────────────────────────────────────────────────────────┤
│  3 pending tasks                                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approve Publication                                  │   │
│  │ Endpoint: ep-12345 🔗  Tenant: tenant-1            │   │
│  │ 🕐 Created: Jan 21, 2026, 10:30 AM        [Approve] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approve Publication                                  │   │
│  │ Endpoint: ep-67890 🔗  Tenant: tenant-2            │   │
│  │ 🕐 Created: Jan 21, 2026, 09:15 AM        [Approve] │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**States:**
1. **Loading:** Spinner với "Loading tasks…"
2. **Empty:** Icon inbox + "No pending approval tasks"
3. **Error:** Red alert với error message và Retry button
4. **Loaded:** List of task cards

**Interactions:**
- Click "Refresh" → Re-fetch tasks
- Click "Approve" → API call → Task disappears from list
- Click Endpoint ID → Navigate to endpoint details

#### 4.2.2 Request Publish Button (Data Endpoints Page)

**Location:** Actions column trong Data Endpoints table

**Visibility:** Chỉ hiển thị cho endpoints có status = INACTIVE

**Icon:** `publish` (Material Symbols)

**Behavior:**
1. Click button
2. API call start process
3. Success: Alert "Publishing request for "{name}" submitted. Admin will review."
4. Error: Alert với error message

#### 4.2.3 Sidebar Navigation

**Menu Item:** "Task Inbox"

**Icon:** `task_alt` (Material Symbols)

**Visibility:** Chỉ hiển thị cho users có role = ADMIN

**Active State:** Highlighted khi URL matches `/workflow/*`

---

## 5. Data Model

### 5.1 BPMN Process Definition

**File:** `endpoint-publishing.bpmn20.xml`

```xml
<process id="endpoint-publishing" name="Data Endpoint Publishing">
  <startEvent id="start" />
  
  <userTask id="approveTask" 
            name="Approve Publication"
            flowable:candidateGroups="admin" />
  
  <serviceTask id="publishTask" 
               name="Publish Endpoint"
               flowable:delegateExpression="${publishEndpointDelegate}" />
  
  <endEvent id="end" />
  
  <sequenceFlow sourceRef="start" targetRef="approveTask" />
  <sequenceFlow sourceRef="approveTask" targetRef="publishTask" />
  <sequenceFlow sourceRef="publishTask" targetRef="end" />
</process>
```

### 5.2 Process Variables

| Variable | Type | Description |
|----------|------|-------------|
| `endpointId` | String (UUID) | ID của data endpoint cần publish |
| `tenantId` | String | Tenant ID của endpoint |

### 5.3 Frontend Types

```typescript
interface WorkflowTask {
  id: string;
  name: string;
  processDefinitionKey: string;
  processInstanceId: string;
  variables: Record<string, unknown>;
  assignee: string | null;
  createTime: string | null;
}

interface CurrentUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

interface StartProcessResponse {
  processInstanceId: string;
  status: string;
}
```

---

## 6. Use Cases

### UC-001: Request Endpoint Publishing

**Actor:** User

**Preconditions:**
- User logged in
- Endpoint exists with status INACTIVE

**Main Flow:**
1. User navigates to Data Endpoints page
2. User finds endpoint in table
3. User clicks "Request Publish" button
4. System validates endpoint status
5. System calls API to start workflow
6. System shows success message
7. Workflow creates task for Admin

**Alternative Flows:**
- 4a. Endpoint already ACTIVE → Show error message
- 5a. API fails → Show error message with retry option

**Postconditions:**
- Process instance created
- Admin sees new task in inbox

---

### UC-002: Approve Endpoint Publishing

**Actor:** Admin

**Preconditions:**
- Admin logged in
- Task exists in inbox

**Main Flow:**
1. Admin navigates to Task Inbox
2. Admin sees list of pending tasks
3. Admin clicks "Approve" on a task
4. System calls API to complete task
5. System removes task from list
6. Workflow activates endpoint

**Alternative Flows:**
- 4a. Task already completed → Show error, refresh list
- 5a. Activation fails → Show error, task remains

**Postconditions:**
- Task completed
- Endpoint status = ACTIVE

---

## 7. Appendices

### A. File Inventory

**Backend:**
| File | Description |
|------|-------------|
| `WorkflowController.java` | REST endpoints for workflow APIs |
| `UserController.java` | `/api/me` endpoint |
| `PublishEndpointDelegate.java` | Service task implementation |
| `endpoint-publishing.bpmn20.xml` | BPMN process definition |

**Frontend:**
| File | Description |
|------|-------------|
| `workflowTypes.ts` | TypeScript type definitions |
| `workflowService.ts` | API client for workflow endpoints |
| `authService.ts` | API client for `/api/me` |
| `useWorkflowTasks.ts` | SWR hook for task management |
| `useCurrentUser.ts` | SWR hook for current user |
| `EndpointTaskInbox.tsx` | Task inbox page component |
| `EndpointTaskCard.tsx` | Individual task card component |

### B. Test Scenarios

See: `WORKFLOW_TEST_SCENARIOS.md`

### C. Glossary

| Term | Definition |
|------|------------|
| BPMN | Business Process Model and Notation |
| SWR | stale-while-revalidate - React data fetching library |
| Flowable | Open-source business process engine |
| DSP | Data Service Platform |

---

**Document History:**

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-01-21 | AI Assistant | Initial release for Phase 1 |
