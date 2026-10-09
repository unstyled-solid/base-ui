import test from 'node:test';
import assert from 'node:assert/strict';
import { nextVersion } from '../../scripts/release.mjs';

test('release bumps patch, minor, major or accepts an explicit version', () => {
  assert.equal(nextVersion('0.0.1', 'patch'), '0.0.2');
  assert.equal(nextVersion('0.2.3', 'minor'), '0.3.0');
  assert.equal(nextVersion('0.2.3', 'major'), '1.0.0');
  assert.equal(nextVersion('0.0.1', '0.0.5'), '0.0.5');
  assert.throws(() => nextVersion('0.0.1', 'wat'));
});
