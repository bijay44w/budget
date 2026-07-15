# Code Standards and Guidelines

This document establishes the coding conventions, architectural practices, and quality standards for the **Budgetree** codebase.

---

## 1. Frontend Standards (Next.js 15 & React 19)

### TypeScript & Type Safety
*   **No `any`**: Explicitly type all variables, function parameters, and return types.
*   **Strict Props**: Always define interfaces or types for component props.
*   **Zod Integration**: Define forms and API responses using Zod schemas. Infer TypeScript types directly from schemas.

### React Components & App Router
*   **Component Structure**: Use functional components with standard `export default` for page/layout entry points, and named exports for reusable UI components.
*   **Client vs. Server Components**: Default to Server Components (`app/` files) for data fetching. Use `"use client"` strictly at the leaf nodes (forms, charts, dropdowns).
*   **File Naming**: Use `kebab-case` for file and directory names in the `app` router. Use `PascalCase` for React components.

---

## 2. Backend Standards (Go & Fiber)

### Idiomatic Go & Code Structure
*   **Error Handling**: Never ignore errors. Check errors immediately and wrap them with meaningful context before returning.
*   **Short Variable Declarations**: Use `:=` for initialization and `var` only when declaring zero-value variables.
*   **Receiver Functions**: Keep pointer receivers consistent (`func (b *Budget) Save(...)`) when modifying struct states.

### API & GORM Database Operations
*   **Database Transactions**: Any multi-step write operation (e.g., creating a budget and then adding its nested category items) must execute within a transactional block.
*   **Payload Validation**: Always bind incoming payloads to input validator structures inside the request handlers before hitting service logic.