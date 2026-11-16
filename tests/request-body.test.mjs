import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

async function compile(path) {
  return ts.transpileModule((await readFile(new URL(path, import.meta.url), "utf8")).replaceAll("import.meta.env", "{}"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}
const bodyExports = {};
runInNewContext(await compile("../src/polymet/lib/request-body.ts"), { exports: bodyExports, FormData, Blob });
const calls = [];
const events = [];
const clientExports = {};
runInNewContext(await compile("../src/polymet/lib/api-client.ts"), {
  exports: clientExports, Headers, FormData, Blob, URL, Error,
  CustomEvent: class { constructor(type) { this.type = type; } },
  window: { dispatchEvent(event) { events.push(event.type); } },
  require(id) {
    if (id === "@/polymet/lib/request-body") return bodyExports;
    if (id === "sonner") return { toast: { error() {}, warning() {} } };
    throw new Error(`Unexpected runtime import: ${id}`);
  },
  fetch: async (url, init) => {
    calls.push({ url, init });
    return new Response('{"success":true}', { headers: { "Content-Type": "application/json" } });
  },
});

test("raw and managed clients serialize JSON identically while preserving credentials and custom headers", async () => {
  for (const send of [clientExports.apiClient.request, clientExports.apiClient.raw]) {
    await send("/records", { method: "POST", body: { reason: "audited", enabled: false }, headers: { "Content-Type": "custom/json" }, credentials: "omit" });
    const { init } = calls.at(-1);
    assert.deepEqual(JSON.parse(init.body), { reason: "audited", enabled: false });
    assert.equal(init.headers.get("Content-Type"), "custom/json");
    assert.equal(init.credentials, "include");
    assert.ok(init.headers.get("X-Correlation-ID"));
    await send("/records", { method: "POST", body: { reason: "audited" } });
    assert.equal(calls.at(-1).init.headers.get("Content-Type"), "application/json");
  }
});

test("both clients keep multipart, Blob, string and absent bodies untouched", async () => {
  const multipart = new FormData();
  multipart.append("file", new Blob(["file"]));
  for (const body of [multipart, new Blob(["raw"]), "raw text", null, undefined]) {
    for (const send of [clientExports.apiClient.request, clientExports.apiClient.raw]) {
      await send("/records", { body, method: "POST" });
      assert.equal(calls.at(-1).init.body, body ?? undefined);
      assert.equal(calls.at(-1).init.headers.has("Content-Type"), false);
    }
  }
});

test("serialization failures still occur before managed error mapping or raw fetch", async () => {
  const circular = {};
  circular.self = circular;
  const count = calls.length;
  await assert.rejects(clientExports.apiClient.request("/records", { body: circular }), /circular/i);
  assert.throws(() => clientExports.apiClient.raw("/records", { body: circular }), /circular/i);
  assert.equal(calls.length, count);
  assert.deepEqual(events, []);
});
