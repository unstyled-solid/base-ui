import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, parse } from 'node:path';

const require = createRequire(import.meta.url);
function metadata(name) {
  let directory = dirname(require.resolve(name));
  while (directory !== parse(directory).root) {
    try {
      const result = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
      if (result.name === name) return result;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    directory = dirname(directory);
  }
  throw new Error(`No package metadata for ${name}`);
}
const pins = {
  'solid-js': '2.0.0-rc.13', '@solidjs/signals': '2.0.0-rc.13',
  '@solidjs/web': '2.0.0-rc.13', '@solidjs/compiler': '2.0.0-rc.13',
  '@solidjs/babel-plugin': '2.0.0-rc.13', '@solidjs/vite-plugin': '3.0.0-next.47',
  '@solidjs/testing-library': '1.0.0-beta.3',
};
for (const [name, version] of Object.entries(pins)) assert.equal(metadata(name).version, version, name);
for (const consumer of ['@solidjs/web', '@solidjs/testing-library']) {
  const fromConsumer = createRequire(require.resolve(consumer));
  assert.equal(realpathSync(fromConsumer.resolve('solid-js')), realpathSync(require.resolve('solid-js')), consumer);
}
const fromSolid = createRequire(require.resolve('solid-js'));
assert.equal(realpathSync(fromSolid.resolve('@solidjs/signals')), realpathSync(require.resolve('@solidjs/signals')));
console.log('PASS: coordinated RC.13 packages resolve one Solid runtime and one signals runtime', pins);
