import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, markdownInventory } from './audit.mjs';
import { json, read, safe, sourceSha, hash, walk, noSymlinks } from './io.mjs';

// The existing build.config.mjs and upstream stagePublishedDocs.mjs define the
// seam: docs/public/**/*.md -> build/docs/**/*.md, gated by BASE_UI_PUBLISH_DOCS.
// Copy already-generated Markdown; do not invent a second prose/API generator.
export async function markdownLedger(repository = root, site = 'docs/generated/site') {
  const files = await markdownInventory(repository,{site});
  const identity = await json(repository,'packages/solid/package.json');
  return { schemaVersion: 1, stagingVersion: 'bsolid-markdown-stage/1', sourceSha, package: { name: identity.name, version: identity.version, private: identity.private }, inventorySha256: hash(JSON.stringify(files)), files };
}
export async function stageMarkdown({ repository = root, site = 'docs/generated/site', destination = 'docs/public', check = false } = {}) {
  if (destination !== 'docs/public') throw new Error('Markdown staging destination must be docs/public (existing build contract)');
  const ledger = await markdownLedger(repository,site), files=ledger.files;
  const output = new Map(await Promise.all(files.map(async entry => [entry.destination, await read(repository,entry.source)])));
  output.set('markdown-manifest.json', Buffer.from(JSON.stringify(ledger,null,2)+'\n'));
  for (const file of output.keys()) await noSymlinks(repository,`${destination}/${file}`);
  let existing = [];
  try { existing = await walk(repository,destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const unexpected = existing.filter(file => !output.has(file.slice(destination.length+1)));
  if (unexpected.length) throw new Error(`Unowned/stale staging files require coordinator reconciliation: ${unexpected.join(', ')}`);
  // Validate the complete input set before any write. No recursive cleanup.
  for (const [file, bytes] of output) {
    const target = `${destination}/${file}`;
    let current; try { current = await read(repository,target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (current?.equals(bytes)) continue;
    if (check) throw new Error(`Missing/stale staged Markdown: ${target}`);
    await fs.mkdir(path.dirname(safe(repository,target)),{recursive:true});
    // Recheck after directory creation, rejecting ancestor symlinks.
    if (await fs.realpath(path.dirname(safe(repository,target))) !== path.dirname(safe(repository,target))) throw new Error(`Symlink staging parent: ${target}`);
    await fs.writeFile(safe(repository,target),bytes);
  }
  return ledger;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--check')) throw new Error('Usage: stage-markdown.mjs [--check]');
    const ledger = await stageMarkdown({check:args.includes('--check')});
    console.log(`Markdown staging v1: ${ledger.files.length} pages/API references; inventory ${ledger.inventorySha256}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
