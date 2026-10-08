import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, type Plugin } from 'vite';
import solid from '@solidjs/vite-plugin';

const root = fileURLToPath(new URL('../../', import.meta.url));
const allowedRoots = ['packages/solid/src/', 'test/harness/', 'test/ssr-harness/'];

function fixtureModule(path: string) {
  const module = resolve(root, path.replace(/^\//, ''));
  const local = relative(root, module).replaceAll('\\', '/');
  if (!allowedRoots.some(prefix => local.startsWith(prefix)) || /\.(test|spec|probe)\./.test(local) || !/fixture/i.test(local) || !/\.[cm]?[jt]sx?$/.test(local)) {
    throw new Error('SSR module must be an owner-provided fixture under packages/solid/src or test harness directories');
  }
  if (!existsSync(module)) throw new Error(`SSR fixture module does not exist: ${local}`);
  return module;
}

function entrySource(module: string) {
  return `import { isServer, renderToString, renderToStream, generateHydrationScript } from '@solidjs/web';
import defaultAssets from 'virtual:solid-manifest';
import * as fixtures from ${JSON.stringify(module)};
if (!isServer || typeof document !== 'undefined') throw new Error('HARNESS_SERVER_CONDITIONS');
let input = ''; for await (const chunk of process.stdin) input += chunk;
const { exportName, props, renderId, mode, assetBridge } = JSON.parse(input);
const Component = fixtures[exportName];
if (typeof Component !== 'function') throw new Error('Missing callable SSR fixture export: ' + exportName);
const render = () => <Component {...props} />;
let head = '';
const resolvedAssets = new Map(); const pendingAssets = new Map();
const manifest = {
  resolve(key) {
    if (resolvedAssets.has(key)) return resolvedAssets.get(key);
    let pending = pendingAssets.get(key);
    if (!pending) {
      pending = fetch(assetBridge + '?key=' + encodeURIComponent(key)).then(async response => {
        if (!response.ok) throw new Error('Native asset bridge failed for ' + key + ': ' + response.status);
        const assets = await response.json();
        if (!assets || !assets.js?.length) throw new Error('Native asset bridge returned no client module for ' + key);
        resolvedAssets.set(key, assets); pendingAssets.delete(key); return assets;
      });
      pendingAssets.set(key, pending);
    }
    return pending;
  },
  resolveSync(key) { return resolvedAssets.get(key) ?? defaultAssets.resolveSync(key); }
};
const options = { renderId, manifest, onHead(value) { head = value; } };
const html = mode === 'stream' ? await renderToStream(render, options) : renderToString(render, options);
process.stdout.write(generateHydrationScript() + head + '<main data-harness-ssr="true">' + html + '</main>');`;
}

/** Independent production server compilation + fresh server-condition process per request. */
export function fixtureServer(): Plugin {
  const compiled = new Map<string, Promise<string>>();
  const builds = new Set<Promise<string>>();
  let directory: string | undefined;
  const children = new Set<ReturnType<typeof spawn>>();
  const compile = (module: string) => {
    let pending = compiled.get(module);
    if (!pending) {
      pending = (async () => {
        const parent = join(root, 'test/ssr-harness/.generated');
        mkdirSync(parent, { recursive: true });
        directory ??= mkdtempSync(join(parent, 'http-'));
        const output = mkdtempSync(join(directory, 'fixture-'));
        const entry = join(output, 'entry.tsx');
        writeFileSync(entry, entrySource(module));
        const bundle = join(output, 'bundle');
        await build({
          root, configFile: false, logLevel: 'warn',
          plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true } })],
          build: { ssr: entry, outDir: bundle, emptyOutDir: true, minify: false,
            rollupOptions: { output: { entryFileNames: 'server.mjs' } } },
        });
        return join(bundle, 'server.mjs');
      })();
      compiled.set(module, pending);
      const buildPromise = pending;
      builds.add(buildPromise);
      buildPromise.then(() => builds.delete(buildPromise), () => builds.delete(buildPromise));
      pending.catch(() => { if (compiled.get(module) === pending) compiled.delete(module); });
    }
    return pending;
  };
  return {
    name: 'real-browser-fixture-server',
    configureServer(server) {
      // Recompile when an owner repairs the actual fixture or a production dependency.
      server.watcher.on('change', () => { compiled.clear(); });
      server.httpServer?.once('close', () => {
        for (const child of children) child.kill();
        void Promise.allSettled(builds).then(() => { if (directory) rmSync(directory, { recursive: true, force: true }); });
      });
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (url.pathname === '/__harness__/assets/pixel.svg' || url.pathname === '/avatar.png') {
          response.setHeader('Content-Type', 'image/svg+xml');
          response.setHeader('Cache-Control', 'public, max-age=3600');
          response.end('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#3070a0"/></svg>');
          return;
        }
        const avatar = /^\/packages\/solid\/src\/avatar\/fixtures\/\.generated\/(avatar-kept|avatar-preloaded)\.html$/.exec(url.pathname);
        const endpoint = url.pathname === '/__harness__/ssr.html' || /\/fixtures\/ssr\.html$/.test(url.pathname);
        if (!avatar && !endpoint) { next(); return; }
        void (async () => {
          try {
            const module = fixtureModule(avatar ? 'packages/solid/src/avatar/fixtures/AvatarHydrationFixture.tsx' : url.searchParams.get('module') ?? '');
            const exportName = avatar ? 'AvatarHydrationFixture' : url.searchParams.get('export') ?? 'default';
            const renderId = avatar?.[1] ?? url.searchParams.get('renderId');
            if (!renderId || renderId.length > 160) throw new Error('SSR fixtures require an explicit renderId (max 160 characters)');
            const props: unknown = avatar ? { keepMounted: avatar[1] === 'avatar-kept' } : JSON.parse(url.searchParams.get('props') ?? '{}');
            if (!props || typeof props !== 'object' || Array.isArray(props)) throw new Error('SSR fixture props must be a JSON object');
            const mode = url.searchParams.get('mode') ?? 'string';
            if (mode !== 'string' && mode !== 'stream') throw new Error('SSR mode must be string or stream');
            const entry = await compile(module);
            const html = await new Promise<string>((resolveHTML, reject) => {
              const child = spawn(process.execPath, [entry], { cwd: root, env: { ...process.env, TZ: 'UTC' }, timeout: 30_000 });
              children.add(child);
              let stdout = ''; let stderr = '';
              child.stdout.on('data', chunk => { stdout += chunk; });
              child.stderr.on('data', chunk => { stderr += chunk; });
              child.on('error', reject);
              child.on('close', status => {
                children.delete(child);
                if (status !== 0 || stderr) reject(new Error(`SSR fixture ${relative(root, module)}#${exportName} failed (${status}): ${stderr || stdout}`));
                else resolveHTML(stdout);
              });
              const protocol = server.config.server.https ? 'https' : 'http';
              const assetBridge = `${protocol}://${request.headers.host}/@solidjs/vite-plugin/dev-manifest`;
              child.stdin.end(JSON.stringify({ exportName, props, renderId, mode, assetBridge }));
            });
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.setHeader('Cache-Control', 'no-store');
            response.setHeader('X-Harness-Renderer', 'independent-solid2-ssr');
            response.end(html);
          } catch (error) {
            server.config.logger.error(String(error));
            response.statusCode = 500;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.end(`HARNESS_SSR_FIXTURE_ERROR: ${String(error)}`);
          }
        })();
      });
    },
  };
}
