# Project Structure Design

> **Goal:** Separate the monolithic project structure into distinct `frontend` and `backend` directories to support a modern full-stack development workflow.

## 1. Current Structure
```
d:\projects\ldop-demo
├── pom.xml          (Backend Build)
├── src/             (Backend Source)
├── target/          (Backend Build Artifacts)
├── API_CHEATSHEET.md
├── ARCHITECTURE.md
└── ...
```

## 2. Proposed Structure

We will adopt a **Monorepo-style** layout.

```
d:\projects\ldop-demo
├── backend/                 # Java/Spring Boot Project
│   ├── pom.xml
│   ├── src/
│   ├── target/
│   └── .gitignore           # Backend-specific ignore
│
├── frontend/                # React/Vite Project
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   ├── public/
│   └── .gitignore           # Frontend-specific ignore
│
├── docs/                    # Documentation
│   ├── mockups/             # UI Design Mockups (Reference Mandatory)
│   ├── API_CHEATSHEET.md
│   ├── ARCHITECTURE.md
│   ├── FRONTEND_SPEC.md
│   └── UI_ANALYSIS.md
│
└── README.md                # Root Project Documentation
```

## 3. Migration Plan

### Phase 1: Backend Migration
1.  Create `backend/` directory.
2.  Move `pom.xml`, `src/`, and `target/` into `backend/`.
3.  Update IDE configuration (IntelliJ/VS Code) to recognize `backend` as the Maven root.

### Phase 2: Documentation Organization
1.  Create `docs/` directory.
2.  Move all markdown specifications (`*.md`) into `docs/`.
3.  Create a root `README.md` pointing to these docs.

### Phase 3: Frontend Initialization
1.  Create `frontend/` directory.
2.  Initialize the React+Vite project inside `frontend/` as per `FRONTEND_SPEC.md`.

## 4. Benefits
*   **Clean Separation:** Backend and Frontend have their own build lifecycles (Maven vs NPM).
*   **Clarity:** Documentation is centralized.
*   **Scalability:** Easier to add other services (e.g., `worker`, `scripts`) in the future.
