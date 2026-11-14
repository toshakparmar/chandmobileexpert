import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconOnly?: boolean;
  "aria-label"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      iconOnly = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]";

    const variantStyles = {
      primary: "bg-primary text-fg-on-primary hover:bg-primary-600 shadow-sm",
      secondary: "bg-surface-2 text-fg hover:bg-surface border border-border",
      outline: "bg-transparent text-fg border border-border hover:bg-surface-2",
      danger: "bg-danger text-white hover:bg-danger/90",
      ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2",
    }[variant];

    const sizeStyles = iconOnly
      ? {
          sm: "h-8 w-8 p-1.5",
          md: "h-10 w-10 p-2",
          lg: "h-12 w-12 p-3",
        }[size]
      : {
          sm: "h-8 px-3 text-xs gap-1.5",
          md: "h-10 px-4 text-sm gap-2",
          lg: "h-12 px-6 text-base gap-2.5",
        }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";

