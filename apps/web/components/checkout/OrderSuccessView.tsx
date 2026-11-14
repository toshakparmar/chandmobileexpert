"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Store,
  MessageCircle,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { CartItem } from "@/store/cartStore";
import { waLink } from "@/config/business";

interface OrderSuccessViewProps {
  orderId: string;
  total: number;
  paymentMethod: string;
  shippingSummary: string;
  items: CartItem[];
  isTestOrder?: boolean;
  paymentStatus?: string;
  utrSubmitted?: boolean;
}

export function OrderSuccessView({
  orderId,
  total,
  paymentMethod,
  shippingSummary,
  items,
  isTestOrder = false,
  paymentStatus,
  utrSubmitted = false,
}: OrderSuccessViewProps) {
  const isAwaitingVerification =
    paymentStatus === "AWAITING_VERIFICATION" || utrSubmitted;

  return (
    <div className="min-h-screen bg-background relative pt-6 sm:pt-8 pb-20 overflow-x-hidden">
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute top-16 right-1/4 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/[0.04] rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-96 left-10 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-full blur-3xl -z-10" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3.5 pb-6 mb-8 border-b border-border/70 dark:border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-[150px] sm:w-[210px]">
              <Image
                src="/images/logo/logo.png"
                alt="Chand Mobile Expert"
                width={210}
                height={70}
                className="w-full h-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo/dark-logo.png"
                alt="Chand Mobile Expert"
                width={210}
                height={70}
                className="w-full h-auto object-contain hidden dark:block"
                priority
              />
            </div>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 transition-colors shadow-xs w-full min-[480px]:w-auto justify-center"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Browse Shop</span>
          </Link>
        </div>

        {/* Success Banner Card */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Order Placed Successfully
              </span>
              {isAwaitingVerification && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Clock className="w-3 h-3" />
                  UPI Verification in Progress
                </span>
              )}
              {isTestOrder && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <Zap className="w-3 h-3" />
                  Test Order (Sandbox)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
              {isAwaitingVerification
                ? "Your 12-digit UPI reference (UTR) has been received. Our shop owner will verify the payment against our bank records and dispatch your package shortly."
                : isTestOrder
                ? "Your order was completed in Test / Sandbox mode without any payment. You can verify order recording and tracking status below."
                : "We have received your order and our dispatch team has begun preparing your genuine parts & accessories for doorstep delivery."}
            </p>

            {/* Order Reference Pill */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-2.5 px-4 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/70 dark:border-white/10 text-xs text-muted-foreground">
              <span>Order ID:</span>
              <span className="font-mono font-bold text-foreground text-sm">
                #{orderId.toString().slice(0, 13).toUpperCase()}
              </span>
              <span className="opacity-40">•</span>
              <span>
                Payment:{" "}
                <strong className="text-foreground uppercase">
                  {isTestOrder ? "TEST (NO PAYMENT)" : paymentMethod}
                </strong>
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Delivery Timeline */}
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Delivery Timeline
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Confirmed
                </div>
                <div className="p-2.5 rounded-xl bg-foreground/[0.04] text-foreground font-semibold border border-border/60">
                  Packing
                </div>
                <div className="p-2.5 rounded-xl bg-foreground/[0.02] text-muted-foreground border border-border/40">
                  Dispatched
                </div>
                <div className="p-2.5 rounded-xl bg-foreground/[0.02] text-muted-foreground border border-border/40">
                  Delivered
                </div>
              </div>
            </div>

            {/* Shipping & Payment summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/70 dark:border-white/[0.08]">
              <div className="p-4 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Shipping Destination
                </span>
                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  {shippingSummary || "Main Market, Sarai Tarin, Sambhal, UP – 244303"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Order Payment
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Total Amount: <span className="font-extrabold text-sm">₹{total.toLocaleString("en-IN")}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isTestOrder
                    ? "Zero payment charged • Verified Sandbox Test Order"
                    : paymentMethod === "cod"
                    ? "Pay in cash or UPI upon delivery"
                    : isAwaitingVerification
                    ? "UPI verification in progress (UTR submitted)"
                    : "Prepaid online via UPI dynamic QR"}
                </p>
              </div>
            </div>

            {/* Items in this Order */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-border/70 dark:border-white/[0.08]">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Items in this Order ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-foreground/[0.015] dark:bg-white/[0.02] border border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-muted/40 shrink-0 border border-border/60"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0 font-mono">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-border/70 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/account/orders"
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>View in My Orders</span>
              </Link>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={waLink(`Hello Chand Mobile Expert, I need an update on my order #${orderId}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] text-foreground border border-border/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Support</span>
                </a>

                <Link
                  href="/shop"
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] text-foreground border border-border/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Shop More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
