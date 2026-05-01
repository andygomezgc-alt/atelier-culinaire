"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, toggleTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setLocal] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocal(getTheme());
    setMounted(true);
  }, []);

  function onClick() {
    const next = toggleTheme(theme);
    setTheme(next);
    setLocal(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={theme === "dark" ? "Activate light theme" : "Activate dark theme"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md",
        "border border-border bg-bg text-text",
        "transition-colors duration-fast ease-ease",
        "hover:bg-surface",
        className,
      )}
    >
      <span
        className="block transition-opacity duration-200 ease-ease"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        {theme === "dark" ? (
          <Sun size={18} strokeWidth={1.5} />
        ) : (
          <Moon size={18} strokeWidth={1.5} />
        )}
      </span>
    </button>
  );
}
