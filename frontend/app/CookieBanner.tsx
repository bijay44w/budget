"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Cookie states
  const [consent, setConsent] = useState({
    essential: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    setMounted(true);

    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // Observe changes to html class list
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const savedConsent = localStorage.getItem("budgettree_cookie_consent");
    if (!savedConsent) {
      // Small delay to make the banner slide in elegantly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem("budgettree_cookie_consent", JSON.stringify(fullConsent));
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("budgettree_cookie_consent", JSON.stringify(consent));
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-2xl bg-white dark:bg-[#0b0e11] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 md:p-6 z-50 transition-all duration-500 ease-in-out transform translate-y-0 animate-in fade-in slide-in-from-bottom-8 font-sans-inter">
      <div className="flex flex-col gap-4">
        {/* Main Content Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Cookie Illustration */}
          <div className="flex-shrink-0 relative group">
            <img
              src={isDarkMode ? "/cookie-dark.png" : "/cookie.png"}
              alt="Cookie Illustration"
              className="w-20 h-20 md:w-24 md:h-24 object-contain select-none pointer-events-none transition-transform duration-500 group-hover:rotate-12"
            />
          </div>

          {/* Text Description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              We value your privacy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              We use cookies to improve your experience, analyze traffic, and personalize content. Learn more in our{" "}
              <Link
                href="/privacy-policy"
                className="text-green-600 dark:text-[#a8ff35] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Customization Panel */}
        {isCustomizing && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Customize Cookie Preferences
            </h4>

            {/* Essential */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Essential Cookies</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">Always Active</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Required for core functionality, such as secure sign-in (via Clerk) and protecting your account session.
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900">
              <div className="space-y-1 pr-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Analytics & Performance</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Helps us understand how visitors interact with our budgets, traffic sources, and features to optimize user experience.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-[#a8ff35]"></div>
              </label>
            </div>

            {/* Marketing & Payments */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900">
              <div className="space-y-1 pr-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Marketing & Stripe Payments</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Enables secure authentication/telemetry for future payment processing (via Stripe) and personalizing content based on preferences.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:peer-checked:bg-[#a8ff35]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Buttons Action Row */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1">
          {isCustomizing ? (
            <>
              <button
                onClick={() => setIsCustomizing(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-[#a8ff35] dark:hover:bg-[#a8ff35]/90 dark:text-black rounded-xl transition-all duration-200 shadow-md shadow-green-600/10 dark:shadow-none"
              >
                Save Preferences
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsCustomizing(true)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-green-600 dark:text-[#a8ff35] bg-transparent border border-green-600/30 dark:border-[#a8ff35]/30 hover:border-green-600 dark:hover:border-[#a8ff35] hover:bg-green-50 dark:hover:bg-[#a8ff35]/5 rounded-xl transition-all duration-200"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-[#a8ff35] dark:hover:bg-[#a8ff35]/90 dark:text-black rounded-xl transition-all duration-200 shadow-md shadow-green-600/10 dark:shadow-none"
              >
                Accept All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
