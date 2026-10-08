import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './engine.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
try {
  const args = process.argv.slice(2);
  if (args.some((arg) => !['--check', '--require-metadata'].includes(arg))) throw new Error('Usage: node docs/scripts/api/index.mjs [--check] [--require-metadata]');
  const contract = JSON.parse(await fs.readFile(path.join(root, 'distribution/exports.json'), 'utf8'));
  const entries = Object.entries(contract.exports).map(([entrypoint, e]) => ({ entrypoint,
    file: path.join(root, 'packages/solid/build/types', e.target.slice(6).replace(/\.tsx?$/, '.d.ts')) }));
  for (const e of entries) try { await fs.access(e.file); } catch { throw new Error(`Missing ${e.file}; request/run pnpm types:package first`); }
  const catalog = await generate({ root, entries, output: path.join(root, 'docs/generated/api'), check: args.includes('--check'),
    requiredMetadata: args.includes('--require-metadata') ? ['dataAttributes', 'cssVariables'] : [] });
  console.log(`API ${args.includes('--check') ? 'checked' : 'generated'}: ${catalog.modules.length} entrypoints, ${catalog.modules.reduce((n, m) => n + m.exports.length, 0)} exports.`);
} catch (error) { console.error(error.stack); process.exitCode = 1; }
