import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (path) => readFileSync(resolve(root, path));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(read('docs/content/assets/manifest.json'));

test('immutable source links, canonical and captured hashes, publication/license URLs', () => {
  assert.equal(manifest.sourceSha, '19511bb171f3b360b006c94cf6d07e53cb446505');
  for (const entry of manifest.entries) {
    assert.equal(entry.sourceUrl, `${manifest.repository}/blob/${manifest.sourceSha}/${entry.source}`);
    assert.equal(entry.rawUrl, `https://raw.githubusercontent.com/mui/base-ui/${manifest.sourceSha}/${entry.source}`);
    const bytes = read(`upstream/base-ui/${entry.source}`);
    assert.equal(hash(bytes), entry.sha256);
    assert.equal(bytes.length, entry.bytes);
    if (entry.capturedPath) assert.deepEqual(read(entry.capturedPath), bytes);
    if (entry.publishable) {
      assert.equal(entry.destination, `${manifest.publication.publicRoot}${entry.publicUrl}`);
      assert.deepEqual(read(entry.destination), bytes);
      assert.equal(hash(read(entry.license.path)), entry.license.sha256);
      assert.deepEqual(read(`${manifest.publication.publicRoot}${entry.license.publicUrl}`), read(entry.license.path));
    } else {
      assert.equal(entry.publicUrl, null);
      assert.equal(entry.destination, null);
      assert.equal(entry.license.spdx, 'NOASSERTION');
      assert.ok(entry.blocker);
    }
  }
});

test('public tree is an exact allowlist; CSS can reference only approved fonts', () => {
  const allowed = new Set();
  for (const entry of manifest.entries.filter((entry) => entry.publishable)) {
    allowed.add(entry.publicUrl.slice(1));
    allowed.add(entry.license.publicUrl.slice(1));
  }
  const css = manifest.stylesheets.find((entry) => entry.publishable);
  allowed.add(css.publicUrl.slice(1));
  const publicRoot = resolve(root, manifest.publication.publicRoot);
  const actual = readdirSync(publicRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile()).map((entry) => relative(publicRoot, resolve(entry.parentPath, entry.name)));
  assert.deepEqual(new Set(actual), allowed);
  const bytes = read(css.destination);
  assert.equal(hash(bytes), css.sha256);
  const text = bytes.toString();
  assert.ok(!text.includes('die grotesk'));
  for (const match of text.matchAll(/url\('([^']+)'\)/g)) {
    const asset = manifest.entries.find((entry) => entry.publicUrl === match[1]);
    assert.ok(asset?.publishable, `Unapproved CSS URL: ${match[1]}`);
  }
  const original = read(manifest.stylesheets[0].capturedPath);
  assert.equal(hash(original), manifest.stylesheets[0].sha256);
  assert.ok(original.toString().endsWith(text));
  assert.equal(manifest.entries.filter((entry) => !entry.publishable).length, 4);
});
