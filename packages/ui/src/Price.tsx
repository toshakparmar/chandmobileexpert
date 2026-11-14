import React from "react";
import { money } from "@chand/types";

export interface PriceProps {
  amount: number;
  originalAmount?: number | null;
  isPaise?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Price({
  amount,
  originalAmount,
  isPaise = false,
  size = "md",
  className = "",
}: PriceProps) {
  const formattedPrice = money.formatINR(amount, isPaise);
  const formattedOriginal = originalAmount ? money.formatINR(originalAmount, isPaise) : null;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
    xl: "text-2xl font-extrabold",
  }[size];

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`text-fg ${sizeClasses}`}>{formattedPrice}</span>
      {formattedOriginal && (
        <span className="text-xs text-fg-subtle line-through">{formattedOriginal}</span>
      )}
    </div>
  );
}

