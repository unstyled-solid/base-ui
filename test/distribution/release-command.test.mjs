import test from 'node:test';
import assert from 'node:assert/strict';
import { nextVersion, release } from '../../scripts/release.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { temporaryRoot, sha256 } from '../../scripts/distribution/consumers/policy.mjs';

test('release bumps patch, minor, major or accepts an explicit version', () => {
  assert.equal(nextVersion('0.0.1', 'patch'), '0.0.2');
  assert.equal(nextVersion('0.2.3', 'minor'), '0.3.0');
  assert.equal(nextVersion('0.2.3', 'major'), '1.0.0');
  assert.equal(nextVersion('0.0.1', '0.0.5'), '0.0.5');
  assert.throws(() => nextVersion('0.0.1', 'wat'));
});

async function releaseFixture(t, failure) {
  await fs.mkdir(temporaryRoot, { recursive: true });
  const repository = await fs.mkdtemp(path.join(temporaryRoot, 'release-test-'));
  const files = {
    'distribution/package-contract.json': JSON.stringify({ identity: { version: '0.0.4', publicationName: '@test/base-ui' } }),
    'packages/solid/package.json': JSON.stringify({ version: '0.0.4' }),
    'README.md': 'Version 0.0.4', 'packages/solid/README.md': 'Version 0.0.4', 'pnpm-lock.yaml': 'lock',
  };
  for (const [file, text] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(repository, file)), { recursive: true });
    await fs.writeFile(path.join(repository, file), text);
  }
  const f = { repository, calls: [], failure, head: 'source', tag: '', published: null, validations: 0, directory: null, dirty: false };
  t.after(async () => {
    await fs.rm(repository, { recursive: true, force: true });
    if (f.directory) await fs.rm(f.directory, { recursive: true, force: true });
  });
  f.execute = (command, args) => {
    f.calls.push([command, ...args]);
    const ok = stdout => ({ code: 0, stdout: stdout ?? '', stderr: '' });
    if (command === 'git') {
      if (args[0] === 'status') return ok(f.dirty ? ' M unrelated.txt' : '');
      if (args[0] === 'ls-files') return ok(args.includes('-z') ? Object.keys(files).join('\0') + '\0' : '');
      if (args[0] === 'rev-parse') return ok(args.includes('HEAD') ? f.head : 'origin/main');
      if (args[0] === 'diff') return ok('');
      if (args[0] === 'commit') { f.head = 'release'; return ok(); }
      if (args[0] === 'tag' && args[1] === '--list') return ok(f.tag);
      if (args[0] === 'tag') {
        if (f.failure === 'tag') throw new Error('tag failure');
        f.tag = args[1];
      }
      if (args[0] === 'push' && f.failure === 'push') throw new Error('push failure');
      if (args[0] === 'rev-list') return ok('release');
      return ok();
    }
    if (command === 'npm' && args[0] === 'view') return f.published ? ok(JSON.stringify(f.published)) : { code: 1, stdout: '', stderr: 'E404' };
    if (command === 'npm' && args[0] === 'whoami' && f.failure === 'auth') throw new Error('authentication failure');
    if (command === 'npm' && args[0] === 'publish') {
      assert.equal(args[1], f.tarball);
      if (f.failure === 'publish') return { code: 1, stdout: '', stderr: 'E401 login expired' };
      if (f.failure !== 'validation') f.published = f.integrity;
    }
    return ok();
  };
  f.validate = async ({ output }) => {
    f.directory = path.dirname(output);
    f.validations++;
    if (f.failure === 'verify') throw new Error('broken hydration fixture');
    await fs.mkdir(output, { recursive: true });
    f.tarball = path.join(output, 'candidate.tgz');
    const bytes = Buffer.from('verified release archive');
    await fs.writeFile(f.tarball, bytes);
    f.integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
    return { status: 'passed', tarball: f.tarball, archiveSha256: sha256(bytes), stages: [{ name: 'all', status: 'passed' }] };
  };
  return f;
}

test('release publishes the verified tarball once and only stages explicit release files', async t => {
  const f = await releaseFixture(t);
  const state = await release(f);
  assert.equal(state.version, '0.0.5');
  assert.equal(state.tagPushed, true);
  assert.equal(f.validations, 1);
  assert.deepEqual(f.calls.filter(c => c[0] === 'npm' && c[1] === 'publish'), [['npm', 'publish', f.tarball, '--access', 'public']]);
  const add = f.calls.find(c => c[1] === 'add');
  assert.deepEqual(add, ['git', 'add', '--', 'distribution/package-contract.json', 'packages/solid/package.json', 'README.md', 'packages/solid/README.md', 'pnpm-lock.yaml']);
});

for (const failure of ['verify', 'auth', 'publish', 'tag', 'push']) {
  test(`release resumes after ${failure} failure without duplicate publication`, async t => {
    const f = await releaseFixture(t, failure);
    await assert.rejects(release(f));
    const acceptedBefore = f.published;
    f.failure = null;
    const before = f.calls.length;
    const state = await release({ ...f, resume: f.directory });
    assert.equal(state.tagPushed, true);
    assert.equal(f.validations, failure === 'verify' ? 2 : 1);
    if (acceptedBefore) assert.equal(f.calls.slice(before).filter(c => c[1] === 'publish').length, 0);
  });
}

test('accepted publication waits for registry validation and never republishes', async t => {
  const f = await releaseFixture(t, 'validation');
  await assert.rejects(release(f), /awaiting registry validation/);
  await assert.rejects(release({ ...f, resume: f.directory }), /validation is pending/);
  f.published = f.integrity;
  const state = await release({ ...f, resume: f.directory });
  assert.equal(state.tagPushed, true);
  assert.equal(f.calls.filter(c => c[1] === 'publish').length, 1);
});

test('dirty starting checkout fails before preparation', async t => {
  const f = await releaseFixture(t);
  f.dirty = true;
  await assert.rejects(release(f), /clean starting checkout/);
  assert.equal(f.validations, 0);
  assert.equal(JSON.parse(await fs.readFile(path.join(f.repository, 'packages/solid/package.json'))).version, '0.0.4');
});

test('a previously published version is never republished when registry visibility disappears', async t => {
  const f = await releaseFixture(t, 'tag');
  await assert.rejects(release(f), /tag failure/);
  f.published = null;
  await assert.rejects(release({ ...f, resume: f.directory }), /validation is pending/);
  assert.equal(f.calls.filter(call => call[1] === 'publish').length, 1);
});

test('resume rejects changed source or archive bytes', async t => {
  const f = await releaseFixture(t, 'auth');
  await assert.rejects(release(f));
  const readme = path.join(f.repository, 'README.md');
  const before = await fs.readFile(readme);
  await fs.appendFile(readme, 'changed');
  await assert.rejects(release({ ...f, resume: f.directory }), /Source inputs changed/);
  await fs.writeFile(readme, before);
  await fs.appendFile(f.tarball, 'changed');
  await assert.rejects(release({ ...f, resume: f.directory }), /archive hash changed/);
});
