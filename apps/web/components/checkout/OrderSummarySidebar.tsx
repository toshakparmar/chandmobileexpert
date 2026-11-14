"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { CartItem } from "@/store/cartStore";

interface OrderSummarySidebarProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currentStep: 1 | 2;
  isSubmitting?: boolean;
  onProceed?: () => void;
  ctaText?: string;
  disabled?: boolean;
}

export function OrderSummarySidebar({
  items,
  subtotal,
  tax,
  total,
  currentStep,
  isSubmitting = false,
  onProceed,
  ctaText,
  disabled = false,
}: OrderSummarySidebarProps) {
  const defaultCtaText =
    ctaText || (currentStep === 1 ? "Proceed to Payment" : "Place Order & Pay");

  return (
    <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
      {/* Heading */}
      <div className="flex items-center justify-between pb-4 border-b border-border/70 dark:border-white/[0.08]">
        <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
        <Link
          href="/cart"
          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          Edit Cart
        </Link>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={it.image}
                alt={it.name}
                className="w-10 h-10 rounded-lg object-cover bg-muted/40 shrink-0 border border-border/60"
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{it.name}</p>
                <p className="text-[11px] text-muted-foreground">Qty: {it.quantity}</p>
              </div>
            </div>
            <span className="font-bold text-foreground shrink-0 font-mono">
              ₹{(it.price * it.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {/* Price Calculations */}
      <div className="pt-4 border-t border-border/70 dark:border-white/[0.08] space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated GST (18%)</span>
          <span className="font-mono text-foreground">₹{tax.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Delivery (Sambhal & UP)</span>
          <span className="text-emerald-500 font-semibold uppercase tracking-wider text-[11px]">
            Free
          </span>
        </div>

        <div className="pt-3 border-t border-border/70 dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Total Payable</span>
          <span className="text-base font-extrabold text-foreground font-mono">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <button
          type="button"
          onClick={onProceed}
          disabled={disabled || isSubmitting}
          className="w-full h-12 rounded-xl bg-accent text-slate-950 font-bold text-xs hover:bg-[#bbf055] transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{defaultCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Value Proposition Badges */}
      <div className="pt-4 border-t border-border/70 dark:border-white/[0.08] space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>1-Year Store Warranty on genuine repairs & parts</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Truck className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Same-day doorstep delivery across Sambhal</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>7-day easy exchange if defective</span>
        </div>
      </div>
    </div>
  );
}
