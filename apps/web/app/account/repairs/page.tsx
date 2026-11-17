"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench,
  Search,
  Smartphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  X,
  ChevronRight,
  AlertCircle,
  Cpu,
} from "lucide-react";

interface RepairRecord {
  id: string;
  bookingNumber: string;
  createdAt: string;
  deviceModel: string;
  issueDesc: string;
  customerName: string;
  customerPhone: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  adminNotes?: string;
  estimatedCost?: number;
}

export default function RepairsPage() {
  const { user } = useAuthStore();
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      setIsLoading(true);
      try {
        const phoneParam = user?.phone ? `?phone=${encodeURIComponent(user.phone)}` : "";
        const res = await api.get(`/book-repairs/my-repairs${phoneParam}`);
        if (res.data && Array.isArray(res.data)) {
          const mapped: RepairRecord[] = res.data.map((r: any) => ({
            id: r.id,
            bookingNumber: `REP-${r.id.substring(0, 6).toUpperCase()}`,
            createdAt: new Date(r.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            deviceModel: r.deviceModel || "Smartphone Device",
            issueDesc: r.issueDesc || "Hardware/Software Diagnosis",
            customerName: r.customerName || "Customer",
            customerPhone: r.customerPhone || "",
            status: r.status || "PENDING",
            adminNotes: r.adminNotes || undefined,
            estimatedCost: r.estimatedCost || 1499,
          }));
          setRepairs(mapped);
        }
      } catch (error) {
        console.error("Failed to load user repairs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const filteredRepairs = repairs.filter((rep) => {
    const matchesFilter = filterStatus === "ALL" || rep.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      rep.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.issueDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: RepairRecord["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "CONFIRMED":
        return "bg-accent/15 text-accent-foreground dark:text-accent border-accent/25";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70 dark:border-white/[0.08]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              My Repairs & Service
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Live lab diagnosis updates, chip-level inspection tracking, and genuine parts warranty logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] border border-border/60 dark:border-white/10 text-foreground/80">
              {repairs.length} {repairs.length === 1 ? "Repair" : "Repairs"} Booked
            </span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 pb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by token, device model, or issue..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border/80 dark:border-white/10 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-foreground/[0.04] dark:bg-white/[0.05] rounded-xl border border-border/60 dark:border-white/10 overflow-x-auto modal-scrollbar">
            {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].map((st) => {
              const isSelected = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "text-background dark:text-slate-950 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="repairFilterPill"
                      className="absolute inset-0 bg-foreground dark:bg-white rounded-lg shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{st === "IN_PROGRESS" ? "In Lab" : st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Syncing repair lab bookings from database...</p>
          </div>
        ) : filteredRepairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/80 dark:border-white/10 rounded-2xl bg-foreground/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-muted-foreground mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No repair bookings found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
              {searchQuery
                ? `No service queries matching "${searchQuery}".`
                : "Need broken screen replacement, battery repair, or motherboard diagnostics? Book doorstep pickup."}
            </p>
            <Link
              href="/services"
              className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Book Phone Repair</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <AnimatePresence mode="popLayout">
              {filteredRepairs.map((repair, idx) => (
                <motion.div
                  key={repair.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.2) }}
                  className="p-5 sm:p-6 rounded-2xl bg-foreground/[0.01] dark:bg-white/[0.02] border border-border/80 dark:border-white/10 hover:border-border transition-all space-y-4 shadow-2xs"
                >
                  {/* Repair Card Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60 dark:border-white/[0.06]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-foreground">
                          #{repair.bookingNumber}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            repair.status
                          )}`}
                        >
                          {repair.status === "IN_PROGRESS" ? "In Lab Diagnosis" : repair.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Booked on {repair.createdAt} • Registered for Doorstep Service
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-accent/15 text-accent-foreground dark:text-accent border border-accent/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        6M Warranty Included
                      </span>
                    </div>
                  </div>

                  {/* Device & Issue Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Device Model</p>
                        <p className="text-sm font-bold text-foreground">{repair.deviceModel}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.04] text-foreground flex items-center justify-center shrink-0 border border-border/60">
                        <Cpu className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reported Issue</p>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {repair.issueDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technician Notes (if available) */}
                  {repair.adminNotes && (
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Lab Technician Note:
                        </span>
                        <p className="text-xs text-muted-foreground">{repair.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Repair Footer & Actions */}
                  <div className="pt-3 border-t border-border/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Estimated Cost: <span className="font-bold text-foreground">₹{repair.estimatedCost?.toLocaleString("en-IN") || "Quote Pending"}</span> (Post-inspection confirmation)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRepair(repair)}
                        className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/60 dark:border-white/10"
                      >
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Track Lab Status</span>
                      </button>

                      <a
                        href={`https://wa.me/919758677978?text=Hello%20Chand%20Mobile%20Expert,%20I%20want%20to%20check%20repair%20status%20for%20Token%20${repair.bookingNumber}%20(${repair.deviceModel})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Lab</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* REPAIR LAB TRACKING MODAL */}
      {selectedRepair && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedRepair(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#141416] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-6 text-zinc-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 dark:bg-accent/15 text-slate-950 dark:text-accent flex items-center justify-center border border-accent/30 shrink-0">
                  <Wrench className="w-5 h-5 text-accent-foreground dark:text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Repair Status #{selectedRepair.bookingNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Device: {selectedRepair.deviceModel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRepair(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Diagnostic Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Reported Issue:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[240px] truncate">
                  {selectedRepair.issueDesc}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Estimated Lab Quote:</span>
                <span className="font-bold text-slate-900 dark:text-accent">
                  ₹{selectedRepair.estimatedCost?.toLocaleString("en-IN") || "Inspection Pending"}
                </span>
              </div>
              {selectedRepair.adminNotes && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                  <p className="font-semibold text-slate-700 dark:text-zinc-300">Technician Diagnostic Note:</p>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5 italic">"{selectedRepair.adminNotes}"</p>
                </div>
              )}
            </div>

            {/* Visual Stepper */}
            <div className="space-y-6 pl-2 py-1">
              {[
                { title: "Booking Confirmed & Technician Assigned", time: `${selectedRepair.createdAt}`, completed: true },
                {
                  title: "Doorstep Pickup / In-Lab Device Check-in",
                  time: "Diagnostic intake & physical inspection",
                  completed: selectedRepair.status !== "PENDING",
                },
                {
                  title: "Chip-Level & Component Replacement",
                  time: "Genuine OEM parts installation",
                  completed: selectedRepair.status === "IN_PROGRESS" || selectedRepair.status === "COMPLETED",
                },
                {
                  title: "48-Point QA Testing & Final Dispatch",
                  time: "6 Months Warranty Seal Applied",
                  completed: selectedRepair.status === "COMPLETED",
                },
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                      step.completed
                        ? "bg-slate-900 text-white dark:bg-accent dark:text-slate-950 shadow-xs ring-4 ring-accent/20"
                        : "bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-zinc-500 border border-slate-200 dark:border-white/10"
                    }`}
                  >
                    {step.completed ? "✓" : idx + 1}
                  </div>
                  {idx !== 3 && (
                    <div
                      className={`absolute left-3.5 top-7 w-0.5 h-8 transition-colors ${
                        step.completed ? "bg-slate-900 dark:bg-accent" : "bg-slate-200 dark:bg-white/10"
                      }`}
                    />
                  )}
                  <div>
                    <p className={`text-xs sm:text-sm font-semibold ${step.completed ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/919758677978?text=Hello%20Chand%20Mobile%20Expert,%20I%20want%20to%20check%20repair%20status%20for%20Token%20${selectedRepair.bookingNumber}%20(${selectedRepair.deviceModel})`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors border border-emerald-500/20"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Lab Engineer</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedRepair(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
