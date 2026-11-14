"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Sparkles, MessageCircle, ArrowRight, Award, Cpu, CheckCircle2 } from "lucide-react";
import { waLink } from "@/config/business";
import { api } from "@/lib/api";
import { teamMembers as fallbackTeam } from "@/lib/data";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { GradientText } from "@/components/reactbits/GradientText";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { Magnet } from "@/components/reactbits/Magnet";

export interface TeamMemberItem {
  id?: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  expertise: string;
  badge?: string;
}

// Precise focal position for each photo to prevent cutting off heads, chins or clothing
export const getMemberPosition = (member: TeamMemberItem) => {
  const r = (member.role || "").toLowerCase();
  const name = (member.name || "").toLowerCase();
  const img = (member.image || "").toLowerCase();

  // CEO image (ceo.jpg) has a wall sconce lamp & plant leaves in the top 50%; face is centered around 72%
  if (r.includes("ceo") || name.includes("ceo") || img.includes("ceo")) {
    return "center 72%";
  }
  // Operation Director (operations.jpg) head & hair are at the upper portion
  if (r.includes("operation") || name.includes("operation") || img.includes("operations")) {
    return "center 22%";
  }
  // Founder (founder.jpg) white cap & face are upper-center
  if (r.includes("founder") || name.includes("founder") || img.includes("founder")) {
    return "center 28%";
  }
  // Senior Technician (technician1.jpg) head & purple tie are upper-center
  if (r.includes("senior") || img.includes("technician1")) {
    return "center 28%";
  }
  // Technician (technician2.jpg) head is center-upper
  if (r.includes("technician") || img.includes("technician2")) {
    return "center 38%";
  }
  return "center center";
};

export function TeamSection({
  variant = "home",
  title,
  gradientWord,
  subtitle,
  className = "",
}: {
  variant?: "home" | "about";
  title?: string;
  gradientWord?: string;
  subtitle?: string;
  className?: string;
}) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(
    fallbackTeam.map((t) => {
      let badge = "Certified OEM Tech";
      const r = t.role.toLowerCase();
      if (r.includes("founder")) badge = "15+ Yrs Master";
      else if (r.includes("ceo")) badge = "Vision & Expansion";
      else if (r.includes("operation")) badge = "Quality & Workflow";
      else if (r.includes("senior")) badge = "Micro-Soldering Master";
      else badge = "Rapid Repair Tech";
      return { ...t, badge };
    })
  );

  useEffect(() => {
    const fetchTeam = async () => {
      let rawData: any[] = [];

      // 1. Try Axios api instance
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
            let expertise = m.expertise || "Master Technician";
            let badge = "Certified OEM Tech";

            const lowerRole = (m.role || "").toLowerCase();
            const lowerName = (m.name || "").toLowerCase();
            const img = (m.image || "").toLowerCase();

            if (lowerRole.includes("founder") || lowerName.includes("founder") || img.includes("founder")) {
              expertise = "Master Technician";
              badge = "15+ Yrs Master";
            } else if (lowerRole.includes("ceo") || lowerName.includes("ceo") || img.includes("ceo")) {
              expertise = "Business Strategy";
              badge = "Vision & Expansion";
            } else if (lowerRole.includes("operation") || lowerName.includes("operation") || img.includes("operations")) {
              expertise = "Workflow Management";
              badge = "Quality & Workflow";
            } else if (lowerRole.includes("senior") || img.includes("technician1")) {
              expertise = "Motherboard Repairs";
              badge = "Micro-Soldering Master";
            } else if (lowerRole.includes("technician") || img.includes("technician2")) {
              expertise = "Screen & Battery";
              badge = "Rapid Repair Tech";
            }

            return {
              id: m.id,
              name: m.name,
              role: m.role,
              image: m.image || "/team/founder.jpg",
              bio: m.bio || "Certified precision technician delivering master-grade care at Chand Mobile Expert.",
              expertise,
              badge,
            };
          });

        // Exact hierarchy priority: Founder (1) -> CEO (2) -> Operation (3) -> Senior Tech (4) -> Tech (5)
        const getPriority = (member: TeamMemberItem) => {
          const r = member.role.toLowerCase();
          const img = (member.image || "").toLowerCase();
          if (r.includes("founder") || img.includes("founder")) return 1;
          if (r.includes("ceo") || img.includes("ceo")) return 2;
          if (r.includes("operation") || img.includes("operations")) return 3;
          if (r.includes("senior") || img.includes("technician1")) return 4;
          return 5;
        };

        activeMembers.sort((a, b) => getPriority(a) - getPriority(b));

        if (activeMembers.length > 0) {
          setTeamMembers(activeMembers);
        }
      }
    };

    fetchTeam();
  }, []);

  // Categorize members
  const founder = teamMembers.find((m) => m.role.toLowerCase().includes("founder") || m.name.toLowerCase().includes("founder")) || teamMembers[0];
  const ceo = teamMembers.find((m) => m.role.toLowerCase().includes("ceo") || m.name.toLowerCase().includes("ceo")) || teamMembers[1];
  const operation = teamMembers.find((m) => m.role.toLowerCase().includes("operation") || m.name.toLowerCase().includes("operation")) || teamMembers[2];
  
  // Technicians (all remaining members except founder, ceo, operation)
  const technicians = teamMembers.filter((m) => m !== founder && m !== ceo && m !== operation);

  // Top 3 for home page
  const homeTop3 = [founder, ceo, operation].filter(Boolean);

  // -------------------------------------------------------------
  // HOME PAGE VARIANT: Top 3 Members in 3 Balanced Cards
  // -------------------------------------------------------------
  if (variant === "home") {
    return (
      <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32 ${className}`}>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Leadership & Master Engineers"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            {title || "Meet the Master"}{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
              {gradientWord || "Engineers"}
            </GradientText>
          </h2>
          <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
            {subtitle || "Certified repair authority led by industry veterans with over 15 years of precision micro-soldering experience."}
          </p>
        </div>

        {/* 3-Column Top Leadership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {homeTop3.map((member, idx) => (
            <TiltedCard
              key={member.id || idx}
              maxTilt={6}
              scale={1.02}
              glareColor="#a8d946"
              glareMaxOpacity={0.12}
              className="h-full"
            >
              <div className="group relative flex flex-col bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 border border-border/60 hover:border-accent/40 h-full">
                
                {/* Photo & Badge Area - Uses portrait aspect ratio & focal centering */}
                <div className="relative w-full aspect-[4/4.8] overflow-hidden bg-[#0c0d12]">
                  <img
                    src={member.image || "/team/founder.jpg"}
                    alt={member.name}
                    style={{ objectPosition: getMemberPosition(member) }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      {member.badge || "Verified Master"}
                    </span>
                  </div>
                </div>

                {/* Information Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Role */}
                  <p className="text-accent font-bold text-xs uppercase tracking-wider mb-1.5">
                    {member.role}
                  </p>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                    {member.name}
                  </h3>

                  {/* Expertise Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-foreground/90 text-xs font-semibold mb-4 w-fit">
                    <Wrench className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{member.expertise}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-foreground/75 text-sm leading-relaxed mb-6 flex-1">
                    {member.bio}
                  </p>

                  {/* Bottom Action Button */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                    <span className="text-xs text-foreground/50 font-medium">1-Year Warranty Care</span>
                    <Magnet padding={15} magnetStrength={2}>
                      <a
                        href={waLink(`Hello Chand Mobile Expert, I would like to consult with ${member.name} regarding my smartphone repair.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background hover:bg-accent hover:text-black transition-colors text-xs font-bold shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Consult
                      </a>
                    </Magnet>
                  </div>
                </div>
              </div>
            </TiltedCard>
          ))}
        </div>

        {/* View All Team on About Page CTA */}
        <div className="mt-12 text-center">
          <Magnet padding={25} magnetStrength={2}>
            <Link
              href="/about#team"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border/80 hover:border-accent/50 text-foreground hover:text-accent transition-all duration-300 text-sm font-semibold shadow-md group"
            >
              <span>Meet Full Engineering & Technical Crew (About Page)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-accent" />
            </Link>
          </Magnet>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------
  // ABOUT PAGE VARIANT: Unique, Optimized Layout
  // 1. Full-Width Founder Profile Showcase
  // 2. CEO & Operation Manager Side-by-Side (Portrait Ratio, No Head/Chin Cropping)
  // 3. Dynamic Responsive Technicians Grid (Balanced 2-col or 3-col)
  // -------------------------------------------------------------
  return (
    <section id="team" className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32 ${className}`}>
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <DecryptedText
            text="Master Craftsmen & Engineering Crew"
            speed={28}
            className="text-xs font-bold text-accent uppercase tracking-wider"
            encryptedClassName="text-accent/60 font-mono"
          />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
          {title || "Meet Our Master"}{" "}
          <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
            {gradientWord || "Team"}
          </GradientText>
        </h2>
        <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
          {subtitle || "From our visionary founding masters to board-level bench engineers, our certified specialists diagnose, restore, and calibrate every device with zero compromise."}
        </p>
      </div>

      {/* ── 1. FULL WIDTH: FOUNDER PROFILE SHOWCASE ── */}
      {founder && (
        <div className="mb-12 sm:mb-16">
          <div className="relative w-full bg-card rounded-3xl p-6 sm:p-10 lg:p-12 border border-border/70 hover:border-accent/40 shadow-2xl transition-all duration-500 overflow-hidden group">
            {/* Ambient Background Accent Glow */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* Founder Image Area */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full aspect-[4/4.8] rounded-3xl overflow-hidden bg-[#0c0d12] border border-white/10 shadow-2xl">
                  <img
                    src={founder.image || "/team/founder.jpg"}
                    alt={founder.name}
                    style={{ objectPosition: getMemberPosition(founder) }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg">
                      <Award className="w-4 h-4 text-accent" />
                      {founder.badge || "15+ Yrs Master Craftsman"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Founder Bio & Details Area */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                  <Cpu className="w-3.5 h-3.5" />
                  Founding Leadership & Master Architect
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-2 leading-tight">
                  {founder.name}
                </h3>
                
                <p className="text-accent text-lg font-bold mb-4">
                  {founder.role} &bull; <span className="text-foreground/90 font-medium">{founder.expertise}</span>
                </p>

                <p className="text-foreground/80 text-base sm:text-lg leading-relaxed mb-6">
                  {founder.bio}
                </p>

                {/* 3 Executive Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  <div className="bg-background/60 border border-border/60 rounded-2xl p-4 text-center">
                    <span className="block text-2xl font-black text-foreground">15+</span>
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Years Experience</span>
                  </div>
                  <div className="bg-background/60 border border-border/60 rounded-2xl p-4 text-center">
                    <span className="block text-2xl font-black text-foreground">10,000+</span>
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Devices Fixed</span>
                  </div>
                  <div className="bg-background/60 border border-border/60 rounded-2xl p-4 text-center">
                    <span className="block text-2xl font-black text-foreground">Level 3</span>
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Logic Board Master</span>
                  </div>
                </div>

                {/* WhatsApp Consult Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Magnet padding={25} magnetStrength={2.5}>
                    <a
                      href={waLink(`Hello Chand Mobile Expert, I would like to consult with Founder regarding my complex repair.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-foreground text-background hover:bg-accent hover:text-black transition-all duration-300 font-bold text-sm shadow-lg group/btn"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Consult Directly with Founder</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </Magnet>
                  <span className="text-xs text-foreground/50">Direct Master Bench Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MIDDLE ROW: CEO & OPERATION MANAGER SIDE-BY-SIDE ── */}
      <div className="mb-14 sm:mb-20">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Executive Leadership & Operations
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Strategic Direction & Rigorous Quality
          </h3>
        </div>

        {/* 2 Equal Columns: Height and aspect ratio configured so photos are NOT cropped */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[ceo, operation].filter(Boolean).map((member, idx) => (
            <TiltedCard
              key={member.id || idx}
              maxTilt={6}
              scale={1.02}
              glareColor="#a8d946"
              glareMaxOpacity={0.12}
              className="h-full"
            >
              <div className="group relative flex flex-col bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent/5 border border-border/60 hover:border-accent/40 transition-all duration-500 h-full">
                
                {/* Photo Area: uses aspect-[4/4.8] portrait ratio with custom focal center */}
                <div className="relative w-full aspect-[4/4.8] overflow-hidden bg-[#0c0d12]">
                  <img
                    src={member.image || "/team/founder.jpg"}
                    alt={member.name}
                    style={{ objectPosition: getMemberPosition(member) }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      {member.badge}
                    </span>
                  </div>
                </div>

                {/* Information Body */}
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <p className="text-accent font-bold text-xs uppercase tracking-wider mb-1.5">
                    {member.role}
                  </p>

                  <h4 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-accent transition-colors">
                    {member.name}
                  </h4>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-foreground/90 text-xs font-semibold mb-4 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{member.expertise}</span>
                  </div>

                  <p className="text-foreground/75 text-sm leading-relaxed mb-6 flex-1">
                    {member.bio}
                  </p>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                    <span className="text-xs text-foreground/50 font-medium">Verified Authority</span>
                    <Magnet padding={15} magnetStrength={2}>
                      <a
                        href={waLink(`Hello Chand Mobile Expert, I would like to consult with ${member.name}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background hover:bg-accent hover:text-black transition-colors text-xs font-bold shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Consult
                      </a>
                    </Magnet>
                  </div>
                </div>
              </div>
            </TiltedCard>
          ))}
        </div>
      </div>

      {/* ── 3. DOWNSIDE: DYNAMIC RESPONSIVE TECHNICIANS GRID ── */}
      {technicians.length > 0 && (
        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
              <Wrench className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Precision Engineering Specialists
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Master Technicians & Board Engineers
            </h3>
            <p className="text-foreground/60 text-sm mt-1">
              Specialized in intricate micro-soldering, Face ID recovery, logic board diagnostics, and rapid screen/battery restorations.
            </p>
          </div>

          {/* Dynamic Grid: If 2 technicians, centers both in 2 equal columns without a blank 3rd slot */}
          <div
            className={`grid grid-cols-1 ${
              technicians.length === 1
                ? "max-w-md mx-auto"
                : technicians.length === 2
                ? "md:grid-cols-2 max-w-4xl mx-auto"
                : "sm:grid-cols-2 lg:grid-cols-3"
            } gap-6 sm:gap-8`}
          >
            {technicians.map((member, idx) => (
              <TiltedCard
                key={member.id || idx}
                maxTilt={6}
                scale={1.02}
                glareColor="#a8d946"
                glareMaxOpacity={0.12}
                className="h-full"
              >
                <div className="group relative flex flex-col bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent/5 border border-border/60 hover:border-accent/40 transition-all duration-500 h-full">
                  
                  {/* Photo & Badge Area */}
                  <div className="relative w-full aspect-[4/4.8] overflow-hidden bg-[#0c0d12]">
                    <img
                      src={member.image || "/team/technician1.jpg"}
                      alt={member.name}
                      style={{ objectPosition: getMemberPosition(member) }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                        <Wrench className="w-3.5 h-3.5 text-accent" />
                        {member.badge}
                      </span>
                    </div>
                  </div>

                  {/* Information Body */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <p className="text-accent font-bold text-xs uppercase tracking-wider mb-1.5">
                      {member.role}
                    </p>

                    <h4 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-accent transition-colors">
                      {member.name}
                    </h4>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-foreground/90 text-xs font-semibold mb-4 w-fit">
                      <Wrench className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{member.expertise}</span>
                    </div>

                    <p className="text-foreground/75 text-sm leading-relaxed mb-6 flex-1">
                      {member.bio}
                    </p>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                      <span className="text-xs text-foreground/50 font-medium">1-Year Warranty Care</span>
                      <Magnet padding={15} magnetStrength={2}>
                        <a
                          href={waLink(`Hello Chand Mobile Expert, I would like to consult with ${member.name} regarding my device.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background hover:bg-accent hover:text-black transition-colors text-xs font-bold shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Consult
                        </a>
                      </Magnet>
                    </div>
                  </div>
                </div>
              </TiltedCard>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
