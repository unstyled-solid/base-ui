import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildPackage, filesIn, root } from './index.mjs';

export async function assertEnvironments(output) {
  for (const directory of ['dom', 'server', 'dom-dev', 'server-dev']) {
    const development = directory.endsWith('-dev');
    for (const file of (await filesIn(path.join(output, directory))).filter(file => file.endsWith('.js'))) {
      const code = await fs.readFile(path.join(output, directory, file), 'utf8');
      assert(!code.includes('process.env.NODE_ENV'), `${directory}/${file}: browser-unsafe environment reference`);
      assert(!/["'](?:production|development)["']\s*[!=]==?\s*["']production["']/.test(code), `${directory}/${file}: unfolded environment guard`);
    }
    for (const [file, message] of [
      ['internals/use-button/useButton.js', 'a native <button>'],
      ['utils/createControlled.js', 'A component is changing the'],
      ['field/label/FieldLabel.js', 'console.error'],
    ]) {
      const code = await fs.readFile(path.join(output, directory, file), 'utf8');
      assert.equal(code.includes(message), development, `${directory}/${file}: diagnostic variant`);
    }
  }
}

const output = path.join(root, 'packages/solid/build');
async function snapshot() {
  const files = (await filesIn(output)).filter(file => !file.startsWith('types/'));
  return new Map(await Promise.all(files.map(async file => [file, createHash('sha256').update(await fs.readFile(path.join(output, file))).digest('hex')])));
}
try {
  await buildPackage();
  await assertEnvironments(output);
  const first = await snapshot();
  await buildPackage();
  const second = await snapshot();
  assert.deepEqual(second, first, 'Production builds differ (including source maps/manifest/notices); concurrent source changes also invalidate this check');
  console.log(`PASS: two actual production builds, ${second.size} owned files byte-identical; declarations not modified`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
