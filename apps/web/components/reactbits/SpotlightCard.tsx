"use client";

// Ported from ReactBits (reactbits.dev) – SpotlightCard
// https://www.reactbits.dev/components/spotlight-card

import React, { useEffect, useRef } from "react";

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  borderGlow?: number;
  proximity?: number;
  smoothing?: number;
};

function parseColorToRgb(color: string): { r: number; g: number; b: number } {
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(hex, 16);
    if (!isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    }
  }
  return { r: 168, g: 217, b: 70 };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function SpotlightCard({
  children,
  className = "",
  style,
  spotlightColor = "#a8d946",
  intensity = 0.08,
  spotlightSize = 300,
  borderGlow = 0.35,
  smoothing = 0.25,
  ...rest
}: SpotlightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ mx: 0, my: 0, px: 0, py: 0, inside: false, raf: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const border = borderRef.current;
    if (!root || !light || !border) return;

    const rgb = parseColorToRgb(spotlightColor);
    const intensityFactor = Math.max(0.3, Math.min(2.5, intensity / 0.08));
    const borderFactor = Math.max(0.3, Math.min(2.5, borderGlow / 0.35));

    let isDark = document.documentElement.classList.contains("dark");

    const updateGradients = (x: number, y: number) => {
      if (isDark) {
        // Dark theme: Luminous modern ambient glow + vibrant border
        const innerAlpha1 = (0.15 * intensityFactor).toFixed(3);
        const innerAlpha2 = (0.05 * intensityFactor).toFixed(3);
        light.style.background = `radial-gradient(${spotlightSize}px circle at ${x}px ${y}px, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${innerAlpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${innerAlpha2}) 40%, transparent 75%)`;

        const bAlpha1 = (0.75 * borderFactor).toFixed(3);
        const bAlpha2 = (0.25 * borderFactor).toFixed(3);
        border.style.background = `radial-gradient(${spotlightSize * 0.9}px circle at ${x}px ${y}px, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bAlpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bAlpha2}) 35%, transparent 70%)`;
      } else {
        // Light theme: Refined soft tint (not oversaturated neon) + crisp clean border
        const innerAlpha1 = (0.12 * intensityFactor).toFixed(3);
        const innerAlpha2 = (0.035 * intensityFactor).toFixed(3);
        light.style.background = `radial-gradient(${spotlightSize}px circle at ${x}px ${y}px, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${innerAlpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${innerAlpha2}) 45%, transparent 75%)`;

        const bAlpha1 = (0.65 * borderFactor).toFixed(3);
        const bAlpha2 = (0.20 * borderFactor).toFixed(3);
        border.style.background = `radial-gradient(${spotlightSize * 0.9}px circle at ${x}px ${y}px, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bAlpha1}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bAlpha2}) 35%, transparent 70%)`;
      }
    };

    const handleThemeChange = () => {
      isDark = document.documentElement.classList.contains("dark");
      if (stateRef.current.inside) {
        updateGradients(stateRef.current.px, stateRef.current.py);
      }
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const tick = () => {
      const s = stateRef.current;
      s.px = lerp(s.px, s.mx, 1 - smoothing);
      s.py = lerp(s.py, s.my, 1 - smoothing);

      if (s.inside) {
        updateGradients(s.px, s.py);
      }
      s.raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      stateRef.current.mx = e.clientX - rect.left;
      stateRef.current.my = e.clientY - rect.top;
      if (!stateRef.current.inside) {
        stateRef.current.inside = true;
        light.style.opacity = "1";
        border.style.opacity = "1";
      }
    };

    const onEnter = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      stateRef.current.inside = true;
      stateRef.current.mx = e.clientX - rect.left;
      stateRef.current.my = e.clientY - rect.top;
      stateRef.current.px = stateRef.current.mx;
      stateRef.current.py = stateRef.current.my;
      updateGradients(stateRef.current.px, stateRef.current.py);
      light.style.opacity = "1";
      border.style.opacity = "1";
    };

    const onLeave = () => {
      stateRef.current.inside = false;
      light.style.opacity = "0";
      border.style.opacity = "0";
    };

    root.addEventListener("mousemove", onMove, { passive: true });
    root.addEventListener("mouseenter", onEnter, { passive: true });
    root.addEventListener("mouseleave", onLeave, { passive: true });
    stateRef.current.raf = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(stateRef.current.raf);
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [spotlightColor, intensity, spotlightSize, borderGlow, smoothing]);

  return (
    <div ref={rootRef} className={`relative isolate overflow-hidden ${className}`} style={style} {...rest}>
      {/* Surface Spotlight */}
      <div
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0"
      />

      {/* Laser-Sharp Glowing Border */}
      <div
        ref={borderRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] transition-opacity duration-300 opacity-0 z-10"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
