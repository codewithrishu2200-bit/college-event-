import type { EventStatus, UserRole } from "../types";

export const STATUS_TEXT_CLASS: Record<EventStatus, string> = {
  Upcoming: "text-blue-700",
  Ongoing: "text-emerald-700",
  Completed: "text-slate-500",
  Cancelled: "text-rose-700",
  Postponed: "text-amber-700",
};

export const ROLE_TEXT_CLASS: Record<UserRole, string> = {
  Admin: "text-rose-700",
  Organizer: "text-blue-700",
  Attendee: "text-slate-600",
};

export function formatEventDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimestamp(ts: string): string {
  if (!ts) return "";
  const parsed = new Date(ts.includes("T") ? ts : `${ts.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return ts;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
