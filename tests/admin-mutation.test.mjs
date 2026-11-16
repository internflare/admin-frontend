import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const output = ts.transpileModule(await readFile(new URL("../src/polymet/lib/use-admin-mutation.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function fixture(fallback) {
  const states = [];
  let index = 0;
  const exports = {};
  runInNewContext(output, {
    exports, Error,
    require() {
      return { useState(initial) {
        const key = index++;
        if (!(key in states)) states[key] = initial;
        return [states[key], (value) => { states[key] = value; }];
      } };
    },
  });
  return () => { index = 0; return exports.useAdminMutation(fallback); };
}

test("forms remain submitting until action and success callbacks settle", async () => {
  const render = fixture("fallback");
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  let saved = false;
  const submitted = render().run(async () => { await pending; saved = true; });
  assert.equal(render().submitting, true);
  assert.equal(render().error, null);
  assert.equal(saved, false);
  resolve();
  await submitted;
  assert.equal(saved, true);
  assert.equal(render().submitting, false);
});

test("failed actions keep exact Error messages or domain fallback and retry clears prior errors", async () => {
  const render = fixture("The invitation was not confirmed.");
  await render().run(() => { throw new Error("Permission denied"); });
  assert.equal(render().error, "Permission denied");
  assert.equal(render().submitting, false);
  await render().run(() => { throw "not an Error"; });
  assert.equal(render().error, "The invitation was not confirmed.");
  await render().run(() => undefined);
  assert.equal(render().error, null);
  await render().run(() => { throw new Error("failed callback"); });
  render().reset();
  assert.equal(render().error, null);
  assert.equal(render().submitting, false);
});
