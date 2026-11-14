"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight } from "lucide-react";
import { LogoMarquee } from "./LogoMarquee";
import { waLink } from "@/config/business";

const Hero3DCanvas = dynamic(
  () => import("./Hero3DCanvas").then((mod) => mod.Hero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[500px] xl:h-[540px] flex items-center justify-center">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">
          Loading 3D Phone Model…
        </span>
      </div>
    ),
  }
);

export function Hero() {
  return (
    <section className="flex flex-col relative isolate">
      {/* Background Image */}
      <div
        className="absolute inset-0 lg:inset-2.5 bg-cover bg-center bg-no-repeat -z-10 rounded-bl-[2rem] rounded-br-[2rem] lg:rounded-bl-[2.5rem] lg:rounded-br-[2.5rem]"
        aria-hidden="true"
        style={{ backgroundImage: "url(/BG.jpg)" }}
      />

      {/* Hero Header Content */}
      <div className="flex items-start justify-center px-4 sm:px-6 pt-24 min-[360px]:pt-28 sm:pt-36 md:pt-44 lg:pt-56 xl:pt-64">
        <div className="flex flex-col items-start lg:items-center text-left lg:text-center w-full max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 pl-3 pr-2.5 sm:pl-4 sm:pr-3 py-1.5 rounded-xl border border-black/10 bg-white text-black text-xs sm:text-sm font-medium mb-3 sm:mb-6 shadow-xs">
            <span>1-Year Certified Warranty</span>
            <span className="text-accent">✦</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl min-[360px]:text-4xl min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.08] mb-3 sm:mb-6 text-black">
            <span className="block">Your Phone.</span>
            <span className="block">
              Our <span className="italic font-serif text-accent">Expertise.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs min-[360px]:text-sm sm:text-base lg:text-lg text-neutral-700 mb-5 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-xl lg:max-w-2xl leading-relaxed">
            Professional smartphone repairs, certified pre-owned devices &amp; genuine mobile accessories with express 30-minute turnarounds.
          </p>

          {/* CTA Button — mobile: clean pill, sm+: two-piece layered design */}

          {/* Mobile-only: clean full-width button */}
          <a
            href={waLink("Hello Chand Mobile Expert, I would like to book a repair / get a free diagnostic check.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group sm:hidden w-full inline-flex items-center justify-between gap-3 rounded-2xl bg-black text-white px-4 py-3 font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <span>Book a Repair</span>
            <span className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:-rotate-45" />
            </span>
          </a>

          {/* sm+ desktop two-piece layered design */}
          <a
            href={waLink("Hello Chand Mobile Expert, I would like to book a repair / get a free diagnostic check.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative cursor-pointer hidden sm:inline-flex items-center"
                tabIndex={0}
              >
            <span className="absolute right-0 inset-y-0 w-[calc(100%-2rem)] rounded-xl bg-accent" />
            <span className="relative z-10 px-6 py-3 rounded-xl bg-black text-white font-medium text-base">
                Book a Repair
            </span>
            <span className="relative -left-px z-10 w-11 h-11 rounded-xl flex items-center justify-center text-black shrink-0">
              <ArrowDownRight className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-45" />
            </span>
          </a>
        </div>
      </div>

      {/* 3D Phone Showcase */}
      <div className="relative px-4 sm:px-6 mt-6 sm:mt-10 lg:mt-14 flex justify-center items-center">
        <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
          <Hero3DCanvas />
        </div>
      </div>

      {/* Logo Marquee */}
      <div className="-mt-4 sm:-mt-8 lg:-mt-10">
        <LogoMarquee />
      </div>
    </section>
  );
}
