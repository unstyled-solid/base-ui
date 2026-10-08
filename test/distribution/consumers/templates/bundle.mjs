import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { staticRuntimeSource } from './runtime-accounting.mjs';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const mode = process.argv[2];
const mask = Number(process.argv[3] ?? 0);
const conditions = mode === 'client' || (mode === 'server' && process.argv[3]) ? input.conditionSets[mask] : ['browser'];
const reports = [];
function graphPlugin(label) {
  return { name: `packed-graph-${label}`, generateBundle(_, bundle) {
    for (const [file, chunk] of Object.entries(bundle)) if (chunk.type === 'chunk') {
      reports.push({ label, file, bytes: Buffer.byteLength(chunk.code), gzipBytes: gzipSync(chunk.code).length,
        modules: Object.entries(chunk.modules).map(([id, detail]) => ({ id, renderedLength: detail.renderedLength, originalLength: detail.originalLength, renderedExports: detail.renderedExports, removedExports: detail.removedExports })),
        imports: chunk.imports, dynamicImports: chunk.dynamicImports });
    }
  } };
}
async function compile(label, entry, server = false, customConditions = conditions) {
  return build({ root: process.cwd(), configFile: false, logLevel: 'info', mode: 'production',
    plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true, moduleName: '@solidjs/web' } }), graphPlugin(label)],
    resolve: { conditions: [...customConditions, 'production'] },
    ssr: { resolve: { conditions: server && process.argv[3] ? [...customConditions, 'production'] : ['node', 'production'] } },
    build: { outDir: `bundles/${label}`, emptyOutDir: true, sourcemap: true, minify: true,
      ...(server ? { ssr: entry } : { lib: { entry, formats: ['es'], fileName: () => 'client.js' } }),
      rollupOptions: { output: { entryFileNames: server ? 'server.mjs' : 'client.js' }, onwarn(warning) { throw new Error(warning.message); } },
    }, define: { 'process.env.NODE_ENV': '"production"' },
  });
}
try {
  if (mode === 'server') await compile('server', 'server.tsx', true);
  else if (mode === 'client') {
    assert(conditions.includes('browser') && !conditions.includes('worker') && !conditions.includes('types'));
    await fs.writeFile('all-runtime.mjs', staticRuntimeSource(input));
    // Store accounting before hydration. A later runtime failure must not hide
    // the successfully evaluated namespace set from the diagnostic artifact.
    await fs.writeFile('browser-entry.mjs', `import { imports, namespaces } from './all-runtime.mjs'; import { startClient } from './client.js';\nwindow.allImports = imports(); window.runtimeNamespaces = namespaces; startClient();`);
    await compile(`client-${mask}`, 'browser-entry.mjs');
  } else if (mode === 'shaking') {
    const fixtures = {
      empty: 'window.packedEmpty = true;',
      unused: `import { Toggle } from '${input.name}'; window.packedEmpty = true;`,
      root: `import { Toggle } from '${input.name}';`,
      subpath: `import { Toggle } from '${input.name}/toggle';`,
      compound: `import { Tabs } from '${input.name}/tabs'; window.packedExport = Tabs;`,
    };
    const mountedToggle = `import { render } from '@solidjs/web'; import { createSignal } from 'solid-js';
      function Fixture() { const [pressed,setPressed]=createSignal(false); return <><Toggle id="shake-toggle" pressed={pressed()} onPressedChange={setPressed}>Shake toggle</Toggle><output>{pressed()?'on':'off'}</output></>; }
      window.stopShake=render(()=> <Fixture />, document.querySelector('main')); window.shakeReady=true;`;
    fixtures.root += mountedToggle; fixtures.subpath += mountedToggle;
    for (const adapter of ['date-fns', 'luxon']) if (input.kind === 'both' || input.kind === adapter) {
      const name = adapter === 'luxon' ? 'TemporalAdapterLuxon' : 'TemporalAdapterDateFns';
      fixtures[adapter] = `import { ${name} } from '${input.name}/internals/temporal-adapter-${adapter}'; window.packedAdapter = new ${name}();`;
    }
    for (const [label, source] of Object.entries(fixtures)) {
      const extension = ['root', 'subpath'].includes(label) ? 'tsx' : 'mjs';
      await fs.writeFile(`shake-${label}.${extension}`, source);
      await compile(`shake-${label}`, `shake-${label}.${extension}`);
    }
    // This optimized hydration entry imports only the real mounted families; it
    // does not contain the all-exports accounting imports of the separate matrix.
    await fs.writeFile('optimized-entry.mjs', `import { startClient } from './client.js'; startClient();`);
    await compile('shake-optimized', 'optimized-entry.mjs');
    for (const report of reports) {
      assert(report.modules.every(module => typeof module.renderedLength === 'number'), 'Bundler lacks usable elimination evidence');
      const retained = report.modules.filter(module => module.renderedLength > 0).map(module => module.id.replaceAll('\\', '/'));
      assert(!retained.some(id => /node_modules\/(?:react|react-dom|@types\/react)(?:\/|$)/.test(id)), 'React bundle leak');
      const label = report.label.slice(6);
      if (['empty', 'unused'].includes(label)) assert(!retained.some(id => id.includes(`/node_modules/${input.name}/`)), `${label}: unwanted initialization retained`);
      if (['root', 'subpath'].includes(label)) {
        assert(retained.some(id => id.includes(`/${input.name}/dom/toggle/`)), `${label}: actual Toggle eliminated`);
        for (const key of Object.keys(input.contract)) {
          if (!/^\.\/[^/]+$/.test(key) || ['types', 'toggle', 'toggle-group', 'merge-props', 'use-render', 'unstable-use-media-query'].includes(key.slice(2))) continue;
          assert(!retained.some(id => id.includes(`/${input.name}/dom/${key.slice(2)}/`)), `${label}: unrelated family ${key}`);
        }
        assert(!retained.some(id => id.includes(`/${input.name}/dom/toggle-group/ToggleGroup.js`)), `${label}: unrelated ToggleGroup implementation`);
      }
      if (label === 'optimized') {
        const mounted = ['toggle', 'toggle-group', 'separator', 'csp-provider', 'scroll-area', 'tabs', 'types', 'merge-props', 'use-render', 'unstable-use-media-query'];
        for (const key of Object.keys(input.contract)) {
          if (/^\.\/[^/]+$/.test(key) && !mounted.includes(key.slice(2))) assert(!retained.some(id => id.includes(`/${input.name}/dom/${key.slice(2)}/`)), `optimized mount retained unrelated ${key}`);
        }
      }
      if (!['date-fns', 'luxon'].includes(label)) assert(!retained.some(id => /temporal-adapter-|node_modules\/(?:date-fns|@date-fns|luxon)(?:\/|$)/.test(id)), `${label}: optional adapter bundled`);
      if (label === 'date-fns') assert(!retained.some(id => /temporal-adapter-luxon|node_modules\/luxon\//.test(id)), 'date-fns bundle coupled to luxon');
      if (label === 'luxon') assert(!retained.some(id => /temporal-adapter-date-fns|node_modules\/(?:date-fns|@date-fns)\//.test(id)), 'luxon bundle coupled to date-fns');
      for (const runtime of ['solid-js', '@solidjs/web', '@solidjs/signals']) {
        const copies = new Set(retained.filter(id => id.includes(`/node_modules/${runtime}/`)).map(id => id.split(`/node_modules/${runtime}/`)[0]));
        assert(copies.size <= 1, `Duplicate bundled runtime: ${runtime}`);
      }
    }
    const root = reports.find(report => report.label === 'shake-root'), subpath = reports.find(report => report.label === 'shake-subpath');
    assert(root && subpath, 'Missing root/subpath size evidence');
    const library = report => report.modules.filter(module => module.renderedLength > 0 && module.id.includes(`/node_modules/${input.name}/`)).map(module => path.relative(process.cwd(), module.id)).sort();
    assert.deepEqual(library(root), library(subpath), 'Root named import retains more library modules than matching subpath');
    assert(root.bytes > reports.find(report => report.label === 'shake-unused').bytes, 'Unused import did not meaningfully eliminate the mounted implementation');
  } else throw new Error(`Unknown bundle mode ${mode}`);
  for (const report of reports) for (const module of report.modules) {
    if (module.id.startsWith('\0') || !path.isAbsolute(module.id)) continue;
    assert(module.id.startsWith(`${input.consumerRoot ?? process.cwd()}/`), `Bundler escaped independent consumer: ${module.id}`);
  }
} finally {
  await fs.writeFile(`bundle-${mode}-${mask}.json`, JSON.stringify({ mode, conditions, compiler: 'babel', reports }, null, 2));
}
