import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const rolesModule = { exports: {} };
runInNewContext(await compile("../src/polymet/data/admin-roles.tsx"), { exports: rolesModule.exports });
const providerSource = await compile("../src/polymet/components/admin-role-provider.tsx");

function createProvider() {
  const states = [];
  let index = 0;
  const module = { exports: {} };
  runInNewContext(providerSource, {
    exports: module.exports,
    require(id) {
      if (id === "react") return {
        createContext: () => ({ Provider: "provider" }),
        useContext: () => undefined,
        useCallback: (callback) => callback,
        useMemo: (callback) => callback(),
        useState(initial) {
          const key = index++;
          if (!(key in states)) states[key] = initial;
          return [states[key], (value) => { states[key] = value; }];
        },
      };
      if (id === "@/polymet/data/admin-roles") return rolesModule.exports;
      return require(id);
    },
  });
  return {
    render() { index = 0; return module.exports.AdminRoleProvider({ children: "page" }).props.value; },
    useAdminRole: module.exports.useAdminRole,
  };
}

test("unassigned and unknown admin roles have no default super-admin label or permission grants", () => {
  const provider = createProvider();
  let context = provider.render();
  assert.equal(context.role, null);
  assert.equal(context.can("system.manage"), false);
  context.setRoleId("unknown-role");
  context.setPermissions(["system.manage"]);
  context = provider.render();
  assert.equal(context.role, null);
  assert.equal(context.can("system.manage"), false);
});

test("role changes and sign-out cannot reuse another administrator's permissions", () => {
  const provider = createProvider();
  let context = provider.render();
  context.setRoleId("super_admin");
  context.setPermissions(["system.manage"]);
  context = provider.render();
  assert.equal(context.can("system.manage"), true);
  context.setRoleId("finance");
  context = provider.render();
  assert.equal(context.can("system.manage"), false);
  assert.equal(context.can("finance.view"), false);
  context.setPermissions(["finance.view"]);
  context = provider.render();
  assert.equal(context.can("finance.view"), true);
  context.setRoleId(null);
  context = provider.render();
  assert.equal(context.role, null);
  assert.equal(context.can("finance.view"), false);
  assert.equal(context.can(), false);
});

test("permission consumers outside their provider fail explicitly", () => {
  assert.throws(createProvider().useAdminRole, /within AdminRoleProvider/);
});
