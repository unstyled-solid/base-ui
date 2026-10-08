import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gate, scenarios, browsers, environments, makeMatrix, manualPlatforms, protocols } from './model.mjs';
import { parseTests, inventory } from './inventory.mjs';

test('source inventory retains literal loops, each, skipped guards and generators', () => {
  const { rows, parseErrors, fileRestrictions } = parseTests(`
    test.skip(process.platform !== 'win32', 'NVDA on Windows');
    describe('keyboard', () => {
      for (const direction of ['ltr', 'rtl'] as const) {
        it.each([false, true])('disabled=%s', async () => {});
        it.skipIf(isJSDOM)('focus', () => {});
      }
      [1, 2, 3].forEach(attempt => it('attempt', () => {}));
      describeConformance(<Button />, () => ({ render }));
      it.each(dynamicCases)('unknown', () => {});
      it.todo('not yet');
    });`, 'button/fixture.test.tsx');
  assert.deepEqual(parseErrors, []);
  assert.equal(rows.length, 6);
  assert.equal(rows[0].literalMultiplicity, 4);
  assert.equal(rows[1].literalMultiplicity, 2);
  assert.match(rows[1].registration, /skipIf/);
  assert.equal(rows[2].literalMultiplicity, 3);
  assert.equal(rows[3].expansion, 'generated-suite-unresolved');
  assert.equal(rows[4].literalMultiplicity, null);
  assert.equal(rows[0].literalInstances.length, 4);
  assert.match(rows[5].registration, /todo/);
  assert.equal(fileRestrictions.length, 1);
  assert.ok(rows.every((row) => row.status === 'blocked'));
});

test('representative batch passing cannot erase source, family or AT denominator', () => {
  const data = { families: ['button', 'tooltip'], cases: [{ status: 'blocked' }], matrix: makeMatrix(['button', 'tooltip']) };
  const results = scenarios.flatMap((s) => browsers.flatMap((browser) => environments.map((environment) => ({ scenario: s.id, browser, environment, status: 'pass' }))));
  const result = gate(data, results);
  assert.equal(result.automated.length, 180);
  assert.ok(result.automated.every((row) => row.status === 'pass'));
  assert.equal(result.passed, false);
  assert.equal(result.sourceBlockers, 1);
  assert.equal(result.matrixBlockers, 18);
  assert.equal(result.manual.length, 35);
  assert.ok(result.manual.every((row) => row.status === 'blocked'));
});

test('missing/duplicate automated rows are never green and physical emulation is rejected', () => {
  const data = { families: ['button'], cases: [], matrix: [] };
  const results = [{ scenario: 'button', browser: 'chromium', environment: 'default', status: 'pass' }];
  const duplicate = gate(data, [...results, ...results]);
  assert.equal(duplicate.errors.length, 1);
  assert.equal(duplicate.passed, false);
  const fake = manualPlatforms.flatMap((platform) => protocols.map((protocol) => ({ id: `${platform.id}:${protocol}`,
    status: 'pass', artifactSha256: 'archive', osVersion: '1', atVersion: '1', browserVersion: '1', operator: 'tester',
    recording: 'capture', transcript: 'speech', familyResults: [{ family: 'button', status: 'pass' }], physicalDevice: false, emulated: true })));
  const result = gate(data, results, fake);
  assert.ok(result.manual.filter((r) => r.id.startsWith('ios-') || r.id.startsWith('android-')).every((r) => r.status === 'blocked'));
});

test('actual source inventory is complete at file/registration level and no runtime pass is invented', async () => {
  const data = await inventory();
  assert.deepEqual(data.parseErrors, []);
  assert.ok(data.families.includes('filter-dropdown'));
  assert.ok(data.families.includes('tooltip'));
  assert.ok(data.sourceFiles.some((f) => f.path.endsWith('ComboboxInput.android.test.tsx')));
  assert.ok(data.sourceFiles.some((f) => f.path === 'test/screen-reader/menu-filter.spec.ts'));
  assert.equal(data.cases.length, data.sourceFiles.reduce((n, f) => n + f.registrationCount, 0));
  assert.equal(new Set(data.cases.map((r) => r.id)).size, data.cases.length);
  assert.equal(data.matrix.length, data.families.length * 9);
  assert.ok(data.cases.every((r) => r.status === 'blocked'));
  assert.equal(data.gate.passed, false);
});
