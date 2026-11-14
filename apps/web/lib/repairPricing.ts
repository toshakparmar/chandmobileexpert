export type RepairType =
  | "Screen Replacement"
  | "Battery Replacement"
  | "Charging Port Repair"
  | "Camera Repair"
  | "Back Glass Repair"
  | "Water Damage"
  | "Motherboard Repair"
  | "Speaker & Mic";

export const repairTypes: RepairType[] = [
  "Screen Replacement",
  "Battery Replacement",
  "Charging Port Repair",
  "Camera Repair",
  "Back Glass Repair",
  "Water Damage",
  "Motherboard Repair",
  "Speaker & Mic",
];

export const deviceCatalog: Record<string, string[]> = {
  Apple: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone SE"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy S22", "Galaxy A54", "Galaxy Z Flip 5", "Galaxy Z Fold 5"],
  OnePlus: ["OnePlus 12", "OnePlus 11", "OnePlus 10 Pro", "OnePlus Nord 3", "OnePlus Nord CE 3"],
  "Google Pixel": ["Pixel 8 Pro", "Pixel 8", "Pixel 7 Pro", "Pixel 7a", "Pixel 6a"],
  Xiaomi: ["Xiaomi 14", "Xiaomi 13 Pro", "Redmi Note 13 Pro", "Poco X6 Pro", "Poco F5"],
  Vivo: ["Vivo X100 Pro", "Vivo V30 Pro", "Vivo V29", "Vivo T2 Pro"],
  Oppo: ["Oppo Reno 11 Pro", "Oppo Find N3 Flip", "Oppo F25 Pro"],
  Realme: ["Realme 12 Pro+", "Realme GT 2 Pro", "Realme Narzo 60"],
  Motorola: ["Edge 40 Pro", "Edge 40 Neo", "Moto G84 5G"],
};

export const conditions = ["Excellent", "Good", "Fair", "Poor"] as const;
export type Condition = (typeof conditions)[number];

const basePrice: Record<RepairType, number> = {
  "Screen Replacement": 4499,
  "Battery Replacement": 1999,
  "Charging Port Repair": 1499,
  "Camera Repair": 2999,
  "Back Glass Repair": 2499,
  "Water Damage": 3499,
  "Motherboard Repair": 3999,
  "Speaker & Mic": 1299,
};

const baseTime: Record<RepairType, string> = {
  "Screen Replacement": "35 min",
  "Battery Replacement": "25 min",
  "Charging Port Repair": "30 min",
  "Camera Repair": "40 min",
  "Back Glass Repair": "50 min",
  "Water Damage": "24–48 hrs",
  "Motherboard Repair": "48–72 hrs",
  "Speaker & Mic": "30 min",
};

const brandMultiplier: Record<string, number> = {
  Apple: 1.35,
  Samsung: 1.15,
  OnePlus: 1.0,
  "Google Pixel": 1.1,
  Xiaomi: 0.85,
  Vivo: 0.85,
  Oppo: 0.85,
  Realme: 0.8,
  Motorola: 0.85,
};

const conditionMultiplier: Record<Condition, number> = {
  Excellent: 0.95,
  Good: 1,
  Fair: 1.1,
  Poor: 1.25,
};

export function estimateRepair(
  brand: string,
  repairType: RepairType,
  condition: Condition = "Good"
) {
  const price = basePrice[repairType] ?? 2499;
  const bMul = brandMultiplier[brand] ?? 1;
  const cMul = conditionMultiplier[condition] ?? 1;
  const estimated = Math.round((price * bMul * cMul) / 10) * 10;
  return {
    price: estimated,
    time: baseTime[repairType] ?? "30–45 min",
    warranty: "1 Year Warranty",
  };
}
