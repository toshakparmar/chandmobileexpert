"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 max-[1200px]:gap-0.5 max-[850px]:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 max-[1200px]:px-2.5 max-[1024px]:px-2 text-sm max-[1024px]:text-xs font-medium transition-colors rounded-full hover:bg-foreground/5 whitespace-nowrap ${
              isActive
                ? "bg-foreground/10 text-foreground font-semibold"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

