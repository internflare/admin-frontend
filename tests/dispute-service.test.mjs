import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/polymet/lib/dispute-service.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const record = {
  _id: "case-1", reference: "DSP-123", title: "Disputed terms", description: "Original offer terms not met",
  status: "Open", priority: "High", version: 3, notes: [], evidence: [],
};
function fixture() {
  const calls = [];
  let response = { success: true, dispute: record };
  let failure;
  const apiClient = Object.fromEntries(["get", "post"].map((method) => [method, async (...args) => {
    calls.push({ method, args });
    if (failure) throw failure;
    return response;
  }]));
  const exports = {};
  runInNewContext(output, {
    exports, Date,
    require(name) {
      if (name.endsWith("api-client")) return { apiClient };
      return {
        isRecord: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
        invalidResponse: () => { throw new Error("Invalid API response"); },
      };
    },
  });
  return { service: exports, calls, respond: (value) => { response = value; }, fail: (value) => { failure = value; } };
}
test("detail passes cancellation and mutations transmit current version/reason without inventing success", async () => {
  const { service, calls, fail } = fixture();
  const signal = new AbortController().signal;
  assert.equal((await service.fetchDispute("case 1", signal)).reference, "DSP-123");
  assert.equal(calls[0].args[0], "/disputes/case%201");
  assert.equal(calls[0].args[1].signal, signal);
  const payload = { version: 3, reason: "Reviewed terms", summary: "Both parties accepted corrected terms" };
  await service.changeDispute("case-1", "resolve", payload);
  assert.equal(calls[1].method, "post");
  assert.equal(calls[1].args[0], "/disputes/case-1/resolve");
  assert.equal(calls[1].args[1], payload);
  const conflict = new Error("Dispute changed. Refresh before trying again.");
  fail(conflict);
  await assert.rejects(service.changeDispute("case-1", "resolve", payload), (error) => error === conflict);
});
test("malformed detail/action responses are rejected instead of displaying invented histories", async () => {
  const { service, respond } = fixture();
  for (const response of [
    { success: false, dispute: record },
    { success: true, dispute: { ...record, version: undefined } },
    { success: true, dispute: { ...record, status: "Bogus" } },
    { success: true, dispute: { ...record, notes: [null] } },
    { success: true, dispute: { ...record, evidence: [{ url: 123 }] } },
    { success: true, dispute: { ...record, resolution: { summary: {} } } },
    { success: true, dispute: { ...record, assignee_id: {} } },
  ]) {
    respond(response);
    await assert.rejects(service.fetchDispute("case-1"), /Invalid API response/);
  }
});
test("lookup scopes kind/search, passes cancellation and rejects malformed options", async () => {
  const { service, respond, calls } = fixture();
  const signal = new AbortController().signal;
  respond({ success: true, options: [{ id: "active-admin", label: "Active Admin" }] });
  assert.equal((await service.lookupDispute("admins", "Ada", signal))[0].id, "active-admin");
  assert.equal(calls[0].args[0], "/disputes/lookups");
  assert.equal(calls[0].args[1].params.kind, "admins");
  assert.equal(calls[0].args[1].params.search, "Ada");
  assert.equal(calls[0].args[1].signal, signal);
  respond({ success: true, options: [{ email: "private@example.com" }] });
  await assert.rejects(service.lookupDispute("admins", "Ada", signal), /Invalid API response/);
});
