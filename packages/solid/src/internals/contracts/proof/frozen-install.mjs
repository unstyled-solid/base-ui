import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// An isolated manifest-only workspace proves lockfile completeness without touching shared node_modules.
const cache = fileURLToPath(new URL('./.cache/', import.meta.url));
await mkdir(cache, { recursive: true });
const directory = await mkdtemp(join(cache, 'frozen-install-'));
const files = ['package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', '.npmrc', 'packages/solid/package.json'];
try {
  await mkdir(join(directory, 'packages/solid'), { recursive: true });
  for (const file of files) await copyFile(file, join(directory, file));
  const before = await readFile(join(directory, 'pnpm-lock.yaml'), 'utf8');
  const result = spawnSync('rtk', ['proxy', 'pnpm', 'install', '--frozen-lockfile'], { cwd: directory, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, 'clean frozen installation');
  assert.equal(await readFile(join(directory, 'pnpm-lock.yaml'), 'utf8'), before, 'frozen lockfile unchanged');
  console.log('PASS: clean isolated frozen install (no existing node_modules), lockfile unchanged');
} finally {
  await rm(directory, { recursive: true, force: true });
}
