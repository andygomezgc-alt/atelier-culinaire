import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const input = cva(
  [
    "block w-full bg-bg text-text",
    "border border-border",
    "transition-colors duration-fast ease-ease",
    "placeholder:text-text-tertiary placeholder:font-serif placeholder:italic",
    "focus:outline-none focus:border-text",
    "disabled:opacity-40 disabled:pointer-events-none",
  ],
  {
    variants: {
      size: {
        md: "h-10 px-s-3 text-body rounded-sm",
        large: "min-h-[7rem] p-s-5 text-h4 rounded-md leading-relaxed",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof input>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(input({ size }), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> &
  VariantProps<typeof input>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "large", ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(input({ size }), "resize-none", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
