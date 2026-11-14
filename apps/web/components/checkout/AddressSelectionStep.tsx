"use client";

import React from "react";
import { Home, Briefcase, Building2, MapPin, CheckCircle2 } from "lucide-react";

export interface SavedAddress {
  id: string;
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  type?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

interface AddressSelectionStepProps {
  savedAddresses: SavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNew: () => void;
}

export function AddressSelectionStep({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
}: AddressSelectionStepProps) {
  const getAddressIcon = (type?: string) => {
    switch (type) {
      case "WORK":
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case "OTHER":
        return <Building2 className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Home className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {savedAddresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? "border-accent bg-accent/5 dark:bg-accent/[0.06] shadow-2xs ring-1 ring-accent"
                  : "border-border/70 dark:border-white/10 bg-foreground/[0.015] dark:bg-white/[0.02] hover:border-foreground/30 dark:hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-foreground/[0.04] dark:bg-white/[0.06] text-[11px] font-semibold text-foreground">
                    {getAddressIcon(addr.type)}
                    <span className="capitalize">{addr.type?.toLowerCase() || "Home"}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded-md bg-accent/10">
                      Default
                    </span>
                  )}
                </div>

                {addr.name && (
                  <p className="text-xs font-bold text-foreground mb-0.5">{addr.name}</p>
                )}
                <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                  {addr.street}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.city}, {addr.state} – {addr.postalCode}
                </p>
                {addr.phone && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Phone: <span className="text-foreground font-semibold">{addr.phone}</span>
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {isSelected ? "Selected Address" : "Click to Deliver Here"}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-accent bg-accent text-slate-950"
                      : "border-border dark:border-white/20"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-accent text-slate-950" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onAddNew}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-border/80 dark:border-white/20 hover:border-accent text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span>+ Add New Delivery Address</span>
        </button>
      </div>
    </div>
  );
}

