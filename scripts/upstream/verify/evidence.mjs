import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fail, hash, json, safePath } from '../git/state.mjs';

// Conservative whole-input qualification. Impact may ADD obligations, never subtract these.
export const inputRoots = Object.freeze({
  source: ['packages/solid/src'],
  test: ['test'],
  tool: ['scripts', 'distribution', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
    'tsconfig.json', 'tsconfig.foundation.json', 'vitest.config.ts', 'vitest.browser.config.ts',
    'packages/solid/package.json'],
  patch: ['docs/patches'],
  docs: ['docs'],
});

export const mandatoryGates = Object.freeze({
  inventory: ['node'], components: ['node'], types: ['node'], unit: ['node'],
  integration: ['node'], 'source-tests': ['node'], docs: ['node'], package: ['node'],
  browser: ['chromium', 'firefox', 'webkit'],
  hydration: ['development', 'production'],
  accessibility: ['keyboard', 'assistive-technology'],
  platform: ['ios-safari-software-keyboard'],
});
export const gateTasks = Object.freeze({
  inventory: 'bsolid-inventory-runtime', components: 'bsolid-components-complete',
  types: 'bsolid-integration', unit: 'bsolid-components-complete', integration: 'bsolid-integration',
  'source-tests': 'bsolid-browser', docs: 'bsolid-docs-complete', package: 'bsolid-dist-pack',
  browser: 'bsolid-browser', hydration: 'bsolid-hydration', accessibility: 'bsolid-accessibility',
  platform: 'bsolid-accessibility',
});

export function check(condition, code, message) { if (!condition) fail(code, message); }
export function nonempty(value) { return typeof value === 'string' && Boolean(value.trim()); }
export function array(value, name) {
  check(Array.isArray(value), 'INVALID_EVIDENCE', `${name} must be an array.`);
  return value;
}
export function unique(values, name) {
  array(values, name);
  check(new Set(values).size === values.length, 'INVALID_EVIDENCE', `Duplicate ${name}.`);
  return values;
}
export function same(actual, expected, code, message) { check(isDeepStrictEqual(actual, expected), code, message); }

export function fileEvidence(root, reference) {
  check(reference && nonempty(reference.path) && /^[a-f0-9]{64}$/.test(reference.sha256),
    'MISSING_EVIDENCE', 'Every artifact needs a relative path and exact-byte SHA-256.');
  const path = safePath(root, reference.path);
  check(lstatSync(path, { throwIfNoEntry: false })?.isFile(), 'MISSING_EVIDENCE', `Missing regular file ${reference.path}.`);
  const bytes = readFileSync(path);
  check(hash(bytes) === reference.sha256, 'EVIDENCE_HASH', `Changed evidence ${reference.path}.`);
  return bytes;
}
export function documentEvidence(root, reference) {
  const bytes = fileEvidence(root, reference);
  try { return JSON.parse(bytes.toString('utf8')); }
  catch { fail('INVALID_EVIDENCE', `Invalid JSON ${reference.path}.`); }
}

// Includes tests, dotfiles and binary inputs. Never follows symlinks. New/deleted files
// invalidate the inventory, even if all previously listed file hashes still match.
export function snapshotInputs(root, roots = inputRoots) {
  const result = {};
  for (const [category, names] of Object.entries(roots)) {
    const files = [];
    function walk(name) {
      const path = safePath(root, name);
      const stat = lstatSync(path, { throwIfNoEntry: false });
      check(stat, 'MISSING_INPUT', `Missing mandatory input ${name}.`);
      if (stat.isDirectory()) {
        for (const entry of readdirSync(path).sort()) walk(`${name}/${entry}`);
      } else {
        check(stat.isFile(), 'UNSAFE_PATH', `Input is not a regular file: ${name}.`);
        files.push({ path: name, sha256: hash(readFileSync(path)) });
      }
    }
    for (const name of names) walk(name);
    result[category] = files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  }
  return result;
}

export function fingerprint(tuple) { return hash(json(tuple)); }

export function validateGates(root, bundle, plan, tuple, initial) {
  const requirements = new Map();
  const add = (name, platform) => requirements.set(`${name}/${platform}`, { name, platform });
  for (const [name, platforms] of Object.entries(mandatoryGates)) for (const platform of platforms) add(name, platform);
  for (const requirement of array(plan.requiredGates, 'requiredGates')) {
    check(nonempty(requirement.name) && nonempty(requirement.platform), 'INVALID_EVIDENCE', 'Invalid selected gate.');
    add(requirement.name, requirement.platform);
  }
  if (initial) add('release-ready', 'coordinator');
  const records = new Map();
  const tasks = [];
  for (const reference of array(bundle.gates, 'gates')) {
    const gate = documentEvidence(root, reference);
    const key = `${gate.name}/${gate.platform}`;
    check(requirements.has(key) && !records.has(key), 'UNKNOWN_GATE', `Unexpected/duplicate gate ${key}.`);
    same(gate.tuple, tuple, 'STALE_GATE', `Gate ${key} tested another source/test/tool/patch/artifact tuple.`);
    check(gate.status === 'passed' && gate.exitCode === 0 && gate.failures === 0 && gate.errors === 0 &&
      gate.unresolved === 0 && gate.diagnostics === 0, 'FAILED_GATE', `Gate ${key} did not pass cleanly.`);
    check(nonempty(gate.command) && gate.command.startsWith('rtk ') &&
      gate.versions && Object.keys(gate.versions).length > 0 && Object.values(gate.versions).every(nonempty),
    'MISSING_EVIDENCE', `Gate ${key} needs an RTK command and exact tool/platform versions.`);
    check(array(gate.artifacts, 'gate artifacts').length > 0, 'MISSING_EVIDENCE', `Gate ${key} has no retained artifacts.`);
    for (const artifact of gate.artifacts) fileEvidence(root, artifact);
    if (gate.name === 'package') {
      check(tuple.artifacts.every((artifact) => gate.artifacts.some((output) =>
        output.path === artifact.path && output.sha256 === artifact.sha256)),
      'MISSING_EVIDENCE', 'Packed consumer gate must actually reference the qualified build/archive hashes.');
    }
    check(nonempty(gate.task) && (!gateTasks[gate.name] || gate.task === gateTasks[gate.name]),
      'INVALID_EVIDENCE', `Gate ${key} has the wrong accountable task.`);
    if (gate.name !== 'release-ready') tasks.push(gate.task);
    else {
      check(initial && key === 'release-ready/coordinator' && gate.task === 'bsolid-release-ready' && gate.authorization === 'approved',
        'INITIAL_QUALIFICATION', 'Initial qualification needs explicit release-ready approval.');
    }
    array(gate.cases, 'gate cases');
    unique(gate.cases.map((row) => row.id), `cases in ${key}`);
    records.set(key, { ...gate, reference });
  }
  for (const key of requirements.keys()) check(records.has(key), 'MISSING_GATE', `Missing mandatory gate/platform ${key}.`);
  return { records, tasks };
}

export function validateScenarios(plan, inventory, records) {
  check(inventory.complete === true && inventory.runtimeExpanded === true &&
    array(inventory.unresolved, 'inventory unresolved').length === 0,
  'INCOMPLETE_SCENARIOS', 'Static declarations or unresolved runtime cardinality cannot qualify parity.');
  const obligations = array(inventory.obligations, 'inventory obligations');
  unique(obligations.map((row) => row.id), 'scenario IDs');
  check(obligations.length > 0, 'INCOMPLETE_SCENARIOS', 'Empty scenario inventory is not behavioral proof.');
  const tasks = [];
  const expected = new Map([...records.keys()].map((key) => [key, new Set()]));
  for (const row of obligations) {
    check(nonempty(row.id) && ['runtime-case', 'type-scenario'].includes(row.kind) &&
      nonempty(row.sourcePath) && /^[a-f0-9]{40}$/.test(row.sourceBlob),
    'INCOMPLETE_SCENARIOS', 'Invalid/unexpanded source scenario.');
    const mapping = plan.sourceMap.find((entry) => entry.path === row.sourcePath);
    check(mapping && mapping.blob === row.sourceBlob, 'UNKNOWN_MAPPING', `Scenario ${row.id} has no exact source mapping.`);
    check(array(row.requirements, 'scenario requirements').length > 0, 'INCOMPLETE_SCENARIOS', `Scenario ${row.id} has no platforms.`);
    unique(row.requirements, `platform obligations for ${row.id}`);
    for (const key of row.requirements) {
      const gate = records.get(key);
      check(gate, 'MISSING_GATE', `Scenario ${row.id} needs ${key}.`);
      expected.get(key).add(row.id);
      const result = gate.cases.find((value) => value.id === row.id);
      check(result && ['passing', 'adapted', 'upstream-skipped'].includes(result.status),
        'INCOMPLETE_SCENARIOS', `Scenario ${row.id}/${key} is missing, failed or queued.`);
      check(array(result.blockers, 'scenario blockers').length === 0, 'OPEN_BLOCKER', `Scenario ${row.id} has blockers.`);
      if (result.status !== 'passing') {
        check(nonempty(result.reason) && nonempty(result.reviewTask) &&
          ((result.sourceStatus === 'skipped' && result.status === 'upstream-skipped') ||
          (result.status === 'adapted' && result.sourceStatus === 'passed')),
        'INCOMPLETE_SCENARIOS', `Scenario ${row.id} needs reviewed source-supported disposition; a source failure is not an adaptation.`);
        tasks.push(result.reviewTask);
      }
      check(array(result.targets, 'scenario targets').length > 0 && result.targets.every((target) => mapping.tests.includes(target)),
        'UNKNOWN_MAPPING', `Scenario ${row.id} needs mapped target tests.`);
    }
  }
  for (const [key, gate] of records) {
    same(gate.cases.map((row) => row.id).sort(), [...expected.get(key)].sort(),
      'INCOMPLETE_SCENARIOS', `Extra/invented or missing cases in ${key}.`);
  }
  return tasks;
}
