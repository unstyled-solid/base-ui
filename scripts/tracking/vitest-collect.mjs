// Child adapter. Only collection APIs are permitted; do not substitute start/run.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {any} task */
export function retainTask(task) {
  if (!['test', 'suite'].includes(task.type)) throw new Error(`Unexpected task type ${task.type}`);
  if (task.type === 'test' && task.result && !['skip', 'todo'].includes(task.result.state)) {
    throw new Error('Executed test result is forbidden in collection evidence');
  }
  return { type: task.type, name: task.name, mode: task.mode, each: Boolean(task.each),
    ...(task.location ? { location: { line: task.location.line, column: task.location.column } } : {}),
    ...(task.type === 'suite' ? { tasks: task.tasks.map(retainTask) } : {}) };
}

/** @param {any} project */
export function projectIdentity(project) {
  const browser = project.config.browser;
  if (browser.enabled) {
    if (!['chromium', 'firefox', 'webkit'].includes(browser.name) || !project._parent?.name) throw new Error('Missing actual browser instance/parent identity');
    return { environment: browser.name, project: project._parent.name, runnerProject: project.name };
  }
  return { environment: project.config.environment, project: project.name, runnerProject: project.name };
}

/** @param {any} project @param {string} moduleId @param {any} request */
export function helperImports(project, moduleId, request) {
  const helpers = new Map((request.helpers ?? []).map((h) => [resolve(request.checkout, h.path), h]));
  const loaded = new Map(), seen = new Set();
  function visit(node) {
    if (!node || seen.has(node)) return;
    seen.add(node);
    const helper = helpers.get(node.file ?? node.id?.split('?')[0]);
    if (helper && node.transformResult) loaded.set(helper.path, helper);
    for (const imported of node.importedModules ?? []) visit(imported);
  }
  // Both the browser client and Vitest worker graphs are actual runtime graphs.
  for (const env of Object.values(project.vite?.environments ?? {})) visit(env.moduleGraph.getModuleById(moduleId));
  return [...loaded.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

/** @param {any} request @param {any} createVitest */
export async function collectWithVitest(request, createVitest) {
  const document = { schemaVersion: 1, baseline: request.baseline, method: 'vitest-runtime-collect',
    command: request.command, toolchain: { node: process.version, vitest: request.vitestVersion },
    specifications: [], files: [], errors: [] };
  const blobs = new Map(request.sources.map((s) => [s.path, s.blob]));
  const pathOf = (moduleId) => relative(request.checkout, moduleId).split(sep).join('/');
  let ctx;
  try {
    ctx = await createVitest({ root: request.checkout, watch: false, run: true,
      project: request.projects, includeTaskLocation: true, maxWorkers: 2, allowOnly: false,
      reporters: [], coverage: { enabled: false } });
    const specs = await ctx.getRelevantTestSpecifications(request.paths);
    for (const spec of specs) {
      const path = pathOf(spec.moduleId);
      if (!blobs.has(path)) throw new Error(`Unknown pinned specification ${path}`);
      const identity = projectIdentity(spec.project);
      if (identity.environment !== request.environment) throw new Error(`Unexpected environment ${identity.environment}`);
      document.specifications.push({ path, blob: blobs.get(path), ...identity });
    }
    if (!specs.length) throw new Error('No test specifications discovered');
    // Unlike CLI list --json, the task tree retains skip/todo and each registrations.
    const result = await ctx.collectTests(specs);
    document.errors.push(...result.unhandledErrors.map((e) => String(e.stack ?? e.message ?? e)));
    for (const module of result.testModules) {
      const path = pathOf(module.moduleId), task = module.task;
      const errors = [module, ...module.children.allSuites()].flatMap((s) => s.errors())
        .map((e) => String(e.stack ?? e.message ?? e));
      document.files.push({ path, blob: blobs.get(path), ...projectIdentity(module.project),
        mode: task.mode, tasks: task.tasks.map(retainTask), errors: [...new Set(errors)],
        helperModules: helperImports(module.project, module.moduleId, request) });
    }
  } catch (error) { document.errors.push(String(error.stack ?? error)); }
  finally { await ctx?.close(); }
  document.errors = [...new Set(document.errors)];
  document.specifications.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  document.files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  return document;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const request = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const { createVitest } = await import(pathToFileURL(resolve(request.checkout, 'node_modules/vitest/dist/node.js')).href);
  const document = await collectWithVitest(request, createVitest);
  writeFileSync(request.output, `${JSON.stringify(document, null, 2)}\n`, { flag: 'wx' });
  process.exitCode = document.errors.length || document.files.some((f) => f.errors.length) ? 1 : 0;
}
