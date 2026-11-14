export interface Service {
  slug: string;
  name: string;
  category: "repair" | "accessories" | "buy-sell";
  description: string;
  time: string;
  warranty: string;
  priceFrom?: string;
  iconName: string;
}

export const services: Service[] = [
  {
    slug: "screen-replacement",
    name: "Screen Replacement",
    category: "repair",
    description: "Cracked or unresponsive display swapped with precision-fit parts.",
    time: "30–45 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹4,499",
    iconName: "Smartphone",
  },
  {
    slug: "battery-replacement",
    name: "Battery Replacement",
    category: "repair",
    description: "Restore all-day battery life with genuine-grade cells.",
    time: "20–30 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹1,999",
    iconName: "BatteryCharging",
  },
  {
    slug: "charging-port-repair",
    name: "Charging Port Repair",
    category: "repair",
    description: "Fix loose connections and ports that won't hold a charge.",
    time: "25–40 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹1,499",
    iconName: "Plug",
  },
  {
    slug: "camera-repair",
    name: "Camera Repair",
    category: "repair",
    description: "Blurry, cracked or dead camera modules replaced and calibrated.",
    time: "30–50 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹2,999",
    iconName: "Camera",
  },
  {
    slug: "speaker-microphone",
    name: "Speaker & Microphone",
    category: "repair",
    description: "Restore call clarity and speaker output to factory spec.",
    time: "25–35 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹1,299",
    iconName: "Volume2",
  },
  {
    slug: "water-damage",
    name: "Water Damage Restoration",
    category: "repair",
    description: "Full diagnostic clean and corrosion treatment for liquid exposure.",
    time: "24–48 hrs",
    warranty: "Store Guarantee",
    priceFrom: "₹3,499",
    iconName: "Droplets",
  },
  {
    slug: "back-glass-repair",
    name: "Back Glass Replacement",
    category: "repair",
    description: "Shattered rear panel replaced without disturbing internals.",
    time: "40–60 min",
    warranty: "1 Year Warranty",
    priceFrom: "₹2,499",
    iconName: "Layers",
  },
  {
    slug: "motherboard-repair",
    name: "Motherboard Micro-Soldering",
    category: "repair",
    description: "Board-level micro-soldering for complex faults others turn away.",
    time: "48–72 hrs",
    warranty: "6 Months Warranty",
    priceFrom: "₹3,999",
    iconName: "CircuitBoard",
  },
  {
    slug: "software-performance",
    name: "Software & OS Troubleshooting",
    category: "repair",
    description: "Diagnostics, OS restore, boot-loop recovery and performance tuning.",
    time: "20–30 min",
    warranty: "Full Support",
    priceFrom: "₹999",
    iconName: "Cpu",
  },
];

export const brands = [
  { name: "Apple", logo: "https://cdn.simpleicons.org/apple" },
  { name: "Samsung", logo: "https://cdn.simpleicons.org/samsung" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus" },
  { name: "Google Pixel", logo: "https://cdn.simpleicons.org/google" },
  { name: "Xiaomi", logo: "https://cdn.simpleicons.org/xiaomi" },
  { name: "Oppo", logo: "https://cdn.simpleicons.org/oppo" },
  { name: "Vivo", logo: "https://cdn.simpleicons.org/vivo" },
  { name: "Motorola", logo: "https://cdn.simpleicons.org/motorola" },
  { name: "Huawei", logo: "https://cdn.simpleicons.org/huawei" },
  { name: "Nokia", logo: "https://cdn.simpleicons.org/nokia" },
];

export const whyUs = [
  {
    title: "Master Certified Technicians",
    description: "Over a decade of hands-on experience across Apple, Samsung, Google, and OnePlus motherboards.",
  },
  {
    title: "1-Year Certified Warranty",
    description: "Every component we replace is backed by our comprehensive 12-month store warranty.",
  },
  {
    title: "100% Data Privacy Guarantee",
    description: "Strict no-access policy on personal photos, messages, and accounts during repair.",
  },
  {
    title: "Transparent Upfront Pricing",
    description: "Itemized written quotes with no hidden charges before any repair work begins.",
  },
  {
    title: "Express Turnaround",
    description: "90% of screen and battery replacements completed in under 45 minutes.",
  },
  {
    title: "Factory-Grade Equipment",
    description: "ESD-safe workstations, laser separators, and microscopic hardware audit tools.",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Book or Walk-In",
    subtitle: "Instant Online Booking & Intake",
    description: "Tell us your phone model and fault online or visit our workshop for direct priority intake.",
    tag: "INTAKE & SCHEDULING",
    time: "2 Minutes",
    warranty: "Pre-Booking Protected",
  },
  {
    step: "02",
    title: "Free 15-Min Diagnosis",
    subtitle: "Precision Multi-Point Fault Inspection",
    description: "Our certified technicians inspect hardware, battery health, and display digitizers at zero cost.",
    tag: "HARDWARE AUDIT",
    time: "10–15 Minutes",
    warranty: "100% Free Test",
  },
  {
    step: "03",
    title: "Transparent Quote",
    subtitle: "Upfront All-Inclusive Pricing",
    description: "Receive a clear written quote with genuine OEM options. No work starts without your approval.",
    tag: "HONEST ESTIMATION",
    time: "Immediate",
    warranty: "Price Guarantee",
  },
  {
    step: "04",
    title: "Master Repair",
    subtitle: "Grade-A Parts & ESD Safe Lab",
    description: "Precision micro-soldering and factory-spec part replacement with water-resistance resealing.",
    tag: "PRECISION WORKBENCH",
    time: "20–45 Minutes",
    warranty: "Grade-A Parts",
  },
  {
    step: "05",
    title: "20-Point Quality Check",
    subtitle: "Functional Bench & Stress Testing",
    description: "Rigorous testing of touch response, Face ID/Fingerprint, cameras, thermal curve, and charging speed.",
    tag: "QUALITY ASSURANCE",
    time: "10 Minutes",
    warranty: "1-Year Certified",
  },
  {
    step: "06",
    title: "Pick Up & 1-Year Warranty",
    subtitle: "Lifetime Support & Hassle-Free Care",
    description: "Collect your device in flawless working condition with full 12-month warranty certificate and GST invoice.",
    tag: "HANDOVER & CARE",
    time: "Instant Handover",
    warranty: "1-Year Full Coverage",
  },
];

export const testimonials = [
  {
    id: "aarav",
    name: "Aarav Mehta",
    device: "iPhone 14 Pro",
    role: "iPhone 14 Pro Owner",
    quote:
      "Got my iPhone screen replaced in less than an hour. The service was fast, professional and the pricing was transparent. The 1-Year warranty gave me total peace of mind.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    brandKey: "apple",
    brandName: "Apple",
  },
  {
    id: "simran",
    name: "Simran Kaur",
    device: "Samsung Galaxy S23",
    role: "Galaxy S23 Owner",
    quote:
      "My phone wouldn't charge at all. They diagnosed it in minutes, fixed the charging port the same day, and cleaned the speaker grilles for free. Amazing service!",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    brandKey: "samsung",
    brandName: "Samsung",
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    device: "OnePlus 11",
    role: "OnePlus 11 5G Owner",
    quote:
      "Dropped my phone in water and thought it was gone for good. Chand Mobile brought it back to life, camera and motherboard all working perfectly.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    brandKey: "oneplus",
    brandName: "OnePlus",
  },
  {
    id: "priya",
    name: "Priya Nair",
    device: "Google Pixel 8",
    role: "Google Pixel 8 Owner",
    quote:
      "Transparent quote, genuine parts, and a warranty I actually trust. Also bought premium protective accessories here. This is now my go-to mobile shop.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    brandKey: "google",
    brandName: "Google",
  },
  {
    id: "karan",
    name: "Karan Malhotra",
    device: "iPhone 13",
    role: "iPhone 13 Owner",
    quote:
      "Battery was barely lasting half a day. Replaced it in thirty minutes with a certified cell and it feels brand new again. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    brandKey: "apple",
    brandName: "Apple",
  },
];

export const faqs = [
  {
    id: "devices",
    question: "What mobile devices and brands do you repair?",
    answer:
      "We repair smartphones and tablets from Apple (iPhone/iPad), Samsung, OnePlus, Google Pixel, Xiaomi/Redmi, Oppo, Vivo, Realme, Motorola, and Nothing. We cover screen, battery, port, camera, water damage, and board-level issues.",
  },
  {
    id: "turnaround",
    question: "How long does a typical mobile repair take?",
    answer:
      "Most common repairs — like screen replacements and battery swaps — are completed in 30 to 45 minutes while you wait. Complex repairs like liquid damage or motherboard micro-soldering typically take 24 to 72 hours.",
  },
  {
    id: "warranty",
    question: "Do you provide a warranty on repairs and replacement parts?",
    answer:
      "Yes! Every repair is backed by an official 1-Year Store Warranty covering replacement parts and workmanship. If a replaced part ever shows a defect, we replace it free of charge.",
  },
  {
    id: "privacy",
    question: "Will my personal data, photos, and messages stay safe?",
    answer:
      "100% Yes. We adhere to strict data privacy protocols. You do not need to provide passcodes for hardware checks where not necessary, and our technicians never access your private data.",
  },
  {
    id: "diagnosis",
    question: "Can I get a free diagnosis before deciding to repair?",
    answer:
      "Yes. Every device receives a free, no-obligation 15-minute diagnostic evaluation and an upfront itemized quote before any work begins.",
  },
  {
    id: "buy-sell",
    question: "Do you buy, sell, and trade used or refurbished phones?",
    answer:
      "Yes. We offer certified pre-owned smartphones that pass a 32-point quality check with up to 12 months warranty, as well as instant cash and trade-in valuations for your old phone.",
  },
  {
    id: "accessories",
    question: "What types of mobile accessories do you stock?",
    answer:
      "We carry premium tempered glass protectors, shockproof cases, fast chargers, braided cables, car mounts, power banks, and audio gear tested for durability and device compatibility.",
  },
];

export const stats = [
  { value: "10,000+", label: "Devices Repaired" },
  { value: "4.9/5", label: "Customer Rating (600+ Reviews)" },
  { value: "99.4%", label: "First-Time Fix Rate" },
  { value: "1 Year", label: "Certified Store Warranty" },
];

export const showcaseItems = [
  { title: "Cracked Screen", before: "Shattered display", after: "Flawless glass, restored", image: "/images/showcase/cracked.jpg" },
  { title: "Battery Replacement", before: "Draining in hours", after: "Full-day battery life", image: "/images/showcase/battery.jpg" },
  { title: "Charging Port", before: "No connection", after: "Reliable, fast charging", image: "/images/showcase/charging.jpg" },
  { title: "Back Glass", before: "Fractured rear panel", after: "Seamless factory finish", image: "/images/showcase/backglass.jpg" },
  { title: "Camera Lens", before: "Blurred, cracked lens", after: "Crystal clear shots", image: "/images/showcase/camera.jpg" },
  { title: "Water Damage", before: "Unresponsive after spill", after: "Fully functional again", image: "/images/showcase/water.jpg" },
];

export const teamMembers = [
  {
    name: "Founder",
    role: "Founder",
    expertise: "Master Technician",
    bio: "With over 15 years of experience, founded the company to bring quality repairs to our customers.",
    image: "/team/founder.jpg"
  },
  {
    name: "CEO",
    role: "CEO",
    expertise: "Business Strategy",
    bio: "Driving the vision and expansion of Chand Mobile Expert to reach new heights.",
    image: "/team/ceo.jpg"
  },
  {
    name: "Operation Director",
    role: "Operation Director",
    expertise: "Workflow Management",
    bio: "Ensures every device goes through our rigorous quality checks swiftly and securely.",
    image: "/team/operations.jpg"
  },
  {
    name: "Technician",
    role: "Senior Technician",
    expertise: "Motherboard Repairs",
    bio: "Specializes in complex micro-soldering and intricate board-level diagnostics.",
    image: "/team/technician1.jpg"
  },
  {
    name: "Technician",
    role: "Technician",
    expertise: "Screen & Battery",
    bio: "Expert at rapid, flawless screen and battery replacements for all flagship devices.",
    image: "/team/technician2.jpg"
  }
];



