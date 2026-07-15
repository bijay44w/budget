"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, GitFork, Star, ShieldCheck, Moon, Sun, KeyRound } from "lucide-react";
import Link from "next/link";

const TreeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L19 12H15V22H9V12H5L12 2Z" fill="currentColor" />
    <path d="M12 6L16 12" />
    <path d="M12 10L8 12" />
  </svg>
);

const PixelBill = ({ className }: { className?: string }) => (
  <img 
    src="/bill.png" 
    alt="Pixel Money Bill" 
    className={`w-16 h-auto select-none pointer-events-none ${className || ""}`}
  />
);

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5 mr-2 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

const CandlestickChart = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-20 dark:opacity-35" viewBox="0 0 800 600" fill="none">
    {/* Grid Lines */}
    <g className="stroke-slate-200/40 dark:stroke-green-950/20" strokeWidth="1" strokeDasharray="3 3">
      <line x1="0" y1="100" x2="800" y2="100" />
      <line x1="0" y1="200" x2="800" y2="200" />
      <line x1="0" y1="300" x2="800" y2="300" />
      <line x1="0" y1="400" x2="800" y2="400" />
      <line x1="0" y1="500" x2="800" y2="500" />
      <line x1="100" y1="0" x2="100" y2="600" />
      <line x1="200" y1="0" x2="200" y2="600" />
      <line x1="300" y1="0" x2="300" y2="600" />
      <line x1="400" y1="0" x2="400" y2="600" />
      <line x1="500" y1="0" x2="500" y2="600" />
      <line x1="600" y1="0" x2="600" y2="600" />
      <line x1="700" y1="0" x2="700" y2="600" />
    </g>
    
    {/* Candlesticks */}
    {[
      [140, 480, 520, 490, 510],
      [180, 450, 500, 460, 490],
      [220, 430, 480, 440, 470],
      [260, 390, 450, 410, 440],
      [300, 370, 430, 385, 415],
      [340, 330, 390, 345, 375],
      [380, 300, 360, 315, 345],
      [420, 270, 330, 285, 315],
      [460, 230, 300, 250, 280],
      [500, 200, 260, 215, 245],
      [540, 160, 220, 175, 205],
      [580, 120, 180, 135, 165],
    ].map(([x, wy1, wy2, by1, by2], idx) => (
      <g key={idx} className="stroke-green-600 dark:stroke-[#a8ff35]" strokeWidth="2">
        <line x1={x} y1={wy1} x2={x} y2={wy2} />
        <rect
          x={x - 6}
          y={by1}
          width="12"
          height={by2 - by1}
          fill={idx % 3 === 0 ? "none" : idx % 2 === 0 ? "currentColor" : "currentColor"}
          className="fill-green-600/80 dark:fill-[#a8ff35]/80 text-green-600 dark:text-[#a8ff35]"
          strokeWidth="2"
        />
      </g>
    ))}
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useSignUp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Failed to start sign up.");
        setIsLoading(false);
        return;
      }

      // Send email verification code
      const verifyPrepare = await signUp.verifications.sendEmailCode();
      if (verifyPrepare.error) {
        setError(verifyPrepare.error.message || "Failed to send verification code.");
        setIsLoading(false);
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      setError("Failed to create account. Please make sure the email is valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (result.error) {
        setError(result.error.message || "Verification code is incorrect.");
        setIsLoading(false);
        return;
      }

      if (signUp.status === "complete") {
        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) {
          setError(finalizeResult.error.message || "Failed to finalize session.");
          setIsLoading(false);
          return;
        }
        router.push("/explore");
      } else {
        setError(`Unable to complete sign up. Status: ${signUp.status}`);
      }
    } catch (err: any) {
      setError("An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (strategy: "oauth_google" | "oauth_github") => {
    if (!signUp) return;
    setIsLoading(true);
    try {
      const result = await signUp.sso({
        strategy,
        redirectUrl: "/explore",
        redirectCallbackUrl: "/sign-in",
      });
      if (result.error) {
        setError(result.error.message || "Failed to initiate social login.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred during social login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#020402] text-slate-800 dark:text-white transition-all duration-300 font-sans-inter overflow-x-hidden relative">
      
      {/* Header spanning across */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-40 relative">
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
            className="p-2 rounded-lg border border-slate-200 dark:border-[#a8ff35]/30 text-slate-700 dark:text-[#a8ff35] hover:bg-slate-50 dark:hover:bg-[#a8ff35]/10 transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-4 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        
        {/* Left Column: Graphics & Metrics */}
        <section className="hidden lg:flex lg:col-span-7 flex-col justify-between min-h-[600px] py-6 relative overflow-hidden select-none">
          <CandlestickChart />

          {/* Heading */}
          <div className="z-10 relative">
            <h1 className="font-retro text-5xl font-bold tracking-wide leading-tight mb-4">
              <span className="text-slate-900 dark:text-[#a8ff35]">Your next chapter.</span>
              <br />
              <span className="text-slate-900 dark:text-white">Not another spreadsheet.</span>
            </h1>
            <p className="font-share-mono text-slate-600 dark:text-slate-300 text-lg">
              Fork real budgets. Learn from others. Build your future.
            </p>
          </div>

          {/* Central Cat Graphic and Floating Bills */}
          <div className="my-auto py-12 flex justify-center items-center relative min-h-[300px]">
            <img 
              src="/cat-light.png" 
              alt="Budgetree Pixel Cat" 
              className="block dark:hidden w-80 h-auto z-10 select-none pointer-events-none drop-shadow-md"
            />
            <img 
              src="/cat-dark.png" 
              alt="Budgetree Pixel Cat" 
              className="hidden dark:block w-80 h-auto z-10 select-none pointer-events-none drop-shadow-[0_0_15px_rgba(168,255,53,0.15)]"
            />

            <PixelBill className="absolute top-4 left-1/4 -rotate-[15deg] animate-float-slow" />
            <PixelBill className="absolute top-1/3 left-4 -rotate-[22deg] animate-float-medium" />
            <PixelBill className="absolute top-8 right-1/4 -rotate-[12deg] animate-float-fast" />
            <PixelBill className="absolute bottom-1/3 right-4 rotate-[18deg] animate-float-slow" />
            <PixelBill className="absolute bottom-8 left-1/3 rotate-[25deg] animate-float-medium" />
          </div>

          {/* Metrics Footer */}
          <div className="grid grid-cols-3 border-t border-slate-200/60 dark:border-slate-800/80 pt-8 z-10 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-[#a8ff35] rounded-lg">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <p className="font-retro text-xl font-bold leading-tight">50K+</p>
                <p className="font-share-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Budget Forks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border-x border-slate-200/60 dark:border-slate-800/80 px-6">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-[#a8ff35] rounded-lg">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-retro text-xl font-bold leading-tight">4.9/5</p>
                <p className="font-share-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">User Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-6">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-[#a8ff35] rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-retro text-xl font-bold leading-tight">100%</p>
                <p className="font-share-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Private & Secure</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sign Up Card */}
        <section className="lg:col-span-5 flex justify-center items-center py-6">
          <div className="w-full max-w-md bg-white dark:bg-[#060b06] rounded-[32px] border border-slate-200/50 dark:border-[#a8ff35]/20 p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all">
            
            {!pendingVerification ? (
              <>
                <div className="mb-8">
                  <h2 className="font-retro text-3xl font-bold tracking-wide text-green-600 dark:text-[#a8ff35] mb-2">
                    Create account
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign up to start your journey.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-share-mono">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block font-share-mono text-xs uppercase tracking-wider text-slate-600 dark:text-[#a8ff35]/70">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#a8ff35]/40">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#030503] border border-slate-200 dark:border-[#a8ff35]/15 focus:border-green-500 dark:focus:border-[#a8ff35] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 rounded-xl text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block font-share-mono text-xs uppercase tracking-wider text-slate-600 dark:text-[#a8ff35]/70">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#a8ff35]/40">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="block w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-[#030503] border border-slate-200 dark:border-[#a8ff35]/15 focus:border-green-500 dark:focus:border-[#a8ff35] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 rounded-xl text-sm focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#a8ff35]/40 hover:text-slate-600 dark:hover:text-[#a8ff35]/70"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA widget mount target */}
                  <div id="clerk-captcha" className="my-2" />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:hover:bg-[#a8ff35]/90 dark:text-black font-share-mono font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Signing up..." : "Sign up →"}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/60 dark:border-slate-800/80"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-share-mono uppercase">
                    <span className="bg-white dark:bg-[#060b06] px-3 text-slate-400 dark:text-slate-500">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("oauth_google")}
                    className="flex items-center justify-center py-2.5 px-4 bg-white dark:bg-[#030503] hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-share-mono transition-all cursor-pointer"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("oauth_github")}
                    className="flex items-center justify-center py-2.5 px-4 bg-white dark:bg-[#030503] hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-share-mono transition-all cursor-pointer"
                  >
                    <GithubIcon />
                    GitHub
                  </button>
                </div>

                {/* Swapping pages link */}
                <div className="mt-6 text-center text-xs font-share-mono text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-green-600 dark:text-[#a8ff35] hover:underline font-semibold">
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-retro text-3xl font-bold tracking-wide text-green-600 dark:text-[#a8ff35] mb-2">
                    Verify email
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We've sent a verification code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-share-mono">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  {/* Code Input */}
                  <div className="space-y-2">
                    <label className="block font-share-mono text-xs uppercase tracking-wider text-slate-600 dark:text-[#a8ff35]/70">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#a8ff35]/40">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#030503] border border-slate-200 dark:border-[#a8ff35]/15 focus:border-green-500 dark:focus:border-[#a8ff35] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 rounded-xl text-sm focus:outline-none transition-all tracking-widest text-center font-bold text-lg"
                      />
                    </div>
                  </div>

                  {/* CAPTCHA widget mount target */}
                  <div id="clerk-captcha" className="my-2" />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:hover:bg-[#a8ff35]/90 dark:text-black font-share-mono font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify code →"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingVerification(false)}
                    className="w-full text-center text-xs font-share-mono text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Back to edit email
                  </button>
                </form>
              </>
            )}

            {/* Bottom tree slogan */}
            <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-share-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <TreeLogo className="w-3.5 h-3.5 text-green-600/80 dark:text-[#a8ff35]/70" />
              <span>Your money. Your rules. Your future.</span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
