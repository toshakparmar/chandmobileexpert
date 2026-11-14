export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image: string;
  images: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface Category {
  name: string;
  image: string;
}

export const shopCategories: Category[] = [
  { name: "All", image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=200&q=80" },
  { name: "Cases", image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=200&q=80" },
  { name: "Screen Protectors", image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=200&q=80" },
  { name: "Chargers", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&q=80" },
  { name: "Cables", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&q=80" },
  { name: "Audio", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80" },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Ultra-Tough Armor Case for iPhone 15 Pro",
    slug: "ultra-tough-armor-case-iphone-15-pro",
    category: "Cases",
    price: 1499,
    originalPrice: 1999,
    description: "Military-grade protection for your premium device. Features shock-absorbing corners and a raised bezel to protect your screen and camera lenses.",
    features: ["Drop-tested up to 10 feet", "Anti-yellowing material", "Wireless charging compatible", "Raised camera lip"],
    image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&q=80",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      "https://images.unsplash.com/photo-1611791484670-ce19b801d192?w=800&q=80"
    ],
    inStock: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "prod-2",
    name: "Premium Liquid Silicone Case for Galaxy S24 Ultra",
    slug: "premium-liquid-silicone-case-galaxy-s24-ultra",
    category: "Cases",
    price: 999,
    description: "Soft to the touch, tough on drops. Our premium liquid silicone case offers a secure grip and minimalist aesthetic.",
    features: ["Microfiber inner lining", "Silky, soft-touch finish", "Easy to clean", "Slim profile"],
    image: "https://images.unsplash.com/photo-1541560052-5e137f229371?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541560052-5e137f229371?w=800&q=80",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80",
      "https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=800&q=80"
    ],
    inStock: true,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "prod-3",
    name: "9H Tempered Glass Edge-to-Edge (2-Pack)",
    slug: "9h-tempered-glass-edge-to-edge",
    category: "Screen Protectors",
    price: 499,
    originalPrice: 699,
    description: "Maximum scratch resistance with pristine clarity. Includes an easy-install alignment frame for perfect application every time.",
    features: ["9H hardness rating", "Oleophobic coating (anti-fingerprint)", "Shatter-proof membrane", "Includes alignment tool"],
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80",
      "https://images.unsplash.com/photo-1616422285623-14ff01633501?w=800&q=80",
      "https://images.unsplash.com/photo-1621644781446-ee2da4eb07df?w=800&q=80"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "prod-4",
    name: "Privacy Anti-Spy Tempered Glass",
    slug: "privacy-anti-spy-tempered-glass",
    category: "Screen Protectors",
    price: 599,
    description: "Keep your screen to yourself. This protector darkens the screen for anyone viewing from an angle while keeping it clear for you.",
    features: ["28-degree privacy angle", "Scratch resistant", "Touch-sensitive", "Edge-to-edge fit"],
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1621644781446-ee2da4eb07df?w=800&q=80",
      "https://images.unsplash.com/photo-1616422285623-14ff01633501?w=800&q=80"
    ],
    inStock: true,
    rating: 4.7,
    reviews: 156,
  },
  {
    id: "prod-5",
    name: "30W Fast Charger Adapter (GaN Tech)",
    slug: "30w-fast-charger-gan",
    category: "Chargers",
    price: 1299,
    originalPrice: 1599,
    description: "Ultra-compact and incredibly fast. Powered by Gallium Nitride (GaN) technology to charge your devices faster and cooler.",
    features: ["PD 3.0 compatible", "50% smaller than standard chargers", "Smart temperature control", "Foldable plug"],
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80"
    ],
    inStock: true,
    rating: 4.9,
    reviews: 245,
  },
  {
    id: "prod-6",
    name: "15W Magnetic Wireless Charging Pad",
    slug: "15w-magnetic-wireless-charging-pad",
    category: "Chargers",
    price: 1899,
    description: "Snap and charge. Perfectly aligns with MagSafe-compatible devices for efficient wireless charging.",
    features: ["Strong magnetic alignment", "Slim aluminum unibody", "Includes 1.5m braided cable", "Foreign object detection"],
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80"
    ],
    inStock: false,
    rating: 4.5,
    reviews: 67,
  },
  {
    id: "prod-7",
    name: "Braided USB-C to USB-C Cable (2m)",
    slug: "braided-usb-c-to-usb-c-cable-2m",
    category: "Cables",
    price: 699,
    description: "Built to last. Features a durable nylon braided exterior and reinforced stress points to withstand 20,000+ bends.",
    features: ["Supports up to 60W charging", "480Mbps data transfer", "Tangle-free design", "Aluminum connector housings"],
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80"
    ],
    inStock: true,
    rating: 4.8,
    reviews: 189,
  },
  {
    id: "prod-8",
    name: "Premium TWS True Wireless Earbuds",
    slug: "premium-tws-earbuds",
    category: "Audio",
    price: 2499,
    originalPrice: 3999,
    description: "Immersive sound with active noise cancellation. Enjoy deep bass, crystal clear calls, and up to 24 hours of total playtime.",
    features: ["Active Noise Cancellation (ANC)", "Bluetooth 5.3", "IPX5 Water Resistant", "Touch controls"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      "https://images.unsplash.com/photo-1606220588913-b3eea41b656b?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
    ],
    inStock: true,
    rating: 4.6,
    reviews: 432,
  },
];
