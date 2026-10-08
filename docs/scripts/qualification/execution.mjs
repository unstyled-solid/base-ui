import { read, json, hash, unique, sameKeys, sourceSha } from './io.mjs';
export const requiredChecks = ['docs-check', 'route-anchor-crawl', 'registered-previews', 'real-family-deferred'];
export const deferredChecks = ['lazy-preview','variant-source-equality','portal-focus','forms','ssr-guidance','cleanup'];

export async function checkExecution(repository, evidence, bindingSha256, variants, routes = []) {
  const failures = [];
  const execution = await json(repository,evidence);
  if (execution.schemaVersion !== 1 || execution.sourceSha !== sourceSha || execution.bindingSha256 !== bindingSha256) failures.push('Missing/stale execution binding; replay the actual current site and implementations');
  const checks = unique(execution.checks,'kind','execution checks');
  sameKeys(new Map(requiredChecks.map(kind => [kind,true])), checks,'execution checks',failures);
  for (const check of checks.values()) {
    if (check.exitCode !== 0 || !Array.isArray(check.argv) || !check.argv.length || !check.startedAt || !check.finishedAt || Number.isNaN(Date.parse(check.startedAt)) || Number.isNaN(Date.parse(check.finishedAt)) || Date.parse(check.finishedAt)<Date.parse(check.startedAt)) failures.push(`Unexecuted/failed check: ${check.kind}`);
    const log = await read(repository,check.log);
    if (!log.length || hash(log) !== check.logSha256) failures.push(`Missing/empty/changed execution log: ${check.kind}`);
  }
  const preview = checks.get('registered-previews');
  if (!preview?.result || hash(await read(repository,preview.result)) !== preview.resultSha256) throw new Error('Missing/changed full registered preview result');
  const result = await json(repository,preview.result);
  if (!Array.isArray(result.failures) || result.failures.length) failures.push('Registered preview replay has failures/diagnostics');
  const passed = unique((result.passed ?? []).map(id => ({id})),'id','preview outcomes');
  sameKeys(new Map(variants.map(id => [id,true])),passed,'preview execution',failures);
  const deferred = checks.get('real-family-deferred');
  if (!deferred?.result || hash(await read(repository,deferred.result)) !== deferred.resultSha256) throw new Error('Missing deferred real-family result');
  const replay = await json(repository,deferred.result);
  const suites = unique(replay.suites,'kind','deferred suites');
  sameKeys(new Map(deferredChecks.map(kind => [kind,true])),suites,'deferred suites',failures);
  for (const suite of suites.values()) {
    if (suite.status !== 'passed' || !Number.isInteger(suite.executed) || suite.executed < 1 || !Array.isArray(suite.failures) || suite.failures.length) failures.push(`Deferred suite incomplete: ${suite.kind}`);
    const cases = unique(suite.cases,'id',`${suite.kind} execution cases`);
    const required = suite.kind === 'ssr-guidance' ? routes : variants;
    sameKeys(new Map(required.map(id=>[id,true])),cases,`${suite.kind} coverage`,failures);
    let executed=0;
    for (const entry of cases.values()) {
      if (entry.status === 'passed') { executed++; continue; }
      if (entry.status !== 'not-applicable' || ['lazy-preview','variant-source-equality','cleanup'].includes(suite.kind) || !entry.reason || !entry.reviewedBy || !entry.source || !entry.sourceSha256) failures.push(`Unexecuted/unreviewed ${suite.kind} case: ${entry.id}`);
      else if (hash(await read(repository,entry.source))!==entry.sourceSha256) failures.push(`Stale ${suite.kind} applicability evidence: ${entry.id}`);
    }
    if (executed!==suite.executed) failures.push(`Deferred execution count mismatch: ${suite.kind}`);
  }
  return failures;
}
