import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

async function loadTypeScript(path, extraGlobals = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  runInNewContext(output, { exports, AbortController, ...extraGlobals });
  return exports;
}

class FakeClock {
  now = 0;
  nextId = 0;
  timers = new Map();

  setTimeout = (callback, delay) => {
    const id = ++this.nextId;
    this.timers.set(id, { at: this.now + delay, callback });
    return id;
  };

  clearTimeout = (id) => this.timers.delete(id);

  advance(milliseconds) {
    const target = this.now + milliseconds;
    while (true) {
      const next = [...this.timers.entries()]
        .filter(([, timer]) => timer.at <= target)
        .sort((left, right) => left[1].at - right[1].at)[0];
      if (!next) break;
      this.now = next[1].at;
      this.timers.delete(next[0]);
      next[1].callback();
    }
    this.now = target;
  }
}

test("admin search trims queries, enforces three characters, and waits for five quiet seconds", async () => {
  const clock = new FakeClock();
  const states = [];
  const { createDebouncedAdminSearch } = await loadTypeScript("../src/polymet/lib/admin-search.ts");
  const search = createDebouncedAdminSearch((state) => states.push(state), {
    debounceEmpty: true,
    schedule: clock.setTimeout,
    unschedule: clock.clearTimeout,
  });

  search.update("  ab ");
  assert.equal(states.at(-1).phase, "too-short");
  clock.advance(5000);
  assert.equal(states.some((state) => state.query), false);

  search.update("  ada ");
  assert.equal(states.at(-1).phase, "pending");
  assert.equal(states.at(-1).query, undefined);
  clock.advance(4999);
  search.update("  adae ");
  clock.advance(4999);
  assert.equal(states.at(-1).phase, "pending");
  clock.advance(1);
  assert.equal(states.at(-1).phase, "ready");
  assert.equal(states.at(-1).query, "adae");

  search.dispose();
});

test("clearing a resource search waits five seconds before requesting the normal list", async () => {
  const clock = new FakeClock();
  const states = [];
  const { createDebouncedAdminSearch } = await loadTypeScript("../src/polymet/lib/admin-search.ts");
  const search = createDebouncedAdminSearch((state) => states.push(state), {
    debounceEmpty: true,
    schedule: clock.setTimeout,
    unschedule: clock.clearTimeout,
  });

  search.update("");
  assert.equal(states.at(-1).phase, "pending");
  clock.advance(4999);
  assert.equal(states.at(-1).phase, "pending");
  clock.advance(1);
  assert.equal(states.at(-1).phase, "ready");
  assert.equal(states.at(-1).query, undefined);
  search.dispose();
});

test("newer requests abort and invalidate older results", async () => {
  const { createQueryRequestGate } = await loadTypeScript("../src/polymet/lib/query-request-gate.ts");
  const gate = createQueryRequestGate();
  const stale = gate.begin();
  const committed = [];
  let resolveStale;
  const staleResult = new Promise((resolve) => { resolveStale = resolve; })
    .then((value) => { if (stale.isCurrent()) committed.push(value); });

  const current = gate.begin();
  assert.equal(stale.signal.aborted, true);
  assert.equal(stale.isCurrent(), false);
  resolveStale("obsolete result");
  await staleResult;
  assert.deepEqual(committed, []);
  assert.equal(current.isCurrent(), true);

  gate.cancel();
  assert.equal(current.signal.aborted, true);
  assert.equal(current.isCurrent(), false);
});

test("resource searches send trimmed backend query parameters and their cancellation signal", async () => {
  let request;
  const service = await loadTypeScript("../src/polymet/lib/admin-service.ts", {
    require(id) {
      if (id === "@/polymet/lib/api-client") {
        return {
          apiClient: {
            get: async (endpoint, options) => {
              request = { endpoint, options };
              return {
                success: true,
                users: [{ _id: "user-1" }],
                pagination: { page: 1, total: 1, totalPages: 1 },
              };
            },
          },
          ApiError: class extends Error {},
          handleApiError: (error) => error,
        };
      }
      throw new Error(`Unexpected runtime import: ${id}`);
    },
  });
  const controller = new AbortController();
  const searchableResources = Object.values(service.resources).filter((resource) => resource.search);

  assert.ok(searchableResources.length > 0);
  assert.equal(searchableResources.every((resource) => resource.searchPath && resource.searchTitleKey), true);
  assert.equal(service.resources.plans.search, undefined);
  assert.equal(service.resources.reconciliation.search, undefined);

  const result = await service.fetchCollection(
    service.resources.users,
    { search: "Ada", page: 1, limit: 5 },
    controller.signal,
  );

  assert.equal(request.endpoint, "/users");
  assert.deepEqual(request.options.params, { search: "Ada", page: 1, limit: 5 });
  assert.equal(request.options.signal, controller.signal);
  assert.equal(result.records[0]._id, "user-1");
});
