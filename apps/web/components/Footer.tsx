"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Phone, MessageCircle, Mail, MapPin, Star, ArrowRight, ArrowDownRight } from "lucide-react";
import { businessConfig } from "@/config/business";
import { useBusinessProfile } from "@/context/BusinessContext";

export function Footer() {
  const { profile, waLink, telLink, mailLink } = useBusinessProfile();
  const [contactInput, setContactInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setContactInput("");
      setIsSubmitted(false);
    }, 4000);
  };

  const pathname = usePathname();
  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <footer className="relative mt-16 sm:mt-20 lg:mt-24 mx-0 sm:mx-2.5 print:hidden">
      {/* ── CTA Banner ── */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-0">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-black/10">
          {/* blurred BG */}
          <div
            className="absolute inset-0 bg-center bg-no-repeat brightness-150 blur-sm scale-110"
            style={{ backgroundImage: "url(/BG.jpg)", backgroundSize: "150%" }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl text-black font-medium tracking-tight max-w-2xl mb-6 sm:mb-8 lg:mb-10">
              Restore your smartphone with certified master care
            </h2>

            {isSubmitted ? (
              <div className="px-6 py-3 bg-white text-black font-medium rounded-xl shadow-lg border border-black/10 animate-in fade-in">
                ✓ Thank you! Our master technician will contact you within 15 minutes.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:max-w-lg bg-white rounded-2xl p-2 shadow-lg border border-black/5 gap-2 sm:gap-0 mx-auto"
              >
                <div className="flex items-center flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-neutral-400 ml-3 shrink-0"
                    aria-hidden="true"
                  >
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                  <input
                    type="text"
                    required
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="Enter phone or device model"
                    aria-label="Phone number or device model"
                    className="flex-1 px-3 py-3 text-sm bg-transparent text-black placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
                <button
                    type="submit"
                  className="group relative inline-flex items-center w-full sm:w-auto active:scale-[0.98] cursor-pointer"
                >
                  <span className="absolute right-0 inset-y-0 w-[calc(100%-1.5rem)] rounded-xl bg-accent" />
                  <span className="relative z-10 px-3.5 sm:px-5 py-3 rounded-xl bg-foreground text-background text-xs sm:text-sm font-medium flex-1 text-center whitespace-nowrap">Book Priority Repair</span>
                  <span className="relative -left-px z-10 w-[44px] h-[44px] rounded-xl flex items-center justify-center text-black shrink-0">
                    <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-45" />
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Green Footer Body ── */}
      <div className="bg-accent rounded-tr-[2rem] rounded-tl-[2rem] sm:rounded-tr-[3rem] sm:rounded-tl-[3rem] -mt-8 pt-16 sm:pt-20 pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">

          {/* Main Grid: Brand | Services | Store Hours | Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="flex flex-col gap-4">
                <Link href="/" className="inline-flex">
                <div className="relative flex items-center justify-center w-[180px] sm:w-[200px] bg-black p-3.5 rounded-2xl shadow-lg border border-white/10">
                    <Image
                      src="/images/logo/dark-logo.png"
                      alt="Chand Mobile Expert Logo"
                      width={180}
                      height={60}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </Link>
              <p className="text-sm text-neutral-900/70 max-w-[260px] leading-relaxed">
                {businessConfig.description}
              </p>
              <div className="flex items-center gap-3 text-sm font-semibold text-neutral-900">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" />
                  {businessConfig.rating}/5
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-900/30" />
                <span>{businessConfig.devicesRepaired} Devices Fixed</span>
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="text-xs font-bold text-neutral-900/50 uppercase tracking-wider mb-5">
                Services
              </h3>
              <ul className="space-y-3.5">
                {[
                  { href: "#features", label: "Screen Replacement" },
                  { href: "#features", label: "Battery & Charging Ports" },
                  { href: "#pricing", label: "Board Micro-Soldering" },
                  { href: "#pricing", label: "Buy & Sell Pre-Owned" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-neutral-900/75 hover:text-neutral-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Store Hours Column */}
            <div>
              <h3 className="text-xs font-bold text-neutral-900/50 uppercase tracking-wider mb-5">
                Store Hours
              </h3>
              <ul className="space-y-3.5">
                {businessConfig.hours.map((h, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-neutral-900/50 font-bold uppercase tracking-wider">
                      {h.day}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-xs font-bold text-neutral-900/50 uppercase tracking-wider mb-5">
                Contact
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href={telLink()}
                    className="group flex items-center gap-3 text-sm font-medium text-neutral-900/75 hover:text-neutral-900 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-neutral-900/8 flex items-center justify-center group-hover:bg-neutral-900/15 transition-colors shrink-0">
                      <Phone className="w-3.5 h-3.5 text-neutral-900" />
                    </span>
                    {profile.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={waLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-sm font-medium text-neutral-900/75 hover:text-neutral-900 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-neutral-900/8 flex items-center justify-center group-hover:bg-neutral-900/15 transition-colors shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-900" />
                    </span>
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <a
                    href={mailLink()}
                    className="group flex items-center gap-3 text-sm font-medium text-neutral-900/75 hover:text-neutral-900 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-neutral-900/8 flex items-center justify-center group-hover:bg-neutral-900/15 transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5 text-neutral-900" />
                    </span>
                    <span className="break-all">{profile.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-sm font-medium text-neutral-900/75 hover:text-neutral-900 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-neutral-900/8 flex items-center justify-center group-hover:bg-neutral-900/15 transition-colors shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-900" />
                    </span>
                    <span className="leading-snug">
                      {profile.address}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 sm:mt-12 pt-6 border-t border-neutral-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-neutral-900/55">
            <p>
              © {new Date().getFullYear()} {profile.companyName}. All rights reserved. 1-Year Certified Store Warranty.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900/60 animate-pulse" />
              {profile.address}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
