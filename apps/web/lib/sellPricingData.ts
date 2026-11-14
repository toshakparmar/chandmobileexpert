export interface DeviceModelOption {
  name: string;
  storages: { label: string; basePrice: number }[];
}

export interface BrandTradeInCatalog {
  [brand: string]: DeviceModelOption[];
}

export const tradeInCatalog: BrandTradeInCatalog = {
  Apple: [
    {
      name: "iPhone 15 Pro Max",
      storages: [
        { label: "256GB", basePrice: 88000 },
        { label: "512GB", basePrice: 98000 },
        { label: "1TB", basePrice: 110000 },
      ],
    },
    {
      name: "iPhone 15 Pro",
      storages: [
        { label: "128GB", basePrice: 72000 },
        { label: "256GB", basePrice: 80000 },
        { label: "512GB", basePrice: 90000 },
      ],
    },
    {
      name: "iPhone 15",
      storages: [
        { label: "128GB", basePrice: 48000 },
        { label: "256GB", basePrice: 56000 },
      ],
    },
    {
      name: "iPhone 14 Pro Max",
      storages: [
        { label: "128GB", basePrice: 62000 },
        { label: "256GB", basePrice: 68000 },
        { label: "512GB", basePrice: 76000 },
      ],
    },
    {
      name: "iPhone 14",
      storages: [
        { label: "128GB", basePrice: 36000 },
        { label: "256GB", basePrice: 42000 },
      ],
    },
    {
      name: "iPhone 13",
      storages: [
        { label: "128GB", basePrice: 29000 },
        { label: "256GB", basePrice: 34000 },
      ],
    },
  ],
  Samsung: [
    {
      name: "Galaxy S24 Ultra",
      storages: [
        { label: "256GB", basePrice: 78000 },
        { label: "512GB", basePrice: 88000 },
      ],
    },
    {
      name: "Galaxy S23 Ultra",
      storages: [
        { label: "256GB", basePrice: 55000 },
        { label: "512GB", basePrice: 62000 },
      ],
    },
    {
      name: "Galaxy S23",
      storages: [
        { label: "128GB", basePrice: 34000 },
        { label: "256GB", basePrice: 38000 },
      ],
    },
  ],
  OnePlus: [
    {
      name: "OnePlus 12",
      storages: [
        { label: "256GB", basePrice: 44000 },
        { label: "512GB", basePrice: 49000 },
      ],
    },
    {
      name: "OnePlus 11 5G",
      storages: [
        { label: "128GB", basePrice: 28000 },
        { label: "256GB", basePrice: 32000 },
      ],
    },
  ],
};

export type PhysicalCondition = "Flawless / Like New" | "Minor Scratches (Good)" | "Heavy Scratches / Dents" | "Cracked Glass";
export type FunctionalStatus = "All Functional" | "Battery Degraded (<80%)" | "Camera / FaceID Faulty" | "Touch / Display Issue";

export function calculateTradeInValue(
  basePrice: number,
  condition: PhysicalCondition,
  functional: FunctionalStatus,
  hasBoxAndBill: boolean
) {
  let multiplier = 1.0;

  switch (condition) {
    case "Flawless / Like New":
      multiplier *= 1.0;
      break;
    case "Minor Scratches (Good)":
      multiplier *= 0.88;
      break;
    case "Heavy Scratches / Dents":
      multiplier *= 0.72;
      break;
    case "Cracked Glass":
      multiplier *= 0.55;
      break;
  }

  switch (functional) {
    case "All Functional":
      break;
    case "Battery Degraded (<80%)":
      multiplier *= 0.92;
      break;
    case "Camera / FaceID Faulty":
      multiplier *= 0.75;
      break;
    case "Touch / Display Issue":
      multiplier *= 0.65;
      break;
  }

  if (hasBoxAndBill) {
    multiplier += 0.05;
  }

  const finalCashValue = Math.round((basePrice * multiplier) / 100) * 100;
  const storeCreditValue = Math.round((finalCashValue * 1.08) / 100) * 100;

  return {
    cashEstimate: finalCashValue,
    storeCreditEstimate: storeCreditValue,
    originalEstimate: basePrice,
  };
}
