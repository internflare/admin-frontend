import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const output = ts.transpileModule(await readFile(new URL("../src/polymet/lib/plan-management.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
runInNewContext(output, { exports, Error, require: () => ({
  isRecord: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
}) });
const { readManagedPlan, planUpdatePayload } = exports;
const plan = {
  code: "career", name: "Career", audience: "talent", price_monthly: 5000, currency: "NGN", updated_at: "2026-01-01T00:00:00Z",
  limits: { tracking_slots: null, public_portfolio: true },
  limitDefinitions: [
    { key: "tracking_slots", type: "count", label: "Tracking slots", unit: "slots" },
    { key: "public_portfolio", type: "boolean", label: "Public portfolio", unit: "access" },
  ],
};

test("editor preserves null, zero and disabled and sends the original stale-write token", () => {
  const payload = planUpdatePayload(plan, "7500.25", "USD", { tracking_slots: "0", public_portfolio: "false" }, "Approved new pricing");
  assert.equal(payload.price_monthly, 7500.25);
  assert.equal(payload.currency, "USD");
  assert.equal(payload.limits.tracking_slots, 0);
  assert.equal(payload.limits.public_portfolio, false);
  assert.equal(payload.updated_at, plan.updated_at);
  const unconfigured = planUpdatePayload(plan, "5000", "NGN", { tracking_slots: "null", public_portfolio: "null" }, "Approved limits update");
  assert.equal(unconfigured.limits.tracking_slots, null);
  assert.equal(unconfigured.limits.public_portfolio, null);
});

test("editor rejects blank, unsafe, fractional counts and incorrectly typed boolean values", () => {
  for (const price of ["", "NaN", "Infinity", "-1", "1.001"]) {
    assert.throws(() => planUpdatePayload(plan, price, "NGN", { tracking_slots: "1", public_portfolio: "true" }, "reason"));
  }
  for (const tracking_slots of ["", "-1", "1.5", "true", "9007199254740992"]) {
    assert.throws(() => planUpdatePayload(plan, "5000", "NGN", { tracking_slots, public_portfolio: "true" }, "reason"));
  }
  assert.throws(() => planUpdatePayload(plan, "5000", "NGN", { tracking_slots: "1", public_portfolio: "1" }, "reason"));
  assert.throws(() => planUpdatePayload({ ...plan, code: "free" }, "1", "NGN", {}, "reason"));
});

test("editor does not invent an editable schema for malformed or unsupported backend limits", () => {
  assert.ok(readManagedPlan(plan));
  assert.equal(readManagedPlan({ ...plan, updated_at: undefined }), null);
  assert.equal(readManagedPlan({ ...plan, limitDefinitions: [] }), null);
  assert.equal(readManagedPlan({ ...plan, limitDefinitions: [{ key: "unrecognised", type: "count", label: "X", unit: "" }] }), null);
  assert.equal(readManagedPlan({ ...plan, limitDefinitions: plan.limitDefinitions.map((d) => ({ ...d, type: "unsupported" })) }), null);
  assert.equal(readManagedPlan({ ...plan, limits: { ...plan.limits, tracking_slots: true } }), null);
  assert.equal(readManagedPlan({ ...plan, limits: { ...plan.limits, public_portfolio: 1 } }), null);
});
