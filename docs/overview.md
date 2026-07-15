# Project Overview

## 1. Product Summary
Budgetree is a personal budgeting platform built around the concepts of version control, functioning essentially as **"GitHub for personal budgets."** It addresses the rigid, isolated nature of traditional financial spreadsheets by introducing a collaborative, evolutionary ecosystem where users can share, adapt, and compare financial blueprints.

---

## 2. Target Audience

| Attribute | Description |
| :--- | :--- |
| **Primary users** | Individual consumers looking for flexible financial templates tailored to specific lifestyle paths (e.g., *FIRE*, *Freelancer*, *Student*, *Remote Worker*). |
| **Secondary users** | Financial content creators and community members who want to share optimized budgeting blueprints. |
| **Technical fluency** | Mixed. While utilizing version control metaphors (Fork, Diff), the interface is kept highly intuitive and accessible to non-technical users. |
| **Usage context** | Monthly budget setting, community template discovery, and active financial scenario planning. |

---

## 3. Core User Flows

### Flow 1: Create a Base Budget
1. User names the budget and inputs their total monthly income.
2. User builds their budget by adding category rows (specifying Name, Amount, and Type: Expense, Savings, or Investment).
3. User views live updates of their savings rate and category charts in the sidebar layout while editing, then saves the budget.

### Flow 2: Discover and Fork a Template
1. User visits the Browse page and filters public budgets by relevant lifestyle tags (e.g., *FIRE*, *Student*, *Freelancer*).
2. User selects a budget card to review its details, metrics, and fork history.
3. User clicks **Fork Budget**, which duplicates all original categories under their own profile, sets the `parent_budget_id`, and immediately opens the fork in edit mode.

### Flow 3: Inspect Budget Differences (Diff View)
1. User opens a previously forked budget that contains modifications.
2. The system triggers the memory-resident `computeDiff` algorithm.
3. User reviews a semantic, color-coded visual log indicating exactly which rows were **Added (Green)**, **Modified (Amber)**, or **Removed (Red)** relative to the parent budget.

### Flow 4: Side-by-Side Comparison
1. User navigates to the Compare page and selects any two budgets in the system.
2. User evaluates a direct side-by-side comparison matrix of the two budgets, contrasting Gross Income, Monthly Spend, Savings, and Savings Rate.

---

## 4. Explicitly Out of Scope
* **No Database-Stored Diffs**: All structural diff calculations are performed strictly in-memory on demand; delta history logs are never written to disk.
* **No Production Authentication in v1**: Phase 1 relies purely on a single mock user profile session (`User ID = 1`).
* **No Banking Integrations**: Budget metrics are entirely self-reported and manually managed; no Plaid or bank syncing features.
* **No Public Developer API**: Backend routes are restricted purely to servicing the core Next.js client application.
* **No Multi-Currency Conversion**: All comparisons and budgets assume a single, fixed currency symbol (e.g., USD) to prevent conversion complexity.

> **Rule for the agent:** If a request or a "would be nice" idea isn't covered by a Core User Flow above, treat it as out of scope by default unless this file is updated first. Flag it — don't build it.

---

## 5. Success Criteria
* A new user can locate a community budget, fork it, and review their live modified diff layout in under 60 seconds without instruction.
* The Go Fiber backend computes structural changes via the custom algorithm dynamically on datasets without impacting request latency