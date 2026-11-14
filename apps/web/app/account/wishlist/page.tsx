"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { api } from "@/lib/api";
import { Heart, ShoppingCart, Trash2, CheckCircle2, Package, Sparkles, Star } from "lucide-react";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ShinyButton } from "@/components/reactbits/ShinyButton";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  brand: string;
  rating: number;
  inStock: boolean;
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem, syncWishlist } = useCartStore();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        // Clean up any stale dummy IDs from previous tests
        const cleanedIds = wishlist.filter((id) => !id.startsWith("fb-"));
        if (cleanedIds.length !== wishlist.length) {
          useCartStore.setState({ wishlist: cleanedIds });
        }

        const [productsRes, userWishlistRes] = await Promise.allSettled([
          api.get("/products"),
          api.get("/wishlist"),
        ]);

        if (userWishlistRes.status === "fulfilled" && Array.isArray(userWishlistRes.value.data)) {
          const backendProductIds = userWishlistRes.value.data
            .map((item: any) => item.productId || item.product?.id)
            .filter(Boolean);
          backendProductIds.forEach((pid: string) => {
            if (!wishlist.includes(pid)) {
              toggleWishlist(pid);
            }
          });
        }

        if (
          productsRes.status === "fulfilled" &&
          Array.isArray(productsRes.value.data) &&
          productsRes.value.data.length > 0
        ) {
          const mapped: WishlistProduct[] = productsRes.value.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.discountPrice || p.price),
            originalPrice: p.discountPrice ? Number(p.price) : null,
            image: p.image || "https://images.unsplash.com/photo-1601784551446-20c9e07cd561?w=500&q=80",
            category: p.category?.name || "Accessories",
            brand: p.brand?.name || "Genuine",
            rating: 4.8,
            inStock: p.inStock ?? true,
          }));
          if (isSubscribed) {
            setProducts(mapped);
            setLoading(false);
          }
          return;
        }
      } catch {
        // If error, do not inject static data
      }

      if (isSubscribed) {
        setProducts([]);
        setLoading(false);
      }
    };

    fetchWishlistProducts();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const wishlistedItems = products.filter((p) => wishlist.includes(p.id));

  const handleRemoveItem = async (product: WishlistProduct) => {
    toggleWishlist(product.id);
    showToast(`Removed "${product.name}" from wishlist.`);
    try {
      await api.delete(`/wishlist/items/${product.id}`);
    } catch (e) {}
  };

  const handleAddToCart = (product: WishlistProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
    });
    showToast(`Added "${product.name}" to cart.`);
  };

  const handleMoveAllToCart = () => {
    wishlistedItems.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
      });
    });
    showToast(`Moved ${wishlistedItems.length} items to your cart.`);
  };

  return (
    <div className="space-y-7 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70 dark:border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            My Wishlist
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {wishlistedItems.length} {wishlistedItems.length === 1 ? "item" : "items"} saved for upcoming purchase or repair.
          </p>
        </div>

        {wishlistedItems.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Move All to Cart</span>
          </button>
        )}
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/30 text-foreground text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Content: Loader, Empty or Grid */}
      {loading ? (
        <div className="flex-1 min-h-[380px] flex flex-col items-center justify-center gap-3 py-20 animate-in fade-in duration-150">
          <div className="w-9 h-9 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Loading your wishlist items...
          </p>
        </div>
      ) : wishlistedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/70 dark:border-white/[0.08] rounded-3xl bg-foreground/[0.01]">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-foreground">Your wishlist is empty</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
            Save items to your wishlist while browsing our catalog of genuine smartphone accessories and spares.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="h-10 px-6 rounded-2xl bg-slate-900 text-white dark:bg-accent dark:text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Browse Shop</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistedItems.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;

            return (
              <SpotlightCard
                key={product.id}
                spotlightColor="#a8d946"
                intensity={0.05}
                borderGlow={0.25}
                className="group rounded-3xl border border-border/80 dark:border-white/[0.09] bg-foreground/[0.015] dark:bg-white/[0.02] p-4.5 flex flex-col justify-between hover:border-accent/50 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted/40 mb-3.5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {product.category}
                    </span>

                    {/* Discount */}
                    {discountPercent && discountPercent > 0 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-accent text-slate-950 shadow-2xs">
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* Remove Icon */}
                    <button
                      onClick={() => handleRemoveItem(product)}
                      title="Remove item"
                      className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-background/90 dark:bg-slate-900/90 text-muted-foreground hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-accent">{product.brand}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-foreground text-[11px]">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {product.rating}
                    </span>
                  </div>

                  <h2 className="font-bold text-foreground text-sm line-clamp-1 mb-1 leading-snug">
                    {product.name}
                  </h2>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-black text-foreground text-base">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                <ShinyButton
                  onClick={() => handleAddToCart(product)}
                  shimmerColor="rgba(168,217,70,0.4)"
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 text-xs font-bold shadow-2xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </ShinyButton>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
