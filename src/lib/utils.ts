import type { Priority } from "@/types";

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatRelativeDay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatGivenAt(date: Date | string): string {
  return `${formatRelativeDay(date)} · ${formatTime(date)}`;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export const PRIORITY_STYLES: Record<
  Priority,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  HIGH: {
    label: "High",
    dot: "bg-clay-500",
    text: "text-clay-600",
    bg: "bg-clay-50",
    border: "border-clay-300",
  },
  NORMAL: {
    label: "Normal",
    dot: "bg-gold-500",
    text: "text-gold-600",
    bg: "bg-gold-50",
    border: "border-gold-300",
  },
  LOW: {
    label: "Low",
    dot: "bg-sage-500",
    text: "text-sage-600",
    bg: "bg-sage-50",
    border: "border-sage-200",
  },
};

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/i;

/** Finds the first http(s) URL in a block of text, if any — used to decide
 * whether a task's description should show a link preview. */
export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(URL_PATTERN);
  if (!match) return null;
  // Trim common trailing punctuation a sentence might leave stuck to the URL.
  return match[1].replace(/[.,;:!?)\]]+$/, "");
}
