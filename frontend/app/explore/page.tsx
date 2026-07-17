"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sun, Moon, Wallet, Home, Heart, PiggyBank, TrendingUp, CreditCard,
  Plus, MoreVertical, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize2,
  Trash2, Undo2, Redo2, LayoutGrid, Save, Check, Lightbulb,
  Utensils, Train, Zap, ShoppingBag, Gamepad2, CircleDollarSign,
  Calendar, ChevronDown, X, PieChart, BarChart3, Shield,
  LayoutDashboard, Receipt, ClipboardList, Target, Settings, LogOut, User, Award
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import UserProfileButton from "../UserProfileButton";
import BudgetDashboard from "./BudgetDashboard";
import SubscriptionTracker from "./SubscriptionTracker";
import Link from "next/link";
import FlowNode from "./FlowNode";

// --- LOGO ---
const TreeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" />
    <path d="M12 6L16 12" />
    <path d="M12 10L8 12" />
  </svg>
);

// --- TYPES ---
interface FlowNode {
  id: string;
  type: "income" | "needs" | "savings" | "investments" | "debt" | "custom" | "expense";
  name: string;
  amount: number;
  x: number;
  y: number;
  parentId: string | null;
}

// --- CONSTANTS ---
const NODE_W = 170;
const NODE_H = 60;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plan", label: "Plan", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "stocks", label: "FlowNode", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

const NODE_TYPES: { type: FlowNode["type"]; label: string; iconColor: string; bgLight: string; bgDark: string }[] = [
  { type: "income", label: "Income", iconColor: "text-green-600", bgLight: "bg-green-50 border-green-200", bgDark: "dark:bg-green-950/40 dark:border-green-800 dark:text-green-400" },
  { type: "needs", label: "Needs", iconColor: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-50 border-blue-200", bgDark: "dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400" },
  { type: "expense", label: "Expense", iconColor: "text-rose-600 dark:text-rose-400", bgLight: "bg-rose-50 border-rose-200", bgDark: "dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400" },
  { type: "savings", label: "Savings", iconColor: "text-emerald-600 dark:text-emerald-400", bgLight: "bg-emerald-50 border-emerald-200", bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400" },
  { type: "investments", label: "Investments", iconColor: "text-purple-600 dark:text-purple-400", bgLight: "bg-purple-50 border-purple-200", bgDark: "dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-400" },
  { type: "debt", label: "Debt", iconColor: "text-red-600 dark:text-red-400", bgLight: "bg-red-50 border-red-200", bgDark: "dark:bg-red-950/40 dark:border-red-800 dark:text-red-400" },
  { type: "custom", label: "Custom", iconColor: "text-slate-600 dark:text-slate-400", bgLight: "bg-slate-50 border-slate-200", bgDark: "dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400" },
];

const TYPE_STYLES: Record<string, { text: string; iconBg: string; border: string }> = {
  income: { text: "text-green-600 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/50", border: "border-green-200 dark:border-green-800/60" },
  needs: { text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-200 dark:border-blue-800/60" },
  expense: { text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-900/50", border: "border-rose-200 dark:border-rose-800/60" },
  savings: { text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", border: "border-emerald-200 dark:border-emerald-800/60" },
  investments: { text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-200 dark:border-purple-800/60" },
  debt: { text: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50", border: "border-red-200 dark:border-red-800/60" },
  custom: { text: "text-slate-600 dark:text-slate-400", iconBg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
};

// --- ICON LOOKUP ---
const getNodeIcon = (name: string, type: string) => {
  const n = name.toLowerCase();
  if (n.includes("food") || n.includes("dining") || n.includes("grocery")) return Utensils;
  if (n.includes("rent") || n.includes("house") || n.includes("home")) return Home;
  if (n.includes("transport") || n.includes("train") || n.includes("commut")) return Train;
  if (n.includes("utilit") || n.includes("electric") || n.includes("water")) return Zap;
  if (n.includes("saving") || n.includes("emergency")) return PiggyBank;
  if (n.includes("invest") || n.includes("stock") || n.includes("etf")) return TrendingUp;
  if (n.includes("debt") || n.includes("loan") || n.includes("credit") || n.includes("payment")) return CreditCard;
  if (n.includes("entertain") || n.includes("game")) return Gamepad2;
  if (n.includes("shopping") || n.includes("clothes")) return ShoppingBag;
  if (n.includes("personal")) return Heart;
  if (n.includes("insurance") || n.includes("protect")) return Shield;
  if (type === "income") return Wallet;
  if (type === "needs") return Home;

  if (type === "savings") return PiggyBank;
  if (type === "investments") return TrendingUp;
  if (type === "debt") return CreditCard;
  if (type === "expense") return CreditCard;
  return CircleDollarSign;
};

// --- HELPERS ---
const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "NPR", label: "Nepalese Rupee", symbol: "Rs" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "KRW", label: "South Korean Won", symbol: "₩" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
];
const makeFmt = (currency: string) => (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
const pct = (part: number, total: number) => total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "0%";

const getEdgePath = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.abs(x2 - x1);
  const cpOff = Math.max(dx * 0.4, 50);
  return `M ${x1} ${y1} C ${x1 + cpOff} ${y1}, ${x2 - cpOff} ${y2}, ${x2} ${y2}`;
};

let _ctr = 0;
const newId = () => `n_${Date.now()}_${++_ctr}`;

// ========= COMPONENT =========
export default function BudgetPlanPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- THEME ---
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const s = localStorage.getItem("theme");
    const t = s === "light" ? "light" : "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // --- CURRENCY ---
  const [currency, setCurrency] = useState("USD");
  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
  }, []);
  const changeCurrency = (code: string) => {
    setCurrency(code);
    localStorage.setItem("currency", code);
  };
  const fmt = makeFmt(currency);

  // --- DATE SELECTION ---
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });


  const formatDateStr = (dStr: string) => {
    if (!dStr) return "";
    const [y, m, d] = dStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  const canHaveChildren = (n: FlowNode) => {
    if (n.type === "income") return true;
    if (!n.parentId) return true;
    const parentNode = nodes.find(p => p.id === n.parentId);
    return parentNode?.type === "income";
  };

  // --- NAV ---
  const [activeNav, setActiveNav] = useState("dashboard");

  // --- MULTI-BUDGET ---
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [budgetName, setBudgetName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDate, setNewPlanDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [cloneFromId, setCloneFromId] = useState("");

  // --- CANVAS ---
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<"select" | "pan">("select");

  // --- NODES ---
  const [nodes, setNodes] = useState<FlowNode[]>([]);

  // --- UNDO / REDO ---
  const historyRef = useRef<FlowNode[][]>([]);
  const futureRef = useRef<FlowNode[][]>([]);

  // --- INTERACTION ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ nodeId: string; sx: number; sy: number; nx: number; ny: number } | null>(null);
  const [panDrag, setPanDrag] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [mouseCanvas, setMouseCanvas] = useState({ x: 0, y: 0 });
  const [menuNodeId, setMenuNodeId] = useState<string | null>(null);
  const [editField, setEditField] = useState<{ id: string; field: "name" | "amount" } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // --- PERSISTENCE ---
  const [budgetId, setBudgetId] = useState<number | null>(null);
  const [autoSaved, setAutoSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getHeaders = () => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (user?.id) { h["X-Clerk-User-Id"] = user.id; h["X-Clerk-User-Name"] = user.fullName || "User"; }
    return h;
  };

  const loadAllBudgets = async () => {
    if (!isLoaded || !user) return;
    try {
      const res = await fetch("http://localhost:8080/api/budgets", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAllBudgets(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBudget = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this budget plan?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/budgets/${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) {
        if (budgetId === id) {
          setBudgetId(null);
          setNodes([]);
        }
        loadAllBudgets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBudget = async (dateVal = selectedDate) => {
    if (!isLoaded || !user) return;
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8080/api/budgets?tag=${dateVal}`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const budgets = await res.json();
      const b = budgets?.[0];
      if (b) {
        setBudgetId(b.id);
        setBudgetName(b.name || `Budget Plan - ${formatDateStr(dateVal)}`);
        try {
          const meta = JSON.parse(b.metadata || "{}");
          if (meta.plannerNodes?.length) { setNodes(meta.plannerNodes); }
          else { setNodes([]); }
        } catch { setNodes([]); }
      } else {
        const defaultName = `Budget Plan - ${formatDateStr(dateVal)}`;
        const payload = {
          name: defaultName,
          income: 0,
          tags: dateVal,
          categories: [],
          metadata: JSON.stringify({ plannerNodes: [] })
        };
        const cr = await fetch("http://localhost:8080/api/budgets", { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) });
        if (cr.ok) {
          const nb = await cr.json();
          setBudgetId(nb.id);
          setBudgetName(nb.name || defaultName);
        }
        setNodes([]);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadBudgetById = async (id: number) => {
    if (!isLoaded || !user) return;
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8080/api/budgets/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const b = await res.json();
      if (b) {
        setBudgetId(b.id);
        setBudgetName(b.name || `Budget Plan - ${formatDateStr(b.tags)}`);
        setSelectedDate(b.tags || selectedDate);
        try {
          const meta = JSON.parse(b.metadata || "{}");
          if (meta.plannerNodes?.length) { setNodes(meta.plannerNodes); }
          else { setNodes([]); }
        } catch { setNodes([]); }
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const saveBudget = useCallback(async (nodesToSave: FlowNode[], nameOverride?: string) => {
    if (!budgetId) return;
    try {
      setSaving(true);
      const inc = nodesToSave.find(n => n.type === "income");
      const nameToSave = nameOverride !== undefined ? nameOverride : (budgetName || `Budget Plan - ${formatDateStr(selectedDate)}`);
      const payload = {
        name: nameToSave,
        income: inc?.amount || 0,
        tags: selectedDate,
        categories: nodesToSave.filter(n => n.type !== "income").map(n => {
          let backendType = "Expense";
          if (n.type === "savings") backendType = "Savings";
          else if (n.type === "investments") backendType = "Investment";
          return { name: n.name, amount: n.amount, type: backendType };
        }),
        metadata: JSON.stringify({ plannerNodes: nodesToSave })
      };
      const res = await fetch(`http://localhost:8080/api/budgets/${budgetId}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) setAutoSaved(true);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }, [budgetId, user, selectedDate, budgetName]);

  const scheduleAutoSave = useCallback((newNodes: FlowNode[]) => {
    setAutoSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveBudget(newNodes), 2000);
  }, [saveBudget]);

  const handleStartNewBudget = async () => {
    if (!isLoaded || !user) return;
    try {
      setIsLoading(true);
      const today = new Date();
      const todayVal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      
      const res = await fetch(`http://localhost:8080/api/budgets?tag=${todayVal}`, { headers: getHeaders() });
      const existing = await res.json();
      let b = existing?.[0];
      if (!b) {
        const payload = {
          name: `Budget Plan - ${formatDateStr(todayVal)}`,
          income: 0,
          tags: todayVal,
          categories: [],
          metadata: JSON.stringify({ plannerNodes: [] })
        };
        const cr = await fetch("http://localhost:8080/api/budgets", { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) });
        if (cr.ok) b = await cr.json();
      }
      if (b) {
        setBudgetId(b.id);
        setSelectedDate(todayVal);
        setBudgetName(b.name || `Budget Plan - ${formatDateStr(todayVal)}`);
        try {
          const meta = JSON.parse(b.metadata || "{}");
          if (meta.plannerNodes?.length) { setNodes(meta.plannerNodes); }
          else { setNodes([]); }
        } catch { setNodes([]); }
      }
      setShowReport(false);
      setActiveNav("plan");
      loadAllBudgets();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBudget = (budget: any) => {
    setBudgetId(budget.id);
    setSelectedDate(budget.tags || selectedDate);
    setBudgetName(budget.name || `Budget Plan - ${formatDateStr(budget.tags)}`);
    try {
      const meta = JSON.parse(budget.metadata || "{}");
      if (meta.plannerNodes?.length) { setNodes(meta.plannerNodes); }
      else { setNodes([]); }
    } catch { setNodes([]); }
    setShowReport(false);
    setActiveNav("plan");
  };

  const handleCreateNewPlan = async () => {
    if (!newPlanName.trim()) return;
    try {
      setIsLoading(true);
      
      let plannerNodes = [];
      let income = 0;
      let categories = [];
      
      if (cloneFromId) {
        const selectedParent = allBudgets.find(b => b.id === Number(cloneFromId));
        if (selectedParent) {
          income = selectedParent.income || 0;
          try {
            const meta = JSON.parse(selectedParent.metadata || "{}");
            plannerNodes = meta.plannerNodes || [];
          } catch {}
          categories = selectedParent.categories || [];
        }
      }
      
      const payload = {
        name: newPlanName.trim(),
        income: income,
        tags: newPlanDate,
        categories: categories.map((c: any) => ({ name: c.name, amount: c.amount, type: c.type })),
        metadata: JSON.stringify({ plannerNodes })
      };
      
      const res = await fetch("http://localhost:8080/api/budgets", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newBudget = await res.json();
        setBudgetId(newBudget.id);
        setSelectedDate(newBudget.tags);
        setBudgetName(newBudget.name);
        setNodes(plannerNodes);
        setShowNewPlanModal(false);
        setNewPlanName("");
        setCloneFromId("");
        setActiveNav("plan");
        loadAllBudgets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      const initLoad = async () => {
        try {
          setIsLoading(true);
          const res = await fetch("http://localhost:8080/api/budgets", { headers: getHeaders() });
          if (res.ok) {
            const budgets = await res.json();
            setAllBudgets(budgets || []);
            const userBudgets = budgets?.filter((b: any) => b.parent_budget_id === null || b.user_id !== 1) || [];
            if (userBudgets.length > 0) {
              handleOpenBudget(userBudgets[0]);
            } else {
              const today = new Date();
              const todayVal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              await loadBudget(todayVal);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      initLoad();
    }
  }, [isLoaded, user]);

  const updateNodes = (updater: (prev: FlowNode[]) => FlowNode[]) => {
    setNodes(prev => {
      historyRef.current = [...historyRef.current.slice(-49), prev]; // ponytail: cap at 50
      futureRef.current = [];
      const next = updater(prev);
      scheduleAutoSave(next);
      return next;
    });
  };
  const undo = () => {
    if (!historyRef.current.length) return;
    setNodes(prev => {
      futureRef.current = [...futureRef.current, prev];
      const last = historyRef.current.pop()!;
      scheduleAutoSave(last);
      return last;
    });
  };
  const redo = () => {
    if (!futureRef.current.length) return;
    setNodes(prev => {
      historyRef.current = [...historyRef.current, prev];
      const next = futureRef.current.pop()!;
      scheduleAutoSave(next);
      return next;
    });
  };

  // --- COMPUTED ---
  const totalIncome = nodes.filter(n => n.type === "income").reduce((s, n) => s + n.amount, 0);
  const allExpenseNodes = nodes.filter(n => n.type !== "income");

  // Only sum top-level allocations to prevent double-counting child allocations!
  const topLevelAllocations = allExpenseNodes.filter(n => {
    if (!n.parentId) return true;
    const parentNode = nodes.find(p => p.id === n.parentId);
    return !parentNode || parentNode.type === "income";
  });

  const totalPlanned = topLevelAllocations.reduce((s, n) => s + n.amount, 0);
  const remaining = totalIncome - totalPlanned;

  // Non-overlapping expenses vs savings breakdown
  let totalExpenses = 0;
  let totalSavingsInvest = 0;

  allExpenseNodes.forEach(n => {
    const childrenSum = nodes.filter(c => c.parentId === n.id).reduce((s, c) => s + c.amount, 0);
    const ownAmount = Math.max(0, n.amount - childrenSum);
    if (["savings", "investments"].includes(n.type)) {
      totalSavingsInvest += ownAmount;
    } else {
      totalExpenses += ownAmount;
    }
  });
  const edges = nodes.filter(n => n.parentId).map(n => ({ from: n.parentId!, to: n.id }));

  // --- ADD / DELETE ---
  const addNode = (type: FlowNode["type"]) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - pan.x) / zoom : 400;
    const cy = rect ? (rect.height / 2 - pan.y) / zoom : 300;
    const names: Record<string, string> = { income: "Income", needs: "Needs", savings: "Savings", investments: "Investments", debt: "Debt Payment", custom: "Custom", expense: "Expense" };
    const id = newId();
    updateNodes(prev => [...prev, { id, type, name: names[type] || "Node", amount: 0, x: cx - NODE_W / 2 + (Math.random() * 80 - 40), y: cy - NODE_H / 2 + (Math.random() * 80 - 40), parentId: null }]);
    setSelectedId(id);
    setShowAddPanel(false);
  };

  const addChildNode = (pId: string) => {
    const parentNode = nodes.find(n => n.id === pId);
    if (!parentNode) return;
    const id = newId();
    updateNodes(prev => [
      ...prev,
      {
        id,
        type: "custom",
        name: "Custom",
        amount: 0,
        x: parentNode.x + 220,
        y: parentNode.y + (Math.random() * 60 - 30),
        parentId: pId
      }
    ]);
    setSelectedId(id);
    setMenuNodeId(null);
  };

  const deleteNode = (id: string) => {
    updateNodes(prev => prev.filter(n => n.id !== id).map(n => n.parentId === id ? { ...n, parentId: null } : n));
    if (selectedId === id) setSelectedId(null);
    setMenuNodeId(null);
  };

  const disconnectNode = (id: string) => {
    updateNodes(prev => prev.map(n => n.id === id ? { ...n, parentId: null } : n));
    setMenuNodeId(null);
  };

  // --- MOUSE HANDLERS ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.hasAttribute("data-canvas-bg") && !target.closest("[data-canvas-bg]")) return;

    if (connectFrom) {
      // Clicked canvas background while connecting — cancel
      setConnectFrom(null);
      return;
    }
    if (tool === "pan" || e.button === 1) {
      setPanDrag({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
    } else {
      setSelectedId(null);
      setMenuNodeId(null);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setMouseCanvas({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });

    if (panDrag) setPan({ x: panDrag.px + (e.clientX - panDrag.sx), y: panDrag.py + (e.clientY - panDrag.sy) });
    if (dragState) {
      const dx = (e.clientX - dragState.sx) / zoom;
      const dy = (e.clientY - dragState.sy) / zoom;
      setNodes(prev => prev.map(n => n.id === dragState.nodeId ? { ...n, x: dragState.nx + dx, y: dragState.ny + dy } : n));
    }
  }, [panDrag, dragState, pan.x, pan.y, zoom]);

  const handleMouseUp = useCallback(() => {
    if (dragState) setNodes(prev => { scheduleAutoSave(prev); return prev; });
    setPanDrag(null);
    setDragState(null);
    // Cancel any in-progress connection drag if released on empty space
    setConnectFrom(null);
  }, [dragState, scheduleAutoSave]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const nz = Math.min(Math.max(zoom * factor, 0.15), 3);
    setPan(p => ({ x: mx - (mx - p.x) * (nz / zoom), y: my - (my - p.y) * (nz / zoom) }));
    setZoom(nz);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId && !editField) deleteNode(selectedId);
      if (e.key === "Escape") { setConnectFrom(null); setSelectedId(null); setMenuNodeId(null); setEditField(null); setShowAddPanel(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editField]);

  const fitView = () => {
    if (!canvasRef.current || nodes.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pad = 80;
    const minX = Math.min(...nodes.map(n => n.x)) - pad;
    const maxX = Math.max(...nodes.map(n => n.x + NODE_W)) + pad;
    const minY = Math.min(...nodes.map(n => n.y)) - pad;
    const maxY = Math.max(...nodes.map(n => n.y + NODE_H)) + pad;
    const nz = Math.min(rect.width / (maxX - minX), rect.height / (maxY - minY), 1.5);
    setZoom(nz);
    setPan({ x: (rect.width - (maxX - minX) * nz) / 2 - minX * nz, y: (rect.height - (maxY - minY) * nz) / 2 - minY * nz });
  };

  // --- NODE EVENTS ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectFrom) return; // ponytail: connection completes on mouseUp, not mouseDown
    setSelectedId(nodeId);
    setMenuNodeId(null);
    const nd = nodes.find(n => n.id === nodeId);
    if (nd) setDragState({ nodeId, sx: e.clientX, sy: e.clientY, nx: nd.x, ny: nd.y });
  };

  const handleNodeMouseUp = (e: React.MouseEvent, nodeId: string) => {
    if (connectFrom && connectFrom !== nodeId) {
      e.stopPropagation();
      updateNodes(prev => prev.map(n => n.id === nodeId ? { ...n, parentId: connectFrom } : n));
      setConnectFrom(null);
    }
  };

  const handleConnectorDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectFrom(nodeId);
    setSelectedId(nodeId);
  };

  const startEdit = (id: string, field: "name" | "amount") => {
    const nd = nodes.find(n => n.id === id);
    if (!nd) return;
    setEditField({ id, field });
    setEditValue(field === "name" ? nd.name : String(nd.amount));
  };
  const commitEdit = () => {
    if (!editField) return;
    updateNodes(prev => prev.map(n => {
      if (n.id !== editField.id) return n;
      if (editField.field === "name") return { ...n, name: editValue || n.name };

      const childrenSum = prev.filter(c => c.parentId === n.id).reduce((s, c) => s + c.amount, 0);
      let val = Math.max(childrenSum, Number(editValue) || 0);

      if (n.type !== "income") {
        const parent = prev.find(p => p.id === n.parentId);
        if (parent && parent.type !== "income") {
          // It is a sub-allocation node
          const otherChildrenAmount = prev.filter(c => c.parentId === parent.id && c.id !== n.id).reduce((s, c) => s + c.amount, 0);
          const maxAllowed = Math.max(childrenSum, parent.amount - otherChildrenAmount);
          if (val > maxAllowed) val = maxAllowed;
        } else {
          // It is a top-level allocation node
          const income = prev.filter(p => p.type === "income").reduce((s, p) => s + p.amount, 0);
          const otherTopLevelPlanned = prev.filter(p => {
            if (p.type === "income" || p.id === n.id) return false;
            if (!p.parentId) return true;
            const parentNode = prev.find(parent => parent.id === p.parentId);
            return !parentNode || parentNode.type === "income";
          }).reduce((s, p) => s + p.amount, 0);

          const maxAllowed = Math.max(childrenSum, income - otherTopLevelPlanned);
          if (val > maxAllowed) val = maxAllowed;
        }
      }
      return { ...n, amount: val };
    }));
    setEditField(null);
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()} / ${String(today.getMonth() + 1).padStart(2, "0")} / ${String(today.getDate()).padStart(2, "0")}`;

  const isDark = theme === "dark";

  // ============ RENDER ============
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0e12]" : "bg-slate-50"}`}>
        <p className="text-sm text-slate-400 animate-pulse">Loading Budget Plan...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#0a0e12] text-slate-200" : "bg-slate-50 text-slate-800"}`} style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ====== LEFT NAVIGATION SIDEBAR ====== */}
      <nav className={`w-[200px] flex-shrink-0 border-r flex flex-col z-40 ${
        isDark ? "bg-[#0c1015] border-slate-800" : "bg-white border-slate-200"
      }`}>
        {/* Branding */}
        {activeNav === "stocks" ? (
          <div className="flex flex-col gap-0.5 px-5 py-3 border-b border-slate-200 dark:border-slate-800 select-none">
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="w-5 h-5 text-green-550" />
              <span className="font-retro text-sm font-bold tracking-wider text-white">StockPlanner</span>
            </div>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Plan. Invest. Grow.</span>
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <TreeLogo className="w-6 h-6 text-green-600" />
            <span className="font-bold text-base tracking-wide">Budget Planner</span>
          </Link>
        )}

        {/* Nav Items */}
        <div className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "plan") {
                    if (budgetId) {
                      setActiveNav("plan");
                    } else {
                      handleStartNewBudget();
                    }
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700"
                    : isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </div>

      </nav>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNav === "plan" ? (
          <>
            {/* --- PLANNER TOP BAR --- */}
            <div className={`w-full border-b px-5 py-3 flex items-center justify-between flex-shrink-0 ${
              isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"
            }`}>
              <div>
                {isEditingName ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => {
                      setIsEditingName(false);
                      const newName = tempName.trim() || budgetName || `Budget Plan - ${formatDateStr(selectedDate)}`;
                      setBudgetName(newName);
                      saveBudget(nodes, newName);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingName(false);
                        const newName = tempName.trim() || budgetName || `Budget Plan - ${formatDateStr(selectedDate)}`;
                        setBudgetName(newName);
                        saveBudget(nodes, newName);
                      }
                    }}
                    className="text-lg font-bold bg-transparent border-b border-green-500 outline-none w-48"
                  />
                ) : (
                  <h1
                    onClick={() => {
                      setIsEditingName(true);
                      setTempName(budgetName || "");
                    }}
                    className="text-lg font-bold hover:text-green-500 cursor-pointer transition-colors"
                    title="Click to rename"
                  >
                    {budgetName || "Budget Plan"}
                  </h1>
                )}
                <p className="text-[11px] text-slate-400">Visualize and organize your money flow</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                  isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"
                }`}>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{formatDateStr(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {saving ? <><div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> <span className="text-slate-400">Saving...</span></>
                    : autoSaved ? <><Check className="w-3.5 h-3.5 text-green-500" /> <span className="text-green-600 dark:text-green-400">Auto-saved</span></>
                    : <span className="text-amber-500">Unsaved changes</span>}
                </div>
                {/* Undo / Redo */}
                <div className="flex items-center gap-0.5">
                  <button onClick={undo} disabled={!historyRef.current.length} className={`p-1.5 rounded-lg cursor-pointer transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} ${historyRef.current.length ? "" : "opacity-30 cursor-default"}`} title="Undo"><Undo2 className="w-4 h-4" /></button>
                  <button onClick={redo} disabled={!futureRef.current.length} className={`p-1.5 rounded-lg cursor-pointer transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"} ${futureRef.current.length ? "" : "opacity-30 cursor-default"}`} title="Redo"><Redo2 className="w-4 h-4" /></button>
                </div>

                <button onClick={() => setShowReport(r => !r)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                  showReport
                    ? "border-green-500 bg-green-500/10 text-green-500"
                    : isDark ? "border-slate-700 bg-slate-900 hover:bg-slate-800" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}><BarChart3 className="w-3.5 h-3.5" /> {showReport ? "Back to Plan" : "View Report"}</button>

                <button onClick={async () => {
                  await saveBudget(nodes);
                  await loadAllBudgets();
                  setActiveNav("dashboard");
                }} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> Save Plan
                </button>
              </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className={`w-full px-5 py-3 flex gap-3 border-b flex-shrink-0 ${
              isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"
            }`}>
              {[
                { label: "Total Income", value: fmt(totalIncome), sub: "Monthly Salary", icon: Wallet, ic: "text-green-500", ib: "bg-green-100 dark:bg-green-900/40" },
                { label: "Total Planned", value: fmt(totalPlanned), sub: `${pct(totalPlanned, totalIncome)} of income`, icon: PieChart, ic: "text-blue-500", ib: "bg-blue-100 dark:bg-blue-900/40" },
                { label: "Total Expenses", value: fmt(totalExpenses), sub: `${pct(totalExpenses, totalIncome)} of income`, icon: BarChart3, ic: "text-red-500", ib: "bg-red-100 dark:bg-red-900/40" },
                { label: "Total Savings & Invest.", value: fmt(totalSavingsInvest), sub: `${pct(totalSavingsInvest, totalIncome)} of income`, icon: TrendingUp, ic: "text-teal-500", ib: "bg-teal-100 dark:bg-teal-900/40" },
                { label: "Remaining", value: fmt(remaining), sub: remaining === 0 ? "✓ Fully allocated" : `${pct(remaining, totalIncome)} of income`, icon: Wallet, ic: remaining > 0 ? "text-amber-500" : "text-green-500", ib: remaining > 0 ? "bg-amber-100 dark:bg-amber-900/40" : "bg-green-100 dark:bg-green-900/40" },
              ].map(c => (
                <div key={c.label} className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                  isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.ib}`}>
                    <c.icon className={`w-4 h-4 ${c.ic}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide truncate">{c.label}</p>
                    <p className="text-sm font-bold truncate">{c.value}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            {showReport ? (
              <BudgetDashboard nodes={nodes} fmt={fmt} isDark={isDark} currency={currency} selectedMonth={selectedDate} allBudgets={allBudgets} />
            ) : (<>
            {/* --- CANVAS AREA --- */}
            <div className="flex-1 relative overflow-hidden min-h-0">
              {/* Dot grid bg */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: isDark
                  ? "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)"
                  : "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }} />

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="absolute inset-0"
                style={{ cursor: connectFrom ? "crosshair" : tool === "pan" ? (panDrag ? "grabbing" : "grab") : "default" }}
                onMouseDown={handleCanvasMouseDown}
                onWheel={handleWheel}
                data-canvas-bg
              >
                <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute", inset: 0 }} data-canvas-bg>

                  {/* SVG Edges */}
                  <svg style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1, overflow: "visible" }} className="pointer-events-none">
                    <defs>
                      <marker id="ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill={isDark ? "#475569" : "#94a3b8"} />
                      </marker>
                      <marker id="ah-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
                      </marker>
                    </defs>
                    {edges.map(edge => {
                      const from = nodes.find(n => n.id === edge.from);
                      const to = nodes.find(n => n.id === edge.to);
                      if (!from || !to) return null;
                      return (
                        <path key={`${edge.from}-${edge.to}`}
                          d={getEdgePath(from.x + NODE_W, from.y + NODE_H / 2, to.x, to.y + NODE_H / 2)}
                          stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth="2" fill="none" markerEnd="url(#ah)" />
                      );
                    })}
                    {/* Connecting preview line */}
                    {connectFrom && (() => {
                      const fn = nodes.find(n => n.id === connectFrom);
                      if (!fn) return null;
                      return <path d={getEdgePath(fn.x + NODE_W, fn.y + NODE_H / 2, mouseCanvas.x, mouseCanvas.y)}
                        stroke="#22c55e" strokeWidth="2" strokeDasharray="6 3" fill="none" markerEnd="url(#ah-green)" />;
                    })()}
                  </svg>

                  {/* Node Cards */}
                  {nodes.map(node => {
                    const st = TYPE_STYLES[node.type] || TYPE_STYLES.custom;
                    const Icon = getNodeIcon(node.name, node.type);
                    const isSel = selectedId === node.id;
                    const percentage = totalIncome > 0 && node.type !== "income" ? pct(node.amount, totalIncome) : "";
                    const isEd = editField?.id === node.id;

                    return (
                      <div
                        key={node.id}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                        onDoubleClick={(e) => { e.stopPropagation(); startEdit(node.id, "amount"); }}
                        className={`absolute select-none rounded-xl border-[1.5px] transition-shadow ${
                          isDark ? "bg-slate-900 shadow-black/20" : "bg-white shadow-slate-200/50"
                        } ${isSel ? "border-green-500 shadow-lg ring-2 ring-green-500/20" : st.border} shadow-md hover:shadow-lg`}
                        style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H, zIndex: isSel ? 10 : 1, cursor: connectFrom ? "crosshair" : "grab" }}
                      >
                        <div className="flex items-start gap-2 px-3 py-2 h-full">
                          {/* Icon */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${st.iconBg}`}>
                            <Icon className={`w-3.5 h-3.5 ${st.text}`} />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            {isEd && editField.field === "name" ? (
                              <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit} onKeyDown={e => e.key === "Enter" && commitEdit()}
                                className="w-full text-xs font-semibold bg-transparent border-b border-green-500 outline-none"
                                onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} />
                            ) : (
                              <p className="text-xs font-semibold truncate" onDoubleClick={(e) => { e.stopPropagation(); startEdit(node.id, "name"); }}>{node.name}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isEd && editField.field === "amount" ? (
                                <input autoFocus type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                                  onBlur={commitEdit} onKeyDown={e => e.key === "Enter" && commitEdit()}
                                  className="w-20 text-[11px] font-bold bg-transparent border-b border-green-500 outline-none"
                                  onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} />
                              ) : (
                                <span className="text-[11px] font-bold" onDoubleClick={(e) => { e.stopPropagation(); startEdit(node.id, "amount"); }}>{fmt(node.amount)}</span>
                              )}
                              {percentage && <span className="text-[10px] text-slate-400">{percentage}</span>}
                            </div>
                          </div>
                          {/* Kebab */}
                          <button onClick={(e) => { e.stopPropagation(); setMenuNodeId(menuNodeId === node.id ? null : node.id); }}
                            onMouseDown={e => e.stopPropagation()}
                            className={`p-0.5 rounded cursor-pointer mt-0.5 ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
                            <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>

                        {/* ★ GREEN CONNECTOR DOT — right edge */}
                        {canHaveChildren(node) && (
                          <button
                            onMouseDown={(e) => handleConnectorDragStart(e, node.id)}
                            className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-green-500 border-[3px] cursor-crosshair hover:scale-150 hover:shadow-[0_0_10px_rgba(34,197,94,0.7)] transition-all z-20"
                            style={{ borderColor: isDark ? "#0f172a" : "#ffffff" }}
                            title="Drag to connect to another node"
                          />
                        )}

                        {/* Dropdown Menu */}
                        {menuNodeId === node.id && (
                          <div className={`absolute top-full right-0 mt-1 w-40 rounded-xl border shadow-xl z-50 py-1 text-xs ${
                            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                          }`} onMouseDown={e => e.stopPropagation()}>
                            <button onClick={() => { startEdit(node.id, "name"); setMenuNodeId(null); }} className={`w-full text-left px-3 py-2 cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>Rename</button>
                            <button onClick={() => { startEdit(node.id, "amount"); setMenuNodeId(null); }} className={`w-full text-left px-3 py-2 cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>Edit Amount</button>
                            {canHaveChildren(node) && (
                              <button onClick={() => addChildNode(node.id)} className={`w-full text-left px-3 py-2 text-green-500 font-semibold cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>+ Add Child Node</button>
                            )}
                            <div className={`border-t my-1 ${isDark ? "border-slate-700" : "border-slate-200"}`} />
                            {node.parentId && <button onClick={() => disconnectNode(node.id)} className={`w-full text-left px-3 py-2 cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>Disconnect</button>}
                            <button onClick={() => deleteNode(node.id)} className={`w-full text-left px-3 py-2 text-red-500 cursor-pointer ${isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"}`}>Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ★ FLOATING ADD NODE PANEL */}
              <div className="absolute top-4 left-4 z-20">
                {showAddPanel ? (
                  <div className={`w-[150px] rounded-xl border shadow-xl p-3 ${
                    isDark ? "bg-slate-900/95 border-slate-700 backdrop-blur-sm" : "bg-white/95 border-slate-200 backdrop-blur-sm"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold">Add Node</p>
                      <button onClick={() => setShowAddPanel(false)} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"><X className="w-3.5 h-3.5 text-slate-400" /></button>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">Click to add a node</p>
                    <div className="flex flex-col gap-1">
                      {NODE_TYPES.map(nt => {
                        const Icon = getNodeIcon(nt.label, nt.type);
                        return (
                          <button key={nt.type} onClick={() => addNode(nt.type)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition ${nt.bgLight} ${nt.bgDark}`}>
                            <Icon className={`w-3.5 h-3.5 ${nt.iconColor}`} /> {nt.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-start gap-1.5 text-[9px] text-slate-400">
                      <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Tip:</strong> Drag the green dot to connect nodes.</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddPanel(true)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border shadow-lg text-xs font-semibold cursor-pointer transition ${
                      isDark ? "bg-slate-900/95 border-slate-700 hover:bg-slate-800 backdrop-blur-sm" : "bg-white/95 border-slate-200 hover:bg-slate-50 backdrop-blur-sm"
                    }`}>
                    <Plus className="w-4 h-4 text-green-500" /> Add Node
                  </button>
                )}
              </div>

              {/* CONNECTING INDICATOR */}
              {connectFrom && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold shadow-lg z-30 flex items-center gap-2 pointer-events-auto">
                  Release on a node to connect
                  <button onClick={() => setConnectFrom(null)} className="p-0.5 rounded hover:bg-green-700 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* BOTTOM TOOLBAR */}
              <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shadow-xl z-20 ${
                isDark ? "bg-slate-900/95 border-slate-700 backdrop-blur-sm" : "bg-white/95 border-slate-200 backdrop-blur-sm"
              }`}>
                <button onClick={() => setTool("select")} className={`p-2 rounded-lg cursor-pointer transition ${tool === "select" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : isDark ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}><MousePointer2 className="w-4 h-4" /></button>
                <button onClick={() => setTool("pan")} className={`p-2 rounded-lg cursor-pointer transition ${tool === "pan" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : isDark ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}><Hand className="w-4 h-4" /></button>
                <div className={`w-px h-5 mx-1 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.15))} className={`p-2 rounded-lg cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}><ZoomOut className="w-4 h-4" /></button>
                <span className="text-xs font-medium text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className={`p-2 rounded-lg cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}><ZoomIn className="w-4 h-4" /></button>
                <div className={`w-px h-5 mx-1 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                <button onClick={fitView} className={`p-2 rounded-lg cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}><Maximize2 className="w-4 h-4" /></button>
                <button onClick={() => selectedId && deleteNode(selectedId)} className={`p-2 rounded-lg cursor-pointer transition ${selectedId ? "hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500" : isDark ? "text-slate-700" : "text-slate-300"}`}><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* MINIMAP */}
              <div className={`absolute bottom-4 right-4 w-[130px] h-[85px] rounded-lg border overflow-hidden z-20 ${
                isDark ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-slate-200"
              }`}>
                {nodes.length > 0 && (() => {
                  const pad = 30;
                  const minX = Math.min(...nodes.map(n => n.x)) - pad;
                  const maxX = Math.max(...nodes.map(n => n.x + NODE_W)) + pad;
                  const minY = Math.min(...nodes.map(n => n.y)) - pad;
                  const maxY = Math.max(...nodes.map(n => n.y + NODE_H)) + pad;
                  const sc = Math.min(126 / (maxX - minX || 1), 81 / (maxY - minY || 1));
                  return (
                    <div className="relative w-full h-full p-0.5">
                      {nodes.map(nd => {
                        const colors: Record<string, string> = { income: "bg-green-500", needs: "bg-blue-500", savings: "bg-emerald-500", investments: "bg-purple-500", debt: "bg-red-500", custom: "bg-slate-500", expense: "bg-rose-500" };
                        return <div key={nd.id} className={`absolute rounded-sm ${colors[nd.type] || "bg-slate-400"}`}
                          style={{ left: (nd.x - minX) * sc, top: (nd.y - minY) * sc, width: Math.max(NODE_W * sc, 4), height: Math.max(NODE_H * sc, 3), opacity: 0.7 }} />;
                      })}
                    </div>
                  );
                })()}
                <div className={`absolute bottom-0 right-0 flex items-center gap-0.5 p-0.5 rounded-tl-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.15))} className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"><ZoomOut className="w-2.5 h-2.5" /></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"><ZoomIn className="w-2.5 h-2.5" /></button>
                  <button onClick={fitView} className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"><Maximize2 className="w-2.5 h-2.5" /></button>
                </div>
              </div>
            </div>
          </>)}
          </>
        ) : activeNav === "dashboard" ? (
          /* --- DASHBOARD BUDGETS LIST --- */
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Header */}
            <div className={`w-full border-b px-6 py-4 flex-shrink-0 flex items-center justify-between ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
              <div>
                <h1 className="text-lg font-bold">My Budgets</h1>
                <p className="text-[11px] text-slate-400 font-medium">Select a plan to view or edit your budget plan</p>
              </div>
              <button
                onClick={() => {
                  setNewPlanName("");
                  setNewPlanDate(new Date().toISOString().split("T")[0]);
                  setCloneFromId("");
                  setShowNewPlanModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Plan
              </button>
            </div>

            {/* List/Grid of Date Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBudgets.length > 0 ? (
                allBudgets.map(b => {
                  let monthNodes: any[] = [];
                  try {
                    const meta = JSON.parse(b.metadata || "{}");
                    monthNodes = meta.plannerNodes || [];
                  } catch {}
                  const incNode = monthNodes.find(n => n.type === "income");
                  const expNodes = monthNodes.filter(n => n.type !== "income");
                  const incAmt = incNode?.amount || 0;
                  const expAmt = expNodes.reduce((sum: number, n: any) => sum + n.amount, 0);
                  const remAmt = incAmt - expAmt;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleOpenBudget(b)}
                      className={`rounded-xl border p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
                        isDark ? "border-slate-800 bg-[#0c1015] hover:border-slate-700" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                            {formatDateStr(b.tags || "")}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {monthNodes.length} nodes
                            </span>
                            <button
                              onClick={(e) => deleteBudget(b.id, e)}
                              className={`p-1 rounded transition cursor-pointer ${
                                isDark ? "hover:bg-slate-800 text-red-400" : "hover:bg-slate-100 text-red-500"
                              }`}
                              title="Delete Budget"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold mb-3 truncate">{b.name || `Budget Plan - ${b.tags}`}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Income</span>
                            <span className="font-bold text-green-500">{fmt(incAmt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Planned Expenses</span>
                            <span className="font-bold text-blue-500">{fmt(expAmt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-t pt-1.5 mt-1.5 border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Remaining</span>
                            <span className={`font-bold ${remAmt >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmt(remAmt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end text-[10px] font-semibold text-green-500">
                        Open Plan →
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold">No Budgets Created</h3>
                  <p className="text-xs text-slate-400 max-w-xs text-center">Click the button above to start your first budget plan.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeNav === "reports" ? (
          <BudgetDashboard nodes={nodes} fmt={fmt} isDark={isDark} currency={currency} selectedMonth={selectedDate} allBudgets={allBudgets} />
        ) : activeNav === "subscriptions" ? (
          <SubscriptionTracker isDark={isDark} currency={currency} fmt={fmt} />
        ) : activeNav === "stocks" ? (
          <FlowNode isDark={isDark} />
        ) : activeNav === "settings" ? (
          /* --- SETTINGS VIEW --- */
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className={`w-full border-b px-6 py-4 flex-shrink-0 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
              <h1 className="text-lg font-bold">Settings</h1>
              <p className="text-[11px] text-slate-400">Manage your preferences and account</p>
            </div>
            <div className="p-6 space-y-6 max-w-lg">
              {/* Appearance */}
              <div className={`rounded-xl border p-4 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
                <h3 className="text-sm font-semibold mb-3">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <span className="text-sm">{isDark ? "Dark Mode" : "Light Mode"}</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-10 h-[22px] rounded-full transition-colors cursor-pointer ${
                      isDark ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      isDark ? "left-[22px]" : "left-[3px]"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div className={`rounded-xl border p-4 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
                <h3 className="text-sm font-semibold mb-3">Currency</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => changeCurrency(c.code)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                        currency === c.code
                          ? "bg-green-500/15 text-green-500 font-semibold"
                          : isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="font-mono text-xs w-5">{c.symbol}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account */}
              {isLoaded && user ? (
                <div className={`rounded-xl border p-4 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
                  <h3 className="text-sm font-semibold mb-3">Account</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
                    <div>
                      <p className="text-sm font-semibold">{user.fullName || "User"}</p>
                      <p className="text-xs text-slate-400">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => openUserProfile()}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                        isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Manage Profile
                    </button>
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 transition cursor-pointer ${
                        isDark ? "hover:bg-red-950/20" : "hover:bg-red-50"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl border p-4 ${isDark ? "border-slate-800 bg-[#0c1015]" : "border-slate-200 bg-white"}`}>
                  <h3 className="text-sm font-semibold mb-3">Account</h3>
                  <button onClick={() => router.push("/sign-in")} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 cursor-pointer">Sign in</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- PLACEHOLDER FOR OTHER NAV VIEWS --- */
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              {(() => { const item = NAV_ITEMS.find(n => n.id === activeNav); return item ? <item.icon className="w-7 h-7 text-slate-400" /> : null; })()}
            </div>
            <h2 className="text-lg font-bold">{NAV_ITEMS.find(n => n.id === activeNav)?.label}</h2>
          </div>
        )}
      </div>

      {/* ====== CREATE NEW PLAN MODAL ====== */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isDark ? "bg-[#0c1015] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Create New Plan</h3>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className={`p-1 rounded cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Plan Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Budget 2026"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition ${
                    isDark
                      ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white"
                      : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                  }`}
                />
              </div>

              {/* Month/Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Month / Date</label>
                <input
                  type="date"
                  value={newPlanDate}
                  onChange={(e) => setNewPlanDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition ${
                    isDark
                      ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white"
                      : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                  }`}
                />
              </div>

              {/* Clone From */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Clone From (Optional)</label>
                <select
                  value={cloneFromId}
                  onChange={(e) => setCloneFromId(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition ${
                    isDark
                      ? "bg-slate-900 border-slate-800 focus:border-green-500 text-white"
                      : "bg-white border-slate-200 focus:border-green-500 text-slate-800"
                  }`}
                >
                  <option value="">Blank Plan (Start from scratch)</option>
                  {allBudgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || `Budget Plan - ${formatDateStr(b.tags)}`} ({formatDateStr(b.tags)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isDark
                    ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPlan}
                disabled={!newPlanName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer ${
                  newPlanName.trim()
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-600/50 cursor-not-allowed"
                }`}
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
