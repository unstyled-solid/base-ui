import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

test('Node syntax checks every authored runner/template/test without executing consumers', async () => {
  const roots = [new URL('../../../scripts/distribution/consumers/', import.meta.url), new URL('./', import.meta.url), new URL('./templates/', import.meta.url)];
  for (const root of roots) for (const file of await fs.readdir(root)) {
    if (!file.endsWith('.mjs')) continue;
    const location = fileURLToPath(new URL(file, root));
    const result = spawnSync('rtk', ['proxy', process.execPath, '--check', location], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${location}\n${result.stdout}\n${result.stderr}`);
  }
});
