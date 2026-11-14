"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

interface CheckoutStepsBarProps {
  currentStep: 1 | 2 | 3;
  onStepChange?: (step: 1 | 2) => void;
  canProceedToStep2?: boolean;
}

export function CheckoutStepsBar({
  currentStep,
  onStepChange,
  canProceedToStep2 = false,
}: CheckoutStepsBarProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2.5">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/cart" className="hover:text-foreground transition-colors">
          Cart
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-semibold">Checkout</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Choose delivery address and complete payment with instant warranty coverage.
          </p>
        </div>

        {/* Stepper Pill Indicator */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-card dark:bg-[#121214] border border-border/70 dark:border-white/10 rounded-2xl shadow-2xs self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => onStepChange?.(1)}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentStep === 1
                ? "bg-foreground text-background dark:bg-white dark:text-slate-950 font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>1. Shipping</span>
          </button>
          <span className="text-muted-foreground/30">•</span>
          <button
            type="button"
            onClick={() => {
              if (canProceedToStep2) {
                onStepChange?.(2);
              }
            }}
            disabled={!canProceedToStep2 && currentStep === 1}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              currentStep === 2
                ? "bg-foreground text-background dark:bg-white dark:text-slate-950 font-bold shadow-xs cursor-pointer"
                : canProceedToStep2
                ? "text-muted-foreground hover:text-foreground cursor-pointer"
                : "text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            <span>2. Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}

