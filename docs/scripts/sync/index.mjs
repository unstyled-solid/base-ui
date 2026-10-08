import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { synchronize } from './engine.mjs';

const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--check', '--import', '--verify-upstream'].includes(arg)) throw new Error(`Unknown docs:sync argument: ${arg}`);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
try {
  console.log(JSON.stringify(await synchronize(root, { check: args.has('--check'), importSource: args.has('--import'), verifyUpstream: args.has('--verify-upstream') }), null, 2));
} catch (error) {
  console.error(`docs:sync: ${error.message}`);
  process.exitCode = 1;
}
