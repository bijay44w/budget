export interface Category {
  id?: number;
  budget_id?: number;
  name: string;
  amount: number;
  type: "Expense" | "Savings" | "Investment";
}

export interface Budget {
  id: number;
  name: string;
  income: number;
  user_id: number;
  parent_budget_id: number | null;
  tags: string;
  categories: Category[];
}

export interface DiffItem {
  name: string;
  type: "Expense" | "Savings" | "Investment";
  parent_amount: number;
  fork_amount: number;
  status: "Added" | "Modified" | "Removed" | "Unchanged";
}

export interface BudgetSummary {
  id: number;
  name: string;
  income: number;
  monthly_spend: number;
  savings: number;
  savings_rate: number;
}

export interface CompareResponse {
  budget1: BudgetSummary;
  budget2: BudgetSummary;
}
