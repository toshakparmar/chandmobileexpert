import React, { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function Card({ children, bordered = true, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-surface p-5 text-fg ${
        bordered ? "border border-border shadow-sm" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

