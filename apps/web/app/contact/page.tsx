"use client";

import React, { useState } from "react";
import Head from "next/head";
import { Phone, MessageCircle, MapPin, Clock, CheckCircle2, Mail, Send, Sparkles, Navigation, ArrowDownRight } from "lucide-react";
import { useBusinessProfile } from "@/context/BusinessContext";
import { api } from "@/lib/api";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { GradientText } from "@/components/reactbits/GradientText";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { Magnet } from "@/components/reactbits/Magnet";
import { StarBorder } from "@/components/reactbits/StarBorder";
import { ShinyButton, ShinyLink } from "@/components/reactbits/ShinyButton";

export default function ContactPage() {
  const { profile, waLink, telLink } = useBusinessProfile();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/general-enquiries', formData);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 6000);
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again or reach out on WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-16">
      <Head>
        <title>Contact Us & Store Location | Chand Mobile Expert</title>
        <meta name="description" content="Get in touch with Chand Mobile Expert for fast, reliable smartphone repairs in Sambhal, Uttar Pradesh." />
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
                text="Priority Desk • 5-Min Response"
                speed={28}
                className="text-white font-medium"
                encryptedClassName="text-accent font-mono"
              />
            </div>
            <h1 className="text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-sm">
              Get in{" "}
              <GradientText colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]} animationSpeed={7}>
                Touch
              </GradientText>
            </h1>
            <p className="text-base sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
              Have a shattered screen, dead battery, or motherboard issue? Speak directly to our certified technicians or visit our lab in Sambhal, UP.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="flex flex-col space-y-12 lg:space-y-16">
          
          {/* ── Row 1: Direct Channels & Store Address ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Left: Quick Communication Cards */}
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Instant Direct Channels
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                  Reach Our Bench Instantly
                </h2>
                <p className="text-foreground/70 text-sm sm:text-base">
                  Choose your preferred channel for fast diagnosis, quotes, and walk-in scheduling.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                {/* WhatsApp Card with TiltedCard */}
                <TiltedCard maxTilt={8} scale={1.02} glareColor="#25D366" glareMaxOpacity={0.16} className="h-full">
                  <a
                    href={waLink("Hello Chand Mobile Expert, I need an express quote for my device.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col p-6 rounded-3xl bg-card border border-border/60 hover:border-[#25D366]/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-[#25D366]" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">WhatsApp Chat</h3>
                    <p className="text-foreground/60 text-xs mb-4">Fastest response for estimates and photos.</p>
                    <span className="text-[#25D366] font-bold text-xs mt-auto group-hover:underline flex items-center gap-1">
                      Start Conversation →
                    </span>
                  </a>
                </TiltedCard>

                {/* Phone Card with TiltedCard */}
                <TiltedCard maxTilt={8} scale={1.02} glareColor="#a8d946" glareMaxOpacity={0.16} className="h-full">
                  <a
                    href={telLink()}
                    className="group flex flex-col p-6 rounded-3xl bg-card border border-border/60 hover:border-accent/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Call Lab Directly</h3>
                    <p className="text-foreground/60 text-xs mb-4">Speak directly with a master technician.</p>
                    <span className="text-accent font-bold text-xs mt-auto group-hover:underline flex items-center gap-1">
                      {profile.phone} →
                    </span>
                  </a>
                </TiltedCard>
              </div>

              {/* Email Support Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-foreground/5 border border-border/50 flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground/60">Email Support</p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{profile.email}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-xs font-semibold text-accent hover:underline shrink-0"
                >
                  Write Email →
                </a>
              </div>
            </div>

            {/* Right: Address & Hours with SpotlightCard */}
            <SpotlightCard
              spotlightColor="#a8d946"
              intensity={0.12}
              spotlightSize={320}
              borderGlow={0.4}
              className="bg-foreground text-background rounded-3xl p-5 sm:p-9 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <MapPin className="w-56 h-56" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  Store Open Today
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">{profile.city || "Sambhal"}, {profile.state || "Uttar Pradesh"}</h3>
                <p className="text-background/80 text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                  {profile.address}. Dedicated customer service counter, fast diagnosis, and express priority intake.
                </p>

                <div className="space-y-4 pt-6 border-t border-white/15">
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Opening Hours</p>
                      <p className="text-xs text-white/70">{profile.openingHours}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Location</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{profile.address}</p>
                </div>
                <Magnet padding={15} magnetStrength={2}>
                  <a
                    href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent/90 transition-colors shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </a>
                </Magnet>
              </div>
            </SpotlightCard>

          </div>

          {/* ── Row 2: Interactive Contact Form & Map ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Left: Contact Form Wrapped in SpotlightCard */}
            <SpotlightCard
              spotlightColor="#a8d946"
              intensity={0.08}
              spotlightSize={300}
              borderGlow={0.35}
              className="bg-card rounded-3xl p-7 sm:p-10 shadow-lg border border-border/50 relative overflow-hidden flex flex-col justify-between"
            >
              {isSubmitted && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 bg-card/98 backdrop-blur-md animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Message Received!</h3>
                  <p className="text-foreground/70 text-sm sm:text-base max-w-sm">
                    Thank you! Our master technicians will review your details and contact you within 15 minutes.
                  </p>
                </div>
              )}

              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-3">
                  <Send className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Express Inquiry
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
                  Send us a Message
                </h2>
                <p className="text-foreground/70 text-sm mb-7">
                  Fill out the form below and we will get back to you with diagnostic insights and pricing.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-foreground/80">Full Name *</label>
                      <input
                        type="text"
                        required
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="px-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-bold text-foreground/80">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter 10-digit mobile number"
                        className="px-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-foreground/80">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="px-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="subject" className="text-xs font-bold text-foreground/80">Phone Model / Issue *</label>
                      <input
                        type="text"
                        required
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. iPhone 15 / Samsung S24 / OnePlus 12"
                        className="px-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label htmlFor="message" className="text-sm font-semibold text-foreground/80">Message</label>
                    <textarea required id="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Describe your device issue or inquiry in detail..." className="px-4 py-3.5 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-300 text-foreground text-sm resize-none shadow-inner hover:bg-foreground/10 flex-1 min-h-[120px]"></textarea>
                  </div>
                  <button type="submit" disabled={isLoading} className="group flex w-full h-12 mt-4 rounded-xl overflow-hidden bg-foreground disabled:opacity-70 disabled:cursor-not-allowed shrink-0">
                    <span className="flex-1 flex items-center px-5 text-background text-sm font-medium">{isLoading ? "Sending..." : "Submit Request"}</span>
                    <span className="w-12 h-12 flex items-center justify-center bg-accent text-black shrink-0">
                      <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-45" />
                    </span>
                  </button>
                </form>
              </div>
            </SpotlightCard>

            {/* Right: Map Embed with Glassmorphic Floating Badge */}
            <div className="w-full min-h-[420px] h-full rounded-3xl overflow-hidden shadow-lg border border-border/50 group relative">
              <iframe
                src={profile.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full filter grayscale-[15%] contrast-[92%]"
                title="Chand Mobile Expert Google Map"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none z-10" />
              
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 pointer-events-none">
                <div className="bg-background/85 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-xs sm:text-sm truncate">{profile.companyName}</p>
                    <p className="text-foreground/70 text-[11px] sm:text-xs truncate">{profile.address}</p>
                  </div>
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-accent rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

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
              Need a quote right now?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl">
              Message us on WhatsApp. Our technicians usually reply within 5 minutes with a price and turnaround estimate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href={waLink("Hello Chand Mobile Expert, I need a repair quote.")}
                  target="_blank"
                  rel="noopener noreferrer"
                className="group relative inline-flex items-center w-full sm:w-auto"
              >
                <span className="absolute right-0 inset-y-0 w-[calc(100%-1.5rem)] rounded-xl bg-accent" />
                <span className="relative z-10 px-6 py-3.5 rounded-xl bg-white text-black text-sm font-bold flex-1 text-center whitespace-nowrap">Get WhatsApp Quote</span>
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
