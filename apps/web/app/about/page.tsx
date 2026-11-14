"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { whyUs, teamMembers as fallbackTeam } from "@/lib/data";
import { CheckCircle2, Wrench, ShieldCheck, Zap, Cpu, Sparkles, Award, Microscope, Layers, ArrowDownRight } from "lucide-react";
import { api } from "@/lib/api";
import { useBusinessProfile } from "@/context/BusinessContext";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { GradientText } from "@/components/reactbits/GradientText";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { CountUp } from "@/components/reactbits/CountUp";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { Magnet } from "@/components/reactbits/Magnet";
import { StarBorder } from "@/components/reactbits/StarBorder";
import { ShinyLink } from "@/components/reactbits/ShinyButton";
import { TeamSection } from "@/components/TeamSection";

interface TeamMemberData {
  id?: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  expertise: string;
  badge?: string;
}

export default function AboutPage() {
  const { waLink, profile } = useBusinessProfile();
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(
    fallbackTeam.map((t) => ({ ...t, badge: "Verified Master" }))
  );
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      let rawData: any[] = [];

      // 1. Try axios api instance (defaults to http://localhost:3000)
      try {
        const response = await api.get("/teams");
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          rawData = response.data;
        }
      } catch (err) {
        console.warn("api.get('/teams') failed, trying proxy /api/teams:", err);
      }

      // 2. Try Next.js server proxy /api/teams
      if (!rawData || rawData.length === 0) {
        try {
          const res = await fetch("/api/teams");
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              rawData = json;
            }
          }
        } catch (err) {
          console.warn("/api/teams proxy failed, trying direct backend port 3000:", err);
        }
      }

      // 3. Try direct fetch to port 3000
      if (!rawData || rawData.length === 0) {
        try {
          const res = await fetch("http://localhost:3000/teams");
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              rawData = json;
            }
          }
        } catch (err) {
          console.warn("direct port 3000 failed:", err);
        }
      }

      if (rawData && rawData.length > 0) {
        const activeMembers = rawData
          .filter((m: any) => m.isActive !== false)
          .map((m: any) => {
            let expertise = "Hardware Micro-Repair";
            let badge = "Verified Master";

            const lowerRole = (m.role || "").toLowerCase();
            if (lowerRole.includes("founder") || lowerRole.includes("craftsman")) {
              expertise = "Master Craftsman & Logic Board Trace";
              badge = "15+ Yrs Master";
            } else if (lowerRole.includes("iphone") || lowerRole.includes("apple")) {
              expertise = "Micro-soldering, Face ID & OLEDs";
              badge = "Apple Specialist";
            } else if (lowerRole.includes("android")) {
              expertise = "Samsung, Pixel, OnePlus Boards";
              badge = "Android Specialist";
            } else if (lowerRole.includes("diagnostics") || lowerRole.includes("qa") || lowerRole.includes("quality")) {
              expertise = "20-Point Bench Audit & Thermals";
              badge = "QA Certified";
            } else if (lowerRole.includes("laser") || lowerRole.includes("display")) {
              expertise = "Curved OLED Laser Debonding";
              badge = "Laser Engineer";
            } else if (lowerRole.includes("warranty") || lowerRole.includes("concierge")) {
              expertise = "Warranty Desk & Express Dispatch";
              badge = "Store Concierge";
            }

            return {
              id: m.id,
              name: m.name,
              role: m.role,
              image: m.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face",
              bio: m.bio || "Certified precision technician delivering master-grade care at Chand Mobile Expert.",
              expertise,
              badge,
            };
          });

        // Sort so Founder appears first, followed by lead technicians
        activeMembers.sort((a, b) => {
          const aFounder = a.role.toLowerCase().includes("founder") ? -1 : 0;
          const bFounder = b.role.toLowerCase().includes("founder") ? -1 : 0;
          return aFounder - bFounder;
        });

        if (activeMembers.length > 0) {
          setTeamMembers(activeMembers);
        }
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="w-full pb-16">
      <Head>
        <title>About Us & Masters Team | Chand Mobile Expert</title>
        <meta name="description" content="Meet our certified master technicians and explore our leading smartphone repair laboratory in Sambhal, UP." />
      </Head>

      {/* ── Hero Section ── */}
      <section className="flex flex-col relative isolate mb-20 sm:mb-24 pb-16">
        <div className="absolute inset-0 lg:inset-2.5 -z-10 rounded-bl-[2rem] rounded-br-[2rem] lg:rounded-bl-[2.5rem] lg:rounded-br-[2.5rem] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/BG.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
        </div>

        <div className="flex items-start justify-center px-4 sm:px-6 pt-36 sm:pt-44 md:pt-48">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-6 border border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <DecryptedText
                text="Trusted Repair Lab Since 2011"
                speed={28}
                className="text-white font-medium"
                encryptedClassName="text-accent font-mono"
              />
            </div>
            <h1 className="text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-sm">
              About{" "}
              <GradientText colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]} animationSpeed={7}>
                Chand Mobile
              </GradientText>
            </h1>
            <p className="text-base sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
              For over 15 years, we have been the gold standard in premium smartphone micro-restoration. We treat every device with surgical precision, honest pricing, and genuine manufacturer-spec parts.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Section with CountUp ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 bg-[#090a0f] rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/10">
          {[
            { target: 10000, suffix: "+", label: "Devices Restored" },
            { target: 99.4, suffix: "%", decimals: 1, label: "First-Time Fix Rate" },
            { target: 15, suffix: "+", label: "Years Experience" },
            { target: 365, suffix: " Days", label: "Certified Store Warranty" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <span className="text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 mb-2 sm:mb-3 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                <CountUp from={0} to={stat.target} duration={1800} decimals={stat.decimals || 0} />
                {stat.suffix}
              </span>
              <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-bold text-accent uppercase tracking-widest sm:tracking-[0.2em] leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us Section with SpotlightCard ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Unmatched Precision Care"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            The Master Care{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
              Difference
            </GradientText>
          </h2>
          <p className="text-foreground/70 text-lg">
            We hold ourselves to the highest standards in the industry. Here is what makes our service unparalleled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {whyUs.map((feature, idx) => (
            <SpotlightCard
              key={idx}
              spotlightColor="#a8d946"
              intensity={0.08}
              spotlightSize={280}
              borderGlow={0.35}
              className="group relative flex flex-col bg-card rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-2xl border border-border/50 hover:border-accent/40 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
                <CheckCircle2 className="w-6 h-6 text-accent-foreground group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                {feature.description}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── High-Tech Lab Standards Section ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="bg-[#0b0c10] border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              <DecryptedText
                text="State-of-the-Art Laboratory"
                speed={28}
                className="text-xs font-bold text-accent uppercase tracking-wider"
                encryptedClassName="text-accent/60 font-mono"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              State-of-the-Art{" "}
              <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
                Repair Laboratory
              </GradientText>
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Unlike ordinary kiosks, our service facility is engineered with industrial-grade micro-electronics tools for delicate restorations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Microscope,
                title: "Optical Stereo Microscopes",
                desc: "0.01mm zoom magnification for precision trace rebuilding, BGA reballing & micro-soldering.",
              },
              {
                icon: Layers,
                title: "Laser OLED Separator",
                desc: "Cold-plate debonding and bubble-free optical vacuum lamination for curved glass.",
              },
              {
                icon: ShieldCheck,
                title: "ESD-Safe Clean Lab",
                desc: "Anti-static grounded matting and HEPA ionized air filtration protecting microchips from static shock.",
              },
              {
                icon: Award,
                title: "20-Point Automated Diagnostics",
                desc: "Algorithmic hardware bench testing verifying charging curves, Face ID, digitizers & thermals.",
              },
            ].map((item, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="#a8d946"
                intensity={0.1}
                spotlightSize={240}
                borderGlow={0.4}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col hover:border-accent/40 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet the Team Section (Unique Executive & Technicians Layout) ── */}
      <TeamSection variant="about" />


      {/* ── CTA Banner with StarBorder & Magnet ── */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-0">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-black/10 bg-black">
          <div
            className="absolute inset-0 bg-center bg-no-repeat brightness-50 opacity-40 blur-sm scale-110"
            style={{ backgroundImage: "url(/BG.jpg)", backgroundSize: "cover" }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 sm:px-12 sm:py-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-medium tracking-tight max-w-2xl mb-6">
              Experience the difference today.
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl">
              Visit our state-of-the-art lab in {profile.city || "Sambhal"}, {profile.state || "UP"}, or speak directly to a master technician.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href={waLink("Hello Chand Mobile Expert, I want to visit your store.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center w-full sm:w-auto"
              >
                <span className="absolute right-0 inset-y-0 w-[calc(100%-1.5rem)] rounded-xl bg-accent" />
                <span className="relative z-10 px-6 py-3.5 rounded-xl bg-white text-black text-sm font-bold flex-1 text-center whitespace-nowrap">Message on WhatsApp</span>
                <span className="relative -left-px z-10 w-[48px] h-[48px] rounded-xl flex items-center justify-center text-black shrink-0">
                  <ArrowDownRight className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-45" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
