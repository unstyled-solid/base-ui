import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readArchive } from './archive.mjs';
import { hash, read, json, unique } from '../../../docs/scripts/qualification/io.mjs';

export const root = fileURLToPath(new URL('../../../',import.meta.url)).replace(/\/$/,'');
export const ledgerPath = 'tracking/distribution/donor-notices.json';
export function checkNotices(archive,files) {
  const failures=[];
  for (const [name,expected] of files) {
    const actual=archive.get(`package/${name}`);
    if (!actual) failures.push(`Missing packed notice: ${name}`);
    else if (!actual.equals(expected)) failures.push(`Changed/truncated packed notice: ${name}`);
  }
  return failures;
}
export async function requiredFiles(repository=root) {
  const ledger = await json(repository,ledgerPath);
  unique(ledger.texts,'destination','notice texts');
  const files = new Map();
  for (const text of ledger.texts) files.set(text.destination,await read(repository,text.file));
  files.set('NOTICE',await read(repository,'NOTICE'));
  files.set('THIRD-PARTY-NOTICES.md',await read(repository,'docs/third-party-notices.md'));
  files.set('notices/provenance.json',await read(repository,ledgerPath));
  return { ledger, files };
}
export async function auditTarball({ repository=root, tarball, bytes }={}) {
  const compressed=bytes ?? await read(repository,tarball);
  const archive=readArchive(compressed);
  const {files}=await requiredFiles(repository);
  const failures=checkNotices(archive,files);
  let manifest;
  try { manifest=JSON.parse(archive.get('package/package.json')?.toString('utf8')); } catch { failures.push('Missing/invalid packed package.json'); }
  const { identity }=await json(repository,'distribution/package-contract.json');
  if (manifest?.name!==identity.publicationName || manifest?.version!==identity.version || manifest?.private!==false) failures.push('Packed identity/version mismatch');
  function targets(value) { return typeof value==='string' ? [value] : value && typeof value==='object' ? Object.values(value).flatMap(targets) : []; }
  if (!manifest?.exports || !Object.keys(manifest.exports).length) failures.push('Packed package has no exports');
  for (const target of targets(manifest?.exports)) {
    if (!target.startsWith('./') || target.includes('..') || !archive.has(`package/${target.slice(2)}`)) failures.push(`Missing/unsafe packed export: ${target}`);
  }
  return { schemaVersion:1, tarballSha256:hash(compressed), ledgerSha256:hash(await read(repository,ledgerPath)), complete:failures.length===0, archiveFiles:archive.size, requiredNotices:[...files.keys()], failures:[...new Set(failures)] };
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if (args.length!==2 || args[0]!=='--tarball') throw new Error('Usage: audit.mjs --tarball repository-relative.tgz');
    const result=await auditTarball({tarball:args[1]});
    console.log(JSON.stringify(result,null,2)); if (!result.complete) process.exitCode=1;
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
