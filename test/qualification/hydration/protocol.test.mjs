import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { archiveFiles, defaultFunction, mark, newReport, parseArgs, verifyArchive, within } from './protocol.mjs';
import { documentFor } from './scenarios.mjs';

function tar(entries) {
  const blocks = entries.flatMap(([name, content, type = '0']) => {
    const payload = Buffer.from(content);
    const header = Buffer.alloc(512);
    header.write(name, 0); header.write('0000644\0', 100); header.write('0000000\0', 108); header.write('0000000\0', 116);
    header.write(`${payload.length.toString(8).padStart(11, '0')}\0`, 124);
    header.fill(32, 148, 156); header.write(type, 156); header.write('ustar\0', 257);
    const checksum = header.reduce((sum, value) => sum + value, 0);
    header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148);
    return [header, payload, Buffer.alloc((512 - payload.length % 512) % 512)];
  });
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

test('archive parser rejects path traversal, links, duplicates and damaged checksums', () => {
  const manifest = ['package/package.json', '{"name":"baseui-solid2"}'];
  for (const entries of [[manifest, ['package/../escape', 'x']], [manifest, ['package/link', '', '2']], [manifest, manifest]]) {
    assert.throws(() => archiveFiles(tar(entries)));
  }
  const compressed = tar([manifest]); compressed[0] = 0;
  assert.throws(() => archiveFiles(compressed));
});

test('actual installation must match every archive byte and cannot be workspace linked', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'opencode', 'hydration-protocol-'));
  try {
    const consumer = path.join(directory, 'consumer');
    const packageDirectory = path.join(consumer, 'node_modules/baseui-solid2');
    await mkdir(packageDirectory, { recursive: true });
    const manifest = '{"name":"baseui-solid2","version":"0.0.0"}';
    const archive = path.join(directory, 'package.tgz');
    await writeFile(archive, tar([['package/package.json', manifest], ['package/server.js', 'real artifact']]));
    await writeFile(path.join(packageDirectory, 'package.json'), manifest);
    await writeFile(path.join(packageDirectory, 'server.js'), 'real artifact');
    const verified = await verifyArchive(archive, consumer, path.join(directory, 'repository'));
    assert.equal(verified.verifiedFiles, 2); assert.match(verified.sha256, /^[a-f0-9]{64}$/);
    await writeFile(path.join(packageDirectory, 'server.js'), 'altered artifact');
    await assert.rejects(verifyArchive(archive, consumer, path.join(directory, 'repository')), /archive mismatch/);
    await rm(packageDirectory, { recursive: true });
    const outside = path.join(directory, 'workspace'); await mkdir(outside);
    await symlink(outside, packageDirectory);
    await assert.rejects(verifyArchive(archive, consumer, outside), /workspace\/outside-consumer/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('coverage cannot become green from one mode or authored fixtures and never loses failure evidence', () => {
  const report = newReport();
  assert.equal(report.rows.length, 27);
  assert(report.rows.every(row => row.status === 'blocked'));
  mark(report, ['archive'], 'production', 'passed', 'production');
  assert.equal(report.rows[0].status, 'blocked');
  mark(report, ['archive'], 'development', 'passed', 'development');
  assert.equal(report.rows[0].status, 'passed');
  mark(report, ['archive'], 'development', 'failed', 'mismatch');
  mark(report, ['archive'], 'development', 'passed', 'other scenario');
  assert.equal(report.rows[0].status, 'failed');
  assert.equal(report.qualified, false);
  assert(report.rows.filter(row => row.stage === 'blocked').every(row => row.reason));
});

test('CLI requires tarball/consumer/output and refuses typo or ambiguous flags', () => {
  const args = ['--consumer', '/consumer', '--tarball', '/package.tgz', '--output', '/consumer/run'];
  assert.equal(parseArgs(args).phase, 'compile');
  assert.equal(parseArgs([...args, '--phase', 'browser']).phase, 'browser');
  assert.throws(() => parseArgs(args.slice(0, 4)), /Required --output/);
  assert.throws(() => parseArgs([...args, '--workspace', 'true']), /Invalid/);
  assert.throws(() => parseArgs([...args, '--consumer', '/other']), /Repeated/);
  assert.throws(() => parseArgs([...args, '--phase', 'compile', '--phase', 'browser']), /Repeated/);
  assert.equal(within('/consumer', '/consumer/run'), true);
  assert.equal(within('/consumer', '/consumer-elsewhere/run'), false);
  assert.equal(within('/consumer', '/consumer/../workspace'), false);
});

test('independent tool loading handles node/CJS and ESM defaults without accidentally calling an exports object', () => {
  const plugin = () => [];
  assert.equal(defaultFunction({ default: plugin }, 'plugin'), plugin);
  assert.equal(defaultFunction({ default: { default: plugin } }, 'plugin'), plugin);
  assert.throws(() => defaultFunction({ default: {} }, 'plugin'), /Missing callable/);
});

test('SSR document preserves emitted scripts and gates hydration after prehydration snapshot under nonce CSP', () => {
  const html = documentFor([{ id: 'controls-a', props: { request: '</script><evil>' }, html: '<input data-hk="x"><script nonce="qualification-nonce">actualSSR()</script>' }]);
  assert(html.includes('actualSSR()'));
  assert(html.includes('\\u003c/script>'));
  assert(!html.includes('<evil>'));
  assert(html.indexOf('actualSSR()') < html.indexOf('window.prehydration'));
  assert(html.indexOf('window.prehydration') < html.indexOf('window.startQualification'));
  assert(html.includes('nonce="qualification-nonce"'));
});
