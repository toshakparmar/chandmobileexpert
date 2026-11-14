"use client";

import React, { useEffect, useRef, useState } from "react";

const TEXT =
  "Chand Mobile Expert delivers master-grade smartphone repairs, certified pre-owned devices, and genuine accessories backed by an official 1-Year Store Warranty, express 30-minute turnarounds, and strict personal data privacy.";

export function BlurInHeadline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.2;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = TEXT.split(" ");

  return (
    <section className="w-full bg-background px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
      <div ref={containerRef} className="mx-auto max-w-5xl">
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-left leading-snug tracking-tight text-foreground">
          {words.map((word, index) => {
            const wordThreshold = index / words.length;
            const isRevealed = scrollProgress >= wordThreshold;
            const distance = Math.max(0, wordThreshold - scrollProgress);
            const opacity = isRevealed ? 1 : Math.max(0.15, 1 - distance * 3);
            const blurAmount = isRevealed ? 0 : Math.min(8, distance * 24);

            return (
              <span
                key={index}
                className="mr-2 inline-block lg:mr-3"
                style={{
                  opacity: opacity,
                  filter: `blur(${blurAmount}px)`,
                  transition: "opacity 75ms, filter 75ms",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
