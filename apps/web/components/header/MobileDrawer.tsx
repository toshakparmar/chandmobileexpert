"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, X, ArrowRight } from "lucide-react";
import { NAV_ITEMS } from "./NavLinks";
import { waLink } from "@/config/business";

interface MobileDrawerProps {
  isOpen: boolean;
  isVisible: boolean;
  onClose: () => void;
  totalItems: number;
  mounted: boolean;
}

export function MobileDrawer({
  isOpen,
  isVisible,
  onClose,
  totalItems,
  mounted,
}: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isVisible) return null;

  return (
    <div
      id="mobile-nav-overlay"
      className="fixed inset-0 z-[9998] max-[850px]:flex hidden justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-400"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className="relative h-full w-full max-w-none bg-frame shadow-2xl flex flex-col transition-transform duration-400 ease-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-foreground/5">
          <span className="font-bold text-foreground text-lg">Menu</span>
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors group flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-accent text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="px-5 pt-5 pb-6 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent font-bold"
                    : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </Link>
            );
          })}

          <div className="pt-6 mt-4 border-t border-foreground/5 space-y-3">
            <a
              href={waLink("Hello Chand Mobile Expert, I have an inquiry about mobile repair / phone accessories.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 border border-emerald-500/20"
            >
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
