import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-50",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "sm" && "px-3 py-1.5 text-xs",
          variant === "primary" &&
            "bg-gradient-to-r from-brand-600 to-blue-500 text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
          variant === "secondary" &&
            "border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
          variant === "ghost" &&
            "text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",
          variant === "danger" &&
            "bg-gradient-to-r from-danger-600 to-rose-500 text-white shadow-lg shadow-danger-500/30 transition-all hover:shadow-xl hover:shadow-danger-500/40 hover:brightness-110 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
