# Distribution contract — bsolid-dist-contract

`baseui-solid2` is private. `package-contract.json` records `publicationName: null`;
there is no registry installation or publication claim. The root workspace is
`baseui-solid2-workspace`. Bootstrap's original scoped identity is historical;
the authorized correction changed only its self-reference fixture and identity
documentation/evidence. Existing bootstrap results remain historical results.

## Consumer/build API

- `exports.json.exports` is the exact **79-key** snapshot of Base UI
  `19511bb171f3b360b006c94cf6d07e53cb446505`. Each record has the upstream path,
  proposed Solid source path, runtime/type intent and implementation owner.
- `pathRules` and `package-contract.json.resolution` specify the deterministic
  staged map. Remove `./src/` and `.ts`/`.tsx` from `target` to obtain `{stem}`.
  For example `./internals/useBaseUiId` retains its public spelling but resolves
  `./dom/internals/createBaseUiId.js`, `./server/internals/createBaseUiId.js` and
  `./types/internals/createBaseUiId.d.ts`. No barrel is implemented here.
- **76 runtime entries**, **3 types-only entries**: `./types`, `./internals/types`
  and `./internals/temporal`. The last is confirmed from both temporal source
  leaves, not inferred from its name. Types-only entries have no runtime fallback.
- `./internals/contracts` is a development-only bootstrap seam. It is explicitly
  outside the 79-key published map. The source manifest exposes only existing
  structural types; it does not advertise missing component/build files.
- Build/declaration integrators must use these templates, fail complete staging
  on absent outputs, preserve relative `.js` imports, externalize Solid and date
  peers, and copy `LICENSE`/`NOTICE`. Artifact existence and symbol completeness
  belong to `bsolid-dist-build`, `bsolid-dist-types`, `bsolid-integration` and the
  packed consumer gate. Extension changes require a manifest-owner request.

### ESM resolution matrix

Condition object order is `types`, `browser`, `node`, `worker`, `deno`, `default`.
It is **object order**, not caller condition-list order, that chooses the branch.

| Active conditions | Runtime entry | Types-only entry |
|---|---|---|
| none / unknown / development only | `server/{stem}.js` | unexported |
| browser (with or without development) | `dom/{stem}.js` | unexported |
| node, worker or deno without browser | `server/{stem}.js` | unexported |
| browser plus any/all server conditions | `dom/{stem}.js` | unexported |
| types plus any other conditions | `types/{stem}.d.ts` | declaration |

There is no `require`, `solid`, wildcard or CJS target. Supplying `solid` still
falls through to default ESM. Modern Node's ability to require ESM is not a CJS
distribution promise. A normal runtime import of a types-only subpath fails;
`types` is a declaration-resolution condition, not a JavaScript execution mode.

**Known RC13 integration gap:** the pinned `solid-js` and `@solidjs/web` maps put
`worker` before `browser`. A library DOM target selected with both conditions can
therefore receive server helpers from its peers. `bsolid-dist-mixed-conditions`
blocks `bsolid-dist-pack` and `bsolid-hydration`, following `bsolid-dist-build`.
It requires a real compiled/mounted consumer strategy or a reviewed contract
decision. The exhaustive resolver fixture below proves the library map only.
Do not advertise mixed-condition runtime compatibility from this result.

## Dependencies, optional adapters and attribution

`dependencies.json` classifies external imports from all 1,319 tracked source/test
files in upstream React/utils source trees. Both authored imports and manifest-only
dependencies are audited. The canonical source is read via immutable Git blobs.

- Direct geometry dependencies: `@floating-ui/dom@1.8.0` and
  `@floating-ui/utils@0.2.12`, matching actual upstream runtime/type use and its
  lock. Workspace overrides pin transitive `@floating-ui/core@1.8.0` and utils.
- Matching exact Solid/web peers are `2.0.0-rc.13`; compiler/Babel are RC13,
  Vite plugin is `3.0.0-next.47`. Build/test tooling stays development-only.
  Strict engines/peers and exact direct pins remain enabled.
- Date-fns adapter requires `date-fns` **and** `@date-fns/tz`; TZDate is imported
  unconditionally. Luxon adapter requires `luxon`; TypeScript consumers also need
  `@types/luxon` because public methods expose `DateTime`. All four are optional
  peers globally and exact development installations locally. Ordinary root and
  component runtime **and declaration graphs** must not traverse either adapter.
  Packed no-peer/date-fns-only/Luxon-only consumers remain mandatory.
- React, React DOM/types, Floating UI's React binding, external-store shims and
  React test tooling are excluded. `@base-ui/utils` is source-adapted by existing
  foundations, not installed. `reselect` is framework-neutral but used only by
  upstream store machinery; native derivations replace that machinery. It is not
  installed speculatively or mislabeled as a React package.
- `solid-floating-ui` is a separate pinned donor, not an installed Solid-1 runtime
  package. Donor provenance/pinning/reconciliation files remain donor-owned;
  positioning owns the RC13 adaptation. Tiny pure Base UI leaves retain MIT
  attribution; React-only ref/hook helpers are replaced, not emulated.
- `LICENSE` preserves upstream MIT text byte-for-byte. `NOTICE` records provenance
  and the donor notice handoff. Actual adaptations must retain source-local
  notices; build/pack must include them. Bootstrap `sideEffects: false` is not
  qualified: staged output stays conservative until `bsolid-dist-shaking` audits it.

## Installation text generation

Generate examples from the identity fields, never from a hard-coded npm scope:

```sh
rtk proxy node --input-type=module -e 'import fs from "node:fs"; const {identity:i}=JSON.parse(fs.readFileSync("distribution/package-contract.json","utf8")); for (const kind of ["workspace","tarball"]) console.log(i.installation[kind].replaceAll("{workspaceName}",i.workspaceName).replaceAll("{version}",i.version)); console.log(i.installation.runtimePeers);'
```

The workspace command is for another workspace package; the tarball command is
for an independent consumer **after** the pack lane produces that local artifact.
No tarball is produced by this ticket. Adapter opt-in examples use the exact
development pins:

```sh
rtk pnpm add date-fns@4.4.0 @date-fns/tz@1.5.0
rtk pnpm add luxon@3.7.2
rtk pnpm add -D @types/luxon@3.7.6
```

## Shared commands and handoff

`package.json` is the live command source. Distribution retains exclusive manifest,
workspace and lock ownership. Requests and responses are recorded in Beads and
`dependencies.json.integrationRequests`; no parallel worker edits shared files.

- Harness: `test:jsdom`, `test:ssr`, `test:types`, `test:contracts` route to
  `scripts/test/run.mjs <mode> <args>`. The runner normalizes `--no-watch`.
- Upstream: `upstream:init/update/status/verify` route to the upstream CLI.
  `--source solid-floating-ui` is an explicit donor selector. `upstream:verify`
  remains a fail-closed reservation owned by the qualification lane.
- Inventory: `test:coverage-map`, `inventory:generate`, `test:tracking` are
  integrated. A mapping check is not runtime parity.
- Docs: `docs:sync` and `docs:test:content` plus the nine requested pure parser
  pins are integrated. Harness jest-dom is the owner's exact `6.9.1` request.
- Upstream's additional `upstream:abandon` and `test:upstream:git` are integrated.
- Build/browser/parity reservations fail closed until their owners implement them;
  `bsolid-bootstrap-command-handoff` remains the release gate for replacement.

Bootstrap documentation's old proof-routing/results table is historical evidence;
the identity-only authorization did not rewrite its command coverage claims.

## Reproducible contract check

This executable specification lives in this ticket's owned README rather than a
new unowned scripts directory. It creates only a uniquely named temporary fixture,
never production barrels/artifacts. Run from the repository root after install:

```sh
rtk proxy node --input-type=module -e 'import fs from "node:fs"; const code=fs.readFileSync("distribution/README.md","utf8").split("```js contract-check\n")[1].split("\n```")[0]; try { await import("data:text/javascript;base64,"+Buffer.from(code).toString("base64")); } catch (error) { console.error(error.message); process.exitCode=1; }'
```

The fixture checks immutable export keys/source paths, owner IDs, normalized output
paths, license identity, actual installed pins and optional/forbidden dependencies.
It uses **real Node ESM resolution**, **Rolldown's neutral-platform resolver** (from
the installed Vite dependency), and **TypeScript Bundler/NodeNext**. Rolldown's
neutral platform matters: Node always supplies `node`, so Node alone cannot prove
an empty-condition default. All 64 subsets include mixed and type-first cases.
The synthetic declarations prove resolution, not emitted production API fidelity.

```js contract-check
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const json = p => JSON.parse(fs.readFileSync(path.resolve(root, p), 'utf8'));
const contract = json('distribution/exports.json');
const policy = json('distribution/package-contract.json');
const audit = json('distribution/dependencies.json');
const pkg = json('packages/solid/package.json');
const workspace = json('package.json');
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');
const viteRequire = createRequire(require.resolve('vite/package.json'));
const { rolldown } = await import(pathToFileURL(viteRequire.resolve('rolldown')).href);
const git = (...args) => execFileSync('rtk', ['proxy', 'git', '-C', path.join(root, 'upstream/base-ui'), ...args], { encoding: 'utf8' });
const source = JSON.parse(git('show', `${contract.sourceSha}:packages/react/package.json`));
assert.equal(git('rev-parse', 'HEAD').trim(), contract.sourceSha);
assert.equal(git('status', '--porcelain=v1').trim(), '');
assert.deepEqual(Object.keys(contract.exports).sort(), Object.keys(source.exports).sort());
assert.equal(Object.keys(contract.exports).length, contract.comparison.upstreamCount);
assert.equal(contract.comparison.targetCount, 79);
assert.deepEqual(contract.comparison.missingKeys, []);
assert.deepEqual(contract.comparison.extraKeys, []);
assert.equal(fs.readFileSync('LICENSE', 'utf8'), git('show', `${contract.sourceSha}:LICENSE`));
const tickets = JSON.parse(execFileSync('rtk', ['proxy', 'bd', 'list', '--all', '--limit', '0', '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
const owners = new Set(tickets.map(ticket => ticket.id));
const map = {};
for (const [key, entry] of Object.entries(contract.exports)) {
  assert.equal(source.exports[key], entry.upstream, key);
  assert(owners.has(entry.owner), `Unknown owner ${entry.owner}`);
  assert(!key.includes('*'));
  assert.match(entry.target, /^\.\/src\/[A-Za-z0-9_/-]+\.tsx?$/);
  assert(!entry.target.includes('/../') && !entry.target.includes('node_modules'));
  assert(['runtime', 'types-only'].includes(entry.kind));
  const stem = entry.target.slice(6).replace(/\.tsx?$/, '');
  const template = entry.kind === 'types-only' ? policy.resolution.typeOnlyTemplate : policy.resolution.runtimeTemplate;
  map[key] = Object.fromEntries(Object.entries(template).map(([condition, target]) => [condition, target.replace('{stem}', stem)]));
  assert.deepEqual(Object.keys(map[key]), entry.kind === 'types-only' ? ['types'] : ['types', 'browser', 'node', 'worker', 'deno', 'default']);
  for (const target of Object.values(map[key])) assert.match(target, /^\.\/(types|dom|server)\/[A-Za-z0-9_/-]+\.(d\.ts|js)$/);
}
assert.deepEqual(Object.keys(contract.exports).filter(k => contract.exports[k].kind === 'types-only').sort(), policy.resolution.typeOnlyEntries.toSorted());
assert.equal(pkg.name, 'baseui-solid2');
assert.equal(pkg.private, true);
assert.equal(pkg.type, 'module');
assert.equal(workspace.private, true);
assert.equal(policy.identity.publicationName, null);
assert.equal(json('tsconfig.json').compilerOptions.jsxImportSource, '@solidjs/web');
for (const [name, version] of Object.entries(policy.toolchain)) {
  if (name === 'node') { assert.equal(process.versions.node, version); continue; }
  if (name === 'pnpm') { assert.equal(workspace.packageManager, `pnpm@${version}`); continue; }
  assert.equal(json(`node_modules/${name}/package.json`).version, version, name);
  assert.equal(workspace.devDependencies[name], version, name);
}
for (const [name, peer] of Object.entries(audit.requiredPeers)) assert.equal(pkg.peerDependencies[name], peer.range);
for (const requested of Object.values(audit.integratedDevelopmentRequests)) for (const [name, version] of Object.entries(requested)) {
  assert.equal(workspace.devDependencies[name], version);
  assert.equal(json(`node_modules/${name}/package.json`).version, version);
}
for (const [name, dependency] of Object.entries(audit.runtimeDependencies)) {
  assert.equal(pkg.dependencies[name], dependency.version);
  assert.equal(json(`packages/solid/node_modules/${name}/package.json`).version, dependency.version);
}
for (const [name, peer] of Object.entries(audit.optionalPeers)) {
  assert.equal(pkg.peerDependencies[name], peer.range);
  assert.equal(pkg.peerDependenciesMeta[name].optional, true);
  assert.equal(pkg.devDependencies[name], peer.developmentPin);
  assert.equal(json(`packages/solid/node_modules/${name}/package.json`).version, peer.developmentPin);
  assert.equal(pkg.dependencies[name], undefined);
}
for (const name of Object.keys(audit.excluded)) for (const manifest of [workspace, pkg]) {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) assert.equal(manifest[field]?.[name], undefined, `${field}: ${name}`);
}
const lock = fs.readFileSync('pnpm-lock.yaml', 'utf8');
assert(!/^  ['"]?(?:react|react-dom|@types\/react|@types\/react-dom|@floating-ui\/react-dom|use-sync-external-store)@/m.test(lock), 'React lockfile leak');
const domDirectory = fs.realpathSync('packages/solid/node_modules/@floating-ui/dom');
assert.equal(JSON.parse(fs.readFileSync(path.join(domDirectory, '../../@floating-ui/core/package.json'), 'utf8')).version, '1.8.0');
console.log('PASS: exact 79 keys, owners, normalized paths, type intent, MIT, private identity and actual installed pins');

const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opencode', 'bsolid-dist-contract-')));
const fixturePackage = path.join(directory, 'node_modules/baseui-solid2');
const write = (file, text) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
try {
  write(path.join(fixturePackage, 'package.json'), JSON.stringify({ name: pkg.name, private: true, type: 'module', exports: map }));
  for (const targets of Object.values(map)) for (const target of new Set(Object.values(targets))) {
    write(path.join(fixturePackage, target), target.endsWith('.d.ts') ? 'export declare const marker: "types";\n' : `export const marker = ${JSON.stringify(target)};\n`);
  }
  const importer = path.join(directory, 'consumer.mts');
  write(importer, 'export {};\n');
  const specifier = key => key === '.' ? pkg.name : pkg.name + key.slice(1);
  const dimensions = ['types', 'browser', 'node', 'worker', 'deno', 'development'];
  const subsets = Array.from({ length: 64 }, (_, mask) => dimensions.filter((_, i) => mask & (1 << i)));
  for (const conditions of subsets) {
    const expected = key => conditions.includes('types') ? map[key].types : contract.exports[key].kind === 'types-only' ? null : conditions.includes('browser') ? map[key].browser : map[key].default;
    const probe = path.join(directory, 'probe.mjs');
    write(probe, `const keys=${JSON.stringify(Object.keys(map).map(specifier))}; console.log(JSON.stringify(keys.map(key=>{try{return import.meta.resolve(key)}catch(error){return error.code}})));`);
    const actual = JSON.parse(execFileSync('rtk', ['proxy', process.execPath, ...conditions.toReversed().map(c => `--conditions=${c}`), probe], { encoding: 'utf8' }));
    Object.keys(map).forEach((key, i) => assert.equal(actual[i], expected(key) ? pathToFileURL(path.join(fixturePackage, expected(key))).href : 'ERR_PACKAGE_PATH_NOT_EXPORTED', `Node ${key}: ${conditions}`));
    const bundle = await rolldown({
      input: 'contract:entry', cwd: directory, platform: 'neutral', logLevel: 'silent',
      resolve: { conditionNames: conditions.toReversed() },
      plugins: [{
        name: 'contract-resolution',
        resolveId(id) { if (id === 'contract:entry') return '\0contract:entry'; },
        load(id) { if (id === '\0contract:entry') return 'export {};'; },
        async buildStart() {
          for (const key of Object.keys(map)) {
            const result = await this.resolve(specifier(key), importer);
            const want = expected(key);
            if (want) assert.equal(result?.id, path.join(fixturePackage, want), `Rolldown ${key}: ${conditions}`);
            else assert.equal(result, null, `Types-only runtime must be unexported: ${key}`);
          }
        }
      }]
    });
    try { await bundle.generate({ format: 'esm' }); } finally { await bundle.close(); }
  }
  for (const mode of [ts.ModuleResolutionKind.Bundler, ts.ModuleResolutionKind.NodeNext]) {
    for (const conditions of [[], ['browser'], ['worker'], ['browser', 'worker', 'node', 'deno']]) {
      const options = { moduleResolution: mode, module: mode === ts.ModuleResolutionKind.NodeNext ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext, customConditions: conditions, skipLibCheck: false };
      for (const key of Object.keys(map)) {
        const result = ts.resolveModuleName(specifier(key), importer, options, ts.sys, undefined, undefined, ts.ModuleKind.ESNext);
        assert.equal(result.resolvedModule?.resolvedFileName, path.join(fixturePackage, map[key].types), `TS ${key}: ${conditions}`);
      }
    }
  }
  const probe = path.join(directory, 'runtime.mjs');
  write(probe, `import assert from 'node:assert/strict'; for (const key of ${JSON.stringify(Object.keys(map).filter(k => contract.exports[k].kind === 'runtime').map(specifier))}) { const {marker}=await import(key); assert(marker.startsWith(process.env.EXPECTED)); }`);
  for (const [conditions, marker] of [[[], './server/'], [['browser'], './dom/']]) execFileSync('rtk', ['proxy', process.execPath, ...conditions.map(c => `--conditions=${c}`), probe], { env: { ...process.env, EXPECTED: marker } });
  console.log('PASS: 79 exports x 64 Node condition sets; 79 x 64 neutral Rolldown sets; 632 Bundler/NodeNext resolutions; 152 runtime marker imports');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
```

Production compilation, hydration, packed optional-peer isolation, side-effect
qualification and publication remain their named gates. A resolver marker is
never component behavior evidence.

### Reproduce the import inventory

The same read-only immutable-tree audit can be replayed independently:

```sh
rtk proxy node --input-type=module -e 'import fs from "node:fs"; const code=fs.readFileSync("distribution/README.md","utf8").split("```js import-audit\n")[1].split("\n```")[0]; try { await import("data:text/javascript;base64,"+Buffer.from(code).toString("base64")); } catch (error) { console.error(error.message); process.exitCode=1; }'
```

```js import-audit
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const ts = createRequire(`${root}/package.json`)('typescript');
const audit = JSON.parse(fs.readFileSync('distribution/dependencies.json', 'utf8'));
const git = (...args) => execFileSync('rtk', ['proxy', 'git', '-C', `${root}/upstream/base-ui`, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const files = git('ls-tree', '-r', '--name-only', audit.sourceSha, 'packages/react/src', 'packages/utils/src').trim().split('\n').filter(p => /\.[cm]?[jt]sx?$/.test(p));
assert.equal(files.length, audit.audit.scannedSourceFiles);
const production = new Set();
const tests = new Set();
const dynamicImports = [];
for (const file of files) {
  const source = ts.createSourceFile(file, git('show', `${audit.sourceSha}:${file}`), ts.ScriptTarget.Latest, true);
  const group = /\.(test|spec)\.|\/(testUtils|test-utils)\./.test(file) ? tests : production;
  const add = s => { if (!s.startsWith('.') && !s.startsWith('#')) group.add(s); };
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) add(node.moduleSpecifier.text);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) add(node.argument.literal.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      if (node.arguments[0] && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text);
      else {
        const record = audit.audit.nonliteralImports.find(entry => entry.file === file);
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        assert(record?.lines.includes(line) && node.arguments[0]?.getText(source) === record.expression, `Nonliteral import needs explicit audit: ${file}:${line}`);
        dynamicImports.push(`${file}:${line}`);
        add('@base-ui/react');
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
const expected = new Set([
  'react', 'react-dom', '@floating-ui/react-dom', '@floating-ui/utils', '@floating-ui/utils/dom',
  '@date-fns/tz', 'luxon', 'reselect', 'use-sync-external-store/shim', 'use-sync-external-store/shim/with-selector',
  ...audit.upstreamUtilities.productionSubpaths.map(s => `@base-ui/utils/${s}`),
  ...audit.optionalPeers['date-fns'].upstreamSubpaths.map(s => `date-fns/${s}`)
]);
assert.deepEqual([...production].sort(), [...expected].sort());
assert.deepEqual(dynamicImports.sort(), audit.audit.nonliteralImports.flatMap(entry => entry.lines.map(line => `${entry.file}:${line}`)).sort());
const packageRoot = s => s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0];
assert.deepEqual([...new Set([...tests].map(packageRoot))].sort(), Object.keys(audit.testOnlyImports).sort());
console.log(`PASS: ${files.length} pinned files; ${production.size} production specifiers; ${tests.size} literal test specifiers; ${dynamicImports.length} classified self-reference dynamic imports; no unclassified external package or production subpath`);
```

## Verification results (distribution handoff)

- `rtk pnpm install --frozen-lockfile`: pass with strict peer/engine settings.
- Import audit above: 1,319 files, 108 production specifiers, 80 literal test
  specifiers and two explicitly classified manifest-driven self-reference imports;
  no unclassified external package or production subpath.
- Executable contract check above: pass, exact 79 keys/owners and MIT bytes;
  5,056 Node + 5,056 neutral Rolldown condition resolutions, 632 TS resolutions,
  and 152 executable DOM/server marker imports. One initial macOS `/var` versus
  `/private/var` fixture-path assertion was corrected by canonicalizing the
  generated temporary directory; no resolver assertion was weakened.
- `rtk pnpm typescript`: pass after private identity correction.
- `rtk pnpm test:contracts --no-watch`: pass after harness owner corrected its
  Jest-root types to `/vitest`; 31 client tests, 4 SSR tests, 2 explicitly queued
  browser cases; native/Babel DOM/SSR and runtime identity checks; negative
  reactivity/cleanup/owner/diagnostic/condition/type/filter probes all pass.
  Earlier missing matcher/root-Jest-type failures are superseded by the requested
  exact matcher installation and owner configuration fix, not suppressed.
- `rtk pnpm docs:sync --check`: 84 pages, 86 outputs, no changes.
- `rtk pnpm docs:test:content`: 11/11 pass from normal workspace resolution.
- `rtk pnpm test:coverage-map --no-watch`: integrity passes for 79 exports and
  2,816 inputs; 897 unresolved obligations and unknown runtime denominator remain
  explicitly blocked by `bsolid-inventory-runtime`.
- `rtk pnpm test:tracking`: 15/15; `rtk pnpm test:upstream:git`: 29/29.
- `rtk pnpm upstream:status`: clean canonical SHA, parity null. No live
  update/init/abandon or donor mutation was invoked by this ticket.

Followup `bsolid-dist-mixed-conditions` remains open. Existing
`bsolid-donor-notices` and `bsolid-bootstrap-command-handoff` retain their release
gates. `bsolid-docs-content-command-integration` has normal-workspace passing
evidence for owner review. Main `bsolid-dist-contract` stays open for review and
retains shared integration ownership; no commit, push or publication occurred.
