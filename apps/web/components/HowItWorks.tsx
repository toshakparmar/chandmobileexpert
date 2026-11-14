"use client";

import React, { useEffect, useRef, useState } from "react";
import { waLink } from "@/config/business";
import { Sparkles } from "lucide-react";
import { GradientText } from "@/components/reactbits/GradientText";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { ShinyLink } from "@/components/reactbits/ShinyButton";
import { TrueFocus } from "@/components/reactbits/TrueFocus";
import { Magnet } from "@/components/reactbits/Magnet";

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const topOffset = windowHeight / 2 - rect.top;
      
      const percentage = Math.min(Math.max((topOffset / (totalHeight - 120)) * 100, 0), 100);
      setLineHeight(percentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="how-it-works" className="relative w-full bg-background">
      <div
        ref={containerRef}
        className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 py-16 sm:py-20 lg:py-28 lg:grid-cols-2 lg:gap-20"
      >
        {/* Sticky Sidebar */}
        <div className="lg:sticky lg:top-48 lg:h-fit lg:self-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Streamlined Repair Workflow"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground mb-4">
            How it{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
              works
            </GradientText>
          </h2>

          <div className="my-4">
            <TrueFocus sentence="Express Same-Day Master Repair" blurAmount={3} />
          </div>

          <p className="mt-4 max-w-md text-base sm:text-lg leading-relaxed text-muted-foreground">
            Your smartphone repaired by certified master engineers and backed by an{" "}
            <span className="font-medium text-foreground">Official 1-Year Store Warranty</span>, ready
            for express same-day pickup.
          </p>

          <div className="mt-8">
            <Magnet padding={35} magnetStrength={3}>
              <ShinyLink
                href={waLink("Hello Chand Mobile Expert, I want to schedule a repair / diagnostic check.")}
                target="_blank"
                rel="noopener noreferrer"
                shimmerColor="rgba(168,217,70,0.4)"
                shimmerDuration={1800}
                className="inline-flex items-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:bg-accent hover:text-black shadow-lg"
                tabIndex={0}
              >
                Book Free Diagnostic
              </ShinyLink>
            </Magnet>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div
            className="absolute left-6 top-6 h-[calc(100%-6rem)] w-0.5 -translate-x-1/2 bg-foreground/10"
            aria-hidden="true"
          >
            <div
              className="w-full bg-accent"
              style={{ willChange: "height", height: `${lineHeight}%` }}
            />
          </div>

          <ol className="relative list-none p-0 m-0">
            {/* Step 1 */}
            <li>
              <div className="relative flex gap-3.5 sm:gap-5 pb-14 sm:pb-24">
                <div
                  className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-accent"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar-check h-5 w-5 text-black"
                    aria-hidden="true"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                    <path d="m9 16 2 2 4-4" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    1. Free 15-Min Diagnosis
                  </h3>
                  <p className="mt-2 max-w-sm text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Book online or walk into our store. Our certified technician identifies
                    the exact issue at zero cost with no obligation.
                  </p>
                </div>
              </div>
            </li>

            {/* Step 2 */}
            <li>
              <div className="relative flex gap-3.5 sm:gap-5 pb-14 sm:pb-24">
                <div
                  className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-accent"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-file-check h-5 w-5 text-black"
                    aria-hidden="true"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="m9 15 2 2 4-4" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    2. Transparent Quote
                  </h3>
                  <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground">
                    Receive a clear written breakdown of original &amp; OEM grade parts with fixed
                    pricing. No work begins until you approve.
                  </p>
                </div>
              </div>
            </li>

            {/* Step 3 */}
            <li>
              <div className="relative flex gap-3.5 sm:gap-5">
                <div
                  className="relative z-10 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-accent"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-shield-check h-5 w-5 text-black"
                    aria-hidden="true"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    3. Master Repair &amp; 1-Year Warranty
                  </h3>
                  <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground">
                    Precision hardware repair in our ESD lab in 30–45 mins. 20-point test verified and
                    handed over with a 1-Year Warranty certificate.
                  </p>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
