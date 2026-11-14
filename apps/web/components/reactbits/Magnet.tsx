"use client";

import React, { useState, useEffect, useRef } from "react";

// Ported from ReactBits (reactbits.dev) – Magnet
// https://www.reactbits.dev/components/magnet

interface MagnetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
}

export function Magnet({
  children,
  padding = 40,
  disabled = false,
  magnetStrength = 2.5,
  activeTransition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
  inactiveTransition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  className = "",
  style,
  ...props
}: MagnetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const magnetElement = magnetRef.current;
    if (!magnetElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = magnetElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < rect.width / 2 + padding && distY < rect.height / 2 + padding) {
        setIsHovered(true);
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        setPosition({ x: offsetX, y: offsetY });
      } else {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [padding, disabled, magnetStrength]);

  return (
    <div
      ref={magnetRef}
      className={`inline-block ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? activeTransition : inactiveTransition,
        willChange: "transform",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
