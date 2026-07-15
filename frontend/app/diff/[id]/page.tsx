"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, GitCommit, ArrowRight, Check } from "lucide-react";
import { DiffItem, Budget } from "../../../types";
import { useUser } from "@clerk/nextjs";

const API_BASE = "http://localhost:8080/api";

interface DiffParams {
  id: string;
}

export default function DiffPage({ params }: { params: Promise<DiffParams> }) {
  const router = useRouter();
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

  // Fetch budget details to show metadata
  const { data: budget, isLoading: isBudgetLoading } = useQuery<Budget>({
    queryKey: ["budget", budgetId, userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/budgets/${budgetId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load budget metadata");
      return res.json();
    },
  });

  // Fetch the diff log from the backend Diff Engine
  const { data: diffs = [], isLoading: isDiffLoading, error } = useQuery<DiffItem[]>({
    queryKey: ["diff", budgetId, userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/budgets/${budgetId}/diff`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to calculate operational diff");
      return res.json();
    },
  });

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt);
  };

  const isLoading = isBudgetLoading || isDiffLoading;

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-12 py-10 min-h-screen bg-[#070a0e]">
      
      {/* Navbar header */}
      <div className="flex items-center gap-4 border-b border-slate-900 pb-6 mb-8">
        <button
          onClick={() => router.push("/explore")}
          className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#a8ff35]" />
        </button>
        <div>
          <h1 className="text-2xl font-retro text-[#a8ff35] uppercase tracking-wider">
            Version Control Diff Log
          </h1>
          {budget && (
            <p className="text-slate-400 text-sm mt-0.5 font-share-mono">
              Reviewing operational deltas for <span className="text-white font-bold">{budget.name}</span>
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 font-share-mono">
          <div className="w-10 h-10 border-4 border-[#a8ff35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4 text-sm">Running in-memory computeDiff()...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/20 border border-rose-900/40 text-rose-500 px-6 py-4 rounded-2xl font-share-mono text-sm">
          Error calculating diffs: {error.message}
        </div>
      ) : diffs.length === 0 ? (
        <div className="bg-[#0b0e11] border border-slate-800 rounded-3xl p-12 text-center font-share-mono">
          <div className="w-12 h-12 bg-slate-900 text-[#a8ff35] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-lg">No modifications detected</h3>
          <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
            This budget has identical structural allocations relative to its parent base blueprint.
          </p>
          <button
            onClick={() => router.push(`/edit/${budgetId}`)}
            className="mt-6 bg-[#a8ff35] hover:bg-[#bbf64a] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            Modify allocations to generate diffs
          </button>
        </div>
      ) : (
        <div className="space-y-6 font-share-mono">
          {/* Diff summary metadata */}
          <div className="bg-[#0b0e11] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-[#a8ff35] rounded-2xl border border-slate-800/40">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dynamic In-Memory Delta Engine</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Deltas are computed dynamically on-demand in-memory without database overhead.
              </p>
            </div>
            <div className="ml-auto text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              {diffs.filter((d) => d.status !== "Unchanged").length} changes detected
            </div>
          </div>

          {/* Semantic Diff Cards List */}
          <div className="bg-[#0b0e11] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-slate-900/60">
              {diffs.map((diff, index) => {
                let statusClasses = "";
                let amountSection = null;
                let statusLabel = "";

                if (diff.status === "Added") {
                  statusClasses = "bg-emerald-950/20 border-emerald-900/40 text-emerald-500";
                  statusLabel = "Added";
                  amountSection = (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Allocation</p>
                      <p className="text-sm font-extrabold text-emerald-500">
                        + {formatCurrency(diff.fork_amount)}
                      </p>
                    </div>
                  );
                } else if (diff.status === "Removed") {
                  statusClasses = "bg-rose-950/20 border-rose-900/40 text-rose-500";
                  statusLabel = "Removed";
                  amountSection = (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Allocation</p>
                      <p className="text-sm font-extrabold text-rose-500">
                        - {formatCurrency(diff.parent_amount)}
                      </p>
                    </div>
                  );
                } else if (diff.status === "Modified") {
                  statusClasses = "bg-amber-950/20 border-amber-900/40 text-amber-500";
                  statusLabel = "Modified";
                  amountSection = (
                    <div className="text-right flex items-center gap-3.5">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Before</p>
                        <p className="text-sm font-bold text-slate-500 line-through">
                          {formatCurrency(diff.parent_amount)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">After</p>
                        <p className="text-sm font-extrabold text-amber-500">
                          {formatCurrency(diff.fork_amount)}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  // Unchanged
                  statusClasses = "bg-slate-900 border-slate-800 text-slate-500";
                  statusLabel = "Unchanged";
                  amountSection = (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Allocation</p>
                      <p className="text-sm font-semibold text-slate-400">
                        {formatCurrency(diff.fork_amount)}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="p-6 flex items-center justify-between hover:bg-[#070a0e]/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Tag */}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${statusClasses}`}>
                        {statusLabel}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-base">{diff.name}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Type: {diff.type}
                        </p>
                      </div>
                    </div>

                    {amountSection}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
