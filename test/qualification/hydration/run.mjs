import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile, writeFile, mkdir, copyFile, realpath, lstat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { defaultFunction, mark, newReport, parseArgs, verifyArchive, within } from './protocol.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const repository = fileURLToPath(new URL('../../../', import.meta.url));

export async function run(args) {
  const options = parseArgs(args);
  const consumer = await realpath(options.consumer);
  if (within(repository, consumer) || consumer === repository) throw new Error('Consumer must be outside the workspace');
  const requestedOutput = path.resolve(options.output);
  const parent = await realpath(path.dirname(requestedOutput));
  const output = path.join(parent, path.basename(requestedOutput));
  if (!within(consumer, output) || output.includes(`${path.sep}node_modules${path.sep}`)) throw new Error('Output must be a fresh directory inside independent consumer, outside node_modules');
  // Fresh output avoids overwriting existing lane/user work and makes evidence atomic per run.
  if (await lstat(output).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; })) throw new Error('Output already exists; use a fresh path');
  if (parent !== consumer && !within(consumer, parent)) throw new Error('Output parent must exist inside consumer');
  await mkdir(output);
  const report = newReport();
  report.input = { consumer, tarball: path.resolve(options.tarball), output, phase: options.phase };
  const save = () => writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  try {
    report.archive = await verifyArchive(options.tarball, consumer, repository);
    const require = createRequire(path.join(consumer, 'package.json'));
    const load = async name => import(pathToFileURL(require.resolve(name)).href);
    const pinned = {};
    for (const name of ['solid-js', '@solidjs/signals', '@solidjs/web', '@solidjs/compiler', '@solidjs/babel-plugin', '@solidjs/vite-plugin', 'vite', 'typescript']) {
      // Some compiler packages hide package.json behind exports; walk up from actual entry.
      let directory = path.dirname(await realpath(require.resolve(name)));
      let manifest;
      for (let depth = 0; depth < 8 && !manifest; depth += 1) {
        const candidate = await readFile(path.join(directory, 'package.json'), 'utf8').then(JSON.parse, error => { if (error.code === 'ENOENT') return null; throw error; });
        if (candidate?.name === name) manifest = candidate;
        else directory = path.dirname(directory);
      }
      if (!manifest || !within(consumer, directory) || within(repository, directory)) throw new Error(`Toolchain outside independent consumer: ${name}`);
      const expected = name === '@solidjs/vite-plugin' ? '3.0.0-next.47' : name === 'vite' ? '8.3.2' : name === 'typescript' ? '5.9.3' : '2.0.0-rc.13';
      if (manifest.version !== expected) throw new Error(`Pinned tool mismatch: ${name}@${manifest.version}; expected ${expected}`);
      pinned[name] = { version: manifest.version, directory };
    }
    report.toolchain = pinned;
    const { build, createLogger } = await load('vite');
    const solid = defaultFunction(await load('@solidjs/vite-plugin'), '@solidjs/vite-plugin');
    for (const mode of ['production', 'development']) {
      mark(report, ['archive'], mode, 'passed', report.archive);
      const directory = path.join(output, mode); await mkdir(directory);
      for (const name of ['fixtures.tsx', 'client.tsx', 'server.tsx', 'fixture.css']) await copyFile(path.join(here, name), path.join(directory, name));
      const modules = { server: [], client: [] };
      const buildDiagnostics = [];
      const logger = createLogger('info');
      const customLogger = { ...logger, warn(message, options) {
        buildDiagnostics.push({ level: 'warn', message }); logger.warn(message, options);
      }, warnOnce(message, options) {
        buildDiagnostics.push({ level: 'warn', message }); logger.warnOnce(message, options);
      }, error(message, options) {
        buildDiagnostics.push({ level: 'error', message }); logger.error(message, options);
      } };
      const conditions = mode === 'development' ? ['development'] : [];
      const audit = target => ({ name: 'hydration-consumer-audit', moduleParsed(info) {
        modules[target].push(info.id);
        if (info.id.includes('/packages/solid/src/') || info.id.startsWith(repository)) throw new Error(`Workspace module leaked: ${info.id}`);
        if (info.id.includes('/baseui-solid2/') && /\.[jt]sx?$/.test(info.id) && !info.id.startsWith(report.archive.installed + path.sep)) throw new Error(`Package outside verified installation: ${info.id}`);
      } });
      const previous = process.env.NODE_ENV; process.env.NODE_ENV = mode;
      try {
        const types = spawnSync('rtk', ['proxy', process.execPath, require.resolve('typescript/bin/tsc'), '--noEmit', '--strict',
          '--skipLibCheck', 'false', '--jsx', 'preserve', '--jsxImportSource', '@solidjs/web', '--module', 'esnext', '--moduleResolution', 'bundler',
          '--target', 'esnext', '--lib', 'esnext,dom,dom.iterable', '--types', 'node', ...['fixtures.tsx', 'client.tsx', 'server.tsx'].map(name => path.join(directory, name))],
        { cwd: consumer, encoding: 'utf8', timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
        await writeFile(path.join(directory, 'types.log'), `${types.stdout ?? ''}\n${types.stderr ?? ''}`);
        if (types.status !== 0 || types.error) throw new Error(`CONSUMER_TYPECHECK_FAILED: ${types.error ?? types.stdout ?? types.stderr}; exit=${types.status}`);
        const common = { root: consumer, configFile: false, mode, logLevel: 'info', customLogger,
          resolve: { alias: [], conditions: ['browser', 'module', ...conditions] },
          ssr: { resolve: { conditions: ['worker', 'node', ...conditions], externalConditions: ['worker', 'node', ...conditions] },
            external: ['solid-js', '@solidjs/web', ...['field', 'input', 'toggle', 'tabs', 'dialog', 'slider', 'scroll-area', 'select', 'csp-provider'].map(part => `baseui-solid2/${part}`)] },
        };
        await build({ ...common, plugins: [solid({ compiler: 'babel', ssr: true }), audit('server')],
          build: { ssr: path.join(directory, 'server.tsx'), outDir: path.join(directory, 'server'), emptyOutDir: false, minify: false,
            rollupOptions: { output: { entryFileNames: 'server.mjs' } } } });
        await build({ ...common, plugins: [solid({ compiler: 'babel', ssr: true }), audit('client')],
          define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
          build: { outDir: path.join(directory, 'client'), emptyOutDir: false, minify: mode === 'production',
            rollupOptions: { input: path.join(directory, 'client.tsx'), output: { entryFileNames: 'client.js', inlineDynamicImports: true } } } });
        const webModules = modules.client.filter(id => /@solidjs\/web\/dist\/web(?:\.dev)?\.js$/.test(id));
        if (!webModules.length || webModules.some(id => id.endsWith('web.dev.js') !== (mode === 'development'))) throw new Error(`CLIENT_CONDITIONS_MISMATCH: ${webModules}`);
        if (!modules.client.some(id => id.startsWith(report.archive.installed + path.sep))) throw new Error('Client did not consume actual package');
        if (buildDiagnostics.length) throw new Error(`UNAPPROVED_BUILD_DIAGNOSTICS:${JSON.stringify(buildDiagnostics)}`);
        await writeFile(path.join(directory, 'modules.json'), JSON.stringify(modules, null, 2));
        mark(report, ['conditions'], mode, 'passed', { modules: path.join(directory, 'modules.json'), conditions });
        report.modes[mode] = { compiled: true, server: false, browser: false };
        const result = spawnSync('rtk', ['proxy', process.execPath, ...conditions.map(condition => `--conditions=${condition}`), '--conditions=worker',
          path.join(directory, 'server/server.mjs'), path.join(directory, 'server-evidence.json')], {
          cwd: consumer, env: { ...process.env, NODE_ENV: mode }, encoding: 'utf8', timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
        });
        await writeFile(path.join(directory, 'server.log'), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
        if (result.status !== 0 || result.error || result.stderr?.trim()) throw new Error(`SSR_FAILED_OR_DIAGNOSTIC: ${result.error ?? result.stderr ?? result.stdout}; exit=${result.status}`);
        mark(report, ['server-globals', 'request-isolation', 'stream-shell'], mode, 'passed', path.join(directory, 'server-evidence.json'));
        report.modes[mode] = { compiled: true, server: true, browser: false };
        if (options.phase === 'browser') {
          const { chromium } = await load('playwright');
          const { browserReplay } = await import('./scenarios.mjs');
          await browserReplay({ chromium, directory, report, mode });
          report.modes[mode].browser = true;
        }
      } catch (error) {
        report.modes[mode] = { ...report.modes[mode], error: String(error.stack ?? error) };
        const stage = report.modes[mode].server ? 'browser' : report.modes[mode].compiled ? 'server' : 'compile';
        mark(report, report.rows.filter(row => row.stage === stage).map(row => row.id), mode, 'failed', String(error.stack ?? error));
      } finally {
        await writeFile(path.join(directory, 'build-diagnostics.json'), JSON.stringify(buildDiagnostics, null, 2));
        if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
        await save();
      }
    }
  } catch (error) {
    report.error = String(error.stack ?? error);
    await save();
  }
  report.qualified = report.rows.every(row => row.status === 'passed');
  await save();
  console.log(`Hydration qualification ${report.qualified ? 'PASS' : 'INCOMPLETE'}: ${path.join(output, 'report.json')}`);
  return report.rows.some(row => row.status === 'failed') || report.error ? 1 : report.qualified ? 0 : 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).then(code => { process.exitCode = code; }, error => { console.error(error); process.exitCode = 1; });
}
