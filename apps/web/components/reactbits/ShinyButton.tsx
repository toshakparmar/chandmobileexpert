"use client";

// ReactBits-inspired ShinyButton – animated shimmer effect
// https://www.reactbits.dev/components/shiny-button

import React, { useRef, useEffect } from "react";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerDuration?: number;
  className?: string;
}

export function ShinyButton({
  children,
  shimmerColor = "rgba(168,217,70,0.35)",
  shimmerDuration = 1800,
  className = "",
  ...rest
}: ShinyButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    let raf = 0;
    let startTime: number | null = null;

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = ((ts - startTime) % shimmerDuration) / shimmerDuration;
      const x = -100 + progress * 300;
      btn.style.setProperty(
        "--shimmer-x",
        `${x}%`
      );
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [shimmerDuration]);

  return (
    <button
      ref={btnRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--shimmer-color": shimmerColor,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(
            105deg,
            transparent 30%,
            var(--shimmer-color) 50%,
            transparent 70%
          )`,
          transform: `translateX(var(--shimmer-x, -100%))`,
          transition: "none",
        }}
      />
      {children}
    </button>
  );
}

interface ShinyLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerDuration?: number;
  className?: string;
}

export function ShinyLink({
  children,
  shimmerColor = "rgba(168,217,70,0.35)",
  shimmerDuration = 1800,
  className = "",
  ...rest
}: ShinyLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;

    let raf = 0;
    let startTime: number | null = null;

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = ((ts - startTime) % shimmerDuration) / shimmerDuration;
      const x = -100 + progress * 300;
      el.style.setProperty("--shimmer-x", `${x}%`);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [shimmerDuration]);

  return (
    <a
      ref={linkRef}
      className={`relative overflow-hidden ${className}`}
      style={{ "--shimmer-color": shimmerColor } as React.CSSProperties}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(105deg, transparent 30%, var(--shimmer-color) 50%, transparent 70%)`,
          transform: `translateX(var(--shimmer-x, -100%))`,
        }}
      />
      {children}
    </a>
  );
}
