import { spawnSync } from 'node:child_process';
import { check, unique } from './evidence.mjs';
import { fail } from '../git/state.mjs';

function bd(root, args) {
  const result = spawnSync('rtk', ['proxy', 'bd', '--readonly', ...args, '--json'],
    { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error || result.status !== 0 || result.signal) fail('BEADS_UNAVAILABLE', result.stderr || 'Cannot audit live Beads.');
  try { return JSON.parse(result.stdout); }
  catch { fail('BEADS_UNAVAILABLE', 'Beads did not return complete JSON.'); }
}

// Full unfiltered audit catches open blockers omitted from the producer's task list.
// Read each required task's real dependency edges rather than trusting a saved status.
export function readBeads(root, required) {
  const issues = bd(root, ['list', '--all', '--flat', '--limit', '0', '--include-gates', '--include-ephemeral']);
  check(Array.isArray(issues), 'BEADS_UNAVAILABLE', 'Expected complete Beads issue array.');
  const byId = new Map(issues.map((issue) => [issue.id, issue]));
  const pending = [...required];
  const visited = new Set();
  while (pending.length) {
    const id = pending.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const response = bd(root, ['show', id]);
    const issue = Array.isArray(response) && response.length === 1 ? response[0] : null;
    check(issue?.id === id && byId.get(id)?.status === issue.status, 'BEADS_UNAVAILABLE', `Incomplete/inconsistent Beads task ${id}.`);
    check((issue.dependencies ?? []).every((edge) => ['blocks', 'parent-child', 'related', 'discovered-from'].includes(edge.dependency_type)),
      'BEADS_UNAVAILABLE', `Unrecognized dependency semantics for ${id}; coordinator must explicitly classify the edge.`);
    const dependencies = (issue.dependencies ?? []).filter((edge) => edge.dependency_type === 'blocks').map((edge) => edge.id);
    byId.set(id, { ...issue, requiredDependencies: dependencies });
    pending.push(...dependencies);
  }
  return [...byId.values()].map((issue) => ({ id: issue.id, status: issue.status,
    type: issue.issue_type, labels: issue.labels ?? [], metadata: issue.metadata ?? {},
    dependencies: issue.requiredDependencies ?? [] })).sort((a, b) => a.id.localeCompare(b.id, 'en'));
}

export function auditBeads(issues, required, authorizationHash) {
  check(Array.isArray(issues), 'BEADS_UNAVAILABLE', 'Missing live Beads snapshot.');
  unique(issues.map((issue) => issue.id), 'Beads task IDs');
  const map = new Map(issues.map((issue) => [issue.id, issue]));
  for (const issue of issues) {
    check(['open', 'in_progress', 'blocked', 'deferred', 'closed'].includes(issue.status), 'BEADS_UNAVAILABLE', `Unknown status for ${issue.id}.`);
    const blocker = issue.type === 'bug' || issue.metadata?.parityBlocker === true ||
      issue.labels?.some((label) => ['parity-blocker', 'verification-blocker'].includes(label)) ||
      (issue.type !== 'epic' && issue.labels?.includes('parity') &&
        !(issue.id === 'bsolid-release-ready' && authorizationHash &&
          issue.metadata?.verificationAuthorizationHash === authorizationHash));
    check(!blocker || issue.status === 'closed', 'OPEN_BLOCKER', `Open Beads parity blocker ${issue.id}.`);
  }
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    check(!visiting.has(id), 'OPEN_BLOCKER', `Cyclic Beads prerequisites at ${id}.`);
    const issue = map.get(id);
    check(issue?.status === 'closed', 'OPEN_TASK', `Required task ${id} is absent or open.`);
    visiting.add(id);
    for (const dependency of issue.dependencies ?? []) visit(dependency);
    visiting.delete(id); visited.add(id);
  }
  for (const id of new Set(required)) visit(id);
  if (authorizationHash) {
    check(map.get('bsolid-release-ready')?.metadata?.verificationAuthorizationHash === authorizationHash,
      'INITIAL_QUALIFICATION', 'Release coordinator has not approved this exact release-ready evidence hash in Beads.');
  }
}
