import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { parseAsync, transformAsync } from '@babel/core';
import solid from '@solidjs/babel-plugin';

const require = createRequire(import.meta.url);
const typescript = require('typescript');
const versions = ['solid-js', '@solidjs/web', '@solidjs/compiler', '@solidjs/babel-plugin'];
for (const name of versions) {
  // This local check checks fixture compiler syntax only, never executes a
  // workspace component graph and never counts as archive qualification.
  const entry = require.resolve(name);
  if (!entry.includes('2.0.0-rc.13')) throw new Error(`Unexpected local compiler pin: ${entry}`);
}
for (const name of ['fixtures.tsx', 'client.tsx', 'server.tsx']) {
  const filename = new URL(name, import.meta.url).pathname;
  const original = await readFile(filename, 'utf8');
  const erased = typescript.transpileModule(original, {
    compilerOptions: { jsx: typescript.JsxEmit.Preserve, target: typescript.ScriptTarget.ESNext, module: typescript.ModuleKind.ESNext },
    fileName: filename, reportDiagnostics: true,
  });
  if (erased.diagnostics?.length) throw new Error(typescript.formatDiagnosticsWithColorAndContext(erased.diagnostics, {
    getCanonicalFileName: name => name, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
  }));
  for (const generate of ['dom', 'ssr']) for (const dev of [false, true]) {
    const result = await transformAsync(erased.outputText, { filename: filename.replace(/\.tsx$/, '.jsx'),
      configFile: false, babelrc: false, plugins: [[solid, { generate, hydratable: true, dev, moduleName: '@solidjs/web' }]],
    });
    await parseAsync(result.code, { sourceType: 'module', configFile: false, babelrc: false });
    console.log(`PASS fixture syntax/compiler: ${name} ${generate} ${dev ? 'development' : 'production'}`);
  }
}
console.log('Local syntax/compiler checks only; no tarball, SSR or browser qualification claimed.');
