import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {any} report @param {any} request */
export function retainPlaywright(report, request) {
  const pins = new Map(request.sources.map((s) => [s.path, s.blob]));
  const document = { schemaVersion: 1, baseline: request.baseline, method: 'playwright-list', command: request.command,
    toolchain: { node: process.version, playwright: request.playwrightVersion }, specifications: [], files: [],
    errors: (report.errors ?? []).map((e) => String(e.message ?? e)) };
  const files = new Map();
  function visit(suite, parents = []) {
    for (const spec of suite.specs ?? []) {
      const path = `test/screen-reader/${spec.file}`;
      if (!pins.has(path)) throw new Error(`Unknown Playwright source ${path}`);
      for (const test of spec.tests) {
        if (test.projectName !== 'chromium' || test.results?.length) throw new Error('Unexpected project or executed Playwright result');
        const key = path;
        if (!files.has(key)) files.set(key, { path, blob: pins.get(path), environment: 'chromium', project: 'screen-reader',
          runnerProject: test.projectName, mode: 'run', tasks: [], errors: [] });
        files.get(key).tasks.push({ type: 'test', name: [...parents, spec.title].join(' > '),
          mode: test.expectedStatus === 'skipped' ? 'skip' : 'run', each: false,
          location: { line: spec.line, column: spec.column } });
      }
    }
    for (const child of suite.suites ?? []) visit(child, suite.file === suite.title ? parents : [...parents, suite.title].filter(Boolean));
  }
  for (const suite of report.suites ?? []) visit(suite);
  document.files = [...files.values()];
  document.specifications = document.files.map(({ path, blob, environment, project, runnerProject }) => ({ path, blob, environment, project, runnerProject }));
  return document;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const request = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const result = spawnSync('rtk', ['proxy', process.execPath, resolve(request.checkout, 'node_modules/@playwright/test/cli.js'),
    'test', '--list', '--config', 'test/screen-reader/playwright.config.ts', '--reporter=json'],
  { cwd: request.checkout, encoding: 'utf8', timeout: 45_000, maxBuffer: 16 * 1024 * 1024 });
  let document;
  try { document = retainPlaywright(JSON.parse(result.stdout), request); }
  catch (error) { document = { schemaVersion: 1, baseline: request.baseline, method: 'playwright-list', command: request.command,
    toolchain: { node: process.version, playwright: request.playwrightVersion }, specifications: [], files: [], errors: [String(error.stack ?? error)] }; }
  if (result.status !== 0) document.errors.push(`Playwright list exit=${result.status}: ${result.stderr ?? ''} ${result.error?.message ?? ''}`);
  writeFileSync(request.output, `${JSON.stringify(document, null, 2)}\n`, { flag: 'wx' });
  process.exitCode = document.errors.length ? 1 : 0;
}
