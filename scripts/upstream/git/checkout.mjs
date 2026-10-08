import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { git, gitText } from './process.mjs';
import { fail, safePath } from './state.mjs';

export function inspectSource(root, state, source) {
  if (state.submodulePath !== `upstream/${source}`) {
    fail('SOURCE_PATH', `Source ${source} must use its independent upstream/${source} checkout.`);
  }
  const checkout = safePath(root, state.submodulePath);
  const modules = safePath(root, '.gitmodules');
  const entries = git(root, ['config', '-f', modules, '--null', '--get-regexp', '^submodule\\..*\\.path$'], { allowFailure: true });
  const matches = entries.stdout.split('\0').filter(Boolean).map((entry) => {
    const split = entry.indexOf('\n');
    return [entry.slice(0, split), entry.slice(split + 1)];
  }).filter(([, path]) => path === state.submodulePath);
  if (matches.length !== 1) fail('SUBMODULE_CONFIG', `Expected one .gitmodules entry for ${state.submodulePath}; ask the source owner to restore its pin.`);
  const prefix = matches[0][0].slice(0, -4);
  const configured = (key) => gitText(root, ['config', '-f', modules, '--get', `${prefix}${key}`]);
  if (configured('url') !== state.repositoryUrl || configured('branch') !== state.branch) {
    fail('SUBMODULE_CONFIG', '.gitmodules URL/branch differs from recorded source state. Coordinate with the pin owner; no configuration was changed.');
  }
  for (const key of ['url', 'branch']) {
    const local = git(root, ['config', '--local', '--get', `${prefix}${key}`], { allowFailure: true });
    if (local.status === 0 && local.stdout.trim() !== state[key === 'url' ? 'repositoryUrl' : 'branch']) {
      fail('SUBMODULE_CONFIG', `Local ${prefix}${key} differs from recorded state. Correct the configuration explicitly.`);
    }
  }
  if (git(root, ['check-ref-format', `refs/heads/${state.branch}`], { allowFailure: true }).status !== 0) {
    fail('INVALID_BRANCH', `Invalid recorded branch ${state.branch}.`);
  }
  const index = gitText(root, ['ls-files', '--stage', '--', state.submodulePath]);
  if (!/^160000 [a-f0-9]{40} 0\t/.test(index) || index.split('\n').length !== 1) {
    fail('MISSING_GITLINK', `No unconflicted gitlink for ${state.submodulePath}. Restore the source owner's recorded gitlink before init.`);
  }
  if (!existsSync(join(checkout, '.git'))) {
    if (existsSync(checkout) && readdirSync(checkout).length) {
      fail('UNRECOGNIZED_CHECKOUT', `${checkout} contains files but is not an initialized submodule. Move or reconcile those files manually; nothing was removed.`);
    }
    return { checkout, missing: true, head: null, gitlinkSha: index.slice(7, 47), dirty: false };
  }
  safePath(root, `${state.submodulePath}/.git`);
  if (realpathSync(gitText(checkout, ['rev-parse', '--show-toplevel'])) !== realpathSync(checkout)) {
    fail('UNRECOGNIZED_CHECKOUT', `${checkout} is not an independent Git worktree.`);
  }
  const gitDir = realpathSync(gitText(checkout, ['rev-parse', '--absolute-git-dir']));
  const common = realpathSync(resolve(root, gitText(root, ['rev-parse', '--git-common-dir'])));
  const moduleRelative = relative(join(common, 'modules'), gitDir);
  if (gitDir !== join(checkout, '.git') && (moduleRelative.startsWith('..') || isAbsolute(moduleRelative))) {
    fail('EXTERNAL_GIT_DIR', `Source Git directory ${gitDir} is outside this repository's submodules. A reference repository must never be used as writable source metadata.`);
  }
  const origin = gitText(checkout, ['remote', 'get-url', '--all', 'origin']);
  if (origin !== state.repositoryUrl) fail('WRONG_REMOTE', `origin URL differs from ${state.repositoryUrl}; correct it explicitly before updating.`);
  const attached = git(checkout, ['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFailure: true });
  if (attached.status === 0 && attached.stdout.trim() !== state.branch) {
    fail('WRONG_BRANCH', `Checkout is attached to ${attached.stdout.trim()}, expected ${state.branch} or a detached pin. Switch explicitly after preserving your work.`);
  }
  const dirty = gitText(checkout, ['status', '--porcelain=v1', '--untracked-files=all', '--ignored=matching']);
  return { checkout, missing: false, head: gitText(checkout, ['rev-parse', 'HEAD']), dirty: Boolean(dirty), changes: dirty };
}

export function requireClean(info) {
  if (info.dirty) fail('DIRTY_SOURCE', `Source ${info.checkout} has tracked, untracked or ignored work. Preserve/reconcile it manually; no reset, clean or stash was attempted.\n${info.changes}`);
}

export function requireCommit(checkout, sha) {
  const result = git(checkout, ['rev-parse', '--verify', `${sha}^{commit}`], { allowFailure: true });
  if (result.status !== 0 || result.stdout.trim() !== sha) {
    fail('MISSING_COMMIT', `Recorded commit ${sha} is missing in ${checkout}. Restore/fetch the recorded history explicitly; the baseline will not be guessed.`);
  }
}

export function requireAncestor(checkout, from, to) {
  requireCommit(checkout, from); requireCommit(checkout, to);
  const result = git(checkout, ['merge-base', '--is-ancestor', from, to], { allowFailure: true });
  if (result.status !== 0) fail('NON_ANCESTOR', `${from} is not an ancestor of ${to}. Upstream history may have been rewritten or rolled back; explicit coordinator triage is required.`);
}

export function requireHead(info, expected) {
  if (info.missing) fail('MISSING_SUBMODULE', 'Source checkout is missing. Run upstream:init first; update never recreates a worker checkout.');
  if (!expected.includes(info.head)) fail('CHECKOUT_MOVED', `Checkout HEAD ${info.head} differs from recorded ${expected.join(' or ')}. Restore the intended pin explicitly; no checkout was changed.`);
}

export function fetchCandidate(info, state) {
  // No remote-tracking branch is force-updated. FETCH_HEAD is resolved immediately,
  // under the source lock, and only its full commit ID enters durable state.
  git(info.checkout, ['-c', 'gc.auto=0', '-c', 'maintenance.auto=false',
    'fetch', '--no-tags', '--no-recurse-submodules', 'origin', `refs/heads/${state.branch}`]);
  return gitText(info.checkout, ['rev-parse', '--verify', 'FETCH_HEAD^{commit}']);
}

export function initialize(root, state, source) {
  let info = inspectSource(root, state, source);
  requireClean(info);
  if (info.missing) {
    git(root, ['-c', 'core.hooksPath=/dev/null', 'submodule', 'update', '--init', '--checkout', '--', state.submodulePath]);
    info = inspectSource(root, state, source);
    requireClean(info);
  }
  return info;
}

export function repositoryRoot(root) {
  const path = realpathSync(resolve(root));
  if (realpathSync(gitText(path, ['rev-parse', '--show-toplevel'])) !== path) {
    fail('ROOT_REQUIRED', 'Run the upstream CLI from the repository root, or pass --root <repository>.');
  }
  return path;
}
