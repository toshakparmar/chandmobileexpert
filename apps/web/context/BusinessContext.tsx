"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { businessConfig as fallbackConfig } from "@/config/business";
import { api } from "@/lib/api";

export interface BusinessProfileData {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  openingHours: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  latitude: number;
  longitude: number;
  mapEmbedUrl: string;
}

interface BusinessContextType {
  profile: BusinessProfileData;
  loading: boolean;
  waLink: (message?: string) => string;
  telLink: () => string;
  mailLink: () => string;
}

const defaultProfile: BusinessProfileData = {
  companyName: fallbackConfig.name,
  phone: fallbackConfig.phone,
  whatsapp: fallbackConfig.whatsapp,
  email: fallbackConfig.email,
  address: `${fallbackConfig.address}, ${fallbackConfig.city}, ${fallbackConfig.state} – ${fallbackConfig.zip}`,
  city: fallbackConfig.city,
  state: fallbackConfig.state,
  zip: fallbackConfig.zip,
  openingHours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 5:00 PM",
  instagramUrl: fallbackConfig.social.instagram,
  facebookUrl: fallbackConfig.social.facebook,
  twitterUrl: fallbackConfig.social.twitter,
  latitude: fallbackConfig.latitude,
  longitude: fallbackConfig.longitude,
  mapEmbedUrl: fallbackConfig.mapEmbedUrl,
};

const BusinessContext = createContext<BusinessContextType>({
  profile: defaultProfile,
  loading: true,
  waLink: (msg) => `https://wa.me/${fallbackConfig.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg || "Hello Chand Mobile Expert")}`,
  telLink: () => `tel:${fallbackConfig.phoneRaw}`,
  mailLink: () => `mailto:${fallbackConfig.email}`,
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BusinessProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBusinessProfile() {
      try {
        let data: any = null;
        try {
          const apiRes = await api.get("/business-profile");
          data = apiRes.data;
        } catch {
          const res = await fetch("/api/business-profile");
          if (res.ok) {
            data = await res.json();
          }
        }

        if (data && isMounted) {
          setProfile((prev) => ({
            ...prev,
            companyName: data.companyName || prev.companyName,
            phone: data.phone || prev.phone,
            whatsapp: data.whatsapp || prev.whatsapp,
            email: data.email || prev.email,
            address: data.address || prev.address,
            openingHours: data.openingHours || prev.openingHours,
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            facebookUrl: data.facebookUrl || prev.facebookUrl,
            twitterUrl: data.twitterUrl || prev.twitterUrl,
            linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
          }));
        }
      } catch (err) {
        console.warn("Could not load dynamic business profile, using fallback config:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBusinessProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const waLink = (message: string = "Hello Chand Mobile Expert, I would like to enquire about mobile repair.") => {
    const rawNumber = profile.whatsapp.replace(/[^0-9]/g, "");
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  };

  const telLink = () => {
    const rawNumber = profile.phone.replace(/[^0-9+]/g, "");
    return `tel:${rawNumber}`;
  };

  const mailLink = () => {
    return `mailto:${profile.email}`;
  };

  return (
    <BusinessContext.Provider value={{ profile, loading, waLink, telLink, mailLink }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessProfile() {
  return useContext(BusinessContext);
}
