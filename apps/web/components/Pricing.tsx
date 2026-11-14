"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useBusinessProfile } from "@/context/BusinessContext";
import { services } from "@/lib/data";
import {
  ChevronDown,
  MessageCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  Wrench,
  Zap,
  Check,
  Search,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  ArrowDownRight,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { GradientText } from "@/components/reactbits/GradientText";
import { ShinyLink } from "@/components/reactbits/ShinyButton";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { Magnet } from "@/components/reactbits/Magnet";

// ── Device Data ────────────────────────────────────────────────────────────────
const brandModels: Record<string, string[]> = {
  Apple: [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 12",
    "iPhone 11",
  ],
  Samsung: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23 FE",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy A55",
    "Galaxy A54",
    "Galaxy M54",
  ],
  OnePlus: [
    "OnePlus 12",
    "OnePlus 12R",
    "OnePlus 11",
    "OnePlus 11R",
    "OnePlus 10 Pro",
    "OnePlus Nord 3",
    "OnePlus Nord CE 3",
    "OnePlus Nord CE 3 Lite",
  ],
  "Google Pixel": [
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 8a",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 7a",
    "Pixel 6a",
  ],
  Xiaomi: [
    "Xiaomi 14 Ultra",
    "Xiaomi 14",
    "Xiaomi 13 Pro",
    "Redmi Note 13 Pro+",
    "Redmi Note 13",
    "Redmi Note 12 Pro",
    "Poco X6 Pro",
    "Poco F5",
  ],
  Oppo: ["Reno 11 Pro", "Reno 11", "Reno 10 Pro", "Find N3 Flip", "F25 Pro", "F23"],
  Vivo: ["X100 Pro", "X100", "X90 Pro", "V30 Pro", "V30", "V29 Pro", "T2 Pro", "Y200"],
  Realme: ["Realme 12 Pro+", "Realme 12 Pro", "Realme 11 Pro+", "GT Neo 3", "Narzo 60 Pro"],
  Motorola: ["Edge 50 Pro", "Edge 40 Neo", "Edge 40", "Moto G84", "Moto G54"],
  Nothing: ["Nothing Phone (2)", "Nothing Phone (2a)", "Nothing Phone (1)"],
};

const topBrands = ["Apple", "Samsung", "OnePlus", "Google Pixel", "Xiaomi"];

interface ConditionOption {
  key: string;
  label: string;
  subtitle: string;
  accentColor: string;
  ringColor: string;
  bgGlow: string;
}

const conditionOptions: ConditionOption[] = [
  {
    key: "Excellent",
    label: "Excellent",
    subtitle: "Like New",
    accentColor: "text-emerald-400",
    ringColor: "border-emerald-500/40",
    bgGlow: "bg-emerald-500/10",
  },
  {
    key: "Good",
    label: "Good",
    subtitle: "Light Wear",
    accentColor: "text-sky-400",
    ringColor: "border-sky-500/40",
    bgGlow: "bg-sky-500/10",
  },
  {
    key: "Fair",
    label: "Fair",
    subtitle: "Scratched",
    accentColor: "text-amber-400",
    ringColor: "border-amber-500/40",
    bgGlow: "bg-amber-500/10",
  },
  {
    key: "Poor",
    label: "Poor",
    subtitle: "Cracked",
    accentColor: "text-orange-400",
    ringColor: "border-orange-500/40",
    bgGlow: "bg-orange-500/10",
  },
  {
    key: "Dead/Not Powering",
    label: "Dead",
    subtitle: "No Power",
    accentColor: "text-rose-400",
    ringColor: "border-rose-500/40",
    bgGlow: "bg-rose-500/10",
  },
];

// ── Searchable / Custom Dropdown ────────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  hint?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: (string | SelectOption)[];
  icon: React.ReactNode;
  label: string;
  badge?: string;
  placeholderSearch?: string;
  enableSearch?: boolean;
}

function CustomSelect({
  value,
  onChange,
  options,
  icon,
  label,
  badge,
  placeholderSearch,
  enableSearch = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.hint && opt.hint.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  const currentOption = normalizedOptions.find((o) => o.value === value) || {
    value,
    label: value,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, enableSearch]);

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      {/* Label Row */}
      <div className="flex items-center justify-between text-xs font-semibold text-white/70 select-none px-0.5">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-white/50">
          {icon}
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-medium text-accent/80 tracking-wide bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
            {badge}
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`
            w-full flex items-center justify-between rounded-xl px-4 py-3.5
            text-sm font-medium text-white transition-all duration-200 cursor-pointer text-left
            ${
              isOpen
                ? "bg-[#12131a] border-accent/60 shadow-[0_0_20px_rgba(168,217,70,0.18)] border"
                : "bg-white/[0.04] border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.07]"
            }
          `}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="truncate font-medium text-white text-sm">
              {currentOption.label}
            </span>
            {currentOption.badge && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30">
                {currentOption.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-accent" : ""
            }`}
          />
        </button>

        {/* Floating Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute z-50 left-0 right-0 mt-2 bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
            style={{ minWidth: "100%" }}
          >
            {enableSearch && (
              <div className="p-2 border-b border-white/[0.06]">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholderSearch || "Search..."}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-white/40 text-center">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer
                        ${
                          isSelected
                            ? "bg-accent/15 text-accent font-semibold border border-accent/25"
                            : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                        }
                      `}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.hint && (
                          <span className="text-[11px] text-white/40 font-normal">
                            {opt.hint}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-accent/20 text-accent"
                                : "bg-white/[0.06] text-white/50"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Pricing Component ─────────────────────────────────────────────────────
export function Pricing() {
  const { waLink: dynamicWaLink } = useBusinessProfile();
  const [brandsData, setBrandsData] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [selectedModel, setSelectedModel] = useState("iPhone 15 Pro Max");
  const [selectedService, setSelectedService] = useState("Screen Replacement");
  const [selectedCondition, setSelectedCondition] = useState("Good");
  const [priceAnimating, setPriceAnimating] = useState(false);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Fetch live brands & services from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [brandsRes, servicesRes] = await Promise.all([
          fetch("/api/brands").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/services").then((r) => (r.ok ? r.json() : [])),
        ]);

        if (!isMounted) return;

        if (Array.isArray(brandsRes) && brandsRes.length > 0) {
          setBrandsData(brandsRes);
          const firstBrand = brandsRes[0];
          if (firstBrand && firstBrand.devices && firstBrand.devices.length > 0) {
            setSelectedBrand(firstBrand.name);
            setSelectedModel(firstBrand.devices[0].name);
          }
        }
        if (Array.isArray(servicesRes) && servicesRes.length > 0) {
          setDbServices(servicesRes);
        }
      } catch (err) {
        console.error("Failed to load live brands/services:", err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live brand models
  const currentBrandModels = useMemo<Record<string, string[]>>(() => {
    if (brandsData.length > 0) {
      const map: Record<string, string[]> = {};
      brandsData.forEach((b) => {
        const devNames = (b.devices || []).map((d: any) => d.name);
        if (devNames.length > 0) {
          map[b.name] = devNames;
        }
      });
      if (Object.keys(map).length > 0) return map;
    }
    return brandModels;
  }, [brandsData]);

  // Compute live top brands
  const currentTopBrands = useMemo<string[]>(() => {
    if (brandsData.length > 0) {
      return brandsData.slice(0, 5).map((b) => b.name);
    }
    return topBrands;
  }, [brandsData]);

  const serviceObj = useMemo(() => {
    if (dbServices.length > 0) {
      const found = dbServices.find((s) => s.name === selectedService);
      if (found) return found;
    }
    return services.find((s) => s.name === selectedService) || services[0];
  }, [dbServices, selectedService]);

  // Find matching device & device-service in database
  const currentBrandObj = useMemo(
    () => brandsData.find((b) => b.name === selectedBrand),
    [brandsData, selectedBrand]
  );

  const currentDeviceObj = useMemo(
    () => currentBrandObj?.devices?.find((d: any) => d.name === selectedModel),
    [currentBrandObj, selectedModel]
  );

  const matchedDeviceService = useMemo(() => {
    if (!currentDeviceObj?.services) return null;
    return currentDeviceObj.services.find(
      (s: any) =>
        s.service?.name?.toLowerCase() === selectedService.toLowerCase() ||
        s.serviceName?.toLowerCase() === selectedService.toLowerCase()
    );
  }, [currentDeviceObj, selectedService]);

  // Dynamic calculated price
  const estimatedPrice = useMemo(() => {
    if (matchedDeviceService && matchedDeviceService.price) {
      const dbPrice = parseFloat(matchedDeviceService.price);
      let finalPrice = dbPrice;
      if (selectedCondition === "Excellent" || selectedCondition === "Good") {
        finalPrice -= 150;
      } else if (selectedCondition === "Poor" || selectedCondition === "Dead/Not Powering") {
        finalPrice += 350;
      }
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Math.max(finalPrice, 499));
    }

    let basePrice = parseInt(serviceObj.priceFrom?.replace(/[^0-9]/g, "") || "1499", 10);
    if (selectedBrand === "Apple" || selectedBrand === "Samsung") basePrice += 1000;
    else if (selectedBrand === "Google Pixel" || selectedBrand === "OnePlus") basePrice += 500;
    if (
      selectedModel.includes("Pro") ||
      selectedModel.includes("Ultra") ||
      selectedModel.includes("Max") ||
      selectedModel.includes("Fold")
    ) {
      basePrice += 1500;
    }
    if (selectedCondition === "Excellent" || selectedCondition === "Good") basePrice -= 200;
    if (selectedCondition === "Poor" || selectedCondition === "Dead/Not Powering") {
      basePrice += 500;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(basePrice);
  }, [matchedDeviceService, selectedBrand, selectedModel, selectedCondition, serviceObj.priceFrom]);

  // Price animation trigger
  const prevPrice = useRef(estimatedPrice);
  useEffect(() => {
    if (prevPrice.current !== estimatedPrice) {
      setPriceAnimating(true);
      prevPrice.current = estimatedPrice;
      const t = setTimeout(() => setPriceAnimating(false), 350);
      return () => clearTimeout(t);
    }
  }, [estimatedPrice]);

  const whatsappMsg = `Hello Chand Mobile Expert, I want to book a repair for ${selectedBrand} ${selectedModel} — ${selectedService} (${selectedCondition} condition). Estimated price: ${estimatedPrice}.`;

  const activeCondition =
    conditionOptions.find((c) => c.key === selectedCondition) || conditionOptions[1];

  // Service options with pricing hints
  const serviceOptions: SelectOption[] = useMemo(() => {
    if (dbServices.length > 0) {
      return dbServices.map((s) => ({
        value: s.name,
        label: s.name,
        badge: s.priceFrom || "From ₹499",
        hint: `${s.time || "30-45m"} · ${s.warranty || "1 Yr Warranty"}`,
      }));
    }
    return services
      .filter((s) => s.category === "repair")
      .map((s) => ({
        value: s.name,
        label: s.name,
        badge: s.priceFrom,
        hint: `${s.time || "30-45m"} · ${s.warranty || "1 Yr Warranty"}`,
      }));
  }, [dbServices]);

  const handleBookRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setBookingError("Please provide your full name and contact number.");
      return;
    }
    setIsSubmittingBooking(true);
    setBookingError("");
    try {
      const res = await fetch("/api/book-repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deviceModel: `${selectedBrand} ${selectedModel}`,
          issueDesc: `${selectedService} (${selectedCondition} condition) - Estimate: ${estimatedPrice}${
            bookingNotes ? ` | Note: ${bookingNotes.trim()}` : ""
          }`,
        }),
      });

      if (!res.ok) {
        throw new Error("Server returned status " + res.status);
      }
      setBookingSubmitted(true);
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setBookingError("Failed to submit booking directly. Please message us on WhatsApp!");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <section id="pricing" className="w-full px-4 sm:px-6 py-16 sm:py-20 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Live Database Pricing Engine"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Instant Device{" "}
            <GradientText
              colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]}
              animationSpeed={6}
              className="font-bold"
            >
              Repair Estimate
            </GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-foreground/60 leading-relaxed">
            Configure your device and issue below for an instant, real-time quote powered by our live repair catalog. Genuine parts,
            upfront pricing, and comprehensive 12-month store warranty.
          </p>
        </div>

        {/* Calculator Main Card */}
        <SpotlightCard
          className="relative bg-[#07080b] border border-white/[0.09] rounded-3xl lg:rounded-[2.5rem] shadow-[0_32px_90px_rgba(0,0,0,0.7)] overflow-hidden"
          spotlightColor="#a8d946"
          intensity={0.08}
          spotlightSize={450}
          proximity={180}
          borderGlow={0.35}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* ── Left Column: Device Configuration (7 cols) ── */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,217,70,0.2)]">
                    <Wrench className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Device Configuration
                    </h3>
                    <p className="text-xs text-white/45">
                      Select model, fault & device state
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/25">
                    <Sparkles className="w-3 h-3" />
                    Database Sync
                  </span>
                </div>
              </div>

              {/* Quick Brand Tabs */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/50 px-0.5">
                  <span className="uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-accent" />
                    Popular Brands
                  </span>
                  <span className="text-[10px] text-white/40">Quick switch</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentTopBrands.map((brand) => {
                    const isSelected = selectedBrand === brand;
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brand);
                          const models = currentBrandModels[brand] || [];
                          if (models.length > 0) {
                            setSelectedModel(models[0]);
                          }
                        }}
                        className={`
                          px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
                          ${
                            isSelected
                              ? "bg-accent text-black shadow-[0_0_15px_rgba(168,217,70,0.35)] scale-[1.02]"
                              : "bg-white/[0.04] text-white/70 border border-white/[0.08] hover:border-white/20 hover:text-white hover:bg-white/[0.07]"
                          }
                        `}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Selects: Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                <CustomSelect
                  label="All Brands"
                  icon={<Smartphone className="w-3.5 h-3.5 text-accent" />}
                  value={selectedBrand}
                  onChange={(brand) => {
                    setSelectedBrand(brand);
                    const models = currentBrandModels[brand] || [];
                    if (models.length > 0) {
                      setSelectedModel(models[0]);
                    }
                  }}
                  options={Object.keys(currentBrandModels)}
                  badge={`${Object.keys(currentBrandModels).length} Brands`}
                />

                <CustomSelect
                  label="Device Model"
                  icon={
                    <svg
                      className="w-3.5 h-3.5 text-accent"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  }
                  value={selectedModel}
                  onChange={setSelectedModel}
                  options={currentBrandModels[selectedBrand] || []}
                  enableSearch={true}
                  placeholderSearch={`Search ${selectedBrand} models...`}
                  badge={`${(currentBrandModels[selectedBrand] || []).length} models`}
                />
              </div>

              {/* Repair Service Selector */}
              <CustomSelect
                label="Repair Service Needed"
                icon={<Wrench className="w-3.5 h-3.5 text-accent" />}
                value={selectedService}
                onChange={setSelectedService}
                options={serviceOptions}
                badge={serviceObj.time || "Quick Service"}
              />

              {/* Device Physical Condition: Interactive 5-Step Segmented Grid */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-white/70 px-0.5">
                  <span className="uppercase tracking-wider text-[11px] text-white/50 flex items-center gap-1.5 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    Physical Condition
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${activeCondition.accentColor} ${activeCondition.bgGlow} ${activeCondition.ringColor}`}
                  >
                    ● {activeCondition.label} ({activeCondition.subtitle})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {conditionOptions.map((cond) => {
                    const isSelected = selectedCondition === cond.key;
                    return (
                      <button
                        key={cond.key}
                        type="button"
                        onClick={() => setSelectedCondition(cond.key)}
                        className={`
                          flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all duration-200 cursor-pointer border
                          ${
                            isSelected
                              ? `${cond.bgGlow} ${cond.ringColor} border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-[1.03]`
                              : "bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]"
                          }
                        `}
                      >
                        <span
                          className={`text-xs font-bold truncate max-w-full ${
                            isSelected ? cond.accentColor : "text-white/80"
                          }`}
                        >
                          {cond.label}
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5">
                          {cond.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[11px] font-medium text-white/70">
                    OEM Grade-A Parts
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[11px] font-medium text-white/70">
                    12-Month Guarantee
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <CalendarCheck className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[11px] font-medium text-white/70">
                    Zero Prepayment
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Estimate Card (5 cols) ── */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white/[0.015] relative overflow-hidden">
              {/* Subtle ambient glows */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-accent/[0.09] rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/[0.05] rounded-full blur-[70px] pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-widest text-accent uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Instant Estimate
                    </span>
                    <div className="flex items-center gap-1.5 bg-accent/15 border border-accent/30 px-2.5 py-1 rounded-full">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                      </span>
                      <span className="text-[10px] font-bold text-accent whitespace-nowrap">
                        Free Diagnostic
                      </span>
                    </div>
                  </div>

                  {/* Device Configuration Summary Chip */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] mb-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                      Selected Device
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {selectedBrand} {selectedModel}
                    </div>
                    <div className="text-xs text-accent mt-0.5 truncate flex items-center gap-1.5 font-medium">
                      <span>{selectedService}</span>
                      <span className="text-white/30">•</span>
                      <span className={activeCondition.accentColor}>
                        {selectedCondition}
                      </span>
                    </div>
                  </div>

                  {/* Big Animated Price */}
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span
                        className={`text-3xl min-[380px]:text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums transition-all duration-300 ${
                          priceAnimating
                            ? "scale-110 text-accent"
                            : "scale-100 text-white"
                        }`}
                        style={{
                          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        {estimatedPrice}
                      </span>
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest pb-1">
                        Inc. GST
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 font-medium">
                      Transparent labor & hardware included. No hidden fee.
                    </p>
                  </div>
                </div>

                {/* Specs List */}
                <div className="space-y-3 py-4 border-y border-white/[0.07]">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>Estimated Turnaround</span>
                    </div>
                    <span className="font-semibold text-white">
                      {serviceObj.time || "30–45 min"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
                      <span>Store Warranty</span>
                    </div>
                    <span className="font-semibold text-accent">
                      {serviceObj.warranty || "1 Year Coverage"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Zap className="w-3.5 h-3.5 text-white/40" />
                      <span>Diagnostic Inspection</span>
                    </div>
                    <span className="font-semibold text-emerald-400">
                      100% Free (₹0)
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-6 flex flex-col gap-3">
                  {/* WhatsApp */}
                  <a
                    href={dynamicWaLink(whatsappMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full flex items-center justify-center gap-2.5 bg-accent/15 border-2 border-accent/30 hover:bg-accent text-white hover:text-black rounded-xl py-3.5 px-5 text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(163,230,53,0.1)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)]"
                  >
                    <MessageCircle className="w-4 h-4 text-accent group-hover:text-black transition-colors" />
                    Get WhatsApp Quote
                  </a>

                  {/* Book Repair Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingError("");
                      setIsBookingOpen(true);
                    }}
                    className="group relative flex items-center w-full mt-1 cursor-pointer"
                  >
                    <span className="absolute right-0 inset-y-0 w-[calc(100%-1.5rem)] rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors" />
                    <span className="relative z-10 px-5 py-3 rounded-xl bg-white text-black text-sm font-bold flex-1 text-left">
                      Book Repair Now
                    </span>
                    <span className="relative -left-px z-10 w-[44px] h-[44px] rounded-xl flex items-center justify-center text-white shrink-0 bg-transparent group-hover:text-accent transition-colors">
                      <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-45" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ── Interactive Booking Modal ── */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0e1017] border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSubmitted ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-9 h-9 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Repair Request Received!</h3>
                <p className="text-sm text-white/70 max-w-sm mb-6 leading-relaxed">
                  Thank you, <span className="font-semibold text-white">{customerName}</span>. Your booking for{" "}
                  <span className="text-accent font-semibold">{selectedBrand} {selectedModel}</span> ({selectedService}) has been logged in our system.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <a
                    href={dynamicWaLink(`Hello Chand Mobile Expert, I just booked a repair online for ${selectedBrand} ${selectedModel} - ${selectedService} (Estimate: ${estimatedPrice}). My phone is ${customerPhone}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-accent text-black font-bold text-sm text-center hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Notify on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="py-3 px-5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Schedule Priority Repair</h3>
                    <p className="text-xs text-white/50">Direct intake & bench reservation</p>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">
                      {selectedBrand} {selectedModel}
                    </div>
                    <div className="text-white/60 mt-0.5">
                      {selectedService} • {selectedCondition} condition
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-extrabold text-base">
                      {estimatedPrice}
                    </div>
                    <div className="text-[10px] text-white/40">Pay after repair</div>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBookRepairSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Phone Number (WhatsApp preferred)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Special Notes / Symptoms (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Screen flickering after minor drop..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-accent resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="px-6 py-2.5 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(168,217,70,0.3)] flex items-center gap-2 disabled:opacity-60"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
