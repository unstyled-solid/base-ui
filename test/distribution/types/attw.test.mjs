import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyAnalysis } from '../../../scripts/distribution/types/attw.mjs';

test('ATTW applicability keeps genuine supported NoResolution failures blocking', () => {
  const problems = [
    { kind: 'NoResolution', resolutionKind: 'node10' },
    { kind: 'CJSResolvesToESM', resolutionKind: 'node16-cjs' },
    { kind: 'NoResolution', resolutionKind: 'bundler' },
    { kind: 'NoResolution', resolutionKind: 'node16-esm' },
    { kind: 'FalseESM', resolutionKind: 'node16-esm' },
  ];
  const result = classifyAnalysis({ types: { kind: 'included' }, entrypoints: {}, problems });
  assert.deepEqual(result.outsideContract, problems.slice(0, 2));
  assert.deepEqual(result.failures, problems.slice(2));
  assert.throws(() => classifyAnalysis({ types: {}, problems: [], entrypoints: { '.': { subpath: '.', resolutions: {} } } }), /missing supported/);
});
