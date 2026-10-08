import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildPackage, filesIn, root } from './index.mjs';

const output = path.join(root, 'packages/solid/build');
async function snapshot() {
  const files = (await filesIn(output)).filter(file => !file.startsWith('types/'));
  return new Map(await Promise.all(files.map(async file => [file, createHash('sha256').update(await fs.readFile(path.join(output, file))).digest('hex')])));
}
try {
  await buildPackage();
  const first = await snapshot();
  await buildPackage();
  const second = await snapshot();
  assert.deepEqual(second, first, 'Production builds differ (including source maps/manifest/notices); concurrent source changes also invalidate this check');
  console.log(`PASS: two actual production builds, ${second.size} owned files byte-identical; declarations not modified`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
