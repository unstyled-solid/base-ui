import { posix } from 'node:path';

export function relativePath(path) {
  return typeof path === 'string' && path.length > 0 && !/[:\\\x00-\x1f*?]/.test(path) &&
    !path.startsWith('/') && !path.endsWith('/') && !path.split('/').some((x) => !x || x === '.' || x === '..');
}

export function matches(path, glob) {
  const expression = glob.split('**').map((part) => part.split('*')
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*');
  return new RegExp(`^${expression}$`).test(path);
}

export function targetCandidates(path) {
  const target = path.replace(/^packages\/react\/src\//, 'packages/solid/src/')
    .replace(/^packages\/utils\/src\//, 'packages/solid/src/utils/');
  return [...new Set([target, target.replace(/\/use([A-Z][^/]*)$/, '/create$1')])];
}

export function mapOwnership(entry, owners, policy) {
  const path = entry.path;
  if (!relativePath(path)) throw new Error(`Unsafe source path ${path}`);
  const overrides = policy.overrides.filter((rule) => matches(path, rule.pattern));
  if (overrides.length > 1) throw new Error(`Duplicate overrides for ${path}`);
  const candidates = targetCandidates(path);
  const claims = owners.flatMap((owner) => candidates.flatMap((target) =>
    owner.owns.some((glob) => matches(target, glob)) ? [{ owner: owner.id, target }] : []));
  let mapping;
  if (overrides.length) {
    const rule = overrides[0];
    mapping = { owner: rule.owner, targets: rule.target ? [path.replace(new RegExp(rule.replace ?? '^.*$'), rule.target)] : [],
      disposition: rule.disposition, reason: rule.reason,
      ...(rule.seam ? { ownershipSeam: rule.seam } : {}),
      provenance: { kind: 'override', rule: rule.pattern, previousClaims: claims } };
  } else if (/^packages\/(react|utils)\/src\//.test(path) && claims.length) {
    const ids = [...new Set(claims.map((c) => c.owner))].sort();
    let selected = ids[0];
    if (ids.length > 1) {
      // Serialized component stages share the same directory by explicit contract.
      const group = policy.serializedFamilies.find((g) => ids.every((id) => g.stages.includes(id)));
      if (!group) throw new Error(`Duplicate ownership ${path}: ${ids.join(', ')}`);
      selected = group.owner;
    }
    const claim = claims.find((c) => c.owner === selected);
    if (!claim) throw new Error(`Missing primary ownership ${path}: ${selected}`);
    mapping = { owner: selected, targets: [claim.target], disposition: 'translated',
      reason: 'Planned Solid-native mapping under ticket target allowlist; no implementation or parity claim.',
      provenance: { kind: 'target-allowlist', candidates: ids } };
  } else {
    const rules = policy.rules.filter((rule) => matches(path, rule.pattern));
    if (rules.length !== 1) throw new Error(`${rules.length ? 'Duplicate' : 'Missing'} ownership ${path}`);
    const rule = rules[0];
    mapping = { owner: rule.owner, targets: rule.targetPrefix !== undefined ? [rule.targetPrefix + path] : [],
      disposition: rule.disposition, reason: rule.reason,
      provenance: { kind: 'policy', rule: rule.pattern } };
  }
  if (!owners.some((o) => o.id === mapping.owner)) throw new Error(`Unknown owner ${mapping.owner}: ${path}`);
  if (!mapping.reason?.trim()) throw new Error(`Missing disposition reason ${path}`);
  for (const target of mapping.targets) {
    if (!relativePath(target) || /^(upstream|\.\.)(\/|$)/.test(target)) throw new Error(`Unsafe target ${target}`);
    if (!owners.find((o) => o.id === mapping.owner).owns.some((glob) => matches(target, glob)) && !mapping.ownershipSeam) throw new Error(`Target outside owner allowlist ${mapping.owner}: ${target}`);
  }
  if (mapping.disposition === 'translated' && !mapping.targets.length) throw new Error(`Missing target ${path}`);
  return mapping;
}

export function classify(path) {
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) return 'test';
  if (path.startsWith('docs/')) return 'docs';
  if (/\/test\/|^test\//.test(path)) return 'test-support';
  if (/^packages\/(react|utils)\/src\//.test(path)) return /\.d\.ts$|\/types(?:\/|\.)/.test(path) ? 'type' : 'runtime';
  if (posix.basename(path) === 'LICENSE') return 'license';
  return 'build-metadata';
}
