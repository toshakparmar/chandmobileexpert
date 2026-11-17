"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "motion/react";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ShinyButton } from "@/components/reactbits/ShinyButton";
import {
  Package,
  Search,
  Truck,
  FileText,
  X,
  Printer,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
  Check,
  Copy,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  BadgeCheck,
  HelpCircle,
  ExternalLink,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { printTaxInvoice, numberToWordsINR } from "@/lib/invoicePrint";


interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: string;
}

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<OrderRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {}
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;
    const customerName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Valued Customer";
    printTaxInvoice(selectedInvoice, customerName);
  };

  useEffect(() => {
    if (selectedInvoice) {
      document.body.classList.add("has-active-invoice");
    } else {
      document.body.classList.remove("has-active-invoice");
    }
    return () => {
      document.body.classList.remove("has-active-invoice");
    };
  }, [selectedInvoice]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchOrders = async () => {
      setIsLoading(true);

      // 1. Instantly load from local storage cache for smooth instant UI response
      let localCached: OrderRecord[] = [];
      try {
        const cached = localStorage.getItem("cme_user_orders");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localCached = parsed;
            if (isSubscribed) {
              setOrders(localCached);
            }
          }
        }
      } catch (e) {}

      // 2. Fetch live from backend database
      try {
        let resolvedEmail = user?.email;
        let resolvedPhone = user?.phone;

        if (!resolvedEmail && typeof window !== "undefined") {
          try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
              const parsed = JSON.parse(authStorage);
              resolvedEmail = parsed.state?.user?.email;
              resolvedPhone = parsed.state?.user?.phone;
            }
          } catch (e) {}
        }

        const userParam = resolvedEmail
          ? `?email=${encodeURIComponent(resolvedEmail)}`
          : resolvedPhone
          ? `?phone=${encodeURIComponent(resolvedPhone)}`
          : "";

        const res = await api.get(`/orders/my-orders${userParam}`);
        if (isSubscribed && res.data && Array.isArray(res.data)) {
          const mapped: OrderRecord[] = res.data.map((o: any) => ({
            id: o.id,
            orderNumber: `CME-${o.id.substring(0, 6).toUpperCase()}`,
            createdAt: new Date(o.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: o.status || "CONFIRMED",
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod:
              o.paymentMethod === "TEST_ORDER_NO_PAYMENT"
                ? "Test Order (No Payment)"
                : o.paymentMethod || "Online Payment",
            shippingAddress: o.shippingAddress
              ? `${o.shippingAddress.name ? o.shippingAddress.name + " • " : ""}${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state || ""} ${o.shippingAddress.postalCode ? "– " + o.shippingAddress.postalCode : ""}`
              : "Saved Customer Address",
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              name: it.product?.name || "Accessory Product",
              price: Number(it.price || 0),
              quantity: it.quantity || 1,
              image: it.product?.image || null,
            })),
          }));

          // Merge backend database orders with any local test orders
          const combined = [...mapped];
          for (const loc of localCached) {
            if (!combined.some((item) => item.id === loc.id)) {
              combined.push(loc);
            }
          }

          setOrders(combined);
          localStorage.setItem("cme_user_orders", JSON.stringify(combined));
        }
      } catch (error) {
        console.error("Failed to load user orders:", error);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = filterStatus === "ALL" || ord.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "SHIPPED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "PROCESSING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <>
      <div className={`space-y-6 flex-1 flex flex-col justify-between ${selectedInvoice ? "print:hidden" : ""}`}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-5 border-b border-border/70 dark:border-white/[0.08]">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              My Orders
            </h2>
            <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Track package deliveries, review item purchases, and download official GST invoices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] border border-border/60 dark:border-white/10 text-foreground/80">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 sm:pt-5 pb-2 sm:pb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or product name..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl bg-background border border-border/80 dark:border-white/10 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-foreground/[0.04] dark:bg-white/[0.05] rounded-xl border border-border/60 dark:border-white/10 overflow-x-auto scrollbar-hide touch-pan-x">
            {["ALL", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => {
              const isSelected = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`relative px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "text-background dark:text-slate-950 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="orderFilterPill"
                      className="absolute inset-0 bg-foreground dark:bg-white rounded-lg shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading your orders from database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/80 dark:border-white/10 rounded-2xl bg-foreground/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-muted-foreground mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try a different search term.`
                : "You haven't placed any accessory or phone orders yet. Explore our genuine catalog."}
            </p>
            <Link
              href="/shop"
              className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Explore Shop</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.2) }}
                  className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-foreground/[0.01] dark:bg-white/[0.02] border border-border/80 dark:border-white/10 hover:border-border transition-all space-y-3 sm:space-y-4 shadow-2xs"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60 dark:border-white/[0.06]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Ordered on {order.createdAt} • Paid via {order.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">Total Amount</span>
                      <span className="text-base sm:text-lg font-bold text-foreground">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {order.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {it.image ? (
                              <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {it.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Qty: {it.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap shrink-0">
                          ₹{it.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="pt-2.5 sm:pt-3 border-t border-border/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                      <span className="font-semibold text-foreground">Delivery to:</span> {order.shippingAddress}
                    </p>

                    <div className="grid grid-cols-2 min-[440px]:flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedTracking(order)}
                        className="col-span-1 justify-center px-2.5 sm:px-3 py-2 min-[440px]:py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/60 dark:border-white/10 whitespace-nowrap"
                      >
                        <Truck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                        <span>Track Shipment</span>
                      </button>

                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="col-span-1 justify-center px-2.5 sm:px-3 py-2 min-[440px]:py-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-border/60 dark:border-white/10 whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                        <span>Tax Invoice</span>
                      </button>

                      <a
                        href={`https://wa.me/919758677978?text=Hello%20Chand%20Mobile%20Expert,%20I%20need%20assistance%20with%20Order%20${order.orderNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 min-[440px]:col-span-1 justify-center px-2.5 sm:px-3 py-2 min-[440px]:py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/20 whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Help</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. E-COMMERCE SHIPMENT TRACKING SYSTEM (FLIPKART / AMAZON / DELHIVERY) */}
      {/* ========================================================================= */}
      {selectedTracking && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-200 print:hidden"
          onClick={() => setSelectedTracking(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 transition-colors"
          >
            {/* Top Brand & Partner Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between bg-zinc-50/60 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {/* Official Logo */}
                <div className="shrink-0">
                  <img
                    src="/images/logo/logo.png"
                    alt="Chand Mobile Expert"
                    className="h-7 sm:h-8 w-auto dark:hidden"
                  />
                  <img
                    src="/images/logo/dark-logo.png"
                    alt="Chand Mobile Expert"
                    className="h-7 sm:h-8 w-auto hidden dark:block"
                  />
                </div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-white/20 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Express Logistics:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-white">
                    <Truck className="w-3.5 h-3.5 text-black dark:text-white" />
                    Delhivery Air Express
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                  #{selectedTracking.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTracking(null)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                  title="Close tracking"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 sm:p-7 space-y-4 sm:space-y-6 max-h-[82vh] overflow-y-auto modal-scrollbar">
              {/* Delivery Hero Card with ReactBits SpotlightCard */}
              <SpotlightCard
                spotlightColor="#a8d946"
                intensity={0.12}
                className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/90 dark:border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      {selectedTracking.status === "DELIVERED"
                        ? "Delivery Completed"
                        : selectedTracking.status === "SHIPPED"
                        ? "Out For Delivery"
                        : "On The Way • In Transit"}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                      {selectedTracking.status === "DELIVERED"
                        ? "Package Delivered Successfully"
                        : "Arriving in 1-2 Business Days"}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Dispatched from Chand Mobile Central Facility, Rampur via Delhivery Express.
                    </p>
                  </div>

                  {/* AWB Pill */}
                  <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 shrink-0">
                    <div className="text-left">
                      <span className="block text-[10px] text-zinc-400 font-semibold uppercase">Tracking AWB</span>
                      <span className="font-mono text-xs font-black text-zinc-900 dark:text-white">DLV98320491</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("awb", "DLV98320491")}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Copy Tracking ID"
                    >
                      {copiedKey === "awb" ? (
                        <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Horizontal E-Commerce Progress Bar (Flipkart / Amazon 4-Stage Tracker) */}
                <div className="pt-4 border-t border-zinc-200/80 dark:border-white/[0.08]">
                  {/* Progress Line */}
                  <div className="relative flex items-center justify-between mb-2">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-full bg-zinc-200 dark:bg-white/10 rounded-full z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
                      style={{
                        width:
                          selectedTracking.status === "DELIVERED"
                            ? "100%"
                            : selectedTracking.status === "SHIPPED"
                            ? "75%"
                            : "50%",
                      }}
                    />

                    {/* Step 1: Ordered */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-3 sm:ring-4 ring-white dark:ring-[#111114] shadow-sm">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white mt-1.5">Ordered</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 hidden min-[440px]:block">{selectedTracking.createdAt}</span>
                    </div>

                    {/* Step 2: Packed */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-3 sm:ring-4 ring-white dark:ring-[#111114] shadow-sm">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white mt-1.5">Packed</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 hidden min-[440px]:block">Verified</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold ring-3 sm:ring-4 ring-white dark:ring-[#111114] shadow-sm ${
                          selectedTracking.status === "SHIPPED" || selectedTracking.status === "DELIVERED"
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-4 ring-emerald-500/25"
                        }`}
                      >
                        {selectedTracking.status === "SHIPPED" || selectedTracking.status === "DELIVERED" ? (
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        ) : (
                          <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white mt-1.5">In Transit</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 hidden min-[440px]:block">Express</span>
                    </div>

                    {/* Step 4: Delivery */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold ring-3 sm:ring-4 ring-white dark:ring-[#111114] shadow-sm ${
                          selectedTracking.status === "DELIVERED"
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 text-zinc-400 dark:bg-white/[0.08] dark:text-zinc-500 border border-zinc-200 dark:border-white/10"
                        }`}
                      >
                        {selectedTracking.status === "DELIVERED" ? (
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        ) : (
                          "4"
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white mt-1.5">Delivery</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 hidden min-[440px]:block">Doorstep</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Items in this Shipment Preview (Amazon Style) */}
              <div className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <span>Items in This Package ({selectedTracking.items.length})</span>
                  <span className="text-zinc-900 dark:text-white font-mono">
                    Total: ₹{selectedTracking.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedTracking.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {it.image ? (
                            <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {it.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Qty: {it.quantity} • Standard Mobile Accessory
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Activity Checkpoints (Delhivery / Flipkart Style) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Detailed Shipment Activity Log</span>
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/10">
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Package in transit to delivery terminal
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Moradabad Express Sorting Hub, UP • Expected dispatch to local delivery rider
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">Today, 04:15 PM</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Package departed from origin logistics hub
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Chand Mobile Central Logistics Gateway, Rampur (09)
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">Today, 01:30 PM</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Quality sealed & manifest generated
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Packed in tamper-proof bubble protection • AWB Attached
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">{selectedTracking.createdAt}, 10:45 AM</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Order received & payment confirmed
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Online electronic verification complete
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400">{selectedTracking.createdAt}, 10:30 AM</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Customer Support Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {/* Shipping Address */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="font-semibold text-zinc-900 dark:text-white leading-relaxed">
                    {selectedTracking.shippingAddress}
                  </p>
                </div>

                {/* Logistics Support */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.06] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      Delivery Helpline
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-white">Delhivery Logistics Support</p>
                    <p className="text-[11px] text-zinc-500">Toll-Free: 1800-102-1234 (8 AM - 10 PM)</p>
                  </div>
                  <a
                    href={`https://wa.me/919758677978?text=Hello%20Chand%20Mobile%20Expert,%20I%20need%20updates%20for%20tracking%20${selectedTracking.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Need Help? Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Actions using ShinyButton from ReactBits */}
            <div className="p-4 px-6 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between bg-zinc-50/60 dark:bg-white/[0.02]">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Live updates synced with Delhivery API
              </span>

              <ShinyButton
                onClick={() => setSelectedTracking(null)}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Close Tracking
              </ShinyButton>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MINIMALIST SOBER E-COMMERCE TAX INVOICE (PROMINENT LOGO & CLEAN LAYOUT) */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div
          id="printable-invoice-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200 print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:m-0 print:overflow-visible print:block print:w-full print:animate-none print:backdrop-blur-none"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            id="printable-invoice"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 my-auto max-h-[94vh] overflow-y-auto modal-scrollbar text-zinc-900 dark:text-zinc-100 transition-colors print:max-w-none print:w-full print:p-6 sm:print:p-8 print:border print:border-zinc-300 print:rounded-2xl print:shadow-none print:bg-white print:text-black print:overflow-visible print:max-h-none print:my-0"
          >
            {/* Top Header: Big Brand Logo + Invoice Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-zinc-100 dark:border-white/10">
              {/* Prominent Large Company Logo */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <img
                    src="/images/logo/logo.png"
                    alt="Chand Mobile Expert"
                    className="h-10 sm:h-16 w-auto object-contain dark:hidden light-logo"
                  />
                  <img
                    src="/images/logo/dark-logo.png"
                    alt="Chand Mobile Expert"
                    className="h-10 sm:h-16 w-auto object-contain hidden dark:block dark-logo"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                  Chand Mobile Expert Retail Pvt. Ltd. • Authorized Electronics Retailer
                </p>
              </div>

              {/* Invoice Pill & Actions */}
              <div className="sm:text-right space-y-1.5 flex flex-col sm:items-end">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold text-[11px] tracking-wider uppercase">
                    Tax Invoice
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-500 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors print:hidden"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                    INV-{selectedInvoice.orderNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy("inv_num", `INV-${selectedInvoice.orderNumber}`)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors print:hidden cursor-pointer"
                    title="Copy Invoice ID"
                  >
                    {copiedKey === "inv_num" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Date: {selectedInvoice.createdAt}
                </p>
              </div>
            </div>

            {/* Clean 2-Column Seller & Buyer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5">
              {/* Sold By */}
              <div className="space-y-1 leading-relaxed">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Sold By
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">Chand Mobile Expert</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Main Market, Sarai Tarin, Sambhal - 244901, UP
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                  GSTIN: <span className="font-semibold text-zinc-800 dark:text-zinc-200">09AAAPL1234F1Z5</span>
                </p>
              </div>

              {/* Billed & Shipped To */}
              <div className="space-y-1 leading-relaxed sm:border-l sm:border-zinc-200/80 sm:dark:border-white/10 sm:pl-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Billed & Shipped To
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Valued Customer"}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {selectedInvoice.shippingAddress}
                </p>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                    PAID • {selectedInvoice.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Minimalist Items Table (Responsive scroll container) */}
            <div className="border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto modal-scrollbar">
              <table className="w-full min-w-[340px] text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider border-b border-zinc-200/80 dark:border-white/10">
                    <th className="p-2.5 sm:p-3 sm:px-4">Item & Description</th>
                    <th className="p-2.5 sm:p-3 text-center font-mono w-14 sm:w-16">Qty</th>
                    <th className="p-2.5 sm:p-3 text-right font-mono w-20 sm:w-24">Price</th>
                    <th className="p-2.5 sm:p-3 sm:px-4 text-right font-mono w-24 sm:w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {selectedInvoice.items.map((it) => {
                    const gross = it.price * it.quantity;
                    return (
                      <tr key={it.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-2.5 sm:p-3 sm:px-4">
                          <p className="font-bold text-zinc-900 dark:text-white line-clamp-1">{it.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            HSN: 85177090 • Incl. 18% GST
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3 text-center font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {it.quantity}
                        </td>
                        <td className="p-2.5 sm:p-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                          ₹{it.price.toLocaleString("en-IN")}
                        </td>
                        <td className="p-2.5 sm:p-3 sm:px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          ₹{gross.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sober Summary & Words Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
              {/* Amount in words + Verified Stamp */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                    Amount in Words:
                  </span>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 text-xs italic leading-snug">
                    "{numberToWordsINR(selectedInvoice.totalAmount)}"
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Digitally authorized tax invoice • Valid e-receipt</span>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Taxable Value</span>
                  <span className="font-mono">₹{(selectedInvoice.totalAmount / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>GST (18% Included)</span>
                  <span className="font-mono">₹{(selectedInvoice.totalAmount - selectedInvoice.totalAmount / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-zinc-900 dark:text-white pt-2.5 border-t border-zinc-200 dark:border-white/10">
                  <span className="text-xs uppercase tracking-wide">Total Paid</span>
                  <span className="text-lg font-black font-mono text-zinc-900 dark:text-white">
                    ₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-white/10 print:hidden">
              <ShinyButton
                onClick={handlePrintInvoice}
                className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Printer className="w-3.5 h-3.5 text-white dark:text-black" />
                <span>Print Invoice</span>
              </ShinyButton>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 sm:flex-initial justify-center px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

