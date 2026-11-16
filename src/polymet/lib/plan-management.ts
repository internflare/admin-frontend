import { isRecord, type AdminRecord } from "@/polymet/lib/admin-service";

export type LimitValue = number | boolean | null;
export interface ManagedPlan {
  code: string;
  name: string;
  audience: "talent" | "employer";
  price_monthly: number;
  currency: "NGN" | "USD";
  updated_at: string;
  limits: Record<string, LimitValue>;
  limitDefinitions: { key: string; label: string; type: "count" | "boolean"; unit: string }[];
}

export function readManagedPlan(record: AdminRecord): ManagedPlan | null {
  if (typeof record.code !== "string" || typeof record.name !== "string" ||
      !["talent", "employer"].includes(String(record.audience)) ||
      typeof record.price_monthly !== "number" || !Number.isFinite(record.price_monthly) ||
      !["NGN", "USD"].includes(String(record.currency)) ||
      typeof record.updated_at !== "string" || !Number.isFinite(Date.parse(record.updated_at)) ||
      !isRecord(record.limits) || !Array.isArray(record.limitDefinitions)) return null;
  const keys = Object.keys(record.limits);
  if (keys.length !== record.limitDefinitions.length ||
      new Set(record.limitDefinitions.map((definition) => isRecord(definition) ? definition.key : undefined)).size !== keys.length) return null;
  if (!record.limitDefinitions.every((definition) =>
    isRecord(definition) && typeof definition.key === "string" &&
    Object.hasOwn(record.limits as AdminRecord, definition.key) &&
    typeof definition.label === "string" && typeof definition.unit === "string" &&
    ["count", "boolean"].includes(String(definition.type)) &&
    ((record.limits as AdminRecord)[definition.key] === null ||
      (definition.type === "boolean"
        ? typeof (record.limits as AdminRecord)[definition.key] === "boolean"
        : Number.isSafeInteger((record.limits as AdminRecord)[definition.key]) &&
          Number((record.limits as AdminRecord)[definition.key]) >= 0)),
  )) return null;
  return record as unknown as ManagedPlan;
}

export function planUpdatePayload(plan: ManagedPlan, price: string, currency: string, limits: Record<string, string>, reason: string) {
  const amount = Number(price);
  if (!price.trim() || !Number.isFinite(amount) || amount < 0 ||
      amount > Number.MAX_SAFE_INTEGER / 100 || Math.abs(amount * 100 - Math.round(amount * 100)) >= 0.000001) {
    throw new Error("Enter a non-negative monthly price with at most two decimal places.");
  }
  if ((plan.code === "free" || plan.code === "emp-free") && amount !== 0) throw new Error("Reserved free tiers must remain free.");
  if (currency !== "NGN" && currency !== "USD") throw new Error("Select NGN or USD.");
  const values = Object.fromEntries(plan.limitDefinitions.map((definition) => {
    const raw = limits[definition.key];
    if (raw === "null") return [definition.key, null];
    if (definition.type === "boolean") {
      if (raw !== "true" && raw !== "false") throw new Error(`Select a value for ${definition.label}.`);
      return [definition.key, raw === "true"];
    }
    const count = Number(raw);
    if (!raw?.trim() || !Number.isSafeInteger(count) || count < 0) {
      throw new Error(`${definition.label} must be a non-negative whole number or not configured.`);
    }
    return [definition.key, count];
  }));
  return { price_monthly: amount, currency, limits: values, updated_at: plan.updated_at, reason };
}
