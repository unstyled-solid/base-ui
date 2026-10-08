import assert from 'node:assert/strict';

export function runtimeKeys(input) {
  assert(input.kind === 'ordinary' || input.kind === 'date-fns' || input.kind === 'luxon' || input.kind === 'both', 'Unknown peer graph');
  return Object.keys(input.contract).filter(key => input.contract[key].kind === 'runtime' &&
    (!key.includes('temporal-adapter-') || input.kind === 'both' || key.endsWith(`temporal-adapter-${input.kind}`)));
}
export function namespaceOracle(input, resolution) {
  assert.deepEqual(resolution.conditions, [], 'Namespace oracle must come from the independently executed default server condition');
  assert.deepEqual(resolution.failures, []);
  return Object.fromEntries(runtimeKeys(input).map(key => {
    const records = resolution.records.filter(record => record.key === key);
    assert.equal(records.length, 1, `${key}: missing/duplicate runtime oracle`);
    assert.equal(records[0].runtime, 'passed', `${key}: nonexecutable oracle`);
    assert(Array.isArray(records[0].exports), `${key}: missing namespace export names`);
    return [key, records[0].exports.slice().sort()];
  }));
}
// Static namespace imports evaluate every applicable module. Publishing the
// actual namespaces (not just literal key strings) and enumerating every value
// keeps all exported bindings observable after minification. This registry is
// intentionally separate from the optimized family-isolation fixtures.
export function staticRuntimeSource(input) {
  const keys = runtimeKeys(input);
  return keys.map((key, index) => `import * as Runtime${index} from ${JSON.stringify(input.name + (key === '.' ? '' : key.slice(1)))};`).join('\n') +
    `\nexport const namespaces = [${keys.map((key, index) => `{ key: ${JSON.stringify(key)}, value: Runtime${index} }`).join(',\n')}];\n` +
    `export function imports() { return namespaces.map(({ key, value }) => ({ key, exports: Object.keys(value).sort(), bindings: Object.entries(value).map(([name, binding]) => ({ name, type: typeof binding })) })); }\n`;
}
export function assertRuntimeAccounting(input, records, expected) {
  const keys = runtimeKeys(input).sort();
  assert.deepEqual(records.map(record => record.key).sort(), keys, 'Incomplete/duplicate executable browser export map');
  assert.deepEqual(Object.keys(expected).sort(), keys, 'Incomplete namespace oracle');
  for (const record of records) {
    assert.deepEqual(record.exports.slice().sort(), expected[record.key], `${record.key}: runtime namespace symbols omitted`);
    assert.deepEqual(record.bindings.map(binding => binding.name).sort(), expected[record.key], `${record.key}: exported bindings not retained/executed`);
    assert(record.bindings.every(binding => typeof binding.type === 'string'), `${record.key}: missing binding observation`);
  }
}
