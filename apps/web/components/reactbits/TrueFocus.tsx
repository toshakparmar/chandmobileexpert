"use client";

import React, { useEffect, useRef, useState } from "react";

// Ported from ReactBits (reactbits.dev) – TrueFocus
// https://www.reactbits.dev/text-animations/true-focus

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

export function TrueFocus({
  sentence = "Master Care Precision Repairs",
  manualMode = false,
  blurAmount = 4,
  borderColor = "#a8d946",
  glowColor = "rgba(168, 217, 70, 0.4)",
  animationDuration = 0.4,
  pauseBetweenAnimations = 1.2,
  className = "",
}: TrueFocusProps) {
  const words = sentence.split(" ");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (manualMode) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex]!.getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [currentIndex, words.length]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex ?? 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-wrap items-center gap-x-2.5 gap-y-1.5 select-none ${className}`}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className="relative cursor-pointer transition-all duration-300 font-bold"
            style={{
              filter: isActive ? "blur(0px)" : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.45,
            }}
          >
            {word}
          </span>
        );
      })}

      {/* Focus Box with Corner Brackets */}
      <div
        className="pointer-events-none absolute transition-all ease-out"
        style={{
          transform: `translate3d(${focusRect.x - 4}px, ${focusRect.y - 4}px, 0)`,
          width: `${focusRect.width + 8}px`,
          height: `${focusRect.height + 8}px`,
          transitionDuration: `${animationDuration}s`,
          boxShadow: `0 0 20px ${glowColor}`,
        }}
      >
        {/* Top Left */}
        <span
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2"
          style={{ borderColor }}
        />
        {/* Top Right */}
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2"
          style={{ borderColor }}
        />
        {/* Bottom Left */}
        <span
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2"
          style={{ borderColor }}
        />
        {/* Bottom Right */}
        <span
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2"
          style={{ borderColor }}
        />
      </div>
    </div>
  );
}
