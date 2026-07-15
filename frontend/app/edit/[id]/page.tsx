"use client";

import React, { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, Trash2, Save, TrendingUp, Wallet, 
  Home, Utensils, Bus, Gamepad2, PiggyBank, Briefcase,
  PieChart as PieIcon, Sun, Moon
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Budget, Category } from "../../../types";
import { useUser } from "@clerk/nextjs";
import UserProfileButton from "../../UserProfileButton";

const API_BASE = "http://localhost:8080/api";

interface EditParams {
  id: string;
}

// Maps name to corresponding lucide category icons
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("income") || n.includes("salary")) return Wallet;
  if (n.includes("rent") || n.includes("housing") || n.includes("home")) return Home;
  if (n.includes("food") || n.includes("grocery") || n.includes("dine") || n.includes("restaurant")) return Utensils;
  if (n.includes("transport") || n.includes("car") || n.includes("bus") || n.includes("train")) return Bus;
  if (n.includes("play") || n.includes("game") || n.includes("entertainment") || n.includes("fun") || n.includes("movie")) return Gamepad2;
  if (n.includes("save") || n.includes("savings") || n.includes("invest")) return PiggyBank;
  return Briefcase;
};

export default function EditBudgetPage({ params }: { params: Promise<EditParams> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: budgetId } = use(params);

  const { user } = useUser();
  const userId = user?.id || "";
  const userName = user?.fullName || "";

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userId) {
      headers["X-Clerk-User-Id"] = userId;
      headers["X-Clerk-User-Name"] = userName;
    }
    return headers;
  };

  // Local state for the form inputs
  const [name, setName] = useState("");
  const [income, setIncome] = useState<number>(0);
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load and apply theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Client hydration check for Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch the budget details
  const { data: budget, isLoading, error } = useQuery<Budget>({
    queryKey: ["budget", budgetId, userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/budgets/${budgetId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load budget details");
      return res.json();
    },
  });

  // Populate form fields once budget loads
  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setIncome(budget.income);
      setTags(budget.tags);
      setCategories(budget.categories || []);
    }
  }, [budget]);

  // Update budget mutation
  const saveMutation = useMutation<Budget, Error, void>({
    mutationFn: async () => {
      const payload = {
        name,
        income: Number(income),
        tags,
        categories: categories.map((c) => ({
          name: c.name,
          amount: Number(c.amount),
          type: c.type,
        })),
      };
      const res = await fetch(`${API_BASE}/budgets/${budgetId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update budget blueprint");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
      router.push("/explore");
    },
  });

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { name: "", amount: 0, type: "Expense" },
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: string | number
  ) => {
    const updated = [...categories];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setCategories(updated);
  };

  // Calculations for sidebar
  const totalExpense = categories
    .filter((c) => c.type === "Expense")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const totalSavings = categories
    .filter((c) => c.type === "Savings")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const totalInvestment = categories
    .filter((c) => c.type === "Investment")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const totalAllocatedSavings = totalSavings + totalInvestment;
  const currentSavingsRate = income > 0 ? (totalAllocatedSavings / income) * 100 : 0;
  const netRemaining = income - totalExpense - totalAllocatedSavings;

  // Chart Data
  const chartData = [
    { name: "Expenses", value: totalExpense, color: "#f43f5e" }, // Rose 500
    { name: "Savings", value: totalSavings, color: theme === "light" ? "#16a34a" : "#a8ff35" }, // Green 600 or Neon Green
    { name: "Investments", value: totalInvestment, color: "#3b82f6" }, // Blue 500
  ].filter((item) => item.value > 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#fafafa] dark:bg-[#020402] min-h-screen">
        <div className="w-10 h-10 border-4 border-green-600 dark:border-[#a8ff35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-share-mono text-sm">Loading worksheet canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#fafafa] dark:bg-[#020402] min-h-screen">
        <div className="max-w-3xl mx-auto px-12 py-12">
          <div className="bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/40 text-red-600 dark:text-rose-500 px-6 py-4 rounded-2xl font-share-mono text-sm">
            Error loading budget: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#020402] text-slate-800 dark:text-white transition-all duration-300 font-sans-inter">
      
      {/* Top Navbar */}
      <div className="bg-white dark:bg-[#0c1117] border-b border-slate-200 dark:border-slate-800 px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/explore")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-green-600 dark:text-[#a8ff35]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your budget blueprint..."
                className="text-lg font-bold font-share-mono text-slate-800 dark:text-white bg-transparent focus:outline-none border-b border-transparent focus:border-green-500 dark:focus:border-[#a8ff35] transition-all px-1 w-64 md:w-96"
              />
            </div>
            {budget?.parent_budget_id && (
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold font-share-mono ml-1 uppercase tracking-wider mt-0.5">
                Version Fork (Parent: ID {budget.parent_budget_id})
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-[#a8ff35] hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* User Profile Button */}
          <UserProfileButton direction="down" align="right" className="w-8 h-8 mr-2" />

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:hover:bg-[#bbf64a] dark:text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Saving..." : "Save Blueprint"}
          </button>
        </div>
      </div>

      {saveMutation.isError && (
        <div className="max-w-7xl w-full mx-auto px-12 mt-4">
          <div className="bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/40 text-red-600 dark:text-rose-500 px-6 py-3 rounded-xl font-share-mono text-sm">
            Validation failed: {saveMutation.error.message}
          </div>
        </div>
      )}

      {/* Main 70/30 Blueprint Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-12 py-8 grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* Left Canvas (70% - 7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-fit">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-retro text-slate-900 dark:text-white tracking-wider uppercase">Financial Allocations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-share-mono mt-0.5">Build your budget tree by adding expense, savings, and investment nodes.</p>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-1.5 text-green-600 border border-green-600 hover:bg-green-50 dark:text-[#a8ff35] dark:border-[#a8ff35] dark:hover:bg-[#a8ff35]/10 px-4 py-2 rounded-xl transition-all font-share-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>

          {/* Income row */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#070a0e] rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800">
            <div className="p-2.5 bg-green-50 text-green-600 border border-green-200 dark:bg-[#a8ff35]/10 dark:text-[#a8ff35] dark:border-[#a8ff35]/20 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1 font-share-mono">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Monthly Income ($)</label>
              <input
                type="number"
                value={income || ""}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder="e.g. 8000"
                className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex-1 font-share-mono">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Lifestyle Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="FIRE, Student, Freelancer"
                className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Allocation Rows */}
          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-share-mono text-sm">
                No allocation rows yet. Click "Add Row" to build your worksheet.
              </div>
            ) : (
              categories.map((cat, idx) => {
                const RowIcon = getCategoryIcon(cat.name);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-[#070a0e]/40 p-2.5 rounded-xl transition-all font-share-mono"
                  >
                    {/* Dynamic Category Icon based on name */}
                    <div className="p-2 bg-slate-100 dark:bg-[#070a0e] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
                      <RowIcon className="w-4 h-4 text-slate-500" />
                    </div>

                    {/* Category Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => handleCategoryChange(idx, "name", e.target.value)}
                        placeholder="Category Name (e.g. rent)"
                        className="w-full bg-slate-50 dark:bg-[#070a0e] border border-slate-200 dark:border-slate-800 focus:border-green-500 dark:focus:border-[#a8ff35] text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none transition-all"
                      />
                    </div>

                    {/* Category Type */}
                    <div className="w-40">
                      <select
                        value={cat.type}
                        onChange={(e) => handleCategoryChange(idx, "type", e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-[#070a0e] border border-slate-200 dark:border-slate-800 focus:border-green-500 dark:focus:border-[#a8ff35] text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none transition-all"
                      >
                        <option value="Expense">Expense</option>
                        <option value="Savings">Savings</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>

                    {/* Category Amount */}
                    <div className="w-40 flex items-center gap-2">
                      <span className="text-green-600 dark:text-[#a8ff35] font-bold">$</span>
                      <input
                        type="number"
                        value={cat.amount || ""}
                        onChange={(e) => handleCategoryChange(idx, "amount", Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-[#070a0e] border border-slate-200 dark:border-slate-800 focus:border-green-500 dark:focus:border-[#a8ff35] text-green-600 dark:text-[#a8ff35] rounded-xl px-4 py-2 text-sm font-bold text-right focus:outline-none transition-all"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveCategory(idx)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-rose-955/20 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar (30% - 3 Cols) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* KPI Summary Card */}
          <div className="bg-white dark:bg-[#0c1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-share-mono">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-[#a8ff35]" /> Live Worksheet KPIs
            </h3>

            <div className="grid grid-cols-1 gap-3.5 pt-2 font-share-mono">
              <div className="bg-slate-50 dark:bg-[#070a0e] p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Gross Income</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(income)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a0e] p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Monthly Spend</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a0e] p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Net Savings Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-extrabold text-green-600 dark:text-[#a8ff35]">{currentSavingsRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">({formatCurrency(totalAllocatedSavings)})</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a0e] p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Net Remaining</p>
                <p className={`text-xl font-extrabold mt-1 ${netRemaining >= 0 ? "text-green-600 dark:text-[#a8ff35]" : "text-rose-500"}`}>
                  {formatCurrency(netRemaining)}
                </p>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Chart */}
          <div className="bg-white dark:bg-[#0c1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider self-start flex items-center gap-1.5 mb-6 font-share-mono">
              <PieIcon className="w-4 h-4 text-green-600 dark:text-[#a8ff35]" /> Structure Summary
            </h3>

            {isMounted && chartData.length > 0 ? (
              <div className="w-full h-56 flex flex-col justify-center items-center font-share-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Legend */}
                <div className="flex gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold text-center font-share-mono">
                Configure income & allocation rows to view structure chart.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
