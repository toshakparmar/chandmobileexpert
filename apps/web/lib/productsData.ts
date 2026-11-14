export type DeviceCategory = "phones" | "accessories" | "tablets";
export type DeviceCondition = "Like New" | "Excellent" | "Good" | "Brand New";

export interface RefurbishedProduct {
  id: string;
  name: string;
  brand: "Apple" | "Samsung" | "Google" | "OnePlus" | "Chand Expert";
  category: DeviceCategory;
  price: number;
  originalPrice: number;
  condition: DeviceCondition;
  storage: string;
  color: string;
  batteryHealth?: string;
  warranty: string;
  rating: number;
  reviewsCount: number;
  image: string;
  specs: {
    display: string;
    processor: string;
    camera: string;
    ram: string;
  };
  features: string[];
  inStock: boolean;
  tag?: string;
}

export const refurbishedProducts: RefurbishedProduct[] = [
  {
    id: "iphone-15-pro-max-256",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "phones",
    price: 104999,
    originalPrice: 159900,
    condition: "Like New",
    storage: "256GB",
    color: "Natural Titanium",
    batteryHealth: "98%",
    warranty: "12 Months Certified Warranty",
    rating: 4.9,
    reviewsCount: 142,
    image: "/models/iphone.png",
    specs: {
      display: '6.7" Super Retina XDR OLED 120Hz',
      processor: "A17 Pro (3nm)",
      camera: "48MP Main + 5x Telephoto + 12MP Ultra-Wide",
      ram: "8GB",
    },
    features: [
      "100% Original Grade-A Titanium Body",
      "Factory Checked 32-Point Diagnostic Test",
      "Brand New Screen Protector & Cable Included",
      "7-Day Money-Back Guarantee",
    ],
    inStock: true,
    tag: "Best Seller",
  },
  {
    id: "iphone-14-128",
    name: "iPhone 14",
    brand: "Apple",
    category: "phones",
    price: 44999,
    originalPrice: 69900,
    condition: "Excellent",
    storage: "128GB",
    color: "Midnight Blue",
    batteryHealth: "94%",
    warranty: "12 Months Certified Warranty",
    rating: 4.8,
    reviewsCount: 289,
    image: "/models/iphone.png",
    specs: {
      display: '6.1" Super Retina XDR OLED',
      processor: "A15 Bionic",
      camera: "Dual 12MP System with Action Mode",
      ram: "6GB",
    },
    features: [
      "Clean IMEI & iCloud Unlocked",
      "Flawless Screen & Camera Lenses",
      "Free Fast Charger Adapter Included",
      "7-Day Hassle-Free Replacement",
    ],
    inStock: true,
    tag: "Popular",
  },
  {
    id: "samsung-s24-ultra-256",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "phones",
    price: 92999,
    originalPrice: 129999,
    condition: "Like New",
    storage: "256GB",
    color: "Titanium Gray",
    batteryHealth: "99%",
    warranty: "12 Months Certified Warranty",
    rating: 4.9,
    reviewsCount: 96,
    image: "/models/iphone.png",
    specs: {
      display: '6.8" Dynamic AMOLED 2X 120Hz',
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      camera: "200MP Quad Camera with AI Zoom",
      ram: "12GB",
    },
    features: [
      "Built-in S-Pen Stylus Included",
      "Galaxy AI Features Fully Functional",
      "Zero Scratches on Display & Frame",
      "1-Year Complete Store Warranty",
    ],
    inStock: true,
    tag: "Flagship",
  },
  {
    id: "oneplus-12-256",
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    category: "phones",
    price: 52999,
    originalPrice: 69999,
    condition: "Like New",
    storage: "256GB",
    color: "Silky Black",
    batteryHealth: "99%",
    warranty: "12 Months Certified Warranty",
    rating: 4.9,
    reviewsCount: 112,
    image: "/models/iphone.png",
    specs: {
      display: '6.82" 2K ProXDR Display 120Hz',
      processor: "Snapdragon 8 Gen 3",
      camera: "4th Gen Hasselblad Camera System",
      ram: "16GB",
    },
    features: [
      "100W SUPERVOOC Fast Charger Included",
      "5400mAh High-Capacity Battery",
      "OxygenOS Smooth Performance",
      "1-Year Warranty & Free Service",
    ],
    inStock: true,
    tag: "High Performance",
  },
];
