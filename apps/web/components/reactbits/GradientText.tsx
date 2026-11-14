"use client";

// Ported from ReactBits (reactbits.dev) – GradientText (simplified no-dep version)
// https://www.reactbits.dev/text-animations/gradient-text

import React, { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  colors?: string[];
  animationSpeed?: number;
  className?: string;
  style?: CSSProperties;
}

export function GradientText({
  children,
  colors = ["#a8d946", "#5eead4", "#a8d946", "#facc15"],
  animationSpeed = 8,
  className = "",
  style,
}: GradientTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const positions = colors.map((_, i) => (i / (colors.length - 1)) * 100);
    let alive = true;

    const tick = (ts: number) => {
      if (!alive) return;
      const dt = lastRef.current ? (ts - lastRef.current) / 1000 : 0;
      lastRef.current = ts;
      timeRef.current += dt;

      const shift = (timeRef.current / animationSpeed) * 100;
      const stops = colors.map((c, i) => `${c} ${((positions[i] + shift) % 100).toFixed(1)}%`).join(", ");
      root.style.backgroundImage = `linear-gradient(90deg, ${stops})`;
      root.style.backgroundSize = `${colors.length * 100}%`;

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [colors, animationSpeed]);

  return (
    <span
      ref={rootRef}
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
