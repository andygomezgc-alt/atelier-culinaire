import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  [
    "inline-flex items-center justify-center gap-s-2",
    "font-sans uppercase font-medium",
    "tracking-[0.1em]",
    "border transition-colors duration-fast ease-ease",
    "rounded-sm",
    "disabled:opacity-40 disabled:pointer-events-none",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-invert text-invert-text border-invert",
          "hover:bg-text hover:border-text",
        ],
        ghost: [
          "bg-transparent text-text border-border-strong",
          "hover:bg-surface",
        ],
        destructive: [
          "bg-transparent text-accent border-accent",
          "hover:bg-accent hover:text-invert-text",
        ],
      },
      size: {
        sm: "h-8 px-s-3 text-micro",
        md: "h-10 px-s-4 text-caption",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
