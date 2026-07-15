# AI Agent Workflow Rules

This file enforces the software development lifecycle policies for any AI agent interacting with this codebase.

---

## 1. Absolute Directives
*   **Single Source of Truth**: Treat `PROJECT_OVERVIEW.md` as the ultimate boundary descriptor. If a feature or sub-requirement is not explicitly itemized in a user flow, you must reject it or ask the user to amend the specification file before writing code.
*   **Scope Gatekeeping**: Intercept feature creep immediately. Do not build authentication modules, multitenancy support, microservices, background jobs, or database migration tables that are labeled out of scope.

---

## 2. Implementation Playbook
1.  **Read Files First**: Prior to writing any code, scan `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, and `CODE_STANDARDS.md`.
2.  **Incremental Execution**: Build one feature slice at a time (e.g., compile the database backend structure before writing frontend visual components).
3.  **No Placeholders**: Never drop code chunks containing structural comments like `// TODO: Implement later` or `/* fix this placeholder */`. All generated modules must be structurally complete.
4.  **Enforce Transactions**: When managing database mutations containing relational components, always write standard transactional error protections to prevent corrupt partial entries.