"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingCart,
  Star,
  Heart,
  Minus,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck,
  AlertCircle,
  Tag,
  PackageX
} from "lucide-react";
import { api } from "@/lib/api";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { GradientText } from "@/components/reactbits/GradientText";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { Magnet } from "@/components/reactbits/Magnet";
import { ShinyButton } from "@/components/reactbits/ShinyButton";
import { CountUp } from "@/components/reactbits/CountUp";

import {
  ShopFilters,
  FilterState,
  initialFilterState,
  PRICE_PRESETS
} from "@/components/shop/ShopFilters";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { ShopPagination } from "@/components/shop/ShopPagination";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  createdAt?: string;
  description?: string;
}

const COMMON_BRANDS = ["Apple", "Samsung", "Pro", "Ultra", "Max", "Spigen", "Anker", "OnePlus"];

const SORT_OPTIONS = [
  { id: "popularity", label: "Relevance / Popularity", badge: "Popular" },
  { id: "price-low-high", label: "Price: Low to High", badge: "Budget" },
  { id: "price-high-low", label: "Price: High to Low", badge: "Premium" },
  { id: "rating", label: "Customer Rating: High to Low", badge: "Top Rated" },
  { id: "name-a-z", label: "Name: A to Z", badge: "A - Z" },
  { id: "name-z-a", label: "Name: Z to A", badge: "Z - A" },
  { id: "newest", label: "Newest First", badge: "Fresh" },
];

function extractBrand(name: string): string {
  const found = COMMON_BRANDS.find((b) => new RegExp(`\\b${b}\\b`, "i").test(name));
  return found || "Universal";
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ name: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilterState,
    selectedCategories: categoryParam && categoryParam !== "All" ? [categoryParam] : []
  }));

  // Sort State (Flipkart style: popularity, price-low-high, price-high-low, rating, newest, name-a-z, name-z-a)
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Mobile drawer states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync categoryParam from URL if changed externally
  useEffect(() => {
    if (categoryParam) {
      if (categoryParam === "All") {
        setFilters((prev) => ({ ...prev, selectedCategories: [] }));
      } else {
        setFilters((prev) => ({
          ...prev,
          selectedCategories: prev.selectedCategories.includes(categoryParam)
            ? prev.selectedCategories
            : [categoryParam]
        }));
      }
      setCurrentPage(1);
    }
  }, [categoryParam]);

  // Fetch products and categories from backend
  useEffect(() => {
    setMounted(true);
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, catsRes] = await Promise.all([
          api.get("/products").catch(() => ({ data: [] })),
          api.get("/categories").catch(() => ({ data: [] }))
        ]);

        if (isCancelled) return;

        let rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
        let rawCats = Array.isArray(catsRes.data) ? catsRes.data : [];

        let mappedProducts: ProductItem[] = rawProducts.map((p: any) => {
          const price = typeof p.price === "string" ? parseFloat(p.price) || 0 : Number(p.price) || 0;
          const originalPrice = p.discountPrice
            ? price + (parseFloat(p.discountPrice) || 0)
            : p.originalPrice
            ? Number(p.originalPrice)
            : Math.round(price * 1.25);

          const categoryName =
            typeof p.category === "object" && p.category?.name
              ? p.category.name
              : typeof p.category === "string"
              ? p.category
              : "Accessories";

          const rating =
            typeof p.rating === "number"
              ? p.rating
              : parseFloat((4.0 + ((p.name?.charCodeAt(0) || 65) % 10) * 0.1).toFixed(1));

          const reviews =
            typeof p.reviews === "number"
              ? p.reviews
              : 35 + (((p.name?.charCodeAt(1) || 70) * 9) % 450);

          return {
            id: String(p.id),
            name: p.name || "Mobile Accessory",
            slug: p.slug || `prod-${p.id}`,
            category: categoryName,
            brand: extractBrand(p.name || ""),
            price,
            originalPrice,
            image: p.image || "https://images.unsplash.com/photo-1601784551446-20c9e07cd561?w=500&q=80",
            rating,
            reviews,
            inStock: p.inStock !== undefined ? Boolean(p.inStock) : (p.stockCount !== undefined ? p.stockCount > 0 : true),
            createdAt: p.createdAt,
            description: p.description
          };
        });

        let mappedCats = rawCats.map((c: any) => ({
          name: c.name,
          image: c.icon || "https://images.unsplash.com/photo-1601784551446-20c9e07cd561?w=200&q=80"
        }));

        // Fallback generator if database has 0 products
        if (mappedProducts.length === 0) {
          const categoryDefinitions = [
            { name: "Cases & Covers", prefixes: ["Liquid Silicone", "Leather", "Rugged Armor", "Clear", "Magnetic"], suffixes: ["Case", "Cover", "Shell"] },
            { name: "Chargers & Cables", prefixes: ["20W USB-C", "65W GaN", "Braided", "Magnetic", "3-in-1"], suffixes: ["Charger", "Cable", "Power Adapter"] },
            { name: "Screen Protectors", prefixes: ["9H Tempered", "Matte", "Privacy", "Edge-to-Edge", "Anti-Glare"], suffixes: ["Glass", "Protector", "Film"] },
            { name: "Audio", prefixes: ["Wireless", "Noise Cancelling", "Sport", "Bluetooth", "Over-Ear"], suffixes: ["Earbuds", "Headphones", "Headset"] },
            { name: "Power Banks", prefixes: ["10000mAh", "20000mAh", "Magnetic", "Slim", "Solar"], suffixes: ["Power Bank", "Portable Charger", "Battery Pack"] },
            { name: "Smartwatches", prefixes: ["GPS", "Cellular", "Fitness", "Pro", "Active"], suffixes: ["Smartwatch", "Band", "Tracker"] },
            { name: "Phone Mounts", prefixes: ["Dashboard", "Vent", "Magnetic", "Bike", "Wireless Charging"], suffixes: ["Mount", "Holder", "Stand"] },
            { name: "Photography", prefixes: ["Macro", "Wide-Angle", "Telephoto", "3-in-1", "Professional"], suffixes: ["Lens Kit", "Clip-on Lens", "Filter"] },
            { name: "Gaming", prefixes: ["Mobile", "Bluetooth", "Cooling", "Ergonomic", "Trigger"], suffixes: ["Controller", "Gamepad", "Pad"] },
            { name: "Storage", prefixes: ["64GB", "128GB", "256GB", "High-Speed", "Extreme"], suffixes: ["MicroSD", "Flash Drive", "Memory Card"] }
          ];

          const techImages = [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
            "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
            "https://images.unsplash.com/photo-1585862705497-b8c116b47209?w=500&q=80",
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80"
          ];

          mappedCats = categoryDefinitions.map((c, idx) => ({
            name: c.name,
            image: techImages[idx % techImages.length]
          }));

          let productCounter = 1;
          const generatedProducts: ProductItem[] = [];

          for (const cat of categoryDefinitions) {
            for (let i = 0; i < 6; i++) {
              const prefix = cat.prefixes[Math.floor(Math.random() * cat.prefixes.length)];
              const suffix = cat.suffixes[Math.floor(Math.random() * cat.suffixes.length)];
              const brand = COMMON_BRANDS[Math.floor(Math.random() * COMMON_BRANDS.length)];
              const price = Math.floor(Math.random() * 3500) + 299;
              const originalPrice = Math.floor(price * (1.2 + Math.random() * 0.6));

              generatedProducts.push({
                id: `demo-${productCounter}`,
                name: `${brand} ${prefix} ${suffix}`,
                category: cat.name,
                brand,
                image: techImages[productCounter % techImages.length],
                price,
                originalPrice,
                rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
                reviews: Math.floor(Math.random() * 500) + 15,
                slug: `${brand.toLowerCase()}-${prefix.toLowerCase().replace(/ /g, "-")}-${suffix.toLowerCase()}-${productCounter}`,
                inStock: Math.random() > 0.08,
                createdAt: new Date().toISOString()
              });
              productCounter++;
            }
          }

          mappedProducts = generatedProducts;
        }

        setProducts(mappedProducts);
        setCategoriesList(mappedCats);
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Compute category counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [products]);

  // Compute brand counts
  const brandsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([name]) => name !== "Universal")
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/shop");
    }
  };

  // Category pill click handler
  const handleCategoryPillClick = (catName: string) => {
    const isSelected = filters.selectedCategories.includes(catName);
    const newSelected = isSelected ? [] : [catName];
    setFilters((prev) => ({ ...prev, selectedCategories: newSelected }));
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      const url = newSelected.length > 0 ? `/shop?category=${encodeURIComponent(catName)}` : "/shop";
      window.history.replaceState(null, "", url);
    }
  };

  const handleAllGearClick = () => {
    setFilters((prev) => ({ ...prev, selectedCategories: [] }));
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/shop");
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. Categories
    if (filters.selectedCategories.length > 0) {
      result = result.filter((p) => filters.selectedCategories.includes(p.category));
    }

    // 3. Price
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    if (!isNaN(min) && min > 0) {
      result = result.filter((p) => p.price >= min);
    }
    if (!isNaN(max) && max < Infinity) {
      result = result.filter((p) => p.price <= max);
    }

    // 4. Rating
    if (filters.minRating > 0) {
      result = result.filter((p) => p.rating >= filters.minRating);
    }

    // 5. Discount
    if (filters.minDiscount > 0) {
      result = result.filter((p) => {
        if (!p.originalPrice || p.originalPrice <= p.price) return false;
        const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return discountPercent >= filters.minDiscount;
      });
    }

    // 6. In Stock Only
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // 7. Brands
    if (filters.selectedBrands.length > 0) {
      result = result.filter((p) => filters.selectedBrands.includes(p.brand));
    }

    // 8. Sorting (Flipkart / Amazon standards)
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name-a-z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "popularity":
      default:
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  // Total pages
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Page change with smooth scrolling
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (catalogTopRef.current) {
      const topOffset = catalogTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (catalogTopRef.current) {
      const topOffset = catalogTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  // Active filter count for badge
  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedCategories.length +
    (filters.pricePreset !== "all" || filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    filters.selectedBrands.length;

  return (
    <div className="w-full pb-20">
      <Head>
        <title>Shop Mobile Accessories | Chand Mobile Expert</title>
        <meta
          name="description"
          content="Shop premium mobile accessories, cases, screen protectors, chargers, and audio with Flipkart/Amazon style filters and fast delivery."
        />
      </Head>

      {/* ── Hero Section ── */}
      <section className="flex flex-col relative isolate mb-6 sm:mb-14 pb-8 sm:pb-14">
        <div className="absolute inset-0 lg:inset-2.5 -z-10 rounded-bl-[2rem] rounded-br-[2rem] lg:rounded-bl-[2.5rem] lg:rounded-br-[2.5rem] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/BG.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
        </div>

        <div className="flex items-start justify-center px-3 min-[360px]:px-4 sm:px-6 pt-24 min-[360px]:pt-28 sm:pt-40 md:pt-44">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 min-[360px]:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-sm font-semibold mb-3 sm:mb-5 border border-white/20 shadow-sm max-w-full">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse shrink-0" />
              <DecryptedText
                text="100% Genuine Master-Grade Accessories"
                speed={25}
                className="text-white font-medium truncate"
                encryptedClassName="text-accent font-mono truncate"
              />
            </div>
            <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-2.5 sm:mb-4 drop-shadow-sm">
              Accessories{" "}
              <GradientText colors={["#a8d946", "#5eead4", "#facc15", "#a8d946"]} animationSpeed={6}>
                Catalog
              </GradientText>
            </h1>
            <p className="text-xs sm:text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto drop-shadow-sm px-1">
              Shop high-performance cases, ultra-fast GaN chargers, 9H tempered glass, and premium audio with verified warranties.
            </p>
          </div>
        </div>
      </section>

      {/* ── Top Category Pills Strip (Flipkart Carousel) ── */}
      <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2.5 sm:pb-3 scrollbar-hide snap-x -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
          {/* "All" button */}
          <button
            onClick={handleAllGearClick}
            className={`snap-start shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl min-w-[76px] sm:min-w-[105px] transition-all duration-300 border ${
              filters.selectedCategories.length === 0
                ? "bg-accent/15 border-accent shadow-sm"
                : "bg-card border-border hover:border-accent/40"
            }`}
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center p-1.5 sm:p-2 border border-border">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <span
              className={`text-[11px] sm:text-xs font-semibold ${
                filters.selectedCategories.length === 0 ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              All Gear
            </span>
          </button>

          {/* Dynamic categories */}
          {categoriesList.map((cat) => {
            const isSelected = filters.selectedCategories.includes(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryPillClick(cat.name)}
                className={`snap-start shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl min-w-[76px] sm:min-w-[105px] transition-all duration-300 border ${
                  isSelected
                    ? "bg-accent/15 border-accent shadow-sm"
                    : "bg-card border-border hover:border-accent/40"
                }`}
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center p-1 sm:p-1.5 border border-border">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain rounded-full" />
                </div>
                <span
                  className={`text-[11px] sm:text-xs truncate max-w-[76px] sm:max-w-[90px] ${
                    isSelected ? "text-foreground font-bold" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Anchor Ref for scrolling pagination ── */}
      <div ref={catalogTopRef} className="scroll-mt-24" />

      {/* ── SKELETON LOADER STATE (Show while loading from backend/DB) ── */}
      {loading ? (
        <ShopSkeleton count={pageSize} />
      ) : (
        /* ── MAIN SHOP LAYOUT (Desktop Sidebar + Catalog Grid) ── */
        <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ── DESKTOP SIDEBAR FILTERS (Flipkart & Amazon Style) ── */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <ShopFilters
                  filters={filters}
                  setFilters={setFilters}
                  categories={categoriesWithCounts}
                  brands={brandsWithCounts}
                  totalFilteredCount={filteredProducts.length}
                  onReset={handleResetFilters}
                />
              </div>
            </aside>

            {/* ── PRODUCTS MAIN CONTENT AREA ── */}
            <main className="lg:col-span-3">
              {/* ── Top Bar: Results Count + Sort Tabs (Flipkart style) ── */}
              <div className="bg-card border border-border/80 rounded-2xl p-4 mb-5 shadow-xs flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Results Count with CountUp */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Showing{" "}
                      <strong className="text-foreground">
                        <CountUp to={filteredProducts.length} duration={600} />
                      </strong>{" "}
                      results
                    </span>
                    {filters.selectedCategories.length === 1 && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        for <strong className="text-foreground">"{filters.selectedCategories[0]}"</strong>
                      </span>
                    )}
                  </div>

                  {/* Mobile Filters and Sort Trigger Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto lg:hidden">
                    <button
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
                      Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </button>

                    <button
                      onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Sort
                    </button>
                  </div>

                  {/* Desktop Luxury Custom Sort Dropdown */}
                  <div className="hidden lg:flex items-center gap-2.5 relative" ref={sortDropdownRef}>
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      Sort By:
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer min-w-[220px] shadow-xs ${
                        isSortDropdownOpen
                          ? "bg-white dark:bg-[#121417] border-accent ring-2 ring-accent/25 text-gray-950 dark:text-white"
                          : "bg-white dark:bg-[#121417] hover:bg-gray-50 dark:hover:bg-[#181b20] border-gray-200 dark:border-white/15 text-gray-900 dark:text-gray-100 hover:border-accent/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ArrowUpDown className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">
                          {SORT_OPTIONS.find((s) => s.id === sortBy)?.label || "Relevance / Popularity"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ${
                          isSortDropdownOpen ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </button>

                    {/* Solid Opaque Floating Menu (Zero blur bleeding) */}
                    {isSortDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-[#121417] border border-gray-200 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5">
                            <ArrowUpDown className="w-3 h-3 text-accent" />
                            Sort Products
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">
                            {SORT_OPTIONS.length} options
                          </span>
                        </div>

                        <div className="space-y-1">
                          {SORT_OPTIONS.map((opt) => {
                            const isSelected = sortBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSortBy(opt.id);
                                  setIsSortDropdownOpen(false);
                                  setCurrentPage(1);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left group ${
                                  isSelected
                                    ? "bg-accent/15 text-gray-950 dark:text-white font-bold border border-accent/40 shadow-xs"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/90 dark:hover:bg-white/10 hover:text-gray-950 dark:hover:text-white border border-transparent font-medium"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      isSelected
                                        ? "bg-accent shadow-xs"
                                        : "bg-gray-300 dark:bg-gray-600 group-hover:bg-accent/60"
                                    }`}
                                  />
                                  <span className="truncate">{opt.label}</span>
                                </div>
                                {isSelected ? (
                                  <Check className="w-4 h-4 text-accent stroke-[3] shrink-0 ml-2" />
                                ) : (
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0 ml-2">
                                    {opt.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flipkart Horizontal Sort Tabs (Desktop quick switch) */}
                <div className="hidden sm:flex items-center gap-1 pt-2 border-t border-border/50 overflow-x-auto scrollbar-hide text-xs">
                  <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">
                    Quick Sort:
                  </span>
                  {[
                    { id: "popularity", label: "Popularity" },
                    { id: "price-low-high", label: "Price -- Low to High" },
                    { id: "price-high-low", label: "Price -- High to Low" },
                    { id: "rating", label: "Customer Rating" },
                    { id: "newest", label: "Newest First" }
                  ].map((tab) => {
                    const isActive = sortBy === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSortBy(tab.id);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? "bg-foreground text-background font-bold shadow-xs"
                            : "text-foreground/75 hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Sort Dropdown Sheet */}
                {isMobileSortOpen && (
                  <div className="lg:hidden p-3 bg-white dark:bg-[#121417] border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl space-y-1 animate-in fade-in">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 dark:border-white/10 mb-1">
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown className="w-3 h-3 text-accent" />
                        Select Sort Order
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">
                        {SORT_OPTIONS.length} options
                      </span>
                    </div>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsMobileSortOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          sortBy === opt.id
                            ? "bg-accent/15 text-gray-950 dark:text-white font-bold border border-accent/40 shadow-xs"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-950 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              sortBy === opt.id ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          <span className="whitespace-nowrap">{opt.label}</span>
                        </div>
                        {sortBy === opt.id ? (
                          <Check className="w-4 h-4 text-accent stroke-[3] shrink-0" />
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Active Filter Pills Bar (Flipkart / Amazon style) ── */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground text-[11px] font-semibold mr-1">Active Filters:</span>

                    {/* Search query tag */}
                    {filters.searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                        "{filters.searchQuery}"
                        <button
                          onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* Categories tags */}
                    {filters.selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-foreground font-medium"
                      >
                        {cat}
                        <button
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              selectedCategories: prev.selectedCategories.filter((c) => c !== cat)
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Price tag */}
                    {(filters.pricePreset !== "all" || filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                        {filters.pricePreset !== "all" && filters.pricePreset !== "custom"
                          ? PRICE_PRESETS.find((p) => p.id === filters.pricePreset)?.label
                          : `₹${filters.minPrice || 0} - ₹${filters.maxPrice || "Above"}`}
                        <button
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              pricePreset: "all",
                              minPrice: "",
                              maxPrice: ""
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* Rating tag */}
                    {filters.minRating > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                        {filters.minRating}★ & above
                        <button
                          onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* Discount tag */}
                    {filters.minDiscount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                        {filters.minDiscount}%+ off
                        <button
                          onClick={() => setFilters((prev) => ({ ...prev, minDiscount: 0 }))}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* In stock tag */}
                    {filters.inStockOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
                        In Stock Only
                        <button
                          onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {/* Brand tags */}
                    {filters.selectedBrands.map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground font-medium"
                      >
                        {brand}
                        <button
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              selectedBrands: prev.selectedBrands.filter((b) => b !== brand)
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Clear all button */}
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-accent hover:underline ml-2 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* ── Product Cards Grid ── */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                  {paginatedProducts.map((product) => {
                    const discountPercent =
                      product.originalPrice && product.originalPrice > product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : null;

                    return (
                      <TiltedCard
                        key={product.id}
                        maxTilt={6}
                        scale={1.015}
                        glareColor="#a8d946"
                        glareMaxOpacity={0.08}
                        className="h-full"
                      >
                        <div className="group relative flex flex-col bg-card rounded-2xl p-2.5 sm:p-4 border border-border/80 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden h-full">
                          {/* Badges Overlay */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start">
                            {discountPercent && discountPercent >= 15 && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-accent text-black font-extrabold text-[9px] sm:text-[10px] tracking-wider shadow-xs">
                                {discountPercent}% OFF
                              </span>
                            )}
                            {product.rating >= 4.8 && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/90 text-white font-bold text-[8px] sm:text-[9px] tracking-wider uppercase shadow-xs">
                                Top Rated
                              </span>
                            )}
                            {!product.inStock && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-red-500 text-white font-bold text-[8px] sm:text-[9px] tracking-wider uppercase">
                                Sold Out
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border hover:bg-background transition-all"
                            aria-label="Toggle wishlist"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${
                                mounted && wishlist.includes(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            />
                          </button>

                          {/* Product Image Area */}
                          <Link
                            href={`/shop/${product.slug}`}
                            className="relative block mb-3 overflow-hidden rounded-xl bg-white aspect-square flex items-center justify-center p-3"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>

                          {/* Product Info */}
                          <div className="flex flex-col flex-1">
                            {/* Category & Brand */}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                              <span className="font-semibold text-accent">{product.brand}</span>
                              <span>•</span>
                              <span className="truncate">{product.category}</span>
                            </div>

                            {/* Title */}
                            <Link href={`/shop/${product.slug}`} className="hover:text-accent transition-colors">
                              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Flipkart Style Rating Pill */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center bg-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-white gap-0.5 shadow-xs">
                                {product.rating}
                                <Star className="w-2.5 h-2.5 fill-white" />
                              </div>
                              <span className="text-[11px] text-muted-foreground font-medium">
                                ({product.reviews})
                              </span>
                            </div>

                            {/* Price and Cart Actions */}
                            <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-border/50">
                              <div className="flex items-baseline gap-2">
                                <span className="text-base sm:text-lg font-bold text-foreground">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <>
                                    <span className="text-[11px] font-medium text-muted-foreground line-through">
                                      ₹{product.originalPrice.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-[11px] font-bold text-green-600">
                                      {discountPercent}% off
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Cart Actions */}
                              <div className="h-9 mt-1 w-full">
                                {(() => {
                                  const cartItem = cartItems.find((item) => item.id === product.id);
                                  if (cartItem && mounted) {
                                    return (
                                      <div className="flex items-center justify-between bg-accent/15 border border-accent/30 rounded-xl p-1 h-full w-full">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            updateQuantity(product.id, cartItem.quantity - 1);
                                          }}
                                          className="w-7 h-7 rounded-lg hover:bg-card flex items-center justify-center text-foreground transition-colors"
                                          aria-label="Decrease quantity"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold text-foreground w-6 text-center">
                                          {cartItem.quantity}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            updateQuantity(product.id, cartItem.quantity + 1);
                                          }}
                                          className="w-7 h-7 rounded-lg hover:bg-card flex items-center justify-center text-foreground transition-colors"
                                          aria-label="Increase quantity"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  }

                                  if (!product.inStock) {
                                    return (
                                      <div className="w-full h-full rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold flex items-center justify-center gap-1.5">
                                        <PackageX className="w-3.5 h-3.5" />
                                        Out of Stock
                                      </div>
                                    );
                                  }

                                  return (
                                    <Magnet padding={15} magnetStrength={2} className="w-full h-full">
                                      <ShinyButton
                                        onClick={(e) => {
                                          e.preventDefault();
                                          addItem({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                            category: product.category,
                                            quantity: 1
                                          });
                                        }}
                                        shimmerColor="rgba(168,217,70,0.4)"
                                        shimmerDuration={1800}
                                        className="w-full h-full rounded-xl bg-foreground text-background text-xs font-bold hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        Add to Cart
                                      </ShinyButton>
                                    </Magnet>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TiltedCard>
                    );
                  })}
                </div>
              ) : (
                /* ── Empty Filter State ── */
                <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-card rounded-3xl border border-dashed border-border/80">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1.5">No accessories match your filters</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                    Try loosening your price range, clearing brand selections, or resetting all filters to view our full collection.
                  </p>
                  <ShinyButton
                    onClick={handleResetFilters}
                    shimmerColor="rgba(168,217,70,0.4)"
                    shimmerDuration={1800}
                    className="px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs hover:bg-accent hover:text-black transition-all shadow-md active:scale-95"
                  >
                    Reset All Filters
                  </ShinyButton>
                </div>
              )}

              {/* ── Proper Scrolling Pagination Component ── */}
              <ShopPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredProducts.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </main>
          </div>
        </section>
      )}

      {/* ── Mobile Filters Slide-Over Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide Drawer */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-card shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
            <ShopFilters
              filters={filters}
              setFilters={setFilters}
              categories={categoriesWithCounts}
              brands={brandsWithCounts}
              totalFilteredCount={filteredProducts.length}
              onReset={handleResetFilters}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton count={12} />}>
      <ShopContent />
    </Suspense>
  );
}
