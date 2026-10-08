import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { gitText } from '../../../scripts/upstream/git/process.mjs';
import { json, sourcePaths } from '../../../scripts/upstream/git/state.mjs';

// Explicitly local-only fixtures. Every child Git invocation is still RTK-wrapped.
process.env.GIT_ALLOW_PROTOCOL = 'file';
export const g = (cwd, ...args) => gitText(cwd, args);
export function write(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
export function commit(repo, message) {
  g(repo, 'add', '--all');
  g(repo, '-c', 'user.name=Upstream Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '-m', message);
  return g(repo, 'rev-parse', 'HEAD');
}

export function fixture(t, { source = 'base-ui', branch = 'master', initialized = true } = {}) {
  const temp = mkdtempSync(join(tmpdir(), 'baseui-upstream-fixture-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const root = join(temp, 'consumer');
  const producer = join(temp, 'producer');
  const remote = join(temp, 'remote.git');
  mkdirSync(root); mkdirSync(producer);
  g(root, 'init', '--initial-branch=fixture');
  g(producer, 'init', `--initial-branch=${branch}`);
  write(join(producer, 'source.txt'), 'original\n');
  write(join(producer, 'rename me.txt'), 'retained source content\n'.repeat(12));
  write(join(producer, 'delete.txt'), 'will be deleted\n');
  write(join(producer, '.gitignore'), 'ignored.txt\n');
  const baseline = commit(producer, 'fixture baseline');
  g(temp, 'clone', '--bare', producer, remote);
  const state = { repositoryUrl: remote, branch, submodulePath: `upstream/${source}`,
    baselineSourceSha: baseline, fetchedCandidateSha: baseline, verifiedParitySha: null };
  const paths = sourcePaths(root, source);
  write(paths.state, json(state));
  write(join(root, '.gitmodules'), `[submodule "upstream/${source}"]\n\tpath = upstream/${source}\n\turl = ${remote}\n\tbranch = ${branch}\n`);
  g(root, 'add', '.gitmodules', paths.state);
  g(root, 'update-index', '--add', '--cacheinfo', `160000,${baseline},upstream/${source}`);
  // Only isolated fixture repositories receive commits, never the development repository.
  g(root, '-c', 'user.name=Upstream Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '-m', 'fixture pin');
  if (initialized) g(root, 'submodule', 'update', '--init', '--checkout', '--', state.submodulePath);
  const checkout = join(root, state.submodulePath);
  function advance(label = 'next') {
    write(join(producer, 'source.txt'), `${label}\n`);
    const sha = commit(producer, label);
    // A local bare fetch updates the fixture remote; no pushes or network are involved.
    g(remote, 'fetch', producer, `${branch}:refs/heads/${branch}`);
    return sha;
  }
  return { temp, root, producer, remote, state, paths, checkout, baseline, source, branch, advance,
    readState: () => JSON.parse(readFileSync(paths.state, 'utf8')) };
}
