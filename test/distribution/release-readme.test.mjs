import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const headings = (text) => [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);

test('consumer READMEs retain upstream structure with truthful Solid identities', async () => {
  for (const [target, source] of [
    ['README.md', 'upstream/base-ui/README.md'],
    ['packages/solid/README.md', 'upstream/base-ui/packages/react/README.md'],
  ]) {
    const text = await read(target);
    assert.deepEqual(headings(text), headings(await read(source)));
    for (const required of [
      'https://github.com/unstyled-solid/base-ui',
      'https://www.npmjs.com/package/@unstyled-solid/base-ui',
      'https://github.com/unstyled-solid/base-ui/releases',
      'npm install @unstyled-solid/base-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13',
      '0.0.1 is an alpha', 'not maintained by MUI', '@solidjs/web',
      '(props, state) => JSX', 'MIT license',
      '19511bb171f3b360b006c94cf6d07e53cb446505',
    ]) assert.ok(text.includes(required), `${target}: missing ${required}`);
    assert.doesNotMatch(text, /project plan|Current state:|not completed|implementation tickets|rtk |@base-ui\/react|className|shadcn|discord\.gg|x\.com|base-ui\.com/);
  }
});

test('registry README source is package-local and documents a real public subpath', async () => {
  const text = await read('packages/solid/README.md');
  const manifest = JSON.parse(await read('packages/solid/package.json'));
  assert.ok(manifest.exports['./button']);
  assert.match(text, /import \{ Button \} from '@unstyled-solid\/base-ui\/button'/);
  for (const peer of ['solid-js', '@solidjs/web']) {
    assert.equal(manifest.peerDependencies[peer], '2.0.0-rc.13');
  }
  const stage = await read('scripts/distribution/build/index.mjs');
  assert.match(stage, /path\.join\(packageDirectory, name\)/);
  assert.match(stage, /await exists\(local\) \? local/);
  assert.match(stage, /fs\.copyFile\(source, path\.join\(output, name\)\)/);
  assert.match(text, /github\.com\/unstyled-solid\/base-ui\/blob\/main\/docs\/site\/README\.md/);
});
