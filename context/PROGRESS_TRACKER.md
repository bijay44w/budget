# MVP Progress Tracker

Use this checklist to track the development roadmap of the Budgetree MVP step-by-step.

---

## Phase 1: Foundation & Data Modeling
- [x] Initialize project directory structure (`backend/`, `frontend/`)
- [x] Define GORM structures for `User`, `Budget`, and `Category` fields
- [x] Establish SQLite development connection and auto-migration script

## Phase 2: Backend API Delivery
- [x] Build budget creation REST endpoint with relational transactional blocks
- [x] Implement Budget Detail lookup handler (`Preload("Categories")`)
- [x] Develop database-level transaction query cloning for the Fork routine
- [x] Code out-of-memory `computeDiff()` algorithmic evaluation utility

## Phase 3: Frontend Interface Construction
- [x] Scaffolding Next.js 15 Client app environment with Tailwind and shadcn configuration
- [x] Build the structural 70/30 split Budget Editor with local state tracking
- [x] Configure reactive calculation calculations and hook up dynamic Recharts summaries
- [x] Develop the semantic DiffViewer layout matching color specs
- [x] Set up Browse template gallery cards and direct Compare data tables

## Phase 4: Integration & Seeding
- [x] Wire API communications using custom TanStack Query hook matrices
- [x] Generate comprehensive backend database seed workflows to automatically establish the primary software developer mock tree hierarchy
- [x] Complete full end-to-end integration validation across the complete Create → Fork → Diff → Compare flow