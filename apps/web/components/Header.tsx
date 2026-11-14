"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { NavLinks } from "./header/NavLinks";
import { ProfileDropdown } from "./header/ProfileDropdown";
import { MobileDrawer } from "./header/MobileDrawer";

export function Header() {
  const [menuState, setMenuState] = useState<"open" | "closing" | false>(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const openMenu = () => setMenuState("open");
  const closeMenu = () => {
    setMenuState("closing");
    setTimeout(() => setMenuState(false), 400);
  };
  const isOpen = menuState === "open";
  const isVisible = menuState === "open" || menuState === "closing";

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Hide Navbar when rendering auth, account, cart, or checkout pages
  if (
    pathname?.startsWith("/account") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/checkout")
  ) {
    return null;
  }

  return (
    <>
      <header className="fixed shadow-2xl/20 top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl rounded-b-3xl sm:rounded-b-4xl bg-frame z-[9999] transition-all duration-300 print:hidden">
        <div className="h-16 sm:h-20 flex items-center justify-between px-2.5 min-[360px]:px-3 sm:px-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative flex items-center justify-center w-[125px] min-[360px]:w-[145px] sm:w-[190px] xl:w-[240px]">
              <Image
                src="/images/logo/logo.png"
                alt="Chand Mobile Expert Logo"
                width={240}
                height={80}
                className="w-full h-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo/dark-logo.png"
                alt="Chand Mobile Expert Logo"
                width={240}
                height={80}
                className="w-full h-auto object-contain hidden dark:block"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <NavLinks />

          {/* Actions & CTAs */}
          <div className="flex items-center gap-1.5 min-[380px]:gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-foreground/5 transition-all group flex items-center justify-center shrink-0"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-foreground/80 group-hover:text-foreground transition-colors" />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-accent text-black text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Profile Menu or Sign In */}
            <ProfileDropdown />

            {/* Hamburger Button (Mobile / Tablet) */}
            <button
              onClick={isVisible ? closeMenu : openMenu}
              className="flex min-[850px]:hidden flex-col items-center justify-center w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10 cursor-pointer gap-[4px] group shrink-0"
              aria-label={isVisible ? "Close menu" : "Open menu"}
              aria-expanded={isVisible}
              aria-controls="mobile-nav-overlay"
            >
              <span
                className="block h-[2px] rounded-full bg-foreground origin-center transition-all duration-300"
                style={{
                  width: "20px",
                  transform: isOpen ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-[2px] rounded-full bg-foreground transition-all duration-300"
                style={{
                  width: "14px",
                  opacity: isOpen ? 0 : 1,
                  transform: isOpen ? "scaleX(0)" : "scaleX(1)",
                }}
              />
              <span
                className="block h-[2px] rounded-full bg-foreground origin-center transition-all duration-300"
                style={{
                  width: "20px",
                  transform: isOpen ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Decorative corner SVGs */}
        <svg
          className="absolute top-0 -left-12.25 rotate-180 text-frame pointer-events-none hidden min-[850px]:block"
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5.50871e-06 0C-0.00788227 37.3001 8.99616 50.0116 50 50H5.50871e-06V0Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="absolute top-0 -right-12.25 rotate-90 text-frame pointer-events-none hidden min-[850px]:block"
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5.50871e-06 0C-0.00788227 37.3001 8.99616 50.0116 50 50H5.50871e-06V0Z"
            fill="currentColor"
          />
        </svg>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isOpen}
        isVisible={isVisible}
        onClose={closeMenu}
        totalItems={totalItems}
        mounted={mounted}
      />
    </>
  );
}
