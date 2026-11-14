"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeSwitch() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 print:hidden theme-switch-container">
        <div className="w-13 h-13 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 shadow-2xl flex items-center justify-center opacity-60">
          <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-50 print:hidden theme-switch-container">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="group relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-amber-400 border-2 border-neutral-300 dark:border-neutral-700 hover:border-accent dark:hover:border-accent flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400/20 transition-transform duration-500 rotate-0 group-hover:rotate-90" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900 fill-neutral-900/10 transition-transform duration-500 -rotate-12 group-hover:rotate-0" />
        )}
      </button>
    </div>
  );
}
