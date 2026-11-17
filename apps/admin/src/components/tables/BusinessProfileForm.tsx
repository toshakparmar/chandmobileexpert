"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import ComponentLoader from "../common/ComponentLoader";

interface BusinessProfile {
  companyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  upiVpa?: string | null;
  upiPayeeName?: string | null;
  upiQrExpiryMinutes?: number | null;
  gstNumber?: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
}

export default function BusinessProfileForm() {
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    openingHours: "",
    upiVpa: "chandmobile@upi",
    upiPayeeName: "Chand Mobile Expert",
    upiQrExpiryMinutes: 15,
    gstNumber: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/business-profile");
        // API should return the singleton object (id: 1)
        if (response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch business profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Backend expects PATCH or PUT to update the singleton
      await api.patch("/business-profile", profile);
      alert("Business Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update business profile", error);
      alert("Failed to update business profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ComponentLoader text="Loading Business & UPI configurations..." />;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          General Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              value={profile.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Support Email *</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="text"
              value={profile.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
            <Input
              id="whatsapp"
              type="text"
              value={profile.whatsapp}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <h3 className="pt-4 text-lg font-bold text-gray-800 dark:text-white/90">
          Location & Hours
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="address">Physical Address *</Label>
            <textarea
              id="address"
              value={profile.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <Label htmlFor="openingHours">Opening Hours *</Label>
            <textarea
              id="openingHours"
              value={profile.openingHours}
              onChange={handleChange}
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>

        <h3 className="pt-4 text-lg font-bold text-gray-800 dark:text-white/90">
          UPI Payment Gateway & Tax Configuration
        </h3>
        <p className="text-xs text-gray-500">
          Direct NPCI UPI configuration for dynamic QR code generation. Customers transfer directly to this UPI ID.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="upiVpa">UPI VPA (Virtual Payment Address / UPI ID) *</Label>
            <Input
              id="upiVpa"
              type="text"
              value={profile.upiVpa || ""}
              onChange={handleChange}
              placeholder="e.g. chandmobile@upi"
              required
            />
          </div>
          <div>
            <Label htmlFor="upiPayeeName">UPI Merchant Payee Name *</Label>
            <Input
              id="upiPayeeName"
              type="text"
              value={profile.upiPayeeName || ""}
              onChange={handleChange}
              placeholder="e.g. Chand Mobile Expert"
              required
            />
          </div>
          <div>
            <Label htmlFor="upiQrExpiryMinutes">Dynamic QR Expiry (Minutes)</Label>
            <Input
              id="upiQrExpiryMinutes"
              type="number"
              min={5}
              max={60}
              value={profile.upiQrExpiryMinutes || 15}
              onChange={handleChange}
              placeholder="15"
            />
          </div>
          <div>
            <Label htmlFor="gstNumber">GSTIN / Tax Number (Optional)</Label>
            <Input
              id="gstNumber"
              type="text"
              value={profile.gstNumber || ""}
              onChange={handleChange}
              placeholder="e.g. 09ABCDE1234F1Z5"
            />
          </div>
        </div>

        <h3 className="pt-4 text-lg font-bold text-gray-800 dark:text-white/90">
          Social Links
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input
              id="facebookUrl"
              type="text"
              value={profile.facebookUrl || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input
              id="instagramUrl"
              type="text"
              value={profile.instagramUrl || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="twitterUrl">Twitter URL</Label>
            <Input
              id="twitterUrl"
              type="text"
              value={profile.twitterUrl || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
