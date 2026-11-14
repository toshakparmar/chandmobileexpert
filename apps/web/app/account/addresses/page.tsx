"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building2,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Phone,
  Sparkles,
  Loader2,
} from "lucide-react";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ShinyButton } from "@/components/reactbits/ShinyButton";
import { AddressMapPicker, GeoLocationData } from "@/components/AddressMapPicker";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { motion, AnimatePresence } from "motion/react";

export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressItem | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    isDefault: false,
  });

  useEffect(() => {
    let isSubscribed = true;

    const fetchBackendAddresses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me/addresses");
        if (!isSubscribed) return;
        if (res.data && Array.isArray(res.data)) {
          const mapped: AddressItem[] = res.data.map((a: any) => ({
            id: a.id,
            name: a.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Saved Address",
            phone: a.phone || user?.phone?.replace(/\D/g, "") || "",
            street: a.street,
            landmark: a.landmark || "",
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            type: (a.tag === "WORK" ? "WORK" : a.tag === "OTHER" ? "OTHER" : "HOME") as "HOME" | "WORK" | "OTHER",
            isDefault: !!a.isDefault,
          }));
          setAddresses(mapped);
          localStorage.setItem("cme_user_addresses", JSON.stringify(mapped));
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to local storage if offline
      }

      try {
        const stored = localStorage.getItem("cme_user_addresses");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Filter out any stale dummy addresses with id "addr-1"
            const realAddresses = parsed.filter((item: any) => item.id !== "addr-1");
            if (isSubscribed) {
              setAddresses(realAddresses);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      if (isSubscribed) {
        setAddresses([]);
        setLoading(false);
      }
    };

    fetchBackendAddresses();

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  const saveAddresses = (newList: AddressItem[]) => {
    setAddresses(newList);
    try {
      localStorage.setItem("cme_user_addresses", JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setForm({
      name: "",
      phone: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      type: "HOME",
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AddressItem) => {
    setEditingAddress(item);
    setForm({
      name: item.name,
      phone: item.phone,
      street: item.street,
      landmark: item.landmark || "",
      city: item.city,
      state: item.state,
      postalCode: item.postalCode,
      type: item.type,
      isDefault: item.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleMapLocationSelect = (data: GeoLocationData) => {
    setForm((prev) => ({
      ...prev,
      street: data.street || prev.street,
      landmark: data.landmark || prev.landmark,
      city: data.city || prev.city,
      state: data.state || prev.state,
      postalCode: data.postalCode || prev.postalCode,
    }));
    showToast("Location pinned! Address fields auto-filled.");
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updated);
    showToast("Default address updated successfully.");
    try {
      await api.patch(`/users/me/addresses/${id}/default`);
    } catch (e) {}
  };

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    setIsDeletingAddress(true);
    const id = addressToDelete.id;
    try {
      await api.delete(`/users/me/addresses/${id}`);
    } catch (e) {
      console.warn("Backend address delete notice:", e);
    }
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    saveAddresses(remaining);
    showToast("Address deleted successfully.");
    setIsDeletingAddress(false);
    setAddressToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (form.phone.replace(/\D/g, "").length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (form.postalCode.replace(/\D/g, "").length !== 6) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingAddress) {
        try {
          await api.patch(`/users/me/addresses/${editingAddress.id}`, {
            name: form.name,
            phone: form.phone,
            tag: form.type,
            street: form.street,
            landmark: form.landmark,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: "IN",
            isDefault: form.isDefault,
          });
        } catch (e) {
          console.warn("Backend address patch warning (using optimistic state):", e);
        }

        const updated = addresses.map((addr) => {
          if (addr.id === editingAddress.id) {
            return {
              ...addr,
              ...form,
            };
          }
          return form.isDefault ? { ...addr, isDefault: false } : addr;
        });
        saveAddresses(updated);
        showToast("Address updated successfully.");
        setIsModalOpen(false);
      } else {
        let createdId = `addr-${Date.now()}`;
        try {
          const res = await api.post("/users/me/addresses", {
            name: form.name,
            phone: form.phone,
            tag: form.type,
            street: form.street,
            landmark: form.landmark,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: "IN",
            isDefault: form.isDefault || addresses.length === 0,
          });
          if (res.data?.id) {
            createdId = res.data.id;
          }
        } catch (e) {
          console.warn("Backend address post warning (using optimistic state):", e);
        }

        const newAddr: AddressItem = {
          id: createdId,
          ...form,
        };
        let updatedList = addresses;
        if (form.isDefault || addresses.length === 0) {
          newAddr.isDefault = true;
          updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
        }
        saveAddresses([...updatedList, newAddr]);
        showToast("New address added successfully.");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Unable to save address. Please check your internet connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-7 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70 dark:border-white/[0.08]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Saved Addresses
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your delivery and doorstep service locations for instant 1-click checkout.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/30 text-foreground text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Cards Grid or Loading or Empty */}
      {loading ? (
        <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center gap-3 py-20 animate-in fade-in duration-150">
          <div className="w-9 h-9 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Loading your saved addresses...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/70 dark:border-white/[0.08] rounded-3xl bg-foreground/[0.01]">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-foreground">No addresses saved yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
            Add your residential or office address for fast doorstep phone pickups and accessory deliveries.
          </p>
          <ShinyButton
            onClick={handleOpenCreate}
            shimmerColor="rgba(168,217,70,0.4)"
            className="h-10 px-6 rounded-2xl bg-slate-900 text-white dark:bg-accent dark:text-slate-950 font-bold text-xs shadow-md hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Address Now
          </ShinyButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const TypeIcon = addr.type === "WORK" ? Briefcase : addr.type === "OTHER" ? Building2 : Home;

            return (
              <SpotlightCard
                key={addr.id}
                spotlightColor="#a8d946"
                intensity={0.05}
                borderGlow={0.25}
                className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  addr.isDefault
                    ? "border-accent/60 bg-accent/[0.03] dark:bg-accent/[0.02] shadow-sm ring-1 ring-accent/20"
                    : "border-border/80 dark:border-white/[0.08] bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-accent/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] text-foreground text-xs font-bold">
                      <TypeIcon className="w-3.5 h-3.5 text-accent" />
                      {addr.type}
                    </span>

                    {addr.isDefault ? (
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-accent text-slate-950 shadow-2xs">
                        DEFAULT
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] font-semibold text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                      >
                        Set as default
                      </button>
                    )}
                  </div>

                  <h2 className="font-bold text-foreground text-base mb-1">{addr.name}</h2>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    +91 {addr.phone}
                  </p>

                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    {addr.street}
                  </p>
                  {addr.landmark && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Landmark: <span className="text-foreground/90 font-medium">{addr.landmark}</span>
                    </p>
                  )}
                  <p className="text-xs font-semibold text-foreground/90 mt-2">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-border/60 dark:border-white/[0.07] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] hover:bg-foreground/[0.08] text-foreground font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setAddressToDelete(addr)}
                      className="px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-accent hover:underline cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            if (!isSaving) setIsModalOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white dark:bg-[#141416] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-150 my-6 max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Active Saving / Updating Backend Progress Overlay */}
            {isSaving && (
              <div className="absolute inset-0 z-50 bg-white/85 dark:bg-[#141416]/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3.5 animate-in fade-in duration-200 select-none">
                <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                <div className="text-center space-y-1 px-4">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {editingAddress ? "Updating delivery address..." : "Saving new address..."}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Synchronizing with your account database. Please wait...
                  </p>
                </div>
              </div>
            )}

            {/* Modal Fixed Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 bg-white dark:bg-[#141416]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent dark:text-accent" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Enter your doorstep delivery details or auto-detect via map
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (!isSaving) setIsModalOpen(false);
                }}
                className={`w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors ${
                  isSaving ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                }`}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body with .modal-scrollbar */}
            <form id="address-form" onSubmit={handleSubmit} className="modal-scrollbar flex-1 px-5 sm:px-6 py-4 space-y-3.5">
              <fieldset disabled={isSaving} className="space-y-3.5 border-none p-0 m-0">
              {/* Smart Location Auto-Fill with OSM Map */}
              <div>
                <AddressMapPicker onLocationSelect={handleMapLocationSelect} />
              </div>

              {/* Address Type Segmented Control */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 pl-0.5">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/50">
                  {(["HOME", "WORK", "OTHER"] as const).map((type) => {
                    const isSelected = form.type === type;
                    const Icon = type === "WORK" ? Briefcase : type === "OTHER" ? Building2 : Home;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setForm({ ...form, type })}
                        className={`relative py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? "text-zinc-900 dark:text-white font-semibold"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="addressTypePill"
                            className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-lg shadow-xs"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-accent dark:text-accent" : "text-zinc-500 dark:text-zinc-400"}`} />
                          <span>{type === "HOME" ? "Home" : type === "WORK" ? "Work" : "Other"}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Receiver Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name of receiver"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                  Flat, House No., Building, Apartment <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="House / Flat / Block No., Apartment / Road, Area"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs resize-none"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                  Landmark <span className="text-zinc-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Nearby landmark (e.g. Near Bus Stand, Opp. SBI Bank)"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City / District"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 pl-0.5">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, "") })}
                    placeholder="6-digit PIN"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Save as default delivery address
                </span>
              </label>
              </fieldset>
            </form>

            {/* Modal Fixed Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0 bg-white/95 dark:bg-[#141416]/95 backdrop-blur-sm flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (!isSaving) setIsModalOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors ${
                  isSaving ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="address-form"
                disabled={isSaving}
                className={`h-9 px-5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2 ${
                  isSaving
                    ? "bg-zinc-400 text-white dark:bg-zinc-700 dark:text-zinc-300 cursor-not-allowed"
                    : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 hover:shadow cursor-pointer"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{editingAddress ? "Updating Address..." : "Saving Address..."}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{editingAddress ? "Update Address" : "Save Address"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Custom Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!addressToDelete}
        onClose={() => {
          if (!isDeletingAddress) setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDeleteAddress}
        title="Delete Saved Address?"
        description="Are you sure you want to permanently delete this delivery address? It will be removed from your 1-click checkout options."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        itemName={addressToDelete ? `${addressToDelete.street}, ${addressToDelete.city}` : undefined}
        isLoading={isDeletingAddress}
      />
    </div>
  );
}
