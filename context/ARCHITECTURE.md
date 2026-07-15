# Architecture Specification

## 1. High-Level System Architecture

Budgetree uses a decoupled, client-server architecture designed to enable rapid user interactions (such as editing and live charting) while performing computational logic (such as diff evaluations) efficiently on the backend.

```
┌────────────────────────────────────────────────────────┐
│                      Frontend                          │
│          Next.js 15 (App Router, React 19)             │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ HTTP (JSON)                    │ HTTP (JSON)
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     Backend API       │        │  computeDiff() Engine │
│   Go Fiber + GORM     ├───────►│  (In-Memory Service)  │
└───────────┬───────────┘        └───────────────────────┘
            │
            │ SQL Queries (GORM)
            ▼
┌────────────────────────────────────────────────────────┐
│                    Database Layer                      │
│        SQLite (Local) / PostgreSQL (Neon/Prod)         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Technical Selections

### Frontend Client
*   **Next.js 15 & React 19**: Powered by React's latest concurrent features, using client-side interactive rendering for live budget sheets and server-side optimization for public browse pathways.
*   **TanStack Query (v5)**: Serves as the primary caching and asynchronous state synchronization layer between the client and the backend API.
*   **React Hook Form & Zod**: Provides schema-driven input validation directly in the dynamic budget spreadsheet layout.
*   **Recharts**: Powers instant, math-driven visual breakdowns (pie and bar charts) as the user types, calculated entirely on the client side without database overhead.

### Backend API
*   **Go Fiber**: A high-performance, low-memory routing framework that structures RESTful endpoints.
*   **GORM**: The Object Relational Mapper that abstracts database communication, enabling SQLite during development and seamless migration to PostgreSQL for production.
*   **In-Memory Services**: Computes lightweight operational differences (diffs) inside Go RAM dynamically to prevent redundant write cycles on the data layer.

---

## 3. Database Schema & Relationships

The database utilizes three core entities with straightforward relationships to represent the tree-like structure of forked budgets.

```
       ┌───────────┐
       │   User    │
       └─────┬─────┘
             │ 1
             │
             │ *
       ┌─────▼─────┐             ┌───────────────────┐
       │  Budget   │◄────────────┤ Parent Budget ID  │
       └─────┬─────┘   (Optional)└───────────────────┘
             │ 1
             │
             │ *
       ┌─────▼─────┐
       │ Category  │  (Type: Expense, Savings, Investment)
       └───────────┘
```

### Key Relationships
*   **User to Budget (1:N)**: A single user profile owns zero or more created or forked budgets.
*   **Budget to Category (1:N, Cascade)**: A budget acts as a container for many line items. If a parent budget is deleted, all associated categories are deleted automatically from the database.
*   **Budget to Budget (Self-Referential 1:N)**: A budget records an optional, self-referential `ParentBudgetID`. If this field is populated, the budget is treated as a "fork," establishing its lineage in the financial tree.

---

## 4. The Diff Engine Flow

To ensure optimal performance and avoid data duplication, structural budget differences are **never saved to the database**. Instead, they are calculated in-memory on demand when a user views a forked budget.

```
1. Request ────────► 2. Query ────────► 3. Map & Compare ───────► 4. Respond
Client requests      Backend retrieves  Engine loads names       Sorted array of
fork diff payload    categories for     into hashes, detects     semantic changes
                     parent and fork    Add / Remove / Modify    returned to client
```

### Algorithmic Logic
*   **Added**: Exists in the fork budget but is missing in the parent budget.
*   **Removed**: Exists in the parent budget but was omitted in the fork budget.
*   **Modified**: Exists in both budgets but features a different allocated target amount.