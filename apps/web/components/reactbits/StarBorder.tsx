"use client";

import React from "react";

// Ported from ReactBits (reactbits.dev) – StarBorder
// https://www.reactbits.dev/components/star-border

interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
}

export function StarBorder({
  as = "div",
  className = "",
  color = "#a8d946",
  speed = "5s",
  children,
  ...rest
}: StarBorderProps) {
  const Component = (as || "div") as any;
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-2xl p-[1px] ${className}`}
      {...rest}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 w-full h-full rounded-[inherit] bg-[#0c0d12]">
        {children}
      </div>

      <style>{`
        @keyframes star-movement-bottom {
          0% {
            transform: translate(0%, 0%);
            opacity: 1;
          }
          100% {
            transform: translate(-100%, 0%);
            opacity: 0;
          }
        }
        @keyframes star-movement-top {
          0% {
            transform: translate(0%, 0%);
            opacity: 1;
          }
          100% {
            transform: translate(100%, 0%);
            opacity: 0;
          }
        }
        .animate-star-movement-bottom {
          animation: star-movement-bottom linear infinite;
        }
        .animate-star-movement-top {
          animation: star-movement-top linear infinite;
        }
      `}</style>
    </Component>
  );
}
