# 🌳 Budgetree

**GitHub for personal budgets.** Create a budget, share it, let others fork it, and see exactly what changed — just like version control for code, but for money.

## What is this?

Budgetree lets you:

1. **Create a budget** — Add your income and list where your money goes (rent, food, savings, etc.)
2. **Browse other budgets** — See how other people split their money (students, freelancers, FIRE savers)
3. **Fork a budget** — Copy someone's budget and change it to fit your life
4. **See the diff** — Compare your fork to the original and see exactly what you added, removed, or changed (green = added, yellow = changed, red = removed)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TanStack Query, Recharts, Tailwind CSS |
| Backend | Go, Fiber, GORM |
| Database | SQLite (dev) |
| Auth | Clerk |

## Getting Started

### 1. Backend

```bash
cd backend
go run main.go
# Runs on http://localhost:8080
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Environment

The frontend needs a `frontend/.env.local` file with your Clerk keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Project Structure

```
budgettree/
├── backend/
│   ├── main.go          # API server (all routes + models + diff engine)
│   └── main_test.go     # Backend tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── explore/page.tsx   # Browse community budgets
│   │   ├── edit/[id]/page.tsx # Budget editor (create/edit)
│   │   ├── diff/[id]/page.tsx # Fork diff viewer
│   │   ├── sign-in/           # Clerk sign-in page
│   │   └── sign-up/           # Clerk sign-up page
│   ├── proxy.ts         # Clerk auth middleware
│   └── types.ts         # Shared TypeScript types
├── docs/
│   ├── overview.md      # Product overview & user flows
│   └── architecture.md  # Technical architecture & schema
└── README.md            # You are here
```

## License

MIT
