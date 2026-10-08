import assert from 'node:assert/strict';

// Classify exact unsupported resolver/kind pairs, never blanket-ignore a kind:
// NoResolution under Bundler or ESM is always a supported-consumer failure.
export function classifyAnalysis(analysis) {
  assert(analysis.types, 'AreTheTypesWrong did not detect package declarations.');
  const outsideContract = [], failures = [];
  for (const problem of analysis.problems) {
    if ((problem.kind === 'CJSResolvesToESM' && problem.resolutionKind === 'node16-cjs') ||
        (problem.kind === 'NoResolution' && problem.resolutionKind === 'node10')) {
      outsideContract.push(problem);
    } else failures.push(problem);
  }
  for (const entry of Object.values(analysis.entrypoints)) {
    for (const kind of ['bundler', 'node16-esm']) {
      assert(entry.resolutions[kind]?.resolution?.isTypeScript, `${entry.subpath}: missing supported ${kind} declaration resolution`);
    }
  }
  return { outsideContract, failures };
}
