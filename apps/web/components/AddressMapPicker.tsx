"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Loader2,
  Crosshair,
  Check,
  AlertCircle,
  X,
  Map,
  ChevronDown,
  ChevronUp,
  Compass,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface GeoLocationData {
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  lat: number;
  lng: number;
  displayName?: string;
}

interface AddressMapPickerProps {
  onLocationSelect: (data: GeoLocationData) => void;
  initialCoords?: { lat: number; lng: number };
}

// Default center: Sambhal, Uttar Pradesh (28.5833, 78.5667)
const DEFAULT_CENTER = { lat: 28.5833, lng: 78.5667 };

// Quick nearby regions for fast 1-click positioning
const QUICK_REGIONS = [
  { name: "Sambhal", lat: 28.5833, lng: 78.5667, state: "Uttar Pradesh", pin: "244302" },
  { name: "Moradabad", lat: 28.8386, lng: 78.7733, state: "Uttar Pradesh", pin: "244001" },
  { name: "Chandausi", lat: 28.4552, lng: 78.7745, state: "Uttar Pradesh", pin: "244412" },
  { name: "Aligarh", lat: 27.8974, lng: 78.0880, state: "Uttar Pradesh", pin: "202001" },
  { name: "Delhi NCR", lat: 28.6139, lng: 77.2090, state: "Delhi", pin: "110001" },
];

export function AddressMapPicker({
  onLocationSelect,
  initialCoords,
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(
    initialCoords || DEFAULT_CENTER
  );
  const [selectedAddressText, setSelectedAddressText] = useState<string>("");
  const [geoNotice, setGeoNotice] = useState<{ type: "info" | "warning" | "success"; text: string } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(true); // Open by default for immediate clarity
  const [mapReady, setMapReady] = useState(false);

  // Parse OpenStreetMap Nominatim address into structured Indian address fields
  const parseAddress = (data: any, lat: number, lng: number): GeoLocationData => {
    const addr = data.address || {};

    const streetParts = [
      addr.house_number || addr.building,
      addr.road || addr.street,
      addr.suburb || addr.neighbourhood || addr.residential || addr.subdivision,
    ].filter(Boolean);

    const street = streetParts.join(", ");
    const landmark = addr.landmark || addr.amenity || addr.commercial || "";
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      "";
    const state = addr.state || "";
    const postalCode = addr.postcode || "";

    return {
      street,
      landmark,
      city,
      state,
      postalCode,
      lat,
      lng,
      displayName: data.display_name || "",
    };
  };

  // Reverse geocode lat, lng to address details
  const reverseGeocode = async (lat: number, lng: number, silent = false) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!res.ok) throw new Error("Reverse geocode failed");
      const data = await res.json();

      const parsed = parseAddress(data, lat, lng);
      const shortDisplay = [parsed.street, parsed.city, parsed.postalCode].filter(Boolean).join(", ") || data.display_name;
      setSelectedAddressText(shortDisplay);
      onLocationSelect(parsed);
      if (!silent) {
        setGeoNotice({
          type: "success",
          text: `Pinned: ${shortDisplay}`,
        });
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      if (!silent) {
        setGeoNotice({
          type: "info",
          text: "Coordinates selected. You can refine your street details below.",
        });
      }
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    if (!isMapOpen) return;

    const initMap = async () => {
      await new Promise((r) => setTimeout(r, 120));

      if (isCancelled || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      if (isCancelled || !mapContainerRef.current) return;

      // Clean, modern custom map pin icon
      const deliveryIcon = L.divIcon({
        className: "custom-delivery-pin",
        html: `
          <div style="position: relative; width: 32px; height: 40px; transform: translate(-16px, -40px); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)); cursor: grab;">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#18181b"/>
              <circle cx="16" cy="15" r="9" fill="#a8d946"/>
              <circle cx="16" cy="15" r="4" fill="#18181b"/>
            </svg>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentCoords.lat, currentCoords.lng],
          zoom: 15,
          zoomControl: false,
        });

        // Add sleek zoom control
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Standard OpenStreetMap tiles (free, reliable, no API key watermark)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([currentCoords.lat, currentCoords.lng], {
          icon: deliveryIcon,
          draggable: true,
        }).addTo(map);

        // Marker drag event
        marker.on("dragend", async (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          setCurrentCoords({ lat, lng });
          await reverseGeocode(lat, lng);
        });

        // Map click to move pin
        map.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCurrentCoords({ lat, lng });
          await reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapReady(true);
      } else {
        mapInstanceRef.current.invalidateSize();
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [isMapOpen]);

  // Set map coordinates and smoothly pan
  const setMapLocation = (lat: number, lng: number, zoom = 16) => {
    setCurrentCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Smart GPS Geolocation with automatic IP-based fallback if browser blocks GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      fallbackToIpLocation("Your browser does not support GPS. Using network location.");
      return;
    }

    setIsLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapLocation(lat, lng, 17);
        await reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      async (err) => {
        console.warn("GPS error, trying network fallback:", err);
        // Fallback to IP location when GPS is denied or unavailable
        await fallbackToIpLocation(
          err.code === 1
            ? "GPS permission blocked in browser settings. Detected approximate region via network."
            : "Could not get high-accuracy GPS fix. Detected region via network."
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 30000,
      }
    );
  };

  // Network IP location fallback
  const fallbackToIpLocation = async (message: string) => {
    try {
      const res = await fetch("https://ipwho.is/");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          const lat = data.latitude;
          const lng = data.longitude;
          setMapLocation(lat, lng, 14);

          onLocationSelect({
            city: data.city || "",
            state: data.region || "",
            postalCode: data.postal || "",
            lat,
            lng,
            displayName: `${data.city || ""}, ${data.region || ""}, ${data.country || "India"}`,
          });

          setSelectedAddressText(`${data.city || ""}, ${data.region || ""}`);
          setGeoNotice({
            type: "warning",
            text: `${message} Tap the map or search colony to set your exact doorstep.`,
          });
          return;
        }
      }
    } catch (e) {
      console.warn("IP lookup error:", e);
    }

    setGeoNotice({
      type: "warning",
      text: "Location access was not granted. Please search your colony or street manually below.",
    });
  };

  // Search Autocomplete (India only)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=in&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (res.ok) {
          const results = await res.json();
          setSearchResults(results);
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = async (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchQuery(item.display_name.split(",")[0] || item.display_name);
    setShowResults(false);
    setMapLocation(lat, lng, 16);
    const parsed = parseAddress(item, lat, lng);
    setSelectedAddressText(item.display_name);
    onLocationSelect(parsed);
    setGeoNotice({
      type: "success",
      text: `Selected: ${parsed.street || parsed.city || item.display_name}`,
    });
  };

  const handleSelectQuickRegion = (region: typeof QUICK_REGIONS[0]) => {
    setMapLocation(region.lat, region.lng, 15);
    onLocationSelect({
      city: region.name,
      state: region.state,
      postalCode: region.pin,
      lat: region.lat,
      lng: region.lng,
      displayName: `${region.name}, ${region.state}`,
    });
    setSelectedAddressText(`${region.name}, ${region.state} - ${region.pin}`);
    setGeoNotice({
      type: "info",
      text: `Centered to ${region.name}. Drag pin or enter street details.`,
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-2.5">
      {/* Top Search & Location Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input with autocomplete */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search colony, street, area or PIN code..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all shadow-2xs"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 w-3.5 h-3.5 text-zinc-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-2.5 w-4 h-4 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-start gap-2 text-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons: Use GPS & Toggle Map */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="h-8.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            title="Detect GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-accent dark:text-zinc-950" />
            )}
            <span>{isLocating ? "Locating..." : "Use GPS"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMapOpen(!isMapOpen)}
            className="h-8.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="Toggle map view"
          >
            <Map className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{isMapOpen ? "Hide Map" : "View Map"}</span>
            {isMapOpen ? (
              <ChevronUp className="w-3 h-3 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Region Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
        <span className="text-zinc-400 dark:text-zinc-500 font-medium shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3" /> Quick:
        </span>
        {QUICK_REGIONS.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => handleSelectQuickRegion(r)}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 cursor-pointer font-normal"
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Sober Non-Intrusive Notice Banner */}
      {geoNotice && (
        <div
          className={`p-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
            geoNotice.type === "success"
              ? "bg-accent/15 dark:bg-accent/10 border border-accent/30 text-zinc-900 dark:text-zinc-200"
              : geoNotice.type === "warning"
              ? "bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200"
              : "bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {geoNotice.type === "success" ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-accent shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className="text-[11px] leading-tight flex-1">{geoNotice.text}</span>
          <button
            type="button"
            onClick={() => setGeoNotice(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Map Container View */}
      {isMapOpen && (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Bottom Floating Address Badge on Map */}
            <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/85 backdrop-blur-md text-white text-[11px] font-medium shadow-sm max-w-[80%] truncate">
                <MapPin className="w-3 h-3 text-accent shrink-0" />
                <span className="truncate">
                  {selectedAddressText || "Drag pin or tap map to pin doorstep"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="pointer-events-auto h-6.5 px-2.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-[11px] shadow-sm transition-colors cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right pr-1">
            Tap map or drag pin to fine-tune doorstep location
          </p>
        </div>
      )}
    </div>
  );
}
