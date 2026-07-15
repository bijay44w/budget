"use client";

import React, { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { User, Settings, LogOut, FolderHeart } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileButtonProps {
  direction?: "up" | "down";
  align?: "left" | "right";
  className?: string;
}

export default function UserProfileButton({ direction = "down", align = "right", className = "w-8 h-8" }: UserProfileButtonProps) {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!isLoaded || !user) return null;

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const menuPositionClass = direction === "up"
    ? `bottom-full mb-3 slide-in-from-bottom-1 ${align === "left" ? "left-0" : "right-0"}`
    : `top-full mt-2 slide-in-from-top-1 ${align === "left" ? "left-0" : "right-0"}`;

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`block rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-[#a8ff35] transition-all focus:outline-none focus:ring-2 focus:ring-[#a8ff35] cursor-pointer shadow-md ${className}`}
      >
        <img
          src={user.imageUrl}
          alt={user.fullName || "User Avatar"}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Backplate to close dropdown on click outside */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Menu */}
          <div className={`absolute w-56 rounded-xl border bg-white dark:bg-[#0c1117] border-slate-200 dark:border-[#30363d] shadow-lg z-50 py-1.5 animate-in fade-in duration-100 text-slate-700 dark:text-slate-300 ${menuPositionClass}`}>
            {/* Header info */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-[#21262d]">
              <p className="text-[10px] font-share-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Signed in as
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate font-share-mono">
                {user.username || user.primaryEmailAddress?.emailAddress || "User"}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openUserProfile();
                }}
                className="w-full px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f242c] hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2.5 font-share-mono cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                Your Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/explore");
                }}
                className="w-full px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f242c] hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2.5 font-share-mono cursor-pointer"
              >
                <FolderHeart className="w-4 h-4 text-slate-400" />
                Your Budgets
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openUserProfile();
                }}
                className="w-full px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f242c] hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2.5 font-share-mono cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
            </div>

            {/* Sign Out Section */}
            <div className="border-t border-slate-100 dark:border-[#21262d] mt-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-2.5 font-share-mono cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
