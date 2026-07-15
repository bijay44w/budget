"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { GitFork, Eye, ArrowLeftRight, Tag, Wallet, Plus, BookOpen, Layers, ArrowLeft, Sun, Moon } from "lucide-react";
import { Budget, CompareResponse } from "../../types";
import { useUser } from "@clerk/nextjs";
import UserProfileButton from "../UserProfileButton";
import Link from "next/link";

const TreeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" />
    <path d="M12 6L16 12" />
    <path d="M12 10L8 12" />
  </svg>
);

const API_BASE = "http://localhost:8080/api";

export default function BrowsePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [compareId1, setCompareId1] = useState<string>("");
  const [compareId2, setCompareId2] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#020402] text-slate-800 dark:text-white transition-all duration-300 font-sans-inter overflow-x-hidden relative">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-40 relative border-b border-slate-200/50 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-2">
          <TreeLogo className="w-6 h-6 text-green-600 dark:text-[#a8ff35]" />
          <span className="font-retro text-2xl font-bold tracking-wider text-green-600 dark:text-[#a8ff35]">
            Budgetree
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-[#a8ff35] hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {isLoaded && user ? (
            <UserProfileButton direction="down" align="right" className="w-8 h-8" />
          ) : (
            <button
              onClick={() => router.push("/sign-in")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:hover:bg-[#a8ff35]/90 dark:text-black px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider font-share-mono transition-all cursor-pointer"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-10 z-10 relative">
        
        {/* Explore Title Panel */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all mr-2 cursor-pointer"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-5 h-5 text-green-600 dark:text-[#a8ff35]" />
              </button>
              <h1 className="text-3xl font-retro tracking-widest text-green-600 dark:text-[#a8ff35] uppercase">
                Explore Blueprints
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-share-mono text-sm max-w-xl">
              Fork curated blueprints, track versions, and compare structural allocations.
            </p>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 font-share-mono">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-green-600 dark:text-[#a8ff35]" /> Filter Tags:
          </span>
          <button
            onClick={() => setSelectedTag("")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              selectedTag === ""
                ? "bg-green-600 text-white border-green-600 dark:bg-[#a8ff35] dark:text-black dark:border-[#a8ff35] shadow-md"
                : "bg-white dark:bg-[#0b0e11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            All Blueprints
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                selectedTag === tag
                  ? "bg-green-600 text-white border-green-600 dark:bg-[#a8ff35] dark:text-black dark:border-[#a8ff35] shadow-md"
                  : "bg-white dark:bg-[#0b0e11] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}

          {/* Create Blank Button */}
          <button
            onClick={() => createBlankMutation.mutate()}
            className="ml-auto flex items-center gap-2 bg-transparent text-green-600 dark:text-[#a8ff35] border border-green-600 dark:border-[#a8ff35] hover:bg-green-50 dark:hover:bg-[#a8ff35]/10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-share-mono"
          >
            <Plus className="w-4 h-4" /> New Budget Blueprint
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-600 dark:border-[#a8ff35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4 font-share-mono text-sm">Querying budget database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/40 text-red-600 dark:text-rose-500 px-6 py-4 rounded-2xl font-share-mono text-sm">
            Error loading budgets: {error.message}. Make sure your Go API backend is running on port 8080.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Base Blueprints Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <h2 className="text-xl font-retro text-slate-900 dark:text-white tracking-wider uppercase">Community Blueprints</h2>
              </div>
              {baseTemplates.length === 0 ? (
                <div className="bg-white dark:bg-[#0b0e11] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-share-mono text-sm">
                  No community blueprints found matching that tag.
                </div>
              ) : (
                <div className="grid gap-4">
                  {baseTemplates.map((budget) => (
                    <div
                      key={budget.id}
                      className="bg-white dark:bg-[#0b0e11] border border-slate-200 dark:border-slate-800 hover:border-green-500/45 dark:hover:border-[#a8ff35]/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg font-share-mono">{budget.name}</h3>
                          <div className="flex items-center gap-1.5 mt-2 font-share-mono text-xs">
                            {budget.tags.split(",").map((t) => (
                              <span
                                key={t}
                                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-semibold"
                              >
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right font-share-mono">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Gross Income</p>
                          <p className="text-lg font-extrabold text-green-600 dark:text-[#a8ff35]">{formatCurrency(budget.income)}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-4 flex items-center justify-between font-share-mono">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {budget.categories.length} allocation categories
                        </span>
                        <button
                          onClick={() => forkMutation.mutate(budget.id)}
                          disabled={forkMutation.isPending}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:hover:bg-[#bbf64a] dark:text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
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
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <GitFork className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <h2 className="text-xl font-retro text-slate-900 dark:text-white tracking-wider uppercase">Active Forks & Versions</h2>
              </div>
              {userForks.length === 0 ? (
                <div className="bg-white dark:bg-[#0b0e11] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-share-mono text-sm">
                  No active forks under your profile. Fork a community blueprint on the left to start!
                </div>
              ) : (
                <div className="grid gap-4">
                  {userForks.map((budget) => {
                    const parent = budgets.find((b) => b.id === budget.parent_budget_id);
                    return (
                      <div
                        key={budget.id}
                        className="bg-white dark:bg-[#0b0e11] border border-slate-200 dark:border-slate-800 hover:border-green-500/45 dark:hover:border-[#a8ff35]/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg font-share-mono">{budget.name}</h3>
                            <div className="flex items-center gap-2 mt-1.5 text-xs font-share-mono">
                              <span className="text-slate-400 dark:text-slate-500">Forked from:</span>
                              <span className="bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-[#a8ff35] border border-teal-100 dark:border-teal-900/40 px-2 py-0.5 rounded font-bold">
                                {parent ? parent.name : `ID: ${budget.parent_budget_id}`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right font-share-mono">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Gross Income</p>
                            <p className="text-lg font-extrabold text-green-600 dark:text-[#a8ff35]">{formatCurrency(budget.income)}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-4 flex items-center justify-between gap-2 font-share-mono">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {budget.categories.length} allocation categories
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/diff/${budget.id}`)}
                              className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Diff Log
                            </button>
                            <button
                              onClick={() => router.push(`/edit/${budget.id}`)}
                              className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-950/40 text-green-700 dark:text-[#a8ff35] border border-teal-200 dark:border-teal-900/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
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
      </main>
    </div>
  );
}
