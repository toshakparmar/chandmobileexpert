import React from "react";
import { OrderStatus, PaymentStatus, RepairStatus } from "@chand/types";

export type EntityStatus =
  | OrderStatus
  | PaymentStatus
  | RepairStatus
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | string;

export interface StatusPillProps {
  status: EntityStatus;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusPill({ status, label, size = "md", className = "" }: StatusPillProps) {
  const normStatus = String(status).toUpperCase();

  // Central status-to-color map matching unified design tokens
  let styleClasses = "bg-surface-2 text-fg-muted border-border";

  switch (normStatus) {
    case OrderStatus.DELIVERED:
    case PaymentStatus.PAID:
    case RepairStatus.COMPLETED:
    case "ACTIVE":
      styleClasses = "bg-success/15 text-success border-success/30";
      break;

    case OrderStatus.PROCESSING:
    case OrderStatus.SHIPPED:
    case RepairStatus.IN_PROGRESS:
    case RepairStatus.APPROVED:
    case PaymentStatus.AWAITING_VERIFICATION:
      styleClasses = "bg-info/15 text-info border-info/30";
      break;

    case OrderStatus.PENDING:
    case PaymentStatus.AWAITING_PAYMENT:
    case RepairStatus.PENDING:
    case RepairStatus.REVIEWING:
      styleClasses = "bg-warning/15 text-warning border-warning/30";
      break;

    case OrderStatus.CANCELLED:
    case PaymentStatus.REJECTED:
    case PaymentStatus.EXPIRED:
    case "INACTIVE":
      styleClasses = "bg-danger/15 text-danger border-danger/30";
      break;

    case PaymentStatus.REFUNDED:
      styleClasses = "bg-purple-500/15 text-purple-400 border-purple-500/30";
      break;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";
  const displayLabel = label || normStatus.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses} ${styleClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
}

