export type Theme = "light" | "dark";

export const THEME_COOKIE = "theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Read theme from document cookie. Defaults to "light". */
export function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${THEME_COOKIE}=`));
  const val = match?.split("=")[1];
  return isTheme(val) ? val : "light";
}

/** Persist theme cookie and apply to <html data-theme>. */
export function setTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
  document.documentElement.dataset.theme = theme;
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}
