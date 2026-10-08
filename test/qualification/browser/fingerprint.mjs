import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function fingerprint(root, directories) {
  const hash = createHash('sha256');
  async function walk(path, relative) {
    for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const next = `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(resolve(path, entry.name), next);
      else if (entry.isFile() && /\.(tsx?|jsx?|mjs|css|html|json)$/.test(entry.name)
        && !/\.(test|spec)\./.test(entry.name)) {
        hash.update(next).update('\0').update(await readFile(resolve(path, entry.name))).update('\0');
      }
    }
  }
  for (const directory of directories) await walk(resolve(root, directory), directory);
  return hash.digest('hex');
}
