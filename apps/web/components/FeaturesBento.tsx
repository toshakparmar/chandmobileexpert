"use client";

import React from "react";
import Image from "next/image";
import { Star, Check, Info, CheckCircle2, Zap, Shield, Users } from "lucide-react";
import { businessConfig } from "@/config/business";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { CountUp } from "@/components/reactbits/CountUp";
import { GradientText } from "@/components/reactbits/GradientText";

const REVIEW_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
];

export function FeaturesBento() {
  return (
    <section id="features" className="w-full px-4 sm:px-6 mb-16 sm:mb-24 lg:mb-32 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">

          {/* Card 1 - Express Hardware & Screen Repair (Light Background) */}
          <SpotlightCard
            spotlightColor="#a8d946"
            intensity={0.08}
            spotlightSize={320}
            borderGlow={0.3}
            proximity={160}
            className="group bg-card-primary rounded-4xl p-6 sm:p-8 pb-0 overflow-hidden min-h-[420px] sm:min-h-140 md:row-span-2 flex flex-col border border-foreground/[0.05] dark:border-white/[0.04] hover:border-accent/20 transition-all duration-300"
          >
            <div className="relative z-10 text-center mb-6 transition-transform duration-500 ease-out group-hover:scale-105">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Express Service</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold md:font-semibold text-card-primary-foreground leading-tight mb-3">
                Express Hardware &{" "}
                <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8} className="font-bold">
                  Screen Repair
                </GradientText>
              </h3>
              <p className="text-card-primary-muted text-sm font-medium">
                Precision screen swaps, genuine batteries & port fixes in under 30 minutes
              </p>
            </div>

            <div className="flex-1 flex justify-center items-end transition-transform duration-500 ease-out group-hover:scale-[1.02]">
              <div className="relative bg-background shadow-2xl border-neutral-800 overflow-hidden z-10 w-52 sm:w-56 md:w-64 h-84 sm:h-96 md:h-115 rounded-t-4xl border-6 border-b-0">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 -translate-x-1/2 bg-neutral-800 rounded-full z-10 top-2 w-20 h-5" aria-hidden="true" />

                <div className="absolute inset-0 bg-phone-screen pt-14 px-5">
                  <h4 className="text-2xl sm:text-3xl font-bold text-foreground leading-none tracking-tight mt-4">
                    Your device
                  </h4>
                  <h4 className="text-2xl sm:text-3xl font-bold text-foreground leading-none tracking-tight mb-3">
                    is ready!
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-snug mb-8 font-medium">
                    100% Quality checked with 1-Year Store Warranty issued.
                  </p>

                  <div className="relative bg-gradient-to-br from-accent via-accent/80 to-accent/50 rounded-2xl p-4 h-52 shadow-xl overflow-hidden">
                    <svg className="absolute inset-0 size-full" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0,60 Q30,40 60,50 T100,30" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                      <path d="M0,55 Q40,35 70,45 T100,25" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                    </svg>
                    <div className="relative z-10 flex items-start justify-between gap-3 h-full">
                      <div>
                        <p className="text-lg font-bold text-neutral-950">Express</p>
                        <p className="text-lg font-bold text-neutral-950">Lab</p>
                      </div>
                      <CheckCircle2 className="size-6 text-black/60" aria-hidden="true" />
                    </div>
                    <div className="absolute bottom-3 left-5 flex items-center gap-2 text-neutral-900 text-xs tracking-widest font-bold" aria-hidden="true">
                      <span>EXP</span><span>•</span><span>2026</span><span>•</span><span>LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2 - 20-Point Multi-Audit (Dark Background) */}
          <SpotlightCard
            spotlightColor="#a8d946"
            intensity={0.1}
            spotlightSize={280}
            borderGlow={0.4}
            proximity={140}
            className="group bg-card-secondary rounded-4xl p-6 sm:p-8 overflow-hidden min-h-80 relative flex flex-col md:block border border-white/[0.05] hover:border-accent/20 transition-all duration-300"
          >
            <div className="relative z-10 max-w-xs sm:max-w-48 transition-transform duration-500 ease-out group-hover:scale-105">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Multi-Audit</span>
              </div>
              <h3 className="text-xl md:text-2xl font-medium text-card-secondary-foreground leading-tight mb-3">
                20-Point Multi-Audit
              </h3>
              <p className="text-card-secondary-muted text-sm">
                Touchscreen, biometric sensors, camera, charging & audio calibration
              </p>
            </div>

            <div className="relative md:absolute mt-8 md:mt-0 md:right-12 md:top-1/2 md:-translate-y-1/2 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105 self-center md:self-auto">
              {/* Pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="absolute size-56 border border-accent/60 rounded-full animate-[ping_3s_ease-in-out_infinite]" style={{ animationDelay: "0s" }} />
                <div className="absolute size-72 border border-accent/40 rounded-full animate-[ping_3s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }} />
                <div className="absolute size-88 border border-accent/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
              </div>

              <div className="relative bg-background shadow-2xl border-neutral-800 overflow-hidden z-10 w-44 md:w-48 h-64 md:h-72 rounded-3xl border-4">
                <div className="absolute left-1/2 -translate-x-1/2 bg-neutral-800 rounded-full z-10 top-2 w-16 h-4" aria-hidden="true" />
                <div className="absolute inset-0 bg-phone-screen pt-9 px-3">
                  <div className="bg-muted rounded-full px-2 py-1.5 mb-3 flex items-center gap-1.5 border border-border">
                    <span className="text-muted-foreground text-xs">Diagnostic audit...</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">Lab Diagnostics</p>
                  <p className="text-xl font-medium text-foreground mb-3">Free 15-Min</p>
                  <div className="flex gap-1.5 mb-4">
                    <span className="bg-accent text-black text-xs px-2.5 py-1 rounded-full font-medium">Display</span>
                    <span className="text-muted-foreground text-xs px-2 py-1">Battery</span>
                    <span className="text-muted-foreground text-xs px-2 py-1">Board</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-neutral-900 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-xl z-20 whitespace-nowrap border border-accent/10 max-w-[calc(100%-1rem)]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-neutral-400 text-xs">Diagnostic status</span>
                  <Info className="size-3.5 text-neutral-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-white">All passing</span>
                  <span className="text-xs font-semibold text-accent bg-accent/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="size-3" /> 100%
                  </span>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Bottom Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 3 - Trusted By Customers */}
            <SpotlightCard
              spotlightColor="#a8d946"
              intensity={0.1}
              spotlightSize={240}
              borderGlow={0.4}
              proximity={120}
              className="group bg-card-secondary rounded-4xl p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-64 border border-white/[0.05] hover:border-accent/20 transition-all duration-300"
            >
              <div className="transition-transform duration-500 ease-out group-hover:scale-110">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Trusted</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-card-secondary-foreground leading-tight mb-1">
                  Trusted By
                </h3>
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
                  <CountUp
                    to={parseInt(businessConfig.devicesRepaired?.replace(/[^0-9]/g, "") || "10000")}
                    from={0}
                    duration={1500}
                    suffix="+"
                  />
                </h3>
              </div>

              <div className="transition-transform duration-500 ease-out group-hover:scale-105">
                <div className="flex items-center">
                  {REVIEW_AVATARS.map((src, i) => (
                    <div key={i} className="size-12 rounded-full border-2 border-white/25 overflow-hidden -ml-4 first:ml-0">
                      <Image
                        alt={`Customer avatar ${i + 1}`}
                        loading="lazy"
                        width={48}
                        height={48}
                        style={{ width: "auto", height: "auto" }}
                        className="size-full object-cover"
                        src={src}
                      />
                    </div>
                  ))}
                  <div className="size-12 rounded-full border-2 border-white/25 bg-accent text-black flex items-center justify-center text-sm font-semibold -ml-4">
                    5+
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 text-card-secondary-muted transition-transform duration-500 ease-out group-hover:scale-105">
                <Star className="size-4 fill-current text-accent" aria-hidden="true" />
                <span className="text-xs font-medium">
                  {businessConfig.rating} from {businessConfig.reviewCount} reviews
                </span>
              </div>
            </SpotlightCard>

            {/* Card 4 - Certified Lab Standards */}
            <SpotlightCard
              spotlightColor="#a8d946"
              intensity={0.08}
              spotlightSize={240}
              borderGlow={0.3}
              proximity={120}
              className="group bg-card-primary rounded-4xl p-6 md:p-8 flex flex-col min-h-64 border border-foreground/[0.05] dark:border-white/[0.04] hover:border-accent/20 transition-all duration-300"
            >
              <div className="mb-auto transition-transform duration-500 ease-out group-hover:scale-105">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Certified</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold md:font-semibold text-card-primary-foreground leading-tight mb-2">
                  Certified Lab Standards
                </h3>
                <p className="text-card-primary-muted text-sm font-medium">
                  Enterprise-grade repair infrastructure that grows with you
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mt-6 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                <div className="flex items-center justify-between bg-background rounded-xl p-3.5 shadow-xs border border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🚀</span>
                    <span className="text-foreground font-semibold text-sm">
                      <CountUp to={10000} from={0} duration={1400} suffix="+" /> Revived
                    </span>
                  </div>
                  <span className="text-accent text-sm font-bold">+24%</span>
                </div>

                <div className="flex items-center justify-between bg-background rounded-xl p-3.5 shadow-xs border border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">⚡</span>
                    <span className="text-foreground font-semibold text-sm">1-Year Warranty</span>
                  </div>
                  <span className="text-accent text-sm font-bold">+0.2%</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
