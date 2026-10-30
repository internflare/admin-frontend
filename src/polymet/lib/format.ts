import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

const toDate = (value: string | Date) =>
  typeof value === "string" ? parseISO(value) : value;

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return format(toDate(value), "d MMM yyyy");
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  return format(toDate(value), "d MMM yyyy, HH:mm");
}

export function formatRelative(value?: string | Date | null) {
  if (!value) return "—";
  return `${formatDistanceToNowStrict(toDate(value))} ago`;
}

export function formatCurrency(amount?: number | null, currency = "NGN") {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-NG").format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value?: number | null, digits = 1) {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)}%`;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return "••••";
  return `${name.slice(0, 1)}•••${name.slice(-1)}@${domain}`;
}

export function maskPhone(phone: string) {
  return `${phone.slice(0, 4)} ••• ••${phone.slice(-2)}`;
}
