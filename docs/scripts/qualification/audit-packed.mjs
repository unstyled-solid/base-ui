import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readArchive } from '../../../scripts/distribution/notices/archive.mjs';
import { markdownLedger } from './stage-markdown.mjs';
import { root } from './audit.mjs';
import { read, hash, sourceSha } from './io.mjs';

export function checkPackedMarkdown(archive,ledger) {
  const failures=[];
  const bytes=archive.get('package/docs/markdown-manifest.json');
  if (!bytes) failures.push('Missing packed versioned Markdown inventory: docs/markdown-manifest.json');
  else { try { if (JSON.stringify(JSON.parse(bytes))!==JSON.stringify(ledger)) failures.push('Packed Markdown inventory differs from the current complete version/identity/source inventory'); } catch { failures.push('Invalid packed Markdown inventory'); } }
  const expected=new Set(ledger.files.map(file=>`package/docs/${file.destination}`));
  for (const file of ledger.files) {
    const name=`package/docs/${file.destination}`, bytes=archive.get(name);
    if (!bytes) failures.push(`Missing packed Markdown: ${file.destination}`);
    else if (hash(bytes)!==file.sha256 || bytes.length!==file.bytes) failures.push(`Changed/stale packed Markdown: ${file.destination}`);
  }
  for (const name of archive.keys()) if (name.startsWith('package/docs/') && name.endsWith('.md') && !expected.has(name)) failures.push(`Unexpected packed Markdown: ${name}`);
  let manifest;try { manifest=JSON.parse(archive.get('package/package.json')); } catch { failures.push('Missing/invalid packed package manifest'); }
  if (manifest?.name!==ledger.package.name || manifest?.version!==ledger.package.version || manifest?.private!==ledger.package.private) failures.push('Packed Markdown package identity/version/private state mismatch');
  return failures;
}
export async function auditPacked({repository=root,tarball,site='docs/generated/site'}={}) {
  const bytes=await read(repository,tarball), ledger=await markdownLedger(repository,site);
  const failures=checkPackedMarkdown(readArchive(bytes),ledger);
  return {schemaVersion:1,sourceSha,tarballSha256:hash(bytes),markdownInventorySha256:ledger.inventorySha256,markdown:ledger.files.length,complete:failures.length===0,failures};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { const args=process.argv.slice(2);if (args.length!==2 || args[0]!=='--tarball') throw new Error('Usage: audit-packed.mjs --tarball repository-relative.tgz');const result=await auditPacked({tarball:args[1]});console.log(JSON.stringify(result,null,2));if (!result.complete) process.exitCode=1; }
  catch(error) { console.error(error.message);process.exitCode=1; }
}
