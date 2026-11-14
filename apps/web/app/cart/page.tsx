"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import {
  Store,
  ArrowLeft,
  Home,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const cart = useCartStore();
  const { wishlist, toggleWishlist } = useCartStore();

  useEffect(() => {
    setMounted(true);
    cart.syncCart();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading shopping cart...</p>
      </div>
    );
  }

  const subtotal = cart.getSubtotal();
  const tax = subtotal * 0.18; // 18% GST (already factored or estimated)
  const total = subtotal + tax;
  const totalItems = cart.getTotalItems();

  const handleClearCart = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    cart.clearCart();
    setIsClearModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background relative pt-6 sm:pt-8 pb-20 overflow-x-hidden">
      {/* Subtle background ambient glow matching overall site design */}
      <div className="pointer-events-none absolute top-16 right-1/4 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/[0.04] rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-96 left-10 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-full blur-3xl -z-10" />

      {/* Section Container: max-w-[1360px] */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Bar for Cart Module (matching Account layout) */}
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3.5 pb-6 mb-6 border-b border-border/70 dark:border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3 group shrink-0" title="Return to Home">
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

          <div className="flex items-center gap-2 sm:gap-2.5 w-full min-[480px]:w-auto justify-end">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-foreground border border-border/60 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Browse Shop</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>

        {/* Top Breadcrumb & Heading Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2.5">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground font-semibold">Shopping Cart</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Shopping Cart
                </h1>
                {totalItems > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-foreground/10 text-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Review your personal order items, adjust quantities, and proceed to secure checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Cart Body */}
        {cart.items.length === 0 ? (
          /* Empty Cart State matching Account empty style */
          <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-10 sm:p-16 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Your shopping cart is empty</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-6 max-w-md">
              Looks like you haven&apos;t added any genuine accessories or smartphones to your cart yet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="h-10 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Explore Shop</span>
              </Link>
              <Link
                href="/account/wishlist"
                className="h-10 px-5 rounded-xl bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] text-foreground border border-border/60 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>View Wishlist</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Grid: Left Items + Right Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left: Cart Items (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Items Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-white/[0.06]">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Items in Cart ({totalItems})
                </span>
                <button
                  onClick={handleClearCart}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {cart.items.map((item) => {
                  const slug = item.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  const isWishlisted = wishlist.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-border transition-all flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-5"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/shop/${slug}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted/40 shrink-0 border border-border/60 relative block group"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-col justify-between flex-1 min-w-0 w-full text-center sm:text-left">
                        <div>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {item.category || "Accessories"}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </span>
                          </div>

                          <Link
                            href={`/shop/${slug}`}
                            className="font-bold text-sm sm:text-base text-foreground hover:text-accent transition-colors line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>

                          <p className="text-xs text-muted-foreground mt-1">
                            ₹{item.price.toLocaleString("en-IN")} each
                          </p>
                        </div>

                        {/* Controls (Mobile + Desktop) */}
                        <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border/40 dark:border-white/[0.04]">
                          {/* Stepper */}
                          <div className="flex items-center bg-foreground/[0.04] dark:bg-white/[0.05] border border-border/70 dark:border-white/10 rounded-xl p-1 h-9">
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg hover:bg-background dark:hover:bg-white/10 text-foreground flex items-center justify-center transition-colors cursor-pointer"
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-foreground w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg hover:bg-background dark:hover:bg-white/10 text-foreground flex items-center justify-center transition-colors cursor-pointer"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Item Subtotal & Actions */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm sm:text-base font-black text-foreground">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>

                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isWishlisted
                                  ? "bg-rose-500/10 text-rose-500"
                                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                              }`}
                              title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500" : ""}`} />
                            </button>

                            <button
                              onClick={() => cart.removeItem(item.id)}
                              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Assurance Banner */}
              <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-xs text-muted-foreground shadow-2xs">
                <Truck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  Free express doorstep delivery on accessory orders across Sambhal & nearby regions. Genuine parts guaranteed with warranty.
                </span>
              </div>
            </div>

            {/* Right: Order Summary (4 cols) */}
            <div className="lg:col-span-4 sticky top-8 space-y-4">
              <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
                <h2 className="text-base sm:text-lg font-bold text-foreground pb-4 border-b border-border/70 dark:border-white/[0.08]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Estimated GST (18%)</span>
                    <span className="font-semibold text-foreground">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-border/70 dark:border-white/[0.08]" />

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-foreground">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Inclusive of all taxes & free door delivery
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-border/70 dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>100% Genuine Certified Spares</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="w-4 h-4 text-accent shrink-0" />
                    <span>Express Doorstep Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RotateCcw className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Easy Returns & Replacement</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Global Delete Confirmation Modal for Cart */}
      <DeleteConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Empty Shopping Cart?"
        description="Are you sure you want to remove all items from your cart? You can easily re-add items anytime from the store."
        confirmText="Yes, Clear Cart"
        cancelText="Cancel"
      />
    </div>
  );
}
