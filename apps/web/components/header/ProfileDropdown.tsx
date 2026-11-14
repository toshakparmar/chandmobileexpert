"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  LogOut,
  Package,
  Heart,
  MapPin,
  Settings,
  Wrench,
  X,
  ArrowDownRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function ProfileDropdown() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profileOpen]);

  // Close on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-11 sm:h-11 rounded-full bg-foreground/5 animate-pulse shrink-0" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className="group flex h-8 min-[380px]:h-9 sm:h-12 rounded-full overflow-hidden bg-foreground shadow-xs hover:shadow-md transition-shadow shrink-0"
      >
        <span className="hidden min-[400px]:flex items-center pl-3.5 pr-2 sm:px-6 text-background text-xs sm:text-sm font-medium">
          Sign In
        </span>
        <span className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-accent text-black shrink-0">
          <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-rotate-45" />
        </span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={profileDropdownRef}>
      <button
        type="button"
        onClick={() => setProfileOpen((prev) => !prev)}
        className={`relative w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md border shrink-0 ${
          profileOpen
            ? "bg-slate-900 text-white dark:bg-accent dark:text-slate-950 border-transparent shadow-md rotate-90"
            : "bg-foreground text-background hover:bg-accent hover:text-black border-border/50"
        }`}
        aria-label={profileOpen ? "Close profile menu" : "Open user profile menu"}
        aria-expanded={profileOpen}
      >
        <AnimatePresence mode="wait" initial={false}>
          {profileOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center -rotate-90"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
            </motion.div>
          ) : (
            <motion.div
              key="profile-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : user?.firstName ? (
                <span className="font-bold text-xs sm:text-sm">
                  {(user.firstName[0] + (user.lastName?.[0] || "")).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Profile Dropdown Menu */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 sm:mt-3 right-0 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-card/95 dark:bg-[#141416]/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-[10000]"
          >
            <div className="relative p-4 sm:p-5 border-b border-border/60 dark:border-white/[0.08] bg-foreground/[0.02] flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-accent/20 text-accent flex items-center justify-center font-bold text-lg sm:text-xl mb-2 sm:mb-2.5 shadow-inner border border-accent/30">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : user?.firstName ? (
                  (user.firstName[0] + (user.lastName?.[0] || "")).toUpperCase()
                ) : (
                  <User className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Valued Customer"}
              </p>
              {user?.email && (
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {user.email}
                </p>
              )}
              {user?.phone && (
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {user.phone}
                </p>
              )}
            </div>

            <div className="p-2 sm:p-2.5 flex flex-col gap-0.5 sm:gap-1">
              <Link
                href="/account/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all"
              >
                <Settings className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>Manage Account</span>
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all"
              >
                <Package className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/account/repairs"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all"
              >
                <Wrench className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>My Repairs</span>
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all"
              >
                <Heart className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/account/addresses"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all"
              >
                <MapPin className="w-4 h-4 text-foreground/50 shrink-0" />
                <span>Saved Addresses</span>
              </Link>
              <div className="h-px bg-border/50 dark:border-white/[0.08] my-1 mx-2" />
              <button
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
