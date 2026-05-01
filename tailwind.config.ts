import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-quaternary": "var(--text-quaternary)",
        invert: "var(--invert)",
        "invert-text": "var(--invert-text)",
        accent: "var(--accent)",
      },
      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--tr-display)" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--lh-h1)", letterSpacing: "var(--tr-h1)" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--lh-h2)", letterSpacing: "var(--tr-h2)" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--lh-h3)", letterSpacing: "var(--tr-h3)" }],
        h4: ["var(--text-h4)", { lineHeight: "var(--lh-h4)" }],
        body: ["var(--text-body)", { lineHeight: "var(--lh-body)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--lh-sm)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--lh-caption)", letterSpacing: "var(--ls-caption)" }],
        micro: ["var(--text-micro)", { lineHeight: "var(--lh-micro)", letterSpacing: "var(--ls-micro)" }],
      },
      spacing: {
        "s-1": "var(--s-1)",
        "s-2": "var(--s-2)",
        "s-3": "var(--s-3)",
        "s-4": "var(--s-4)",
        "s-5": "var(--s-5)",
        "s-6": "var(--s-6)",
        "s-8": "var(--s-8)",
        "s-10": "var(--s-10)",
        "s-12": "var(--s-12)",
        "s-16": "var(--s-16)",
      },
      borderRadius: {
        none: "0",
        sm: "var(--r-sm)",
        DEFAULT: "var(--r-md)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        full: "var(--r-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        ease: "var(--ease)",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "180ms",
        slow: "320ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
