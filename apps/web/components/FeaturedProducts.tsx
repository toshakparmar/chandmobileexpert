"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, Star, Heart, Minus, Plus, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { GradientText } from "@/components/reactbits/GradientText";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { Magnet } from "@/components/reactbits/Magnet";
import { ShinyLink } from "@/components/reactbits/ShinyButton";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
}

const FALLBACK_FEATURED: ProductItem[] = [
  {
    id: "fb-1",
    name: "Apple Rugged Armor Case",
    slug: "apple-rugged-armor-case",
    category: "Cases & Covers",
    brand: "Apple",
    price: 1499,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd561?w=500&q=80",
    rating: 4.9,
    reviews: 42,
    inStock: true,
    description: "Military-grade dual-layer drop protection with raised bezels for camera and screen.",
  },
  {
    id: "fb-2",
    name: "Samsung 65W GaN Charger",
    slug: "samsung-65w-gan-charger",
    category: "Chargers & Cables",
    brand: "Samsung",
    price: 2499,
    originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
    rating: 4.8,
    reviews: 38,
    inStock: true,
    description: "Ultra-compact Gallium Nitride 3-port fast charger with adaptive thermal management.",
  },
  {
    id: "fb-3",
    name: "Ultra 9H Tempered Glass",
    slug: "ultra-9h-tempered-glass",
    category: "Screen Protectors",
    brand: "UltraShield",
    price: 699,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1585862705497-b8c116b47209?w=500&q=80",
    rating: 4.9,
    reviews: 75,
    inStock: true,
    description: "Edge-to-edge oleophobic coated tempered glass with zero bubble installation frame.",
  },
  {
    id: "fb-4",
    name: "Apple Wireless Over-Ear Headset",
    slug: "apple-wireless-over-ear-headset",
    category: "Audio",
    brand: "Apple",
    price: 4999,
    originalPrice: 6499,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
    rating: 4.7,
    reviews: 29,
    inStock: true,
    description: "Active noise cancelling with spatial audio calibration and 40-hour ultra battery life.",
  },
  {
    id: "fb-5",
    name: "Max 20000mAh Magnetic Power Bank",
    slug: "max-20000mah-magnetic-power-bank",
    category: "Power Banks",
    brand: "MaxPower",
    price: 2999,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
    rating: 4.8,
    reviews: 51,
    inStock: true,
    description: "High-density polymer cell with 22.5W MagSafe magnetic attachment and LED display.",
  },
  {
    id: "fb-6",
    name: "Pro Cellular Fitness Smartwatch",
    slug: "pro-cellular-fitness-smartwatch",
    category: "Smartwatches",
    brand: "ProFit",
    price: 3999,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
    rating: 4.8,
    reviews: 33,
    inStock: true,
    description: "AMOLED always-on display, heart-rate tracking, GPS tracking and water resistant.",
  },
  {
    id: "fb-7",
    name: "Pro Wireless Charging Mount",
    slug: "pro-wireless-charging-mount",
    category: "Phone Mounts",
    brand: "AutoGrip",
    price: 1899,
    originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    rating: 4.7,
    reviews: 19,
    inStock: true,
    description: "15W fast wireless auto-clamping vehicle mount with 360-degree ball joint.",
  },
  {
    id: "fb-8",
    name: "Max Thunderbolt 7-in-1 Aluminum Hub",
    slug: "max-thunderbolt-7-in-1-hub",
    category: "Docks & Hubs",
    brand: "HubPro",
    price: 3499,
    originalPrice: 4299,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
    rating: 4.9,
    reviews: 64,
    inStock: true,
    description: "4K 60Hz HDMI, 100W Power Delivery pass-through, SD/TF readers and USB 3.2 Gen 2 ports.",
  },
];

export function FeaturedProducts() {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);

  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_FEATURED);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchProducts = async () => {
      let rawData: any[] = [];

      // 1. Try Axios api instance (defaults to http://localhost:3000)
      try {
        const response = await api.get("/products");
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          rawData = response.data;
        }
      } catch {
        // Fallback silently
      }

      // 2. Try Next.js server proxy /api/products
      if (!rawData || rawData.length === 0) {
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              rawData = json;
            }
          }
        } catch {
          // Fallback silently
        }
      }

      // 3. Try direct fetch to backend port 3000
      if (!rawData || rawData.length === 0) {
        try {
          const res = await fetch("http://localhost:3000/products");
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              rawData = json;
            }
          }
        } catch {
          // Fallback silently
        }
      }

      if (rawData && rawData.length > 0) {
        const mappedProducts: ProductItem[] = rawData
          .filter((p: any) => p.isActive !== false)
          .slice(0, 8)
          .map((p: any, idx: number) => {
            const price = Number(p.price) || 999;
            const originalPrice =
              p.originalPrice && Number(p.originalPrice) > price
                ? Number(p.originalPrice)
                : p.discountPrice && Number(p.discountPrice) > price
                ? Number(p.discountPrice)
                : Math.round(price * 1.25);

            return {
              id: p.id || `prod-${idx}`,
              name: p.name,
              slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              category: p.category?.name || (typeof p.category === "string" ? p.category : "Accessories"),
              brand: p.brand || "OEM Expert",
              price,
              originalPrice,
              image: p.image || p.imageUrl || FALLBACK_FEATURED[idx % FALLBACK_FEATURED.length].image,
              rating: Number(p.rating) || Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
              reviews: Number(p.reviews) || 18 + idx * 7,
              inStock: p.inStock !== false && (p.stock === undefined || p.stock > 0),
              description: p.description || "Certified OEM hardware and accessories backed by Chand Mobile Expert guarantee.",
            };
          });

        if (mappedProducts.length > 0) {
          setProducts(mappedProducts);
        }
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Compute available categories for quick tabs
  const categoryTabs = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by selected quick tab
  const displayedProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  return (
    <section className="relative w-full bg-background border-t border-border/40 py-16 sm:py-24 lg:py-28 overflow-hidden">
      {/* Ambient decorative glow matching brand colors */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <DecryptedText
                text="Lab Verified OEM Accessories"
                speed={28}
                className="text-xs font-bold text-accent uppercase tracking-wider"
                encryptedClassName="text-accent/60 font-mono"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Featured{" "}
              <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={8}>
                Products
              </GradientText>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-foreground/70 leading-relaxed">
              Curated flagship accessories, GaN fast chargers, optical armor, and audio gear tested in our laboratory.
            </p>
          </div>

          <div className="shrink-0">
            <Magnet padding={20} magnetStrength={2}>
              <ShinyLink
                href="/shop"
                shimmerColor="rgba(168,217,70,0.4)"
                shimmerDuration={1800}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm hover:bg-accent hover:text-black transition-all duration-300 shadow-md group active:scale-95"
              >
                <span>View Full Shop</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </ShinyLink>
            </Magnet>
          </div>
        </div>

        {/* ── Category Quick-Filter Tabs (Flipkart / Amazon Style) ── */}
        {categoryTabs.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? "bg-accent/20 border-accent text-foreground font-bold shadow-xs scale-[1.02]"
                      : "bg-card border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {tab === "All" ? "All Featured" : tab}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Product Grid: Matches Shop Page Card Architecture ── */}
        {loading ? (
          /* Shimmer Skeleton matching 8-card grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-card rounded-2xl p-3 sm:p-4 border border-border/80 animate-pulse overflow-hidden"
              >
                <div className="aspect-square w-full rounded-xl bg-muted/60 mb-3" />
                <div className="h-3 w-16 bg-muted/70 rounded mb-2" />
                <div className="h-4 w-full bg-muted/80 rounded mb-1.5" />
                <div className="h-4 w-3/4 bg-muted/80 rounded mb-3" />
                <div className="h-3 w-20 bg-muted/60 rounded mb-4" />
                <div className="mt-auto pt-2 border-t border-border/50 flex flex-col gap-2">
                  <div className="h-5 w-24 bg-muted/80 rounded" />
                  <div className="h-9 w-full bg-muted/70 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {displayedProducts.map((product) => {
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
                  <div className="group relative flex flex-col bg-card rounded-2xl p-3 sm:p-4 border border-border/80 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden h-full">
                    
                    {/* Badges Overlay (Discount, Top Rated, Sold Out) */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start">
                      {discountPercent && discountPercent >= 10 && (
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

                    {/* Wishlist Heart Button */}
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

                    {/* Product Image Box (Clean high-contrast background with smooth hover zoom) */}
                    <Link
                      href={`/shop/${product.slug}`}
                      className="relative block mb-3 overflow-hidden rounded-xl bg-white aspect-square flex items-center justify-center p-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* Product Information */}
                    <div className="flex flex-col flex-1">
                      {/* Brand & Category */}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                        <span className="font-semibold text-accent">{product.brand}</span>
                        <span>•</span>
                        <span className="truncate">{product.category}</span>
                      </div>

                      {/* Product Title */}
                      <Link href={`/shop/${product.slug}`} className="hover:text-accent transition-colors">
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Flipkart / Amazon Style Star Rating Pill */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center bg-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-white gap-0.5 shadow-xs">
                          {product.rating}
                          <Star className="w-2.5 h-2.5 fill-white" />
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          ({product.reviews})
                        </span>
                      </div>

                      {/* Price & Cart Actions (Anchored to bottom) */}
                      <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-baseline gap-2 flex-wrap">
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

                        {/* Cart Action Button / Quantity Stepper */}
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
                            return (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    quantity: 1,
                                    category: product.category,
                                  });
                                }}
                                className="flex items-center justify-center gap-1.5 w-full h-full rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-accent hover:text-black transition-all shadow-xs active:scale-[0.98]"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
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
        )}

        {/* Bottom Guarantee Banner */}
        <div className="mt-12 sm:mt-14 text-center">
          <p className="text-xs sm:text-sm text-foreground/60">
            All accessories backed by a <span className="font-semibold text-accent">100% Genuine Compatibility</span> Guarantee & 1-Year Certified Store Warranty.
          </p>
        </div>
      </div>
    </section>
  );
}
