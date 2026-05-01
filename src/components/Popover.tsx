"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

type PopoverContext = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
};

const PopoverCtx = createContext<PopoverContext | null>(null);

function usePopover() {
  const ctx = useContext(PopoverCtx);
  if (!ctx) throw new Error("Popover subcomponents must be inside <Popover>");
  return ctx;
}

export function Popover({ children, open = false, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(open);
  const isControlled = onOpenChange !== undefined;
  const actualOpen = isControlled ? open : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  const triggerId = `popover-trigger-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <PopoverCtx.Provider value={{ open: actualOpen, setOpen, triggerId }}>
      <div className="relative">{children}</div>
    </PopoverCtx.Provider>
  );
}

export function PopoverTrigger({ children, className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const ctx = usePopover();
  return (
    <button
      id={ctx.triggerId}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function PopoverContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx.open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !document.getElementById(ctx.triggerId)?.contains(e.target as Node)
      ) {
        ctx.setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ctx.open, ctx]);

  if (!ctx.open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full left-0 mt-2 z-50",
        "bg-bg border border-border rounded-md shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
