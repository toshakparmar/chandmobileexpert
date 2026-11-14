"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Star,
  Check,
  RotateCcw,
  Sparkles,
  Tag,
  ShieldCheck,
  Percent
} from "lucide-react";
import { ShinyButton } from "@/components/reactbits/ShinyButton";
import { Magnet } from "@/components/reactbits/Magnet";

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  pricePreset: string; // "all" | "under-500" | "500-999" | "1000-1999" | "2000-3499" | "3500-above" | "custom"
  minPrice: string;
  maxPrice: string;
  minRating: number; // 0, 2, 3, 4
  minDiscount: number; // 0, 10, 20, 30, 40, 50
  inStockOnly: boolean;
  selectedBrands: string[];
}

export const initialFilterState: FilterState = {
  searchQuery: "",
  selectedCategories: [],
  pricePreset: "all",
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  minDiscount: 0,
  inStockOnly: false,
  selectedBrands: [],
};

export const PRICE_PRESETS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-999", label: "₹500 - ₹999", min: 500, max: 999 },
  { id: "1000-1999", label: "₹1,000 - ₹1,999", min: 1000, max: 1999 },
  { id: "2000-3499", label: "₹2,000 - ₹3,499", min: 2000, max: 3499 },
  { id: "3500-above", label: "₹3,500 & Above", min: 3500, max: Infinity },
];

export const DISCOUNT_OPTIONS = [
  { value: 50, label: "50% or more" },
  { value: 40, label: "40% or more" },
  { value: 30, label: "30% or more" },
  { value: 20, label: "20% or more" },
  { value: 10, label: "10% or more" },
];

export const RATING_OPTIONS = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

interface ShopFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: { name: string; count: number }[];
  brands: { name: string; count: number }[];
  totalFilteredCount: number;
  onReset: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function ShopFilters({
  filters,
  setFilters,
  categories,
  brands,
  totalFilteredCount,
  onReset,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: ShopFiltersProps) {
  // Accordion section states (Flipkart style)
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    discount: true,
    availability: true,
    brand: true,
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [customMin, setCustomMin] = useState(filters.minPrice);
  const [customMax, setCustomMax] = useState(filters.maxPrice);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.selectedCategories.length > 0 ||
    filters.pricePreset !== "all" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minRating > 0 ||
    filters.minDiscount > 0 ||
    filters.inStockOnly ||
    filters.selectedBrands.length > 0;

  // Category toggle
  const handleCategoryToggle = (categoryName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(categoryName);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter((c) => c !== categoryName)
          : [...prev.selectedCategories, categoryName],
      };
    });
  };

  // Brand toggle
  const handleBrandToggle = (brandName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedBrands.includes(brandName);
      return {
        ...prev,
        selectedBrands: exists
          ? prev.selectedBrands.filter((b) => b !== brandName)
          : [...prev.selectedBrands, brandName],
      };
    });
  };

  // Price preset change
  const handlePresetSelect = (presetId: string) => {
    const preset = PRICE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setFilters((prev) => ({
      ...prev,
      pricePreset: presetId,
      minPrice: presetId === "all" ? "" : preset.min.toString(),
      maxPrice:
        presetId === "all" || preset.max === Infinity
          ? ""
          : preset.max.toString(),
    }));
  };

  // Custom price apply
  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      pricePreset: "custom",
      minPrice: customMin,
      maxPrice: customMax,
    }));
  };

  const filteredCategoriesList = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden ${
        isMobileDrawer ? "h-full border-0 rounded-none shadow-none" : ""
      }`}
    >
      {/* ── Filter Top Header (Flipkart style) ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <span className="font-bold text-foreground text-sm uppercase tracking-wider">
            Filters
          </span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-accent hover:text-accent/80 hover:underline flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              CLEAR ALL
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 text-sm">
        {/* ── Search within Catalog ── */}
        <div className="p-4 bg-background/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accessories..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="w-full pl-9 pr-8 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchQuery: "" }))
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter 1: CATEGORIES (Flipkart / Amazon style) ── */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
          >
            <span className="flex items-center gap-1.5">
              Categories
              {filters.selectedCategories.length > 0 && (
                <span className="bg-accent/20 text-accent font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {filters.selectedCategories.length}
                </span>
              )}
            </span>
            {openSections.categories ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {openSections.categories && (
            <div className="space-y-3 mt-3">
              {/* Category Dropdown Switcher */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Switch Category
                </label>
                <select
                  value={
                    filters.selectedCategories.length === 1
                      ? filters.selectedCategories[0]
                      : filters.selectedCategories.length === 0
                      ? "all"
                      : "custom"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "all") {
                      setFilters((prev) => ({ ...prev, selectedCategories: [] }));
                      if (typeof window !== "undefined") window.history.replaceState(null, "", "/shop");
                    } else if (val !== "custom") {
                      setFilters((prev) => ({ ...prev, selectedCategories: [val] }));
                      if (typeof window !== "undefined") {
                        window.history.replaceState(null, "", `/shop?category=${encodeURIComponent(val)}`);
                      }
                    }
                  }}
                  className="w-full px-2.5 py-2 bg-muted/40 border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="all">
                    All Categories ({categories.reduce((acc, c) => acc + c.count, 0)})
                  </option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                  {filters.selectedCategories.length > 1 && (
                    <option value="custom" disabled>
                      Multiple Selected ({filters.selectedCategories.length})
                    </option>
                  )}
                </select>
              </div>

              {/* Search Category */}
              {categories.length > 6 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search in categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/30 border border-border/80 rounded-lg text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              )}

              {/* Category Checkboxes List */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {/* All Categories Pill */}
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, selectedCategories: [] }));
                    if (typeof window !== "undefined") window.history.replaceState(null, "", "/shop");
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors select-none ${
                    filters.selectedCategories.length === 0
                      ? "bg-accent/15 text-foreground font-semibold border border-accent/30"
                      : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        filters.selectedCategories.length === 0
                          ? "bg-accent border-accent text-black"
                          : "border-border bg-background"
                      }`}
                    >
                      {filters.selectedCategories.length === 0 && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </div>
                    <span className="text-xs">All Categories</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {categories.reduce((acc, c) => acc + c.count, 0)}
                  </span>
                </button>

                {/* Filtered Categories */}
                {filteredCategoriesList.map((cat) => {
                  const isChecked = filters.selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.name)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors select-none ${
                        isChecked
                          ? "bg-accent/15 text-foreground font-semibold border border-accent/30"
                          : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-accent border-accent text-black"
                              : "border-border bg-background group-hover:border-accent/60"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs ${
                            isChecked
                              ? "font-semibold text-foreground"
                              : "text-foreground/80 group-hover:text-foreground"
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Filter 2: PRICE RANGE (Flipkart / Amazon style) ── */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
          >
            <span>Price Range</span>
            {openSections.price ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {openSections.price && (
            <div className="space-y-3 mt-3">
              {/* Presets */}
              <div className="space-y-1">
                {PRICE_PRESETS.map((preset) => {
                  const isSelected = filters.pricePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                        isSelected
                          ? "bg-accent/15 text-foreground font-semibold border border-accent/30"
                          : "text-foreground/75 hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Min & Max Inputs (Amazon / Flipkart style) */}
              <form
                onSubmit={handleApplyCustomPrice}
                className="pt-2 border-t border-border/50"
              >
                <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                  Custom Min - Max (₹)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full px-2 py-1.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="text-muted-foreground text-xs font-bold">
                    to
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full px-2 py-1.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-foreground text-background font-bold text-xs hover:bg-accent hover:text-black transition-colors"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── Filter 3: CUSTOMER RATINGS (Amazon / Flipkart style) ── */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
          >
            <span>Customer Rating</span>
            {openSections.rating ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {openSections.rating && (
            <div className="space-y-1.5 mt-3">
              {RATING_OPTIONS.map((opt) => {
                const isSelected = filters.minRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        minRating: isSelected ? 0 : opt.value,
                      }))
                    }
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-accent/15 border border-accent/40 font-semibold text-foreground"
                        : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < opt.value
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted/40"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-accent stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Filter 4: DISCOUNT / OFFERS (Flipkart style) ── */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("discount")}
            className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
          >
            <span>Discount</span>
            {openSections.discount ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {openSections.discount && (
            <div className="space-y-1 mt-3">
              {DISCOUNT_OPTIONS.map((opt) => {
                const isSelected = filters.minDiscount === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        minDiscount: isSelected ? 0 : opt.value,
                      }))
                    }
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-accent/15 text-foreground font-semibold border border-accent/30"
                        : "text-foreground/75 hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Percent className="w-3 h-3 text-muted-foreground" />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Filter 5: AVAILABILITY / IN STOCK ── */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
          >
            <span>Availability</span>
            {openSections.availability ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {openSections.availability && (
            <div className="mt-3">
              <label className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 cursor-pointer transition-colors select-none">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-foreground">
                    In Stock Only
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      inStockOnly: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* ── Filter 6: BRANDS (Flipkart / Amazon style) ── */}
        {brands.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection("brand")}
              className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider mb-2"
            >
              <span className="flex items-center gap-1.5">
                Brand
                {filters.selectedBrands.length > 0 && (
                  <span className="bg-accent/20 text-accent font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {filters.selectedBrands.length}
                  </span>
                )}
              </span>
              {openSections.brand ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {openSections.brand && (
              <div className="max-h-48 overflow-y-auto space-y-1 mt-3 pr-1 scrollbar-thin">
                {brands.map((brand) => {
                  const isChecked = filters.selectedBrands.includes(brand.name);
                  return (
                    <button
                      key={brand.name}
                      type="button"
                      onClick={() => handleBrandToggle(brand.name)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors select-none ${
                        isChecked
                          ? "bg-accent/15 text-foreground font-semibold border border-accent/30"
                          : "hover:bg-muted/40 text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-accent border-accent text-black"
                              : "border-border bg-background group-hover:border-accent/60"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs ${
                            isChecked
                              ? "font-semibold text-foreground"
                              : "text-foreground/80 group-hover:text-foreground"
                          }`}
                        >
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {brand.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile Footer Apply Bar ── */}
      {isMobileDrawer && (
        <div className="p-4 border-t border-border bg-card flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-4 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted text-center"
          >
            Reset
          </button>
          <button
            onClick={onCloseMobileDrawer}
            className="flex-1 py-3 px-4 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-accent hover:text-black transition-colors text-center shadow-md"
          >
            Apply ({totalFilteredCount})
          </button>
        </div>
      )}
    </div>
  );
}
