"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  itemName?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to permanently delete this record? This action cannot be undone.",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  itemName,
  isLoading = false,
  variant = "danger",
}: DeleteConfirmationModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 print:hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-[#141416] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 sm:p-7 z-10 overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20 ${
                variant === "warning" ? "bg-amber-500" : "bg-rose-500"
              }`}
            />

            {/* Close 'X' Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Animated Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 ${
                  variant === "warning"
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                    : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                }`}
              >
                {variant === "warning" ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <Trash2 className="w-7 h-7 stroke-[2.2]" />
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 px-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Highlighted Item Pill (if provided) */}
              {itemName && (
                <div className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate text-center">
                  "{itemName}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    await onConfirm();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    variant === "warning"
                      ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
