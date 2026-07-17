"use client";

import React from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import { Wallet, TrendingUp, PiggyBank, CreditCard, Home, CircleDollarSign } from "lucide-react";

// --- Types (matches explore page) ---
interface FlowNode {
  id: string;
  type: "income" | "needs" | "savings" | "investments" | "debt" | "custom" | "expense";
  name: string;
  amount: number;
  x: number;
  y: number;
  parentId: string | null;
}

interface BudgetDashboardProps {
  nodes: FlowNode[];
  fmt: (n: number) => string;
  isDark: boolean;
  currency: string;
  selectedMonth?: string;
  allBudgets?: any[];
}

const TYPE_COLORS: Record<string, string> = {
  income: "#22c55e",
  needs: "#3b82f6",
  savings: "#10b981",
  investments: "#a855f7",
  debt: "#ef4444",
  custom: "#64748b",
};

const TYPE_LABELS: Record<string, string> = {
  income: "Income",
  needs: "Needs",
  savings: "Savings",
  investments: "Investments",
  debt: "Debt",
  custom: "Custom",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  income: Wallet,
  needs: Home,
  savings: PiggyBank,
  investments: TrendingUp,
  debt: CreditCard,
  custom: CircleDollarSign,
};

export default function BudgetDashboard({ nodes, fmt, isDark, currency }: BudgetDashboardProps) {
  const incomeNodes = nodes.filter(n => n.type === "income");
  const expenseNodes = nodes.filter(n => n.type !== "income");
  const totalIncome = incomeNodes.reduce((s, n) => s + n.amount, 0);
  const totalPlanned = expenseNodes.reduce((s, n) => s + n.amount, 0);
  const remaining = totalIncome - totalPlanned;
  const allocationPct = totalIncome > 0 ? Math.round((totalPlanned / totalIncome) * 100) : 0;

  // Group by type for breakdown
  const typeGroups = expenseNodes.reduce<Record<string, { amount: number; count: number }>>((acc, n) => {
    acc[n.type] = acc[n.type] || { amount: 0, count: 0 };
    acc[n.type].amount += n.amount;
    acc[n.type].count += 1;
    return acc;
  }, {});

  const breakdownData = Object.entries(typeGroups)
    .map(([type, data]) => ({
      name: TYPE_LABELS[type] || type,
      value: data.amount,
      color: TYPE_COLORS[type] || "#64748b",
      count: data.count,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Individual items for bar chart (top 8)
  const itemBars = expenseNodes
    .filter(n => n.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map(n => ({
      name: n.name.length > 12 ? n.name.slice(0, 12) + "…" : n.name,
      amount: n.amount,
      fill: TYPE_COLORS[n.type] || "#64748b",
    }));

  // Allocation donut
  const allocationData = [
    { name: "Spent", value: totalPlanned, color: "#22c55e" },
    { name: "Remaining", value: Math.max(remaining, 0), color: isDark ? "#1e293b" : "#e2e8f0" },
  ];

  // Income sources
  const incomeData = incomeNodes
    .filter(n => n.amount > 0)
    .map((n, i) => ({
      name: n.name,
      value: n.amount,
      color: ["#22c55e", "#10b981", "#059669", "#047857"][i % 4],
    }));

  const cardClass = `rounded-xl border p-5 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`;
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`;
  const pct = (v: number) => totalIncome > 0 ? `${((v / totalIncome) * 100).toFixed(1)}%` : "0%";

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold">No Budget Data Yet</h2>
        <p className="text-sm text-slate-400 text-center max-w-xs">Create your budget plan first, then come back here to see your analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Header */}
      <div className={`w-full border-b px-6 py-4 flex-shrink-0 flex items-center justify-between ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
        <div>
          <h1 className="text-lg font-bold">Analytics Dashboard</h1>
          <p className="text-[11px] text-slate-400">Visualize your financial data and understand your money better</p>
        </div>
        <div className={`text-[10px] px-3 py-1.5 rounded-lg ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
          All amounts in {currency}
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 grid grid-cols-3 gap-4 auto-rows-min">

        {/* ── ROW 1 ── */}

        {/* Summary Cards */}
        <div className={`${cardClass} col-span-1`}>
          <p className={labelClass}>Budget Overview</p>
          <div className="mt-3 space-y-3">
            {[
              { label: "Total Income", value: fmt(totalIncome), color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Total Planned", value: fmt(totalPlanned), color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Remaining", value: fmt(remaining), color: remaining >= 0 ? "text-emerald-500" : "text-red-500", bg: remaining >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Breakdown Donut */}
        <div className={`${cardClass} col-span-1`}>
          <p className={labelClass}>Expenses Breakdown</p>
          {breakdownData.length > 0 ? (
            <div className="flex items-center gap-3 mt-2">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdownData} innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                      {breakdownData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                {breakdownData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="truncate flex-1">{d.name}</span>
                    <span className="font-semibold tabular-nums">{fmt(d.value)}</span>
                    <span className="text-slate-400 w-10 text-right">{pct(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-4">No expense data yet</p>
          )}
        </div>

        {/* Expense Allocation */}
        <div className={`${cardClass} col-span-1 flex flex-col items-center`}>
          <p className={`${labelClass} self-start`}>Expense Allocation</p>
          <div className="relative w-32 h-32 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} innerRadius={42} outerRadius={58} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {allocationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{allocationPct}%</span>
              <span className="text-[10px] text-slate-400">of Income</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs font-bold">{fmt(totalPlanned)}</p>
              <p className="text-[10px] text-slate-400">Spent</p>
            </div>
            <div className={`w-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
            <div className="text-center">
              <p className="text-xs font-bold">{fmt(Math.max(remaining, 0))}</p>
              <p className="text-[10px] text-slate-400">Remaining</p>
            </div>
          </div>
        </div>

        {/* ── ROW 2 ── */}

        {/* Category Bars */}
        <div className={`${cardClass} col-span-2`}>
          <p className={labelClass}>Category Comparison</p>
          {itemBars.length > 0 ? (
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemBars} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => fmt(v)}
                    contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "none", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    labelStyle={{ fontWeight: 600 }}
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                    {itemBars.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-4">Add budget items to see comparison</p>
          )}
        </div>

        {/* Income Sources */}
        <div className={`${cardClass} col-span-1`}>
          <p className={labelClass}>Income Sources</p>
          {incomeData.length > 0 ? (
            <div className="flex flex-col items-center gap-3 mt-2">
              <div className="relative w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeData} innerRadius={28} outerRadius={48} dataKey="value" stroke="none">
                      {incomeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold">{fmt(totalIncome)}</span>
                  <span className="text-[9px] text-slate-400">Total</span>
                </div>
              </div>
              <div className="w-full space-y-1.5">
                {incomeData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="truncate flex-1">{d.name}</span>
                    <span className="font-semibold tabular-nums">{fmt(d.value)}</span>
                    <span className="text-slate-400 w-10 text-right">{pct(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-4">No income data yet</p>
          )}
        </div>

        {/* ── ROW 3 ── */}

        {/* Per-Category Breakdown Cards */}
        {Object.entries(typeGroups).filter(([, d]) => d.amount > 0).map(([type, data]) => {
          const items = expenseNodes.filter(n => n.type === type && n.amount > 0);
          const Icon = TYPE_ICONS[type] || CircleDollarSign;
          const color = TYPE_COLORS[type] || "#64748b";
          return (
            <div key={type} className={cardClass}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <p className={labelClass}>{TYPE_LABELS[type] || type}</p>
                <span className="ml-auto text-sm font-bold" style={{ color }}>{fmt(data.amount)}</span>
              </div>
              <div className="space-y-2">
                {items.map(item => {
                  const itemPct = data.amount > 0 ? (item.amount / data.amount) * 100 : 0;
                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="truncate">{item.name}</span>
                        <span className="font-semibold tabular-nums ml-2">{fmt(item.amount)}</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${itemPct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
