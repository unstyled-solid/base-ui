// Targeted incompatibility evidence, not an installed donor runtime or compatibility shim.
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as solid from 'solid-js';

const filename = fileURLToPath(new URL('rc13-probe.ts', import.meta.url));
const source = [
  `import { batch, on, onMount, type JSX } from 'solid-js';`,
  `import { Portal } from 'solid-js/web';`,
  `import { createRenderEffect, createContext, createEffect, onSettled } from 'solid-js';`,
  `import type { JSX as WebJSX } from '@solidjs/web';`,
  `createRenderEffect(() => {});`,
  `const C = createContext<string | null>(null);`,
  `C.Provider;`,
  `createEffect(() => 1, value => { void value; return () => {}; });`,
  `onSettled(() => () => {});`,
  `const styles: WebJSX.CSSProperties = { position: 'absolute' };`,
  `void styles;`,
].join('\n');
const options = {
  noEmit: true, strict: true, skipLibCheck: false, types: [],
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
};
const host = ts.createCompilerHost(options);
const originalGetSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (path, languageVersion, ...rest) => path === filename
  ? ts.createSourceFile(filename, source, languageVersion, true)
  : originalGetSourceFile(path, languageVersion, ...rest);
const program = ts.createProgram([filename], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
const evidence = diagnostics.map((diagnostic) => ({
  code: diagnostic.code,
  line: diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1,
  message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
}));
assert.equal(evidence.length, 7, JSON.stringify(evidence, null, 2));
for (const name of ['batch', 'on', 'onMount', 'JSX']) {
  const code = name === 'batch' ? 2724 : 2305;
  assert.ok(evidence.some((item) => item.line === 1 && item.code === code && item.message.includes(`'${name}'`)), JSON.stringify(evidence, null, 2));
}
assert.ok(evidence.some((item) => item.line === 2 && item.code === 2307));
assert.ok(evidence.some((item) => item.line === 5 && item.code === 2554));
assert.ok(evidence.some((item) => item.line === 7 && item.code === 2339));
assert.ok(evidence.every((item) => [1, 2, 5, 7].includes(item.line)), 'native RC13 examples must typecheck');
for (const name of ['batch', 'on', 'onMount']) assert.equal(name in solid, false);
assert.equal(typeof solid.createUniqueId, 'function');
const fixture = solid.createRoot((dispose) => {
  const [value, setValue] = solid.createSignal(0);
  return { value, setValue, dispose };
});
let staged;
try {
  fixture.setValue((previous) => previous + 1);
  fixture.setValue((previous) => previous + 1);
  const before = fixture.value();
  solid.flush(); // Explicit synchronous observation in this test only.
  staged = { before, after: fixture.value() };
} finally {
  fixture.dispose();
}
assert.deepEqual(staged, { before: 0, after: 2 });
console.log(JSON.stringify({
  result: 'PASS: donor forms rejected as expected; native RC13 forms accepted',
  diagnostics: evidence, stagedWrites: staged,
  coverage: 'targeted installed RC13 declarations/runtime; donor not executed or installed',
}, null, 2));
