"use client";
import React, { useState, useEffect } from "react";
import { processSteps, services as defaultServices } from "@/lib/data";
import { useBusinessProfile } from "@/context/BusinessContext";
import { api } from "@/lib/api";
import {
  Smartphone, BatteryCharging, Plug, Camera, Volume2,
  Droplets, Layers, CircuitBoard, Cpu, ArrowUpRight,
  CheckCircle2, Clock, ShieldCheck, LucideIcon, X, Zap,
  User, Phone, FileText, Wrench, Sparkles,
  ArrowDownRight
} from "lucide-react";
import { Pricing } from "@/components/Pricing";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { GradientText } from "@/components/reactbits/GradientText";
import { BlurText } from "@/components/reactbits/BlurText";
import { ShinyLink, ShinyButton } from "@/components/reactbits/ShinyButton";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { Magnet } from "@/components/reactbits/Magnet";
import { StarBorder } from "@/components/reactbits/StarBorder";

// Map string icon names to Lucide components
const IconMap: Record<string, LucideIcon> = {
  Smartphone, BatteryCharging, Plug, Camera, Volume2,
  Droplets, Layers, CircuitBoard, Cpu,
};

export default function ServicesPage() {
  const { waLink, profile } = useBusinessProfile();
  const [services, setServices] = useState<any[]>(defaultServices);
  const [loading, setLoading] = useState(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    deviceModel: "",
    issueDesc: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.get('/services');
        const rawData = Array.isArray(response.data) ? response.data : [];

        if (rawData.length > 0) {
          const mappedServices = rawData.map((s: any) => ({
            ...s,
            iconName: s.icon || "Smartphone",
            priceFrom: s.price || s.priceFrom || "From ₹499",
            time: s.time || "45 Mins",
            warranty: s.warranty || "1 Year Warranty",
            slug: s.id
          }));
          setServices(mappedServices);
        } else {
          setServices(defaultServices);
        }
      } catch {
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const openBookingModal = (service: any) => {
    setSelectedService(service);
    setBookingForm({
      customerName: "",
      customerPhone: "",
      deviceModel: "",
      issueDesc: "",
    });
    setBookingSuccess(false);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await api.post('/book-repairs', bookingForm);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Failed to book repair", error);
      alert("Failed to submit your request. Please try again or contact via WhatsApp.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full pb-16">

      {/* ── Hero Section ── */}
      <section className="flex flex-col relative isolate mb-20 sm:mb-24 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 lg:inset-2.5 -z-10 rounded-bl-[2rem] rounded-br-[2rem] lg:rounded-bl-[2.5rem] lg:rounded-br-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/BG.jpg)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          {/* Accent glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-accent/20 blur-[80px] rounded-full" />
        </div>

        <div className="flex items-start justify-center px-4 sm:px-6 pt-36 sm:pt-44 md:pt-48">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-md text-white text-sm font-semibold mb-8 border border-white/[0.15]">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <DecryptedText
                text="Certified Master Care"
                speed={30}
                className="text-white font-medium"
                encryptedClassName="text-accent font-mono"
              />
            </div>
            <h1 className="text-4xl min-[380px]:text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
              <BlurText
                text="Expert Mobile"
                delay={60}
                className="block"
                direction="top"
              />
              <span className="block mt-1">
                <GradientText colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]} animationSpeed={7}>
                  Repair Services
                </GradientText>
              </span>
            </h1>   
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto">
              From shattered screens to complex motherboard micro-soldering, our master technicians bring your devices back to life with factory-grade precision.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing Estimator ── */}
      <Pricing />

      {/* ── Services Grid ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Wrench className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Our Services
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            What We{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
              Repair
            </GradientText>
          </h2>
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 border-2 border-accent/20 rounded-full absolute" />
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin absolute" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => {
              const Icon = IconMap[service.iconName] || Smartphone;
              const whatsappMsg = `Hello Chand Mobile Expert, I'd like to inquire about the ${service.name} service.`;

              return (
                <SpotlightCard
                  key={service.slug}
                  spotlightColor="#a8d946"
                  intensity={0.1}
                  spotlightSize={260}
                  borderGlow={0.45}
                  proximity={120}
                  className="group flex flex-col bg-card rounded-3xl p-6 sm:p-7 border border-border/50 hover:border-accent/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                >
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/[0.06] dark:bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300 border border-foreground/[0.04] dark:border-accent/10">
                      <Icon className="w-6 h-6 text-foreground/70 group-hover:text-accent transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors duration-300">{service.name}</h3>
                      <p className="text-sm font-semibold text-accent">
                        Starts from {service.priceFrom}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs font-medium text-foreground/50 mb-6">
                    <div className="flex items-center gap-1.5 bg-foreground/[0.04] px-2.5 py-1.5 rounded-lg border border-foreground/[0.05]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-foreground/[0.04] px-2.5 py-1.5 rounded-lg border border-foreground/[0.05]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{service.warranty}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <ShinyButton
                    onClick={() => openBookingModal(service)}
                    shimmerColor="rgba(168,217,70,0.4)"
                    shimmerDuration={1800}
                    className="w-full h-12 mt-auto rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-accent hover:text-black transition-all flex items-center justify-center shadow-md active:scale-95"
                  >
                    Book Repair
                  </ShinyButton>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Process Steps ── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Our Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            How We <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>Work</GradientText>
          </h2>
          <p className="text-foreground/60 text-lg">
            A transparent, rigorous 6-step repair process designed for speed without compromising quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processSteps.map((step, idx) => (
            <SpotlightCard
              key={idx}
              spotlightColor="#a8d946"
              intensity={0.08}
              spotlightSize={240}
              borderGlow={0.35}
              proximity={100}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-card border border-border/80 hover:border-accent/40 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Top Header: Tag Pill on Left + Step Number Badge on Right (Zero Overlap) */}
              <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-[10px] font-bold text-accent uppercase tracking-widest border border-accent/25 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{step.tag}</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.06] border border-border/80 text-xs font-mono font-bold text-accent shrink-0 shadow-2xs">
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {step.title}
                </h3>
                <h4 className="text-xs sm:text-sm font-semibold text-accent/90 mb-3">
                  {step.subtitle}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Faint Background Watermark at Bottom-Right (Safe from any text collision) */}
              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-foreground/[0.03] dark:text-white/[0.03] pointer-events-none select-none font-mono tracking-tighter">
                {step.step}
              </span>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-0">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/[0.07] bg-black">
          <div
            className="absolute inset-0 bg-center bg-no-repeat brightness-50 opacity-40 blur-sm scale-110"
            style={{ backgroundImage: "url(/BG.jpg)", backgroundSize: "cover" }}
            aria-hidden="true"
          />
          {/* Accent glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/25 blur-[60px] rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 sm:px-12 sm:py-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Ready to Restore
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-semibold tracking-tight max-w-2xl mb-6">
              Ready to restore your device?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl">
              Drop by our store or message us on WhatsApp for an instant free quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                  href={waLink()}
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

      {/* ── Booking Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => !bookingLoading && setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141416] border border-slate-200/90 dark:border-white/[0.1] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-slate-900 dark:text-zinc-100"
            style={{ animation: "rb-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <style>{`
              @keyframes rb-modal-in {
                from { opacity: 0; transform: scale(0.94) translateY(8px); }
                to   { opacity: 1; transform: scale(1)    translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Book {selectedService?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Fill in your details to schedule doorstep pickup or lab check-in
                </p>
              </div>
              <button
                type="button"
                onClick={() => !bookingLoading && setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {bookingSuccess ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,217,70,0.3)]">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Received!</h4>
                  <p className="text-slate-600 dark:text-zinc-400 mb-8 text-sm">
                    Our master technicians will review your request and get back to you shortly to confirm the appointment.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                  {[
                    { label: "Full Name", type: "text", field: "customerName" as const, placeholder: "Enter your full name", icon: <User className="w-3.5 h-3.5 text-accent" /> },
                    { label: "Phone Number", type: "tel", field: "customerPhone" as const, placeholder: "Enter 10-digit mobile number", icon: <Phone className="w-3.5 h-3.5 text-accent" /> },
                    { label: "Device Model", type: "text", field: "deviceModel" as const, placeholder: "e.g. iPhone 15 / Samsung S24 / OnePlus 12", icon: <Smartphone className="w-3.5 h-3.5 text-accent" /> },
                  ].map(({ label, type, field, placeholder, icon }) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {icon}
                        {label}
                      </label>
                      <input
                        required
                        type={type}
                        placeholder={placeholder}
                        value={bookingForm[field]}
                        onChange={(e) => setBookingForm({ ...bookingForm, [field]: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#18181b] focus:border-accent focus:ring-2 focus:ring-accent/25 outline-none transition-all text-xs sm:text-sm"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5 mb-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <FileText className="w-3.5 h-3.5 text-accent" />
                      Issue Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the issue (e.g. cracked glass, battery draining fast, no display)"
                      value={bookingForm.issueDesc}
                      onChange={(e) => setBookingForm({ ...bookingForm, issueDesc: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#18181b] focus:border-accent focus:ring-2 focus:ring-accent/25 outline-none transition-all resize-none text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full h-11 mt-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bookingLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Service Request"
                    )}
                  </button>
                  <p className="text-[11px] text-center text-foreground/45 mt-0.5">
                    By submitting, you agree to our repair terms. Free diagnostics included.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
