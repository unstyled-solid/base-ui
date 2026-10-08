import { execFileSync } from 'node:child_process';

// Discovery only. This never reads a legacy port or infers case-level parity.
const files = execFileSync('git', ['-C', 'upstream/base-ui', 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const classes = {
  runtime: [],
  platformSpecific: [],
  browserOnly: [],
  type: [],
  sharedRuntimeRegistrations: [],
  tooling: [],
  benchmarks: [],
};
for (const path of files) {
  let classification;
  if ((path.startsWith('test/public-types/') && /\.tsx?$/.test(path)) || (path.startsWith('packages/') && /\.spec\.tsx?$/.test(path))) classification = 'type';
  else if (/\.bench\.tsx?$/.test(path)) classification = 'benchmarks';
  else if (/^test\/(e2e|regressions|screen-reader)\/.*\.(test|spec)\.tsx?$/.test(path)) classification = 'browserOnly';
  else if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) {
    if (/\.(android|iOS|gecko|webkit|non-mac|react17)\.test\./.test(path)) classification = 'platformSpecific';
    else classification = path.startsWith('packages/') ? 'runtime' : 'tooling';
  } else if (/^packages\/react\/test\/(conformanceTests\/(className|propForwarding|refForwarding|renderProp)|popupConformanceTests|describeGregorianAdapter\/test[^/]*)\.[jt]sx?$/.test(path)) classification = 'sharedRuntimeRegistrations';
  if (classification) classes[classification].push({ path, status: 'not-reviewed' });
}
console.log(JSON.stringify({ sourceCommit: execFileSync('git', ['-C', 'upstream/base-ui', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), counts: Object.fromEntries(Object.entries(classes).map(([key, entries]) => [key, entries.length])), classes }, null, 2));
