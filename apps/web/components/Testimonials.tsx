"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { GradientText } from "@/components/reactbits/GradientText";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { Magnet } from "@/components/reactbits/Magnet";
import { Star, Quote, Sparkles } from "lucide-react";

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        let rawData: any[] = [];
        try {
          const res = await fetch('/api/testimonials');
          if (res.ok) {
            rawData = await res.json();
          }
        } catch (e) {
          console.warn("Failed to fetch /api/testimonials, trying api client:", e);
        }

        if (!rawData || rawData.length === 0) {
          const response = await api.get('/testimonials');
          if (response.data && Array.isArray(response.data)) {
            rawData = response.data;
          }
        }

        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped = rawData.map((t: any) => ({
            id: t.id,
            name: t.customerName || t.name || "Verified Client",
            content: t.review || t.content || "Outstanding smartphone repair service, quick and honest.",
            avatar: t.image || t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            role: t.role || "Verified Customer",
            brandName: t.customerName ? t.customerName.split(" ")[0] : "Client",
            rating: t.rating || 5,
          }));
          setTestimonials(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const duration = 6000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((idx) => (idx + 1) % testimonials.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeIndex, testimonials.length]);

  const activeTestimonial = testimonials[activeIndex];
  const circumference = 301.59289474462014;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  if (loading) {
    return (
      <section className="w-full bg-frame border-t border-b border-accent/15 px-4 sm:px-6 py-20 sm:py-24 lg:py-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="w-full bg-frame border-t border-b border-accent/15 px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Verified Customer Stories"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight font-medium text-foreground">
            Trusted by device owners across the{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]} animationSpeed={7}>
              Tri-City
            </GradientText>
          </h2>
        </div>

        <div className="mb-16 grid gap-8 lg:mb-20 lg:grid-cols-2 lg:gap-12">
          {/* Avatar selector tabs */}
          <div
            className="flex items-center justify-start gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0"
            role="tablist"
            aria-label="Testimonials"
          >
            {testimonials.map((t, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <Magnet key={t.id} padding={20} magnetStrength={3.5}>
                  <div
                    onClick={() => {
                      setActiveIndex(idx);
                      setProgress(0);
                    }}
                    role="tab"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    style={{ cursor: "pointer" }}
                    className="relative"
                  >
                    <div
                      className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-colors duration-500 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                      style={{ backgroundColor: isSelected ? "#a8d946" : "transparent" }}
                    >
                      <Image
                        alt={t.name}
                        loading="lazy"
                        width={64}
                        height={64}
                        className="h-8 w-8 rounded-full object-cover grayscale sm:h-12 sm:w-12 lg:h-16 lg:w-16"
                        src={t.avatar || "/images/avatar.jpg"}
                      />
                    </div>

                    {isSelected && (
                      <svg
                        className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] -rotate-90 pointer-events-none"
                        viewBox="0 0 100 100"
                        aria-hidden="true"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="#a8d946"
                          strokeWidth="1.5"
                          opacity="0.2"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="#a8d946"
                          strokeWidth="1.5"
                          strokeDasharray="301.59289474462014"
                          strokeLinecap="round"
                          style={{ strokeDashoffset }}
                        />
                      </svg>
                    )}
                  </div>
                </Magnet>
              );
            })}
          </div>

          {/* Testimonial Quote Panel with 3D Tilt */}
          <TiltedCard
            maxTilt={6}
            scale={1.01}
            glareColor="#5eead4"
            glareMaxOpacity={0.12}
            className="flex flex-col justify-center"
          >
            <div
              className="relative p-7 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-xl overflow-hidden animate-in fade-in duration-300"
              role="tabpanel"
              aria-live="polite"
            >
              <Quote className="w-10 h-10 text-accent/20 absolute -top-1 -right-1 pointer-events-none" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mb-6 text-lg sm:text-xl leading-relaxed text-foreground/90 font-medium italic">
                “{activeTestimonial?.content}”
              </blockquote>
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div className="text-base font-bold text-foreground">
                  {activeTestimonial?.name}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">
                  {activeTestimonial?.role || "Verified Customer"}
                </span>
              </div>
            </div>
          </TiltedCard>
        </div>

        {/* Brand tabs row */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 flex-wrap">
          {testimonials.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setProgress(0);
                }}
                className="flex items-center cursor-pointer"
              >
                <span
                  className={`text-sm sm:text-base font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? "border-accent bg-accent/20 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.brandName || "Premium Service"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
