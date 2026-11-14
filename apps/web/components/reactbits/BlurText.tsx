"use client";

// Ported from ReactBits (reactbits.dev) – BlurText
// https://www.reactbits.dev/text-animations/blur-text
// Zero external dependencies – uses native CSS animations via style injection

import React, { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
}

export function BlurText({
  text,
  delay = 80,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const yOffset = direction === "top" ? "-12px" : "12px";

  return (
    <span ref={ref} className={`inline ${className}`} aria-label={text}>
      <style>{`
        @keyframes rb-blur-in {
          from { opacity: 0; filter: blur(10px); transform: translateY(${yOffset}); }
          to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
        }
        .rb-blur-word {
          display: inline-block;
          opacity: 0;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
          animation-duration: 0.55s;
        }
        .rb-blur-word.in-view {
          animation-name: rb-blur-in;
        }
      `}</style>
      {elements.map((el, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`rb-blur-word${inView ? " in-view" : ""}`}
          style={{ animationDelay: inView ? `${i * delay}ms` : "0ms" }}
        >
          {el}
          {animateBy === "words" && i < elements.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
