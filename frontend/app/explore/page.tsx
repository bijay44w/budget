"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { GitFork, Eye, ArrowLeftRight, Tag, Wallet, Plus, BookOpen, Layers, ArrowLeft } from "lucide-react";
import { Budget, CompareResponse } from "../../types";
import { useUser, UserButton } from "@clerk/nextjs";

const API_BASE = "http://localhost:8080/api";

export default function BrowsePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [compareId1, setCompareId1] = useState<string>("");
  const [compareId2, setCompareId2] = useState<string>("");

  const { user, isLoaded } = useUser();
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

  // Fetch budgets
  const { data: budgets = [], isLoading, error } = useQuery<Budget[]>({
    queryKey: ["budgets", selectedTag, userId],
    queryFn: async () => {
      const url = selectedTag
        ? `${API_BASE}/budgets?tag=${encodeURIComponent(selectedTag)}`
        : `${API_BASE}/budgets`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return res.json();
    },
  });

  // Fork budget mutation
  const forkMutation = useMutation<Budget, Error, number>({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/budgets/${id}/fork`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fork budget");
      return res.json();
    },
    onSuccess: (newBudget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      router.push(`/edit/${newBudget.id}`);
    },
  });

  // Create new blank budget mutation
  const createBlankMutation = useMutation<Budget, Error, void>({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: "My Custom Budget Blueprint",
          income: 3000,
          tags: "Custom",
          categories: [
            { name: "Rent", amount: 1000, type: "Expense" },
            { name: "Groceries", amount: 400, type: "Expense" },
            { name: "Savings", amount: 500, type: "Savings" },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to create blank budget");
      return res.json();
    },
    onSuccess: (newBudget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      router.push(`/edit/${newBudget.id}`);
    },
  });

  // Compare budgets query
  const { data: compareData, isFetching: isComparing } = useQuery<CompareResponse>({
    queryKey: ["compare", compareId1, compareId2],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/budgets/compare/pair?id1=${compareId1}&id2=${compareId2}`
      );
      if (!res.ok) throw new Error("Failed to compare budgets");
      return res.json();
    },
    enabled: !!compareId1 && !!compareId2,
  });

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      budgets
        .flatMap((b) => b.tags.split(","))
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    )
  );

  const baseTemplates = budgets.filter((b) => b.parent_budget_id === null);
  const userForks = budgets.filter((b) => b.parent_budget_id !== null);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-12 py-10">
      
      {/* Header Panel (matching landing header style) */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-8 mb-10">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all mr-2"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-5 h-5 text-[#a8ff35]" />
            </button>
            <h1 className="text-3xl font-retro tracking-widest text-[#a8ff35] uppercase">
              Explore Blueprints
            </h1>
          </div>
          <p className="text-slate-400 mt-2 font-share-mono text-sm max-w-xl">
            Fork curated blueprints, track versions, and compare structural allocations.
          </p>
        </div>

        {/* User Session Metadata Badge */}
        {isLoaded && user ? (
          <div className="flex items-center gap-3 bg-[#0b0e11] border border-slate-800 rounded-2xl px-4 py-2 shadow-xl">
            <UserButton />
            <div className="text-left font-share-mono">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Session Profile</p>
              <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user.fullName || "User"}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/sign-in")}
            className="flex items-center gap-2 bg-[#a8ff35] text-black hover:bg-[#a8ff35]/90 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider font-share-mono transition-all"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8 font-share-mono">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#a8ff35]" /> Filter Tags:
        </span>
        <button
          onClick={() => setSelectedTag("")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            selectedTag === ""
              ? "bg-[#a8ff35] text-black border-[#a8ff35] shadow-md"
              : "bg-[#0b0e11] text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          All Blueprints
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedTag === tag
                ? "bg-[#a8ff35] text-black border-[#a8ff35] shadow-md"
                : "bg-[#0b0e11] text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            {tag}
          </button>
        ))}

        {/* Create Blank Button */}
        <button
          onClick={() => createBlankMutation.mutate()}
          className="ml-auto flex items-center gap-2 bg-transparent text-[#a8ff35] border border-[#a8ff35] hover:bg-[#a8ff35]/10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        >
          <Plus className="w-4 h-4" /> New Budget Blueprint
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#a8ff35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 font-share-mono text-sm">Querying budget database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/20 border border-rose-900/40 text-rose-500 px-6 py-4 rounded-2xl font-share-mono text-sm">
          Error loading budgets: {error.message}. Make sure your Go API backend is running on port 8080.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Base Blueprints Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <BookOpen className="w-5 h-5 text-slate-500" />
              <h2 className="text-xl font-retro text-white tracking-wider uppercase">Community Blueprints</h2>
            </div>
            {baseTemplates.length === 0 ? (
              <div className="bg-[#0b0e11] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-share-mono text-sm">
                No community blueprints found matching that tag.
              </div>
            ) : (
              <div className="grid gap-4">
                {baseTemplates.map((budget) => (
                  <div
                    key={budget.id}
                    className="bg-[#0b0e11] border border-slate-800 hover:border-[#a8ff35]/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg font-share-mono">{budget.name}</h3>
                        <div className="flex items-center gap-1.5 mt-2 font-share-mono text-xs">
                          {budget.tags.split(",").map((t) => (
                            <span
                              key={t}
                              className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold"
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right font-share-mono">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Income</p>
                        <p className="text-lg font-extrabold text-[#a8ff35]">{formatCurrency(budget.income)}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4 mt-4 flex items-center justify-between font-share-mono">
                      <span className="text-xs text-slate-500 font-medium">
                        {budget.categories.length} allocation categories
                      </span>
                      <button
                        onClick={() => forkMutation.mutate(budget.id)}
                        disabled={forkMutation.isPending}
                        className="flex items-center gap-2 bg-[#a8ff35] hover:bg-[#bbf64a] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        {forkMutation.isPending ? "Forking..." : "Fork Budget"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Forks Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <GitFork className="w-5 h-5 text-slate-500" />
              <h2 className="text-xl font-retro text-white tracking-wider uppercase">Active Forks & Versions</h2>
            </div>
            {userForks.length === 0 ? (
              <div className="bg-[#0b0e11] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-share-mono text-sm">
                No active forks under your profile. Fork a community blueprint on the left to start!
              </div>
            ) : (
              <div className="grid gap-4">
                {userForks.map((budget) => {
                  const parent = budgets.find((b) => b.id === budget.parent_budget_id);
                  return (
                    <div
                      key={budget.id}
                      className="bg-[#0b0e11] border border-slate-800 hover:border-[#a8ff35]/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-white text-lg font-share-mono">{budget.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5 text-xs font-share-mono">
                            <span className="text-slate-500">Forked from:</span>
                            <span className="bg-teal-950/20 text-[#a8ff35] border border-teal-900/40 px-2 py-0.5 rounded font-bold">
                              {parent ? parent.name : `ID: ${budget.parent_budget_id}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-share-mono">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Income</p>
                          <p className="text-lg font-extrabold text-[#a8ff35]">{formatCurrency(budget.income)}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-4 mt-4 flex items-center justify-between gap-2 font-share-mono">
                        <span className="text-xs text-slate-500 font-medium">
                          {budget.categories.length} allocation categories
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/diff/${budget.id}`)}
                            className="flex items-center gap-1.5 bg-amber-950/20 hover:bg-amber-950/40 text-amber-500 border border-amber-900/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Diff Log
                          </button>
                          <button
                            onClick={() => router.push(`/edit/${budget.id}`)}
                            className="flex items-center gap-1.5 bg-teal-950/20 hover:bg-teal-950/40 text-[#a8ff35] border border-teal-900/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                          >
                            Modify Worksheet
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Module */}
      <div className="bg-[#0b0e11] border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-5 mb-6">
          <span className="p-2 bg-slate-900 text-[#a8ff35] rounded-xl">
            <ArrowLeftRight className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-retro text-white tracking-wider uppercase">Side-by-Side Comparison Matrix</h2>
            <p className="text-sm text-slate-400 font-share-mono text-xs mt-0.5">Select any two budgets to compare primary KPIs side-by-side.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 font-share-mono">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Budget Blueprint 1</label>
            <select
              value={compareId1}
              onChange={(e) => setCompareId1(e.target.value)}
              className="w-full bg-[#070a0e] border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 focus:outline-none focus:border-[#a8ff35] transition-all"
            >
              <option value="">-- Choose Budget --</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.parent_budget_id ? "Fork" : "Base"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Budget Blueprint 2</label>
            <select
              value={compareId2}
              onChange={(e) => setCompareId2(e.target.value)}
              className="w-full bg-[#070a0e] border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 focus:outline-none focus:border-[#a8ff35] transition-all"
            >
              <option value="">-- Choose Budget --</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.parent_budget_id ? "Fork" : "Base"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {compareData ? (
          <div className="border border-slate-800 rounded-2xl overflow-hidden font-share-mono">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#070a0e] border-b border-slate-800">
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Financial Metric</th>
                  <th className="px-6 py-4 font-bold text-white">{compareData.budget1.name}</th>
                  <th className="px-6 py-4 font-bold text-white">{compareData.budget2.name}</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 bg-[#0b0e11]">
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-400">Gross Income</td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {formatCurrency(compareData.budget1.income)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-[#a8ff35]">
                    {formatCurrency(compareData.budget2.income)}
                  </td>
                  <td className={`px-6 py-4 font-bold text-center ${
                    compareData.budget2.income - compareData.budget1.income >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {compareData.budget2.income - compareData.budget1.income >= 0 ? "+" : ""}
                    {formatCurrency(compareData.budget2.income - compareData.budget1.income)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-400">Monthly Spending</td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {formatCurrency(compareData.budget1.monthly_spend)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-[#a8ff35]">
                    {formatCurrency(compareData.budget2.monthly_spend)}
                  </td>
                  <td className={`px-6 py-4 font-bold text-center ${
                    compareData.budget1.monthly_spend - compareData.budget2.monthly_spend >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {compareData.budget2.monthly_spend - compareData.budget1.monthly_spend > 0 ? "+" : ""}
                    {formatCurrency(compareData.budget2.monthly_spend - compareData.budget1.monthly_spend)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-400">Total Allocated Savings</td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {formatCurrency(compareData.budget1.savings)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-[#a8ff35]">
                    {formatCurrency(compareData.budget2.savings)}
                  </td>
                  <td className={`px-6 py-4 font-bold text-center ${
                    compareData.budget2.savings - compareData.budget1.savings >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {compareData.budget2.savings - compareData.budget1.savings >= 0 ? "+" : ""}
                    {formatCurrency(compareData.budget2.savings - compareData.budget1.savings)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-slate-400">Savings Rate</td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {compareData.budget1.savings_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 font-extrabold text-[#a8ff35]">
                    {compareData.budget2.savings_rate.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 font-bold text-center ${
                    compareData.budget2.savings_rate - compareData.budget1.savings_rate >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {compareData.budget2.savings_rate - compareData.budget1.savings_rate >= 0 ? "+" : ""}
                    {(compareData.budget2.savings_rate - compareData.budget1.savings_rate).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          compareId1 &&
          compareId2 && (
            <div className="flex justify-center items-center py-6 text-slate-500 font-share-mono text-xs">
              <div className="w-5 h-5 border-2 border-[#a8ff35] border-t-transparent rounded-full animate-spin mr-2"></div>
              Running comparative variance engine...
            </div>
          )
        )}
      </div>
    </div>
  );
}
