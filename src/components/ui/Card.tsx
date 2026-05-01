import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article";
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Tag = "div", ...props }, ref) => (
    <Tag
      ref={ref as never}
      className={cn(
        "bg-bg border border-border rounded-md p-s-6 shadow-xs",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-s-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-serif italic text-h3 text-text", className)}
      {...props}
    />
  );
}

export function CardMeta({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-mono text-caption text-text-secondary mt-s-1", className)}
      {...props}
    />
  );
}
