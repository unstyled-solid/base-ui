import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateCatalog } from './catalog.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const output = new URL('../../generated/demos/catalog.json', import.meta.url);
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check' && arg !== '--complete')) throw new Error('Usage: generate.mjs [--check] [--complete]');
const catalog = await generateCatalog(root);
const bytes = `${JSON.stringify(catalog, null, 2)}\n`;
if (args.includes('--check')) {
  if (await fs.readFile(output, 'utf8') !== bytes) throw new Error('Demo catalog is stale; run docs:generate:demos');
} else {
  await fs.mkdir(new URL('./', output), { recursive: true });
  let previous;
  try { previous = await fs.readFile(output, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous !== bytes) await fs.writeFile(output, bytes);
}
console.log(`Demo catalog: ${catalog.entries.length} entries; ${catalog.missing.length} unresolved upstream references`);
if (args.includes('--complete') && catalog.missing.length) throw new Error(`Missing demos:\n${catalog.missing.join('\n')}`);
