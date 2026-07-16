"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  const sections = [
    { id: "introduction", title: "1. Introduction & Scope" },
    { id: "information-collection", title: "2. Information We Collect" },
    { id: "how-we-use", title: "3. How We Use Information" },
    { id: "cookies", title: "4. Cookies & Tracking Technologies" },
    { id: "stripe-payments", title: "5. Third-Party Payments (Stripe)" },
    { id: "data-sharing", title: "6. Data Sharing & Third Parties" },
    { id: "gdpr-rights", title: "7. EU/UK Data Rights (GDPR)" },
    { id: "ccpa-rights", title: "8. California Privacy Rights (CCPA)" },
    { id: "coppa-children", title: "9. Children's Privacy (COPPA)" },
    { id: "data-retention", title: "10. Data Retention & Transfers" },
    { id: "contact", title: "11. Contact & Inquiries" },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans-inter transition-all duration-300 ${
      theme === "light" ? "bg-[#fafafa] text-slate-800" : "bg-[#070a0e] text-slate-200"
    }`}>
      
      {/* Header */}
      <header className={`w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between border-b z-40 relative transition-all ${
        theme === "light" 
          ? "border-slate-200/60 bg-[#fafafa]" 
          : "border-slate-800/60 bg-[#070a0e]"
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 font-share-mono text-xs ${
              theme === "light"
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "border-[#a8ff35]/30 text-[#a8ff35] hover:bg-[#a8ff35]/10"
            }`}
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2 ml-4">
            <svg className="w-6 h-6 text-green-600 dark:text-[#a8ff35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" />
              <path d="M12 6L16 12" />
              <path d="M12 10L8 12" />
            </svg>
            <span className={`font-retro text-2xl font-bold tracking-wider ${theme === "light" ? "text-slate-900" : "text-white"}`}>
              Budgetree
            </span>
          </div>
        </div>

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
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className={`sticky top-8 border rounded-2xl p-5 ${
            theme === "light" ? "bg-white border-slate-200" : "bg-[#0b0e11] border-slate-800"
          }`}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-[#a8ff35]" />
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Document Navigation</span>
            </div>
            <ul className="space-y-2.5 font-share-mono text-xs">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="block py-1 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-[#a8ff35] transition-colors"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Policy Document Content */}
        <article className="lg:col-span-9 max-w-none">
          <div className={`border rounded-3xl p-6 md:p-10 shadow-sm ${
            theme === "light" ? "bg-white border-slate-200" : "bg-[#0b0e11] border-slate-800/80"
          }`}>
            
            <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
              <h1 className={`font-retro text-4xl md:text-5xl tracking-wide uppercase ${
                theme === "light" ? "text-slate-900" : "text-white"
              }`}>
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-share-mono mt-3">
                LAST UPDATED: JULY 15, 2026 • GLOBAL COMPLIANCE VERSION 1.0
              </p>
            </div>

            <div className="space-y-8 font-sans-inter text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  1. Introduction & Scope
                </h2>
                <p>
                  Welcome to <strong>Budgetree</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy details how we collect, use, process, and safeguard your data across all interactions with our web application, personal budget tools, version control services, and sub-domains.
                </p>
                <p className="mt-3">
                  This document has been prepared in strict accordance with major global regulatory standards, including the <strong>General Data Protection Regulation (GDPR)</strong> (EU & UK), the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, the <strong>Children's Online Privacy Protection Act (COPPA)</strong>, and the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong>.
                </p>
              </section>

              {/* Information Collection */}
              <section id="information-collection" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  2. Information We Collect
                </h2>
                <p>
                  We collect information to provide a modern, collaborative budgeting experience. The categories of information we collect include:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                  <li>
                    <strong>Account Identity & Credentials:</strong> We utilize Clerk for account authentication. When you sign in or sign up, Clerk provides us with your unique user identifier, full name, email address, and profile image URL. We do not store or process your passwords.
                  </li>
                  <li>
                    <strong>Budget & Version Control Details:</strong> We store custom budget allocations, configurations, tag metadata, fork references, and commit histories that you create or modify inside our application.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Technical logs including IP addresses, browser types, device operating systems, screen dimensions, time stamps, and referral paths to monitor service performance.
                  </li>
                </ul>
              </section>

              {/* How We Use */}
              <section id="how-we-use" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  3. How We Use Information
                </h2>
                <p>
                  Your information is processed to deliver, maintain, and optimize Budgetree. Specifically, we use your data to:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                  <li>Provision your private budget workspace and synchronize fork modifications.</li>
                  <li>Verify user authentication states to secure private financial information.</li>
                  <li>Analyze traffic trends, system crashes, and load patterns to optimize UI rendering speeds.</li>
                  <li>Prevent fraud, enforce our Terms of Service, and comply with binding legal constraints.</li>
                </ul>
              </section>

              {/* Cookies */}
              <section id="cookies" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  4. Cookies & Tracking Technologies
                </h2>
                <p>
                  We use cookies to retain your sessions, save preference states (such as light/dark mode), and analyze interaction flows.
                </p>
                <p className="mt-3">
                  You can control optional cookie classifications through our <strong>Cookie Consent Banner</strong>. The categories of cookies we support are:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                  <li><strong>Strictly Necessary:</strong> Mandatory cookies required for authentication and security tokens (e.g., Clerk session state). Cannot be disabled.</li>
                  <li><strong>Analytics:</strong> Used to aggregate anonymous telemetry data regarding page speeds and feature usage.</li>
                  <li><strong>Marketing & Payment Personalization:</strong> Utilized for mapping secure user sessions during payment processes (e.g. Stripe checkout flows).</li>
                </ul>
              </section>

              {/* Stripe Payments */}
              <section id="stripe-payments" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  5. Third-Party Payments (Stripe)
                </h2>
                <p>
                  We plan to offer premium subscriptions and paid feature tiers. In order to facilitate these payments, we will integrate with <strong>Stripe, Inc.</strong>.
                </p>
                <p className="mt-3">
                  When making purchases on our site:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                  <li>All payment processing is handled externally by Stripe. Budgetree does not store or see credit card numbers, CVVs, or payment credentials.</li>
                  <li>Stripe collects purchase metadata, billing addresses, zip codes, and payment details in accordance with their own Privacy Policy and PCI-DSS compliance standards.</li>
                  <li>We receive webhook payloads containing confirmation tokens, subscription statuses, and order amounts to activate premium configurations.</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section id="data-sharing" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  6. Data Sharing & Third Parties
                </h2>
                <p>
                  We do not sell, rent, or trade your personal information. We share data only with trusted sub-processors necessary to run our service:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                  <li><strong>Clerk, Inc.:</strong> User identity authentication services.</li>
                  <li><strong>Stripe, Inc.:</strong> Payment routing and billing infrastructure.</li>
                  <li><strong>Hosting Providers:</strong> Secure database and server clusters.</li>
                </ul>
              </section>

              {/* GDPR */}
              <section id="gdpr-rights" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  7. EU/UK Data Rights (GDPR)
                </h2>
                <p>
                  If you reside in the European Economic Area (EEA) or the United Kingdom (UK), you hold the following rights under the GDPR:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                  <li><strong>Right to Access & Rectify:</strong> Request details on the data we hold and request corrections.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request full deletion of your user profile and budget history.</li>
                  <li><strong>Right to Data Portability:</strong> Obtain a structured JSON export of your budgets.</li>
                  <li><strong>Right to Object/Restrict:</strong> Withdraw consent for analytical cookies or object to legitimate interest processing.</li>
                </ul>
                <p className="mt-3">
                  To exercise your rights, please submit a request to <a href="mailto:privacy@budgettree.com" className="text-green-600 dark:text-[#a8ff35] hover:underline">privacy@budgettree.com</a>.
                </p>
              </section>

              {/* CCPA */}
              <section id="ccpa-rights" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  8. California Privacy Rights (CCPA/CPRA)
                </h2>
                <p>
                  For California residents, you possess rights under the California Consumer Privacy Act:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                  <li><strong>Right to Know:</strong> Disclosures on categories of data collected and third-party recipients.</li>
                  <li><strong>Right to Delete:</strong> Request deletion of your collected data.</li>
                  <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell your personal data. We only share with sub-processors described herein.</li>
                  <li><strong>Right to Non-Discrimination:</strong> We do not deny service or change pricing based on exercising privacy rights.</li>
                </ul>
              </section>

              {/* COPPA */}
              <section id="coppa-children" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  9. Children's Privacy (COPPA)
                </h2>
                <p>
                  Budgetree is not targeted towards, nor do we knowingly collect data from, children under the age of 13. If you become aware that a child has provided us with personal information in violation of COPPA, please contact us immediately so we can purge the record.
                </p>
              </section>

              {/* Data Retention & Transfers */}
              <section id="data-retention" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  10. Data Retention & Transfers
                </h2>
                <p>
                  We retain personal data only as long as your account remains active or as required by law (e.g., billing audits under Stripe).
                </p>
                <p className="mt-3">
                  Because our hosting servers are located in the United States, user records will be transferred and stored internationally. We implement standard contractual protection terms to safeguard cross-border transfers.
                </p>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-6">
                <h2 className={`font-retro text-xl font-bold uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-[#a8ff35]"
                }`}>
                  11. Contact & Inquiries
                </h2>
                <p>
                  For any requests related to your data rights, standard disclosures, or questions regarding this Privacy Policy, please reach out to us at:
                </p>
                <div className={`mt-3 p-4 rounded-xl font-share-mono text-xs border ${
                  theme === "light" ? "bg-slate-50 border-slate-200" : "bg-[#070a0e] border-slate-900"
                }`}>
                  <p className="font-bold">Budgetree Privacy Team</p>
                  <p>Email: privacy@budgettree.com</p>
                  <p>Office: 100 Financial Avenue, Suite 400, San Francisco, CA 94111, USA</p>
                </div>
              </section>

            </div>

          </div>
        </article>

      </main>
    </div>
  );
}
