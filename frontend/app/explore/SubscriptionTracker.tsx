"use client";

import React, { useState } from "react";
import { 
  Plus, Calendar, Bell, Search, MoreVertical, 
  Trash2, Edit, CheckCircle, ArrowRight,
  TrendingUp, CreditCard, Layers, Sparkles, X, AlertTriangle
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip
} from "recharts";

// Category style badges matching mockup
const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Entertainment: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-600 dark:text-red-400", dot: "#f87171" },
  Productivity: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", dot: "#60a5fa" },
  Finance: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-600 dark:text-green-400", dot: "#34d399" },
  Education: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", dot: "#c084fc" },
  Utilities: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400", dot: "#fb923c" },
  Other: { bg: "bg-slate-50 dark:bg-slate-800/60", text: "text-slate-600 dark:text-slate-400", dot: "#94a3b8" }
};

interface Subscription {
  id: string;
  name: string;
  plan: string;
  category: string;
  billing: "Monthly" | "Annual";
  renewalDate: string;
  amount: number;
  status: "Active" | "Paused";
}

const DEFAULT_SUBS = [] as Subscription[];

const SubscriptionLogo = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes("netflix")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-[#E50914] font-extrabold text-sm flex-shrink-0">
        N
      </div>
    );
  }
  if (n.includes("spotify")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
        S
      </div>
    );
  }
  if (n.includes("adobe")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        A
      </div>
    );
  }
  if (n.includes("notion")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        N
      </div>
    );
  }
  if (n.includes("youtube")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
        Y
      </div>
    );
  }
  if (n.includes("google")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
        G
      </div>
    );
  }
  // Initials fallback
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs flex-shrink-0">
      {initials}
    </div>
  );
};

export default function SubscriptionTracker({ isDark, currency, fmt }: { isDark: boolean; currency: string; fmt: (v: number) => string }) {
  const [subs, setSubs] = useState<Subscription[]>(DEFAULT_SUBS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [billing, setBilling] = useState<"Monthly" | "Annual">("Monthly");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("2026-05-16");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Stats Calculations
  const activeSubs = subs.filter(s => s.status === "Active");
  const totalMonthlyCost = activeSubs.reduce((sum, s) => {
    return sum + (s.billing === "Monthly" ? s.amount : s.amount / 12);
  }, 0);
  const totalAnnualCost = totalMonthlyCost * 12;

  // Filtered List
  const filteredSubs = subs.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.plan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" ? true : s.status === statusFilter;
    const matchesCategory = categoryFilter === "All Categories" ? true : s.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Unique categories count
  const categoriesCount = Array.from(new Set(activeSubs.map(s => s.category))).length;

  // Spending by Category Pie Chart
  const categorySums: Record<string, number> = {};
  activeSubs.forEach(s => {
    const amt = s.billing === "Monthly" ? s.amount : s.amount / 12;
    categorySums[s.category] = (categorySums[s.category] || 0) + amt;
  });

  const categoryPieData = Object.entries(categorySums).map(([name, val]) => ({
    name,
    value: val,
    color: CATEGORY_STYLES[name]?.dot || "#64748b",
    percentage: totalMonthlyCost > 0 ? (val / totalMonthlyCost) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // Spending Overview (Mocked trend leading to actual monthly cost)
  const trendData = [
    { month: "Dec '25", amount: totalMonthlyCost * 0.8 },
    { month: "Jan '26", amount: totalMonthlyCost * 0.9 },
    { month: "Feb '26", amount: totalMonthlyCost * 0.85 },
    { month: "Mar '26", amount: totalMonthlyCost * 0.95 },
    { month: "Apr '26", amount: totalMonthlyCost * 0.9 },
    { month: "May '26", amount: totalMonthlyCost }
  ];

  // Upcoming renewals (within next 30 days) sorted
  const sortedRenewals = [...activeSubs]
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .slice(0, 3);

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date("2026-05-16");
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    if (editingId) {
      setSubs(prev => prev.map(s => s.id === editingId ? {
        ...s, name, plan, category, billing, renewalDate, amount: Number(amount)
      } : s));
    } else {
      const newSub: Subscription = {
        id: Math.random().toString(),
        name, plan, category, billing, renewalDate, amount: Number(amount), status: "Active"
      };
      setSubs(prev => [newSub, ...prev]);
    }

    // Reset Form
    setName("");
    setPlan("");
    setCategory("Entertainment");
    setBilling("Monthly");
    setAmount("");
    setRenewalDate("2026-05-16");
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleStartEdit = (s: Subscription) => {
    setName(s.name);
    setPlan(s.plan);
    setCategory(s.category);
    setBilling(s.billing);
    setAmount(String(s.amount));
    setRenewalDate(s.renewalDate);
    setEditingId(s.id);
    setShowAddModal(true);
  };

  const toggleStatus = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? {
      ...s, status: s.status === "Active" ? "Paused" : "Active"
    } : s));
  };

  const deleteSub = (id: string) => {
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  const cardClass = `rounded-xl border p-5 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`;
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Header */}
      <div className={`w-full border-b px-6 py-4 flex-shrink-0 flex items-center justify-between ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
        <div>
          <h1 className="text-lg font-bold">Subscription Tracker</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Manage and optimize all your subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mocked Picker */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"
          }`}>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>May 16, 2026</span>
          </div>

          

          <button
            onClick={() => {
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-12 gap-4 auto-rows-min">
        {/* Summary Cards */}
        {[
          { label: "TOTAL MONTHLY COST", value: fmt(totalMonthlyCost), icon: CreditCard, ic: "text-green-600 dark:text-green-400", ib: "bg-green-100 dark:bg-green-950/40", sub: "▲ 8.5% vs last month" },
          { label: "TOTAL ANNUAL COST", value: fmt(totalAnnualCost), icon: Calendar, ic: "text-blue-600 dark:text-blue-400", ib: "bg-blue-100 dark:bg-blue-950/40", sub: "All subscriptions" },
          { label: "ACTIVE SUBSCRIPTIONS", value: String(activeSubs.length), icon: Layers, ic: "text-purple-600 dark:text-purple-400", ib: "bg-purple-100 dark:bg-purple-950/40", sub: `Across ${categoriesCount} categories` },
          { label: "POTENTIAL SAVINGS", value: fmt(4200), icon: Sparkles, ic: "text-emerald-600 dark:text-emerald-400", ib: "bg-emerald-100 dark:bg-emerald-950/40", sub: "With optimizations" }
        ].map(c => (
          <div key={c.label} className={`${cardClass} col-span-3 flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{c.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{c.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.ib}`}>
              <c.icon className={`w-5 h-5 ${c.ic}`} />
            </div>
          </div>
        ))}

        {/* Middle Row Charts */}
        <div className={`${cardClass} col-span-7 h-[350px] flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <p className={labelClass}>Spending Overview</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={isDark ? "#475569" : "#94a3b8"} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? "#475569" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#1e293b" : "#e2e8f0",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    fontSize: 12,
                    borderRadius: 10,
                  }}
                />
                <Area type="monotone" dataKey="amount" name="Cost" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" activeDot={{ r: 6 }} dot={{ strokeWidth: 2, fill: "#22c55e" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} col-span-5 h-[350px] flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <p className={labelClass}>Spending by Category</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 gap-4">
            <div className="relative w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryPieData} innerRadius={42} outerRadius={58} dataKey="value" stroke="none">
                    {categoryPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-800 dark:text-white">{fmt(totalMonthlyCost)}</span>
                <span className="text-[9px] text-slate-400">/ month</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-1.5 max-h-[220px] overflow-y-auto">
              {categoryPieData.map((d, idx) => (
                <div key={`${d.name}-${idx}`} className="flex items-center gap-2 text-[10px] justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(d.value)}</span>
                    <span className="text-slate-400 w-8">{d.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row Table & Side Lists */}
        {/* Left Side: Table of All Subscriptions */}
        <div className={`${cardClass} col-span-8 flex flex-col justify-between min-h-[420px]`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold">All Subscriptions ({filteredSubs.length})</p>
              
              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none w-44 transition ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-200 focus:border-green-500" : "bg-white border-slate-200 text-slate-700 focus:border-green-500"
                    }`}
                  />
                </div>

                {/* Filters */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg border text-xs outline-none cursor-pointer transition ${
                    isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg border text-xs outline-none cursor-pointer transition ${
                    isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <option value="All Categories">All Categories</option>
                  {Object.keys(CATEGORY_STYLES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <th className="py-2.5 font-bold">Subscription</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold">Billing</th>
                    <th className="py-2.5 font-bold">Next Renewal</th>
                    <th className="py-2.5 font-bold text-right">Amount</th>
                    <th className="py-2.5 font-bold text-center">Status</th>
                    <th className="py-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSubs.map(s => {
                    const badge = CATEGORY_STYLES[s.category] || CATEGORY_STYLES.Other;
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition`}>
                        <td className="py-3 flex items-center gap-3">
                          <SubscriptionLogo name={s.name} />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{s.plan}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                            {s.category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{s.billing}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{s.renewalDate}</td>
                        <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">{fmt(s.amount)}</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => toggleStatus(s.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                              s.status === "Active"
                                ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}
                          >
                            ● {s.status}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(s)}
                              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer`}
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSub(s.id)}
                              className={`p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition cursor-pointer`}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredSubs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No subscriptions found matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 hover:underline cursor-pointer">
              View all subscriptions <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Upcoming & Insights */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Upcoming Renewals */}
          <div className={`${cardClass} flex-1 flex flex-col justify-between`}>
            <div>
              <p className="text-sm font-bold mb-3">Upcoming Renewals</p>
              <div className="space-y-3.5">
                {sortedRenewals.map(s => {
                  const days = getDaysDiff(s.renewalDate);
                  const isSoon = days <= 5;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <SubscriptionLogo name={s.name} />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{s.plan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{fmt(s.amount)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                          isSoon 
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          In {days} days
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 hover:underline cursor-pointer">
                View all upcoming <span>→</span>
              </button>
            </div>
          </div>

          
        </div>
      </div>

      {/* Add/Edit Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative ${
            isDark ? "bg-[#0c1015] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-bold mb-4">
              {editingId ? "Edit Subscription" : "Add New Subscription"}
            </h2>

            <form onSubmit={handleAddOrEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Subscription Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-slate-200 focus:border-green-500" : "bg-white border-slate-200 text-slate-800 focus:border-green-500"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Plan Details</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Plan, Premium, All Apps"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? "bg-slate-900 border-slate-700 text-slate-200 focus:border-green-500" : "bg-white border-slate-200 text-slate-800 focus:border-green-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    {Object.keys(CATEGORY_STYLES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Billing Cycle</label>
                  <select
                    value={billing}
                    onChange={(e) => setBilling(e.target.value as "Monthly" | "Annual")}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1490"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-200 focus:border-green-500" : "bg-white border-slate-200 text-slate-800 focus:border-green-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Next Renewal</label>
                  <input
                    type="date"
                    required
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition cursor-pointer text-xs"
                >
                  {editingId ? "Save Changes" : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}