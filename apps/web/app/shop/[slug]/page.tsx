"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { products } from "@/lib/shop-data";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react";
import { api } from "@/lib/api";
import { ShinyButton } from "@/components/reactbits/ShinyButton";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  // Store actions
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);

  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Pincode checker states
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");

  // Zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const fetchProduct = async () => {
      try {
        let found: any = null;
        // 1. Try single product endpoint
        try {
          const singleRes = await fetch(`/api/products/${encodeURIComponent(String(slug))}`);
          if (singleRes.ok) {
            found = await singleRes.json();
          }
        } catch (e) {
          console.warn("Single product proxy failed, trying list:", e);
        }

        // 2. Fallback to products list if needed
        let allProducts: any[] = [];
        if (!found || !found.id) {
          const listRes = await fetch("/api/products");
          if (listRes.ok) {
            allProducts = await listRes.json();
            found = allProducts.find((p: any) => p.slug === slug || p.id === slug);
          }
        } else {
          // Fetch all products for related items
          const listRes = await fetch("/api/products");
          if (listRes.ok) {
            allProducts = await listRes.json();
          }
        }

        if (found) {
          const mainImg = found.image || found.imageUrl || "/images/placeholder.jpg";
          const rawImages = Array.isArray(found.images) && found.images.length > 0 ? found.images : [mainImg];

          setProduct({
            ...found,
            category: found.category?.name || "Accessories",
            image: mainImg,
            images: rawImages,
            rating: found.rating || 4.7,
            reviews: found.reviews || 24,
            features: found.features || [
              "100% Genuine Tested Component",
              "12-Month Store Warranty Included",
              "Compliant with OEM Specifications",
              "Express Priority Dispatch in 24 Hours",
            ],
          });

          // Filter related products
          if (allProducts.length > 0) {
            const currentCatId = found.categoryId || found.category?.id;
            const related = allProducts
              .filter((p: any) => p.id !== found.id && (!currentCatId || p.categoryId === currentCatId || p.category?.id === currentCatId))
              .slice(0, 4);
            setRelatedProducts(related.length > 0 ? related : allProducts.filter((p: any) => p.id !== found.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-foreground/70">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-foreground/70 mb-8">The accessory you're looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="px-6 py-3 bg-foreground text-background font-semibold rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ ...product, quantity: 1 });
  };

  const handleBuyNow = () => {
    const cartItem = cartItems.find(item => item.id === product.id);
    if (!cartItem) {
      addItem({ ...product, quantity: 1 });
    }
    router.push("/checkout");
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;

    setPincodeStatus("checking");
    setPincodeMessage("");

    // Simulate API call
    setTimeout(() => {
      // Mock validation: Any 6 digit number starting with 1-8 is valid
      if (pincode.match(/^[1-8][0-9]{5}$/)) {
        setPincodeStatus("success");
        setPincodeMessage(`Delivery available to ${pincode} in 2-3 working days.`);
      } else {
        setPincodeStatus("error");
        setPincodeMessage(`Sorry, we do not deliver to ${pincode} currently.`);
      }
    }, 1200);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="w-full pb-24 pt-32 sm:pt-40">
      <Head>
        <title>{product.name} | Chand Mobile Expert</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

          {/* ════════════════════════════════════════════════════════════ */}
          {/* Left: Image Gallery with Carousel and Zoom */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <div
              ref={imageContainerRef}
              className="w-full aspect-square rounded-3xl bg-card border border-border/50 overflow-hidden relative shadow-xl cursor-crosshair group/zoom"
              onMouseEnter={() => {
                if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) {
                  setIsZooming(true);
                }
              }}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <div className="absolute inset-0 flex items-center justify-center text-foreground/20">
                Image Placeholder
              </div>

              {/* The main image */}
              <img
                src={product.images[activeImage] || product.image}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-200 ${isZooming ? "scale-[2.5]" : "scale-100"}`}
                style={
                  isZooming
                    ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : { transformOrigin: "center center" }
                }
              />

              {/* Carousel Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-border/50 hover:bg-background hover:scale-110 transition-all shadow-lg z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-border/50 hover:bg-background hover:scale-110 transition-all shadow-lg z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative snap-start w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <div className="absolute inset-0 bg-card" />
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* Right: Product Info & Actions */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col">

            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                {product.category}
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-12 h-12 rounded-full bg-card flex items-center justify-center border border-border/50 hover:bg-foreground/5 transition-all shadow-sm group/wishlist"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-6 h-6 transition-colors group-hover/wishlist:scale-110 duration-300 ${mounted && wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-foreground/60 group-hover/wishlist:text-red-500"}`}
                />
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <Star className="w-5 h-5 fill-accent text-accent" />
                <Star className="w-5 h-5 fill-accent text-accent" />
                <Star className="w-5 h-5 fill-accent text-accent" />
                <Star className="w-5 h-5 fill-accent text-accent opacity-50" />
              </div>
              <span className="text-sm font-semibold text-foreground/80">{product.rating} Rating</span>
              <span className="w-1 h-1 rounded-full bg-foreground/20" />
              <span className="text-sm font-medium text-foreground/60">{product.reviews} Reviews</span>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-3xl sm:text-5xl font-black text-foreground">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg sm:text-xl font-medium text-foreground/40 line-through mb-1">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-8">
              {product.description}
            </p>

            <ul className="flex flex-col gap-3 mb-10">
              {product.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="h-px w-full bg-border/50 mb-10" />

            {/* Actions */}
            <div className="flex flex-col gap-5 mb-10">

              <div className="flex flex-col min-[420px]:flex-row flex-1 gap-3">
                {(() => {
                  const cartItem = cartItems.find(item => item.id === product.id);
                  if (cartItem && mounted) {
                    return (
                      <div className="flex-1 flex items-center justify-between bg-card border-2 border-foreground/10 rounded-2xl p-2 h-14">
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-bold text-foreground w-8 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center text-foreground transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-14 rounded-2xl bg-card border-2 border-foreground/10 text-foreground font-bold hover:border-foreground/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  );
                })()}

                <ShinyButton
                  onClick={handleBuyNow}
                  shimmerColor="rgba(168,217,70,0.4)"
                  shimmerDuration={1800}
                  className="flex-1 h-14 rounded-xl bg-foreground text-background font-bold hover:bg-accent hover:text-black transition-all shadow-lg active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  Buy Now
                </ShinyButton>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="bg-card rounded-2xl p-6 border border-border/50 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-foreground/80" />
                <h3 className="text-sm font-bold text-foreground">Check Delivery Availability</h3>
              </div>
              <form onSubmit={checkPincode} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6 digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:bg-background focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all font-mono"
                />
                <ShinyButton
                  type="submit"
                  disabled={pincode.length !== 6 || pincodeStatus === "checking"}
                  shimmerColor="rgba(168,217,70,0.4)"
                  shimmerDuration={1800}
                  className="px-6 py-3 bg-foreground text-background font-semibold rounded-xl hover:bg-accent hover:text-black transition-all shadow-md disabled:opacity-50 active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {pincodeStatus === "checking" ? "Checking..." : "Check"}
                </ShinyButton>
              </form>

              {/* Pincode Result */}
              {pincodeStatus === "success" && (
                <div className="mt-4 flex items-start gap-2 text-sm text-green-500 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{pincodeMessage}</span>
                </div>
              )}
              {pincodeStatus === "error" && (
                <div className="mt-4 flex items-start gap-2 text-sm text-red-500 font-medium animate-in fade-in">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 shrink-0">!</span>
                  <span>{pincodeMessage}</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
                <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">1 Year Warranty</span>
                  <span className="text-xs text-foreground/50">On manufacturer defects</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
                <Truck className="w-8 h-8 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Fast Delivery</span>
                  <span className="text-xs text-foreground/50">Usually ships in 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Related Products & Accessories
                </h2>
                <p className="text-sm text-foreground/60 mt-1">
                  Customers who viewed this item also looked at these options.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-semibold text-accent hover:underline hidden sm:block"
              >
                View all in shop →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                const relImg = rel.image || rel.imageUrl || "/images/placeholder.jpg";
                const relPrice = typeof rel.price === "number" ? rel.price : parseFloat(rel.price) || 0;
                return (
                  <Link
                    key={rel.id}
                    href={`/shop/${rel.slug || rel.id}`}
                    className="group flex flex-col bg-card border border-border/50 hover:border-accent/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-square w-full rounded-xl bg-foreground/5 overflow-hidden mb-4 flex items-center justify-center">
                      <img
                        src={relImg}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                        }}
                      />
                      {rel.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                          {rel.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1">
                      {rel.category?.name || "Accessory"}
                    </span>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      {rel.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-extrabold text-foreground">
                        ₹{relPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-foreground/60 flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {rel.rating || 4.8}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
