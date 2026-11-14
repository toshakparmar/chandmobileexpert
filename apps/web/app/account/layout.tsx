"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Package,
  Wrench,
  Heart,
  MapPin,
  LogOut,
  MessageCircle,
  Home,
  ArrowLeft,
  Store,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";

const NAVIGATION_ITEMS = [
  { href: "/account/profile", label: "Profile Details", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/repairs", label: "My Repairs", icon: Wrench },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { wishlist } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading account...</p>
      </div>
    );
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Valued Customer";
  const initials =
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") ||
    (user?.email?.[0] || "U").toUpperCase();
  const emailOrPhone = user?.email || user?.phone || "";

  // Active section title for breadcrumb
  const currentNavItem = NAVIGATION_ITEMS.find((item) => pathname.startsWith(item.href));
  const activePageLabel = currentNavItem ? currentNavItem.label : "Dashboard";

  return (
    <div className="min-h-screen bg-background relative pt-4 sm:pt-8 pb-16 sm:pb-20 overflow-x-hidden print:p-0 print:m-0 print:min-h-0 print:bg-white">
      {/* Subtle background ambient glow matching overall site design */}
      <div className="pointer-events-none absolute top-16 right-1/4 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/[0.04] rounded-full blur-3xl -z-10 print:hidden" />
      <div className="pointer-events-none absolute top-96 left-10 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-full blur-3xl -z-10 print:hidden" />

      {/* Section Container: max-w-[1360px] */}
      <div className="max-w-[1360px] mx-auto px-2 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
        
        {/* Top Header Bar for Account Module (since main navbar is hidden) */}
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-2.5 pb-4 mb-4 sm:pb-6 sm:mb-6 border-b border-border/70 dark:border-white/[0.08] print:hidden">
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

          <div className="flex items-center gap-2 sm:gap-2.5 w-full min-[480px]:w-auto justify-between min-[480px]:justify-end">
            <Link
              href="/shop"
              className="flex-1 min-[480px]:flex-initial inline-flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-foreground border border-border/60 transition-colors shrink-0"
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span>Browse Shop</span>
            </Link>
            <Link
              href="/"
              className="flex-1 min-[480px]:flex-initial inline-flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 transition-colors shadow-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>

        {/* Top Breadcrumb & Heading Bar */}
        <div className="mb-4 sm:mb-8 print:hidden">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2.5">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/account/profile" className="hover:text-foreground transition-colors">
              Account
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground font-semibold">{activePageLabel}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                Manage Account
              </h1>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Manage your personal profile, track device repairs, and configure addresses.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet User Bar & Horizontal Navigation Tabs (Visible on < lg) */}
        <div className="lg:hidden mb-4 space-y-2.5 print:hidden">
          {/* Compact User Bar on Mobile */}
          <div className="flex items-center justify-between p-3.5 bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 text-white dark:bg-accent dark:text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 border border-border/60">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{emailOrPhone}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="p-1.5 px-2.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sign Out</span>
            </button>
          </div>

          {/* Smooth Horizontal Segmented Tabs on Mobile */}
          <div className="relative flex items-center gap-1 p-1 bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl overflow-x-auto scrollbar-hide shadow-2xs touch-pan-x">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              const isWishlist = item.href === "/account/wishlist";
              const count = isWishlist ? wishlist.length : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavPill"
                      className="absolute inset-0 bg-foreground/[0.08] dark:bg-white/[0.1] border border-border/70 dark:border-white/15 rounded-xl shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 transition-colors text-current shrink-0" />
                    <span>{item.label}</span>
                    {count !== null && count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                        isActive
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2-Column Responsive Layout - Equal Height (items-stretch) */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Left Navigation Sidebar (Desktop only) */}
          <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col print:hidden">
            <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
              
              <div className="space-y-6">
                {/* User Profile Mini Header */}
                <div className="flex items-center gap-3.5 pb-5 border-b border-border/70 dark:border-white/[0.08]">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 text-white dark:bg-accent dark:text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-border/60">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-foreground truncate leading-snug">
                      {fullName}
                    </h2>
                    {emailOrPhone && (
                      <p className="text-xs text-muted-foreground truncate">
                        {emailOrPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Clean Navigation Menu with Animated Sliding Pill */}
                <nav className="space-y-1 relative">
                  {NAVIGATION_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    const isWishlist = item.href === "/account/wishlist";
                    const count = isWishlist ? wishlist.length : null;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="desktopNavPill"
                            className="absolute inset-0 bg-foreground/[0.07] dark:bg-white/[0.09] border border-border/70 dark:border-white/15 rounded-xl shadow-2xs"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}

                        <div className="relative z-10 flex items-center gap-3">
                          <Icon className="w-4 h-4 transition-colors text-current shrink-0" />
                          <span>{item.label}</span>
                        </div>

                        {count !== null && count > 0 && (
                          <span
                            className={`relative z-10 text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                              isActive
                                ? "bg-foreground/10 text-foreground font-bold"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer with Help Link & Sign Out */}
              <div className="mt-8 pt-5 border-t border-border/70 dark:border-white/[0.08] space-y-2">
                <a
                  href="https://wa.me/919758677978?text=Hello%20Chand%20Mobile%20Expert,%20I%20need%20support%20with%20my%20account%20or%20orders."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Support on WhatsApp</span>
                </a>

                <button
                  onClick={() => setIsSignOutModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </aside>

          {/* Right Main Content Area - Stretches to Equal Height with Smooth Route Transitions */}
          <main className="flex-1 min-w-0 w-full flex flex-col print:p-0 print:m-0 print:block">
            <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-8 md:p-9 shadow-sm flex-1 flex flex-col h-full overflow-hidden print:p-0 print:m-0 print:border-none print:shadow-none print:bg-transparent print:overflow-visible print:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex-1 flex flex-col h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

        </div>
      </div>

      {/* Global Sign Out Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={() => {
          setIsSignOutModalOpen(false);
          logout();
          router.push("/");
        }}
        variant="warning"
        title="Sign Out Confirmation"
        description="Are you sure you want to sign out of your account on this device? You can log back in anytime with your phone number."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
      />
    </div>
  );
}
