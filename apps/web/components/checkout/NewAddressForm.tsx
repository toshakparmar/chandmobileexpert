"use client";

import React from "react";
import { Home, Briefcase, Building2 } from "lucide-react";

export interface NewAddressData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  type: "HOME" | "WORK" | "OTHER";
  saveToProfile: boolean;
}

interface NewAddressFormProps {
  address: NewAddressData;
  onChange: (updated: Partial<NewAddressData>) => void;
  isAuthenticated?: boolean;
}

export function NewAddressForm({
  address,
  onChange,
  isAuthenticated = false,
}: NewAddressFormProps) {
  return (
    <div className="space-y-4">
      {/* Contact Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={address.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="e.g. Mohd"
            className="w-full h-10 px-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={address.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="e.g. Chand"
            className="w-full h-10 px-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Mobile Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
            +91
          </span>
          <input
            type="tel"
            required
            maxLength={10}
            value={address.phone}
            onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })}
            placeholder="9876543210"
            className="w-full h-10 pl-11 pr-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-accent font-mono"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Required for doorstep delivery dispatch and SMS/WhatsApp updates.
        </p>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Street / Building / Landmark <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={2}
          value={address.street}
          onChange={(e) => onChange({ street: e.target.value })}
          placeholder="e.g. Shop #4, Main Market, Sarai Tarin, Near Jama Masjid"
          className="w-full p-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-accent resize-none leading-relaxed"
        />
      </div>

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={address.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Sambhal"
            className="w-full h-10 px-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground focus:outline-hidden focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            State <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={address.state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="Uttar Pradesh"
            className="w-full h-10 px-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground focus:outline-hidden focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            PIN Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={address.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value.replace(/\D/g, "") })}
            placeholder="244303"
            className="w-full h-10 px-3 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/10 text-xs text-foreground focus:outline-hidden focus:border-accent font-mono"
          />
        </div>
      </div>

      {/* Address Type Tag */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Address Type
        </label>
        <div className="flex items-center gap-2">
          {(["HOME", "WORK", "OTHER"] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange({ type: tag })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                address.type === tag
                  ? "border-accent bg-accent/10 text-accent font-bold ring-1 ring-accent"
                  : "border-border/70 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag === "HOME" && <Home className="w-3 h-3" />}
              {tag === "WORK" && <Briefcase className="w-3 h-3" />}
              {tag === "OTHER" && <Building2 className="w-3 h-3" />}
              <span className="capitalize">{tag.toLowerCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Address Checkbox */}
      {isAuthenticated && (
        <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={address.saveToProfile}
            onChange={(e) => onChange({ saveToProfile: e.target.checked })}
            className="w-4 h-4 rounded-md border-border text-accent focus:ring-accent"
          />
          <span>Save this address to my profile for future orders</span>
        </label>
      )}
    </div>
  );
}

