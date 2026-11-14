"use client";

import React, { useRef, useState } from "react";

// Ported from ReactBits (reactbits.dev) – TiltedCard
// https://www.reactbits.dev/components/tilted-card

interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
}

export function TiltedCard({
  children,
  maxTilt = 12,
  scale = 1.02,
  perspective = 1000,
  glareEnable = true,
  glareMaxOpacity = 0.15,
  glareColor = "#a8d946",
  className = "",
  style,
  ...props
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transform-gpu transition-transform duration-200 ease-out ${className}`}
      style={{
        perspective: `${perspective}px`,
        transform: tilt.isHovered
          ? `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${scale})`
          : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
        transition: tilt.isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        ...style,
      }}
      {...props}
    >
      {children}

      {glareEnable && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            opacity: tilt.isHovered ? glareMaxOpacity : 0,
            background: `radial-gradient(circle 350px at ${tilt.glareX}% ${tilt.glareY}%, ${glareColor}, transparent 80%)`,
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
