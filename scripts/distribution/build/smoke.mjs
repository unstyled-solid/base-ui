import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { build } from 'vite';
import { chromium } from 'playwright';
import { compile, moduleImports, verifyToolchain } from './compiler.mjs';
import { root } from './index.mjs';

export async function smoke({ compilerControl = false } = {}) {
  verifyToolchain();
  const directory = await fs.mkdtemp(path.join(fileURLToPath(new URL('./', import.meta.url)), '.smoke-'));
  let browser, server;
  try {
    const staged = path.join(root, 'packages/solid/build');
    const manifest = JSON.parse(await fs.readFile(path.join(staged, 'package.json'), 'utf8'));
    assert.equal(manifest.private, true);
    assert.equal(Object.keys(manifest.exports).length, 79);
    const source = await fs.readFile(new URL('./fixture.tsx', import.meta.url), 'utf8');
    const resolvePackage = (specifier, target) => {
      if (specifier !== manifest.name && !specifier.startsWith(`${manifest.name}/`)) return specifier;
      const key = specifier === manifest.name ? '.' : `.${specifier.slice(manifest.name.length)}`;
      const entry = manifest.exports[key]?.[target];
      if (!entry) throw new Error(`No runtime export ${specifier}`);
      return path.join(staged, entry);
    };
    // Compile the consumer in both modes, then execute server in a fresh process
    // with no document/window and actual Node condition selection.
    for (const [target, generate] of [['default', 'ssr'], ['browser', 'dom']]) {
      const output = compile(source, 'fixture.tsx', generate);
      for (const specifier of moduleImports(output.code, 'fixture.js')) {
        if (specifier === manifest.name) output.code = output.code.replaceAll(JSON.stringify(specifier), JSON.stringify(resolvePackage(specifier, target)));
      }
      await fs.writeFile(path.join(directory, `${generate}.mjs`), output.code);
    }
    const factory = compilerControl ? 'createCompilerFixture' : 'createFixture';
    await fs.writeFile(path.join(directory, 'server.mjs'), `
      import assert from 'node:assert/strict';
      import { renderToString, generateHydrationScript, isServer } from '@solidjs/web';
      import { ${factory} as createFixture } from './ssr.mjs';
      assert.equal(isServer, true);
      assert.equal(typeof document, 'undefined'); assert.equal(typeof window, 'undefined');
      const errors=[]; const html=renderToString(createFixture, {renderId:'package-', onError:e=>errors.push(String(e))});
      assert.deepEqual(errors, []); assert(html.includes('Package toggle'));
      const all=${JSON.stringify(Object.keys(manifest.exports).filter(key => manifest.exports[key].default && !key.includes('temporal-adapter-')))};
      const map=${JSON.stringify(manifest.exports)};
      for (const key of all) await import(${JSON.stringify(staged + '/')}+map[key].default);
      console.log(JSON.stringify({html,bootstrap:generateHydrationScript(),imports:all.length}));
    `);
    const result = execFileSync('rtk', ['proxy', process.execPath, path.join(directory, 'server.mjs')], { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } });
    const artifact = JSON.parse(result);
    await fs.writeFile(path.join(directory, 'client.mjs'), `
      import { hydrate, render, isServer } from '@solidjs/web';
      import { ${factory} as createFixture } from './dom.mjs';
      if (isServer) throw new Error('Client selected server renderer');
      const root=document.querySelector('main');
      const button=root.querySelector('button');
      const separator=root.querySelector('[role=separator]');
      window.originalButton=button; window.originalSeparator=separator;
      let cleaned=0;
      window.dispose=hydrate(()=>createFixture({cleanup:()=>cleaned++}),root,{renderId:'package-'});
      window.check=()=>({same:button===root.querySelector('button'),sameSeparator:separator===root.querySelector('[role=separator]'),pressed:button.getAttribute('aria-pressed'),value:root.querySelector('output')?.textContent,cleaned});
      window.mount=()=>{const node=document.createElement('div');document.body.append(node);const stop=render(()=>createFixture({cleanup:()=>cleaned++}),node);return ()=>{stop();node.remove();};};
      window.ready=true;
    `);
    await build({
      configFile: false, root: directory, logLevel: 'error',
      build: { outDir: path.join(directory, 'client'), emptyOutDir: true, sourcemap: true,
        minify: true, lib: { entry: path.join(directory, 'client.mjs'), formats: ['es'], fileName: () => 'client.js' },
        rollupOptions: { onwarn(warning) { throw new Error(warning.message); } } },
      resolve: { conditions: ['browser', 'production'] },
      define: { 'process.env.NODE_ENV': '"production"' },
    });
    const client = await fs.readFile(path.join(directory, 'client/client.js'));
    server = createServer((request, response) => {
      if (request.url === '/client.js') { response.setHeader('content-type', 'text/javascript'); response.end(client); }
      else { response.setHeader('content-type', 'text/html'); response.end(`<!doctype html><html><head></head><body>${artifact.bootstrap}<main>${artifact.html}</main><script type="module" src="/client.js"></script></body></html>`); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const diagnostics = [];
    page.on('pageerror', error => diagnostics.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) diagnostics.push(message.text()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    try { await page.waitForFunction(() => window.ready === true, null, { timeout: 10000 }); }
    catch (error) { throw new Error(`${error.message}\nBrowser diagnostics: ${diagnostics.join('\n')}\nSSR HTML: ${artifact.html}`); }
    assert.deepEqual(await page.evaluate(() => window.check()), { same: true, sameSeparator: true, pressed: 'false', value: 'off', cleaned: 0 });
    await page.click('#package-toggle');
    await page.waitForFunction(() => window.check().value === 'on');
    assert.equal((await page.evaluate(() => window.check())).pressed, 'true');
    assert.equal((await page.evaluate(() => window.check())).same, true);
    await page.evaluate(() => { window.dispose(); window.stopMounted=window.mount(); });
    await page.waitForFunction(() => document.querySelector('#package-toggle'));
    await page.click('#package-toggle');
    await page.waitForFunction(() => document.querySelector('output').textContent === 'on');
    await page.evaluate(() => window.stopMounted());
    assert.equal(await page.evaluate(() => document.querySelector('#package-toggle')), null);
    assert.equal((await page.evaluate(() => window.check())).cleaned, 2);
    assert.deepEqual(diagnostics, []);
    console.log(`PASS: ${compilerControl ? 'compiler control (actual package provider/mergeProps, not default-host qualification)' : 'default-host production components'}; staged root SSR + ${artifact.imports} ordinary server export imports; real Chromium hydration retains original button/separator, native click updates state, client mount and both disposals; zero diagnostics`);
  } finally {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
    await fs.rm(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await smoke({ compilerControl: process.argv.includes('--compiler-control') }); } catch (error) { console.error(error.stack); process.exitCode = 1; }
}
