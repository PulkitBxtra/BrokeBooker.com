import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Default check-in / check-out used across the app when the URL doesn't
 * supply them. Fixed to April 24 → April 25 of the current calendar year,
 * rolling to next year if we've already passed April 25.
 */
export function defaultCheckIn(): string {
  return aprilDate(24);
}
export function defaultCheckOut(): string {
  return aprilDate(25);
}

function aprilDate(day: number): string {
  const now = new Date();
  const thisYear = now.getFullYear();
  const candidate = new Date(thisYear, 3, day); // Month 3 = April
  const year = candidate.getTime() < now.setHours(0, 0, 0, 0) ? thisYear + 1 : thisYear;
  const d = new Date(year, 3, day);
  return toIsoDate(d);
}
