"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  Banknote,
  CreditCard,
  Zap,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export type PaymentMethod = "upi" | "cod" | "card" | "test";

interface PaymentSelectionStepProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  subtotal: number;
  tax: number;
  total: number;
  // If in active UPI payment flow (post order creation or live preview)
  livePaymentData?: {
    paymentId: string;
    orderId: string;
    amountRupees: number;
    vpa: string;
    payeeName: string;
    upiUri: string;
    qrDataUrl: string;
    expiresAt: string;
  } | null;
  onUtrSubmit?: (utr: string) => Promise<void>;
  isSubmittingUtr?: boolean;
}

export function PaymentSelectionStep({
  selectedMethod,
  onSelectMethod,
  total,
  livePaymentData,
  onUtrSubmit,
  isSubmittingUtr = false,
}: PaymentSelectionStepProps) {
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  // Timer countdown if live payment data has expiry
  useEffect(() => {
    if (!livePaymentData?.expiresAt) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(livePaymentData.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("00:00 (Expired)");
        clearInterval(interval);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [livePaymentData?.expiresAt]);

  const handleCopyVpa = (vpa: string) => {
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    const cleaned = utrInput.replace(/\s+/g, "");
    if (!/^\d{12}$/.test(cleaned)) {
      setUtrError("Please enter a valid 12-digit numeric UPI reference (UTR / Transaction ID).");
      return;
    }
    if (onUtrSubmit) {
      await onUtrSubmit(cleaned);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* UPI Option */}
        <div
          onClick={() => onSelectMethod("upi")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
            selectedMethod === "upi"
              ? "border-accent bg-accent/5 dark:bg-accent/[0.06] shadow-2xs ring-1 ring-accent"
              : "border-border/70 dark:border-white/10 bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-foreground/30 dark:hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-slate-900 dark:text-accent flex items-center justify-center font-bold text-xs">
                <Wallet className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xs font-bold text-foreground">UPI Dynamic QR</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-slate-950">
              Recommended
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Scan & pay instantly with GPay, PhonePe, Paytm, or BHIM. Zero payment gateway markup.
          </p>
        </div>

        {/* Cash on Delivery */}
        <div
          onClick={() => onSelectMethod("cod")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
            selectedMethod === "cod"
              ? "border-accent bg-accent/5 dark:bg-accent/[0.06] shadow-2xs ring-1 ring-accent"
              : "border-border/70 dark:border-white/10 bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-foreground/30 dark:hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-foreground/10 text-foreground flex items-center justify-center font-bold text-xs">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Cash on Delivery</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
              Doorstep
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pay cash or UPI directly to our delivery courier upon receiving your package in Sambhal.
          </p>
        </div>

        {/* Credit / Debit Card (Offline / Gateway prep) */}
        <div
          onClick={() => onSelectMethod("card")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
            selectedMethod === "card"
              ? "border-accent bg-accent/5 dark:bg-accent/[0.06] shadow-2xs ring-1 ring-accent"
              : "border-border/70 dark:border-white/10 bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-foreground/30 dark:hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Debit / Credit Card</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
              POS Machine
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Card swipe on delivery or at our Sarai Tarin store counter.
          </p>
        </div>

        {/* Test Order Sandbox */}
        <div
          onClick={() => onSelectMethod("test")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
            selectedMethod === "test"
              ? "border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500"
              : "border-border/70 dark:border-white/10 bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-foreground/30 dark:hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">1-Click Test Order</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Sandbox
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Simulate instant checkout without payment verification to test order routing.
          </p>
        </div>
      </div>

      {/* UPI Dynamic QR View (When Live Payment Data is Active) */}
      {selectedMethod === "upi" && livePaymentData && (
        <div className="p-6 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-accent/40 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border/70 dark:border-white/10">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <QrCode className="w-4 h-4 text-accent" />
                <span>Scan to Pay ₹{livePaymentData.amountRupees.toLocaleString("en-IN")}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Payee: <strong className="text-foreground">{livePaymentData.payeeName}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.05] dark:bg-white/[0.06] text-xs font-mono font-semibold text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Expires in: {timeLeft}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0 text-center">
              <img
                src={livePaymentData.qrDataUrl}
                alt="UPI Dynamic QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                BHIM UPI • NPCI Verified
              </p>
            </div>

            {/* Payment Details & Deep-Link */}
            <div className="space-y-3.5 flex-1 min-w-0 text-left">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  UPI ID (VPA)
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.06] text-foreground border border-border/60">
                    {livePaymentData.vpa}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyVpa(livePaymentData.vpa)}
                    className="p-1.5 rounded-lg border border-border/70 hover:bg-foreground/[0.05] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Deep-Link */}
              <div>
                <a
                  href={livePaymentData.upiUri}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-slate-950 font-bold text-xs hover:bg-[#bbf055] transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Any UPI App (PhonePe / GPay)</span>
                </a>
              </div>

              {/* UTR Submission Form */}
              <form onSubmit={handleUtrSubmit} className="pt-2 border-t border-border/60 dark:border-white/10 space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  Step 2: Enter 12-Digit UTR / Transaction ID <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={12}
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 402812345678"
                    className="flex-1 h-10 px-3 rounded-xl bg-background border border-border/80 dark:border-white/10 text-xs font-mono text-foreground focus:outline-hidden focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingUtr || utrInput.length !== 12}
                    className="px-4 h-10 rounded-xl bg-foreground text-background dark:bg-white dark:text-slate-950 font-bold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSubmittingUtr ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Submit UTR</span>
                  </button>
                </div>
                {utrError && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{utrError}</span>
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  After completing the transfer in your UPI app, enter the 12-digit reference number from the payment receipt.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Trust Notice */}
      <div className="p-3.5 rounded-xl bg-accent/5 dark:bg-accent/[0.04] border border-accent/20 flex items-center gap-2.5 text-xs text-foreground">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
        <span>
          100% Genuine Parts Guarantee with standard 1-Year Store Warranty on all replacements & accessories.
        </span>
      </div>
    </div>
  );
}
