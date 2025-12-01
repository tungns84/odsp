# Frontend Specification: Open Data Integration Platform

> **Document Version:** 1.0.0
> **Date:** 2025-11-22
> **Status:** Draft

## 1. Overview
This document outlines the architecture, technology stack, and screen specifications for the frontend of the **Open Data Integration Platform**. The frontend will be a Single Page Application (SPA) designed to manage data connectors and explore dynamic data endpoints.

## 2. Technology Stack

Based on the project constraints and modern best practices:

*   **Core Framework:** React 18+
*   **Build Tool:** Vite (Fast HMR and build)
*   **Language:** TypeScript (Strict Mode)
*   **Routing:** React Router DOM v6+
*   **State Management:**
    *   **Server State:** TanStack Query (React Query) v5 (Caching, Synchronization)
*   **State Management:**
    *   **Server State:** TanStack Query (React Query) v5.
    *   **Global Client State:** **Redux Toolkit** (Strictly typed slices).
*   **UI Component Library:** **@ldop-ui/core** (Internal Wrapper around Ant Design v5).
    *   *Rule:* Do NOT import `antd` directly in features. Use `@ldop-ui/core`.
*   **Testing:**
    *   **Unit/Component:** **Jest** + **React Testing Library**.
    *   *Rule:* NO Enzyme. Prefer Unit tests over Integration.
*   **Styling:** TailwindCSS (Utility-first CSS for layout and custom styling overrides)
*   **Form Handling:** React Hook Form + Zod (Schema validation)
*   **HTTP Client:** Axios (with interceptors for `X-Tenant-ID`)
*   **Code Editor:** Monaco Editor (`@monaco-editor/react`)
    *   *Purpose:* For rich SQL editing with syntax highlighting and autocomplete.
*   **Icons:** Lucide React or Ant Design Icons
*   **Theming:** CSS Variables + React Context (Dynamic theme switching)

## 2.1 Theming System

The application supports **dynamic theme selection** allowing users to choose their preferred primary color theme. The system is built on:

*   **CSS Variables:** All colors are defined as CSS custom properties in HSL format
*   **Semantic Tokens:** Colors are referenced by purpose (e.g., `primary`, `surface`, `surface-elevated`) rather than specific values
*   **React Context:** Global theme state managed via `ThemeContext`
*   **localStorage Persistence:** User's theme preference is saved and persists across sessions

### Available Themes
The system supports the following predefined color themes:
*   **Blue** (Default) - Professional and trustworthy
*   **Purple** - Creative and modern
*   **Green** - Natural and calming
*   **Orange** - Energetic and friendly
*   **Red** - Bold and attention-grabbing

Each theme provides:
*   Primary color and hover state
*   Consistent dark surface backgrounds
*   Semantic color tokens for borders, text, and accents

### Theme Usage in Components
**DO:**
```tsx
// Use semantic color tokens
<div className="bg-surface border-surface-border">
  <button className="bg-primary hover:bg-primary-hover">Click</button>
</div>
```

**DON'T:**
```tsx
// Avoid hardcoded colors
<div className="bg-slate-800 border-slate-700">
  <button className="bg-blue-500 hover:bg-blue-600">Click</button>
</div>
```

### Theme Switching API
```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map(t => <option key={t}>{t}</option>)}
    </select>
  );
}
```


## 3. Architecture

### 3.1 Directory Structure (Feature-based)

```
src/
├── assets/             # Static assets (images, fonts)
├── components/         # Shared UI components (Button, Layout, etc.)
│   ├── core/           # (@ldop-ui/core) AntD Wrappers
│   ├── common/
│   └── layout/
├── config/             # App configuration (env vars, constants)
├── features/           # Feature-based modules
│   ├── auth/           # Authentication & Tenant selection
│   ├── connectors/     # Connector management (List, Create, Approve)
│   └── explorer/       # Data exploration & Querying
├── hooks/              # Shared custom hooks
├── lib/                # Third-party library configurations (Axios, QueryClient)
├── routes/             # Route definitions
├── stores/             # Global Zustand stores
├── types/              # Shared TypeScript interfaces
├── utils/              # Helper functions
└── App.tsx             # Root component
```

### 3.2 Key Architectural Patterns

*   **API Layer:**
    *   Centralized Axios instance in `lib/axios.ts`.
    *   Request interceptor to inject `X-Tenant-ID` header from the global store.
    *   Response interceptor for global error handling (401, 403, 500).
*   **Data Fetching:**
    *   Custom hooks wrapping `useQuery` and `useMutation` (e.g., `useConnectors`, `useCreateConnector`).
    *   Optimistic updates for UI responsiveness where applicable.
*   **Layout:**
    *   **MainLayout:** Sidebar navigation (Connectors, Data Explorer), Header (Tenant Switcher, User Profile), Content Area.

## 4. Screens & UI Specifications

### 4.1 Global Elements
*   **Tenant Selector:** A dropdown or input in the header/login screen to set the `X-Tenant-ID`. This is critical for multi-tenancy support.
*   **Navigation Sidebar:** Links to "Connectors" and "Data Explorer".

### 4.2 Screen: Connector Management (`/connectors`)
*   **Purpose:** View, manage, and approve data connectors.
*   **Components:**
    *   **Stats Cards:** Total Connectors, Active, Pending Approval.
    *   **Connector Table:**
        *   Columns: Name, Type (Database/API), Status (Init/Approved/Rejected), Created At, Actions.
        *   Actions: View Details, Delete.
        *   *Admin Action:* Approve/Reject button (visible if status is INIT).
    *   **Create Button:** Opens the "Create Connector" Modal/Page.

### 4.3 Screen: Create Connector (`/connectors/create` or Modal)
*   **Purpose:** Register a new data source and select available tables.
*   **Flow:** Multi-step Wizard.
*   **Step 1: Connection Details**
    *   **Name:** Text input.
    *   **Type:** Select (DATABASE, REST_API).
    *   **Configuration:**
        *   *If DATABASE:* Host, Port, Database Name, Username, Password.
    *   **Action:** "Test & Next" (Validates connection and fetches tables).
*   **Step 2: Table Selection (Database Only)**
    *   **UI:** Multi-select list of tables fetched from the database.
    *   **Features:** Search bar, Select All/None.
    *   **Validation:** At least one table must be selected.
*   **Validation:** Zod schema validation.

### 4.4 Screen: Data Explorer (`/explorer`)
*   **Purpose:** Query data from registered endpoints.
*   **Components:**
    *   **Endpoint Selector:** Dropdown to select a Data Endpoint (requires fetching available endpoints).
    *   **Query Controls:**
        *   Page Size selector.
        *   Refresh button.
    *   **Data Table:**
        *   Dynamic columns based on the JSON response.
        *   Pagination controls (Page 1, 2, 3...).
        *   Loading skeletons during data fetch.
    *   **JSON View (Optional):** Toggle to view raw JSON response.

### 4.5 Screen: Create Data Endpoint (Query Builder)
*   **Purpose:** Create a new Data Endpoint by selecting a table OR writing a Custom SQL query.
*   **Flow:**
    1.  **Select Connector:** Choose a registered Database Connector.
    2.  **Select Source Type:**
        *   **Option A: Table:** Dropdown listing all tables.
        *   **Option B: Custom SQL:** 
            *   **Component:** Monaco Editor (SQL Mode).
            *   **Features:** Syntax highlighting, **Autocomplete/Suggestions** (keywords, and ideally table/column names from the schema).
    3.  **Build Query (on top of source):**
        *   **Columns:** Select specific columns from the source.
        *   **Filters:** Add conditions.
        *   **Sort:** Select sort columns.
        *   **Sort:** Select sort columns.
    4.  **Test Query (Preview):** Button to execute the query and show the Top 10 results to verify correctness.
    5.  **Save:** Name the endpoint and save.

## 5. API Integration Map

| Feature | Frontend Action | API Endpoint | Method |
| :--- | :--- | :--- | :--- |
| **Connectors** | List Connectors | `/api/v1/connectors` | GET |
| | Create Connector | `/api/v1/connectors` | POST |
| | Get Details | `/api/v1/connectors/{id}` | GET |
| | Delete Connector | `/api/v1/connectors/{id}` | DELETE |
| | Approve/Reject | `/api/v1/connectors/{id}/approval` | PUT |
| **Explorer** | Query Data | `/api/v1/data/{id}` | GET |

## 6. Development Guidelines
1.  **Mockup First:** Before coding any screen, check `docs/mockups/` for the visual design.
2.  **Strict TypeScript:**
    *   **NO `any` types.** Use `unknown` if necessary, but prefer strict interfaces.
    *   **NO JavaScript.** All files must be `.ts` or `.tsx`.
3.  **Component Architecture:**
    *   Use **Functional Components** with Hooks.
    *   Import UI components ONLY from `@ldop-ui/core`.
4.  **Testing Strategy:**
    *   **Prefer Unit Tests** (Jest/RTL) for logic and components.
    *   **Avoid Cypress** unless absolutely necessary for critical E2E flows.
5.  **Strict Types:** All API responses must be typed.
3.  **Error Handling:** Display user-friendly toast notifications for API errors.
4.  **Loading States:** Use skeletons or spinners for all async operations.
5.  **Responsiveness:** Ensure the UI works on desktop and tablet sizes.
