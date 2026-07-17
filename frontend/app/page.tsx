"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, GitFork, Star, ArrowRight, User, Copy, Check,
  Wallet, Home, Utensils, Bus, Gamepad2, PiggyBank,
  Sun, Moon
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import UserProfileButton from "./UserProfileButton";

// Pixel art dollar bill image component cropped from user mockup
const PixelBill = ({ className }: { className?: string }) => (
  <img 
    src="/bill.png" 
    alt="Pixel Money Bill" 
    className={`w-28 h-auto select-none pointer-events-none ${className || ""}`}
  />
);

export default function LandingPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { isLoaded, isSignedIn } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const hasVisited = sessionStorage.getItem("visited_landing");
      if (!hasVisited) {
        setIsRedirecting(true);
        sessionStorage.setItem("visited_landing", "true");
        router.replace("/explore");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (isRedirecting) {
    return null;
  }

  // Static Demo Terminal State
  const yourBudget = {
    income: 12000,
    rent: 4500,
    food: 2000,
    transport: 600,
    entertainment: 500,
    savings: 2200,
  };

  const originalBudget = {
    income: 12000,
    rent: 4500,
    food: 2500,
    transport: 800,
    entertainment: 1000,
    savings: 1500,
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText("b8f3c2a");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  // Variance calculations
  const variances = {
    income: yourBudget.income - originalBudget.income,
    rent: yourBudget.rent - originalBudget.rent,
    food: yourBudget.food - originalBudget.food,
    transport: yourBudget.transport - originalBudget.transport,
    entertainment: yourBudget.entertainment - originalBudget.entertainment,
    savings: yourBudget.savings - originalBudget.savings,
  };

  // Compile active diff list based on edits
  const getActiveDiffs = () => {
    const diffs: { field: string; type: "add" | "remove"; amount: number }[] = [];
    
    const checkDiff = (field: keyof typeof yourBudget) => {
      const variance = variances[field];
      if (variance !== 0) {
        diffs.push({ field, type: "remove", amount: originalBudget[field] });
        diffs.push({ field, type: "add", amount: yourBudget[field] });
      }
    };

    checkDiff("income");
    checkDiff("rent");
    checkDiff("food");
    checkDiff("transport");
    checkDiff("entertainment");
    checkDiff("savings");

    return diffs;
  };

  const activeDiffs = getActiveDiffs();

  return (
    <div className={`min-h-screen flex flex-col font-sans-inter select-none overflow-x-hidden relative transition-all duration-300 ${
      theme === "light" ? "bg-[#e2e8f0]" : "bg-[#070a0e]"
    }`}>
      
      {/* Top Header Navigation */}
      <header className={`w-full max-w-7xl mx-auto px-12 py-6 flex items-center justify-between z-40 relative border-b transition-all ${
        theme === "light" 
          ? "border-slate-100 bg-[#e2e8f0]" 
          : "border-slate-900/60 bg-[#070a0e]"
      }`}>
        <div className="flex items-center gap-2">
          {/* Custom SVG Tree logo matching the mockup */}
          <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" className="text-green-600" />
            <path d="M12 6L16 12" />
            <path d="M12 10L8 12" />
          </svg>
          <span className={`font-retro text-2xl font-bold tracking-wider ${theme === "light" ? "text-slate-900" : "text-white"}`}>
            Budgetree
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-share-mono text-sm">
          <a 
            href="#how" 
            className={`transition-all ${
              theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-[#a8ff35]/80 hover:text-[#a8ff35]"
            }`}
          >
            How it works
          </a>
          <button 
            onClick={() => router.push(isSignedIn ? "/explore" : "/sign-in")}
            className={`transition-all ${
              theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-[#a8ff35]/80 hover:text-[#a8ff35]"
            }`}
          >
            Explore Budgets
          </button>
          <Link 
            href="/privacy-policy" 
            className={`transition-all ${
              theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-[#a8ff35]/80 hover:text-[#a8ff35]"
            }`}
          >
            Privacy Policy
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              theme === "light"
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "border-[#a8ff35] text-[#a8ff35] hover:bg-[#a8ff35]/10"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/explore")}
                className={`font-share-mono text-xs px-4 py-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    : "bg-[#a8ff35]/10 hover:bg-[#a8ff35]/20 text-[#a8ff35]"
                }`}
              >
                Go to App
              </button>
              <UserProfileButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/sign-in")}
                className={`flex items-center gap-2 font-share-mono text-xs px-4 py-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "border border-[#a8ff35] text-[#a8ff35] hover:bg-[#a8ff35]/10"
                }`}
              >
                <User className="w-4 h-4" />
                Sign in
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className={`flex items-center gap-2 font-share-mono text-xs px-4 py-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-[#a8ff35] text-black hover:bg-[#a8ff35]/90"
                }`}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Landing Content Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10 z-30 relative min-h-[calc(100vh-80px)]">
        
        {/* Left Column Content Area */}
        <div className="lg:col-span-5 relative z-20 flex flex-col justify-center min-h-[500px]">
          
          {/* Floating bills overlapping typography precisely as in the mockup */}
          <PixelBill className="absolute top-[-4%] left-[-8%] -rotate-[15deg] z-30 animate-float-slow" />
          <PixelBill className="absolute top-[28%] right-[8%] rotate-12 z-30 animate-float-medium" />
          <PixelBill className="absolute top-[48%] right-[-6%] -rotate-12 z-30 animate-float-fast" />
          <PixelBill className="absolute bottom-[20%] left-[-4%] rotate-[10deg] opacity-90 z-0 animate-float-slow" />

          <div className="relative z-10 pr-6">
            <h1 className={`font-retro text-7xl md:text-8xl leading-[0.85] tracking-tight transition-colors ${
              theme === "light" ? "text-[#0b0f19]" : "text-black"
            }`}>
              Your next<br />
              chapter.
            </h1>
            
            <h2 className={`font-retro text-4xl md:text-5xl leading-[0.85] mt-8 tracking-tight transition-colors ${
              theme === "light" ? "text-green-600" : "text-black"
            }`}>
              Not another<br />
              spreadsheet.
            </h2>
            
            <p className={`font-sans-inter font-medium text-sm md:text-base max-w-[320px] mt-8 leading-relaxed opacity-95 transition-colors ${
              theme === "light" ? "text-slate-600" : "text-black"
            }`}>
              Fork a real budget from someone who's already living it. Make it yours.
            </p>

            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <button
                onClick={() => router.push(isSignedIn ? "/explore" : "/sign-in")}
                className={`flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-full text-xs md:text-sm transition-all hover:translate-x-1 duration-200 shadow-md ${
                  theme === "light"
                    ? "bg-[#38a169] hover:bg-[#2f855a] text-white"
                    : "bg-[#090d10] hover:bg-[#141b21] text-white border border-[#090d10]"
                }`}
              >
                Explore Budgets <span className="font-sans font-bold">→</span>
              </button>
              
              <a
                href="#how"
                className={`font-bold border-b-2 pb-1 hover:opacity-85 transition-all flex items-center gap-1.5 text-xs md:text-sm ${
                  theme === "light"
                    ? "text-[#38a169] border-[#38a169]"
                    : "text-black border-black"
                }`}
              >
                How it works <span className="font-sans font-bold">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column Content Area (Dark UI Terminal, 55% / 7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center relative py-8 px-2 z-20">
          
          {/* Falling 8-bit money bills behind the terminal */}
          <PixelBill className="absolute animate-fall-1 left-[10%]" />
          <PixelBill className="absolute animate-fall-2 left-[35%]" />
          <PixelBill className="absolute animate-fall-3 left-[60%]" />
          <PixelBill className="absolute animate-fall-4 left-[80%]" />
          <PixelBill className="absolute animate-fall-5 left-[92%]" />

          {/* Interactive UI Terminal Card */}
          <div className={`border rounded-3xl p-6 md:p-8 shadow-2xl max-w-xl w-full backdrop-blur-md relative z-10 transition-all ${
            theme === "light"
              ? "bg-white border-slate-100 shadow-slate-100"
              : "bg-[#0b0e11]/90 border-slate-800 shadow-black"
          }`}>
            
            {/* Card Header metadata */}
            <div className={`flex justify-between items-start mb-6 pb-4 border-b ${
              theme === "light" ? "border-slate-100" : "border-slate-800"
            }`}>
              <div>
                <p className={`font-share-mono text-sm tracking-wider ${
                  theme === "light" ? "text-green-600" : "text-slate-500"
                }`}>
                  budget $
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-share-mono text-lg font-bold ${
                    theme === "light" ? "text-green-600" : "text-[#a8ff35]"
                  }`}>
                    fork
                  </span>
                  <span className={`font-share-mono text-lg font-bold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}>
                    student-life-budget
                  </span>
                </div>
              </div>

              <div className={`flex gap-4 text-xs font-share-mono ${
                theme === "light" ? "text-slate-400" : "text-slate-500"
              }`}>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 1.2k</span>
                <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> 340</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> 98</span>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-4 font-share-mono text-sm md:text-base">
              {/* Table Column Titles */}
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className={theme === "light" ? "text-slate-400" : "text-slate-500"}>Category</span>
                <div className="flex gap-16 md:gap-24">
                  <span className={`w-24 text-right ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>Original Budget</span>
                  <span className={`w-40 text-right ${theme === "light" ? "text-green-600" : "text-slate-500"}`}>
                    Your Budget <span className={theme === "light" ? "text-slate-400" : "text-slate-500"}>(you)</span>
                  </span>
                </div>
              </div>

              {/* Rows */}
              {[
                { name: "income", key: "income" as const, prefix: "$", icon: Wallet },
                { name: "rent", key: "rent" as const, prefix: "$", icon: Home },
                { name: "food", key: "food" as const, prefix: "$", icon: Utensils },
                { name: "transport", key: "transport" as const, prefix: "$", icon: Bus },
                { name: "entertainment", key: "entertainment" as const, prefix: "$", icon: Gamepad2 },
                { name: "savings", key: "savings" as const, prefix: "$", icon: PiggyBank },
              ].map((row) => {
                const RowIcon = row.icon;
                const diff = variances[row.key];
                const displayDiff = diff === 0 
                  ? "" 
                  : diff > 0 
                    ? `+$${diff.toLocaleString()}` 
                    : `-$${Math.abs(diff).toLocaleString()}`;
                
                const isExpense = ["rent", "food", "transport", "entertainment"].includes(row.key);
                const isPositiveChange = isExpense ? diff < 0 : diff > 0;
                const isNegativeChange = isExpense ? diff > 0 : diff < 0;

                // Color formatting for Your Budget cell depending on theme and diff status
                const yourBudgetColorClass = diff === 0
                  ? theme === "light"
                    ? "text-slate-800"
                    : "text-white"
                  : isPositiveChange
                    ? theme === "light"
                      ? "text-green-600 font-bold"
                      : "text-[#a8ff35] font-bold"
                    : theme === "light"
                      ? "text-red-600 font-bold"
                      : "text-rose-500 font-bold";

                const diffColorClass = isPositiveChange
                  ? "text-emerald-500" 
                  : isNegativeChange 
                    ? "text-rose-500" 
                    : "text-transparent";
                
                return (
                  <div key={row.name} className="flex justify-between items-center py-0.5 group">
                    <span className={`transition-colors flex items-center gap-2 ${
                      theme === "light" ? "text-slate-700" : "text-slate-400 group-hover:text-white"
                    }`}>
                      <RowIcon className={`w-4 h-4 ${theme === "light" ? "text-slate-400" : "text-slate-500"}`} />
                      {row.name}
                    </span>
                    <div className="flex items-center gap-6 md:gap-10">
                      <span className={`w-24 text-right ${theme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        {row.prefix}{originalBudget[row.key].toLocaleString()}
                      </span>
                      
                      {/* Clean inline click-to-edit text without dark input boxes */}
                      <div className="w-24 text-right">
                        <span className={`py-0.5 px-1 ${yourBudgetColorClass}`}>
                          {row.prefix}{yourBudget[row.key].toLocaleString()}
                        </span>
                      </div>
                      
                      <span className={`w-24 text-right text-xs font-bold ${diffColorClass}`}>
                        {displayDiff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Changes You Made Panel */}
            <div className={`mt-8 pt-6 border-t ${
              theme === "light" ? "border-slate-100" : "border-slate-800"
            }`}>
              <p className="text-slate-500 font-share-mono text-xs uppercase tracking-wider mb-3">
                changes you made
              </p>

              <div className={`border rounded-xl p-4 min-h-[140px] flex flex-col justify-center font-share-mono text-xs md:text-sm space-y-1.5 max-h-[180px] overflow-y-auto transition-colors ${
                theme === "light"
                  ? "bg-slate-50 border-slate-100"
                  : "bg-[#07090b]/80 border-slate-900"
              }`}>
                {activeDiffs.length === 0 ? (
                  <p className="text-slate-600 italic text-center">No edits made yet. Adjust values above to generate deltas.</p>
                ) : (
                  activeDiffs.map((diff, index) => (
                    <div key={index} className={`flex justify-between w-full ${diff.type === "remove" ? "text-rose-500" : "text-emerald-500"}`}>
                      <span>{diff.type === "remove" ? "-" : "+"} {diff.field}</span>
                      <span>${diff.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Commit panel / footer */}
              <div className="flex justify-between items-center mt-5 text-slate-500 font-share-mono text-xs">
                <div className="flex items-center gap-1">
                  <span>commit:</span>
                  <span className={`cursor-pointer hover:underline ${
                    theme === "light" ? "text-slate-600 hover:text-slate-900" : "text-[#a8ff35]"
                  }`} onClick={handleCopyHash}>
                    b8f3c2a
                  </span>
                  <span className="text-slate-600 font-sans">•</span>
                  <span className="text-slate-400">You • just now</span>
                </div>

                <button
                  onClick={handleCopyHash}
                  className={`p-1.5 rounded-md transition-colors ${
                    theme === "light" ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Copy Commit Hash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* How it Works Section */}
      <section 
        id="how" 
        className={`w-full py-24 px-12 border-t transition-all z-20 relative ${
          theme === "light" 
            ? "bg-white border-slate-100" 
            : "bg-[#0b0e11] border-slate-900/60"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`font-retro text-5xl tracking-wider uppercase ${
              theme === "light" ? "text-slate-900" : "text-[#a8ff35]"
            }`}>
              How It Works
            </h2>
            <p className={`mt-4 font-sans-inter text-base leading-relaxed ${
              theme === "light" ? "text-slate-600" : "text-slate-400"
            }`}>
              Welcome to <span className="font-bold">Budgetree</span>—the platform that simplifies personal finance by combining the ease of a personal budget tracker with the collaborative power of version control.
            </p>
          </div>

          {/* Path Lifecycle Flowchart */}
          <div className={`rounded-3xl p-8 mb-16 border transition-all ${
            theme === "light" ? "bg-slate-50 border-slate-100" : "bg-[#070a0e] border-slate-800"
          }`}>
            <h3 className={`font-retro text-2xl tracking-wider uppercase text-center mb-10 ${
              theme === "light" ? "text-slate-800" : "text-white"
            }`}>
               The Core Lifecycle: Simple to Version Controlled
            </h3>

            {/* Timeline / Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative font-share-mono">
              {/* Card A */}
              <div className={`p-6 rounded-2xl border transition-all ${
                theme === "light" ? "bg-white border-slate-100" : "bg-[#0b0e11]/85 border-slate-900"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-4 ${
                  theme === "light" ? "bg-green-100 text-green-700" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  A
                </div>
                <h4 className={`text-lg font-bold mb-2 ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                  Path A: Simple & Private
                </h4>
                <p className={`text-sm leading-relaxed font-sans-inter ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                  Create your own budget from scratch. Add basic allocations, keep it private for personal tracking, or make it public to share.
                </p>
              </div>

              {/* Card B */}
              <div className={`p-6 rounded-2xl border transition-all ${
                theme === "light" ? "bg-white border-slate-100" : "bg-[#0b0e11]/85 border-slate-900"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-4 ${
                  theme === "light" ? "bg-green-100 text-green-700" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  B
                </div>
                <h4 className={`text-lg font-bold mb-2 ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                  Path B: Fork & Collaborate
                </h4>
                <p className={`text-sm leading-relaxed font-sans-inter ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                  Browse the community gallery, discover layouts matching your lifestyle, and click <strong>Fork</strong> to instantly copy and edit it.
                </p>
              </div>

              {/* Card C */}
              <div className={`p-6 rounded-2xl border transition-all ${
                theme === "light" ? "bg-white border-slate-100" : "bg-[#0b0e11]/85 border-slate-900"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-4 ${
                  theme === "light" ? "bg-green-100 text-green-700" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  C
                </div>
                <h4 className={`text-lg font-bold mb-2 ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                  Track, Diff & Compare
                </h4>
                <p className={`text-sm leading-relaxed font-sans-inter ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                  Watch live differential changes ( Added,  Modified, Removed) or compare alternative strategic versions side-by-side.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Pillar 1 */}
            <div className={`p-8 rounded-3xl border transition-all group ${
              theme === "light" 
                ? "bg-white border-slate-100 hover:shadow-lg shadow-slate-100" 
                : "bg-[#0b0e11]/80 border-slate-800 hover:border-[#a8ff35]/30"
            }`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-2xl ${
                  theme === "light" ? "bg-green-50 text-green-600" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className={`font-share-mono text-xl font-bold ${
                  theme === "light" ? "text-slate-800" : "text-white"
                }`}>
                  1. Create: Simple or Complex
                </h3>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${
                theme === "light" ? "text-slate-600" : "text-slate-400"
              }`}>
                You don't need to know what GitHub is to track budgets. Start with a straightforward tracker, or scale to unlimited complexity:
              </p>
              <ul className={`text-xs space-y-2 list-disc list-inside font-share-mono ${
                theme === "light" ? "text-slate-500" : "text-slate-500"
              }`}>
                <li>Start from scratch or build simple trackers</li>
                <li>Scale to unlimited rows, categories, and tags</li>
                <li>Manage via Expenses, Savings, and Investments</li>
                <li>Set privacy to public or entirely private</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className={`p-8 rounded-3xl border transition-all group ${
              theme === "light" 
                ? "bg-white border-slate-100 hover:shadow-lg shadow-slate-100" 
                : "bg-[#0b0e11]/80 border-slate-800 hover:border-[#a8ff35]/30"
            }`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-2xl ${
                  theme === "light" ? "bg-green-50 text-green-600" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  <GitFork className="w-6 h-6" />
                </div>
                <h3 className={`font-share-mono text-xl font-bold ${
                  theme === "light" ? "text-slate-800" : "text-white"
                }`}>
                  2. Fork: Don't Recreate the Wheel
                </h3>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${
                theme === "light" ? "text-slate-600" : "text-slate-400"
              }`}>
                Leverage templates designed by community peers and adjust them to your exact lifestyle details:
              </p>
              <ul className={`text-xs space-y-2 list-disc list-inside font-share-mono ${
                theme === "light" ? "text-slate-500" : "text-slate-500"
              }`}>
                <li>Filter by Student, FIRE, Freelancer, Remote tags</li>
                <li>Duplicate full budget sheets with a single click</li>
                <li>Safely customize values under your own account</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className={`p-8 rounded-3xl border transition-all group ${
              theme === "light" 
                ? "bg-white border-slate-100 hover:shadow-lg shadow-slate-100" 
                : "bg-[#0b0e11]/80 border-slate-800 hover:border-[#a8ff35]/30"
            }`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-2xl ${
                  theme === "light" ? "bg-green-50 text-green-600" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
                <h3 className={`font-share-mono text-xl font-bold ${
                  theme === "light" ? "text-slate-800" : "text-white"
                }`}>
                  3. Diff: Visual Version Control
                </h3>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${
                theme === "light" ? "text-slate-600" : "text-slate-400"
              }`}>
                Our in-memory comparison engine dynamically calculates structural changes to show you exactly how layouts differ:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-share-mono font-bold">
                <div className={`p-2.5 rounded-lg border ${
                  theme === "light" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-emerald-950/20 border-emerald-900/40 text-emerald-500"
                }`}>
                   Added
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  theme === "light" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-amber-950/20 border-amber-900/40 text-amber-500"
                }`}>
                  Modified
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  theme === "light" ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-rose-950/20 border-rose-900/40 text-rose-500"
                }`}>
                   Removed
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className={`p-8 rounded-3xl border transition-all group ${
              theme === "light" 
                ? "bg-white border-slate-100 hover:shadow-lg shadow-slate-100" 
                : "bg-[#0b0e11]/80 border-slate-800 hover:border-[#a8ff35]/30"
            }`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-2xl ${
                  theme === "light" ? "bg-green-50 text-green-600" : "bg-[#a8ff35]/10 text-[#a8ff35]"
                }`}>
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className={`font-share-mono text-xl font-bold ${
                  theme === "light" ? "text-slate-800" : "text-white"
                }`}>
                  4. Compare: Side-by-Side Strategy
                </h3>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${
                theme === "light" ? "text-slate-600" : "text-slate-400"
              }`}>
                Contrast any two strategy blueprints in the ecosystem side-by-side. Spot differences in income metrics, total expenses, and target savings rates instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer className={`w-full py-12 px-12 border-t z-20 relative transition-all ${
        theme === "light" 
          ? "bg-white border-slate-100 text-slate-600" 
          : "bg-[#0b0e11] border-slate-900/60 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-[#a8ff35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" />
              <path d="M12 6L16 12" />
              <path d="M12 10L8 12" />
            </svg>
            <span className={`font-retro text-lg font-bold tracking-wider ${theme === "light" ? "text-slate-900" : "text-white"}`}>
              Budgetree
            </span>
          </div>

          <div className="font-share-mono text-[10px] text-slate-400 dark:text-slate-500">
            &copy; 2026 Budgetree. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Background organic wavy overlay curve separator (full-bleed below the header) */}
      <div 
        className={`absolute top-20 left-0 bottom-0 w-[50%] dot-grid pointer-events-none z-10 hidden lg:block transition-all duration-300 ${
          theme === "light" ? "bg-[#e6f4ea] opacity-80" : "bg-[#a8ff35]"
        }`}
        style={{ clipPath: "url(#wave-clip)", WebkitClipPath: "url(#wave-clip)" }}
      />
      
      {/* Mobile wavy background overlay */}
      <div 
        className={`absolute top-20 left-0 w-full h-[55%] dot-grid pointer-events-none z-10 lg:hidden transition-all duration-300 ${
          theme === "light" ? "bg-[#e6f4ea] opacity-80" : "bg-[#a8ff35]"
        }`}
        style={{ clipPath: "url(#wave-clip-mobile)", WebkitClipPath: "url(#wave-clip-mobile)" }}
      />

      {/* SVG Clip Path Definitions */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          {/* Desktop full-bleed wave clipping mask */}
          <clipPath id="wave-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.96,0 C 0.88,0.2 0.68,0.3 0.78,0.5 C 0.88,0.7 0.98,0.82 0.82,1 L 0,1 Z" />
          </clipPath>
          {/* Mobile wave clipping mask */}
          <clipPath id="wave-clip-mobile" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.85 C 0.75,0.75 0.5,0.95 0.25,0.85 C 0.1,0.8 0,0.9 0,0.8 L 0,0 Z" />
          </clipPath>
        </defs>
      </svg>

    </div>
  );
}
