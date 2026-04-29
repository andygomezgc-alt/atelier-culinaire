import type { Lang } from "./i18n";

export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export function formatDate(ts: number | Date | string, l: Lang = "es"): string {
  const d = new Date(ts);
  const locale = l === "it" ? "it-IT" : l === "en" ? "en-GB" : "es-ES";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

export function formatLongDate(ts: number | Date | string, l: Lang = "es"): string {
  const d = new Date(ts);
  const locale = l === "it" ? "it-IT" : l === "en" ? "en-GB" : "es-ES";
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function shortText(s: unknown, n: number): string {
  const str = String(s ?? "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function initialsFrom(name: string): string {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
}

// Tiny markdown-ish renderer (server-safe — pure string transform).
export function renderMd(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  t = t.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  t = t.replace(/^# (.+)$/gm, "<h3>$1</h3>");
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/(^- .+(\n|$))+/gm, (m) => {
    const items = m
      .trim()
      .split("\n")
      .map((l) => "<li>" + l.replace(/^- /, "") + "</li>")
      .join("");
    return "<ul>" + items + "</ul>";
  });
  t = t.replace(/(^\d+\. .+(\n|$))+/gm, (m) => {
    const items = m
      .trim()
      .split("\n")
      .map((l) => "<li>" + l.replace(/^\d+\. /, "") + "</li>")
      .join("");
    return "<ol>" + items + "</ol>";
  });
  return t;
}
