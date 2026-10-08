import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readArchive } from './archive.mjs';
import { hash, read, json, walk, unique } from '../../../docs/scripts/qualification/io.mjs';

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
  if (ledger.schemaVersion !== 1 || ledger.baseUiSha !== '19511bb171f3b360b006c94cf6d07e53cb446505' || ledger.donorSha !== '0492e49b746deed543dbc167a9a58ed1210c2393') throw new Error('Unsupported notice ledger schema/pins');
  unique(ledger.texts,'destination','notice texts');
  const result = new Map();
  for (const text of ledger.texts) {
    const bytes = await read(repository,text.file);
    if (!/^[a-f0-9]{64}$/.test(text.sha256) || hash(bytes) !== text.sha256) throw new Error(`License/NOTICE hash mismatch: ${text.file}`);
    result.set(text.destination,bytes);
  }
  result.set('NOTICE',await read(repository,'NOTICE'));
  result.set('THIRD-PARTY-NOTICES.md',await read(repository,'docs/third-party-notices.md'));
  result.set('notices/provenance.json',await read(repository,ledgerPath));
  return { ledger, files:result };
}
export async function reconcile(repository=root) {
  const failures=[];
  const { ledger, files } = await requiredFiles(repository);
  for (const [checkout,sha] of [['base-ui',ledger.baseUiSha],['solid-floating-ui',ledger.donorSha]]) {
    const git = (...args) => execFileSync('rtk',['proxy','git','-C',path.join(repository,'upstream',checkout),...args],{encoding:'utf8'}).trim();
    if (git('rev-parse','HEAD') !== sha || git('status','--porcelain')) failures.push(`Dirty/unpinned canonical source: ${checkout}`);
  }
  const map = await json(repository,'tracking/donors/solid-floating-ui/source-map.json');
  if (hash(await read(repository,'tracking/donors/solid-floating-ui/source-map.json')) !== ledger.sourceMapSha256) failures.push('Donor source map changed; reconcile provenance');
  const reviews = unique(ledger.groupReviews,'id','donor group reviews');
  for (const group of map.groups) {
    const review = reviews.get(group.id);
    if (!review || !['adopted','inspected-no-adoption'].includes(review.status) || !review.evidence?.length) failures.push(`Unresolved donor source mapping: ${group.id} (owner ${group.owner})`);
    else for (const evidence of review.evidence) {
      const bytes = await read(repository,evidence.file);
      if (hash(bytes) !== evidence.sha256) failures.push(`Stale donor review evidence: ${evidence.file}`);
    }
  }
  for (const id of reviews.keys()) if (!map.groups.some(group => group.id === id)) failures.push(`Unknown donor group review: ${id}`);
  for (const gap of ledger.unresolved) failures.push(`Unresolved provenance: ${gap.id}: ${gap.reason}`);
  const targets=unique(ledger.adoptions,'target','adopted targets');
  for (const adoption of ledger.adoptions) {
    const bytes=await read(repository,adoption.target);
    if (hash(bytes)!==adoption.targetSha256) failures.push(`Stale adopted-line mapping: ${adoption.target}`);
    if (!adoption.portions?.length || !adoption.changes) failures.push(`Missing scoped adopted portions/change notice: ${adoption.target}`);
    for (const portion of adoption.portions ?? []) {
      const original=await read(repository,portion.source);
      if (hash(original)!==portion.sha256) failures.push(`Stale inherited source: ${portion.source}`);
      const lines=original.toString('utf8').split('\n').length;
      if (!Number.isInteger(portion.startLine)||!Number.isInteger(portion.endLine)||portion.startLine<1||portion.endLine<portion.startLine||portion.endLine>lines) failures.push(`Invalid source line scope: ${portion.source}`);
    }
    if (adoption.requiresProminentChangeNotice && !/modified|adapt(?:ed|ation)|solid/i.test(bytes.toString('utf8').split('\n').slice(0,8).join('\n'))) failures.push(`Missing prominent file-local change notice: ${adoption.target}; request source owner`);
  }
  // Detect inherited attribution on any production leaf not yet covered by the
  // ledger; never silently treat root MIT as a waiver of source-local notices.
  for (const file of await walk(repository,'packages/solid/src')) {
    if (!/\.[jt]sx?$/.test(file) || /(?:test|spec|proof|fixtures|diagnostics)/i.test(file)) continue;
    let text=(await read(repository,file)).toString('utf8');
    const knownHeader=`// Adapted from Base UI ${ledger.baseUiSha}.\n// Copyright (c) 2019 Material-UI SAS. MIT license: ../temporal/LICENSE.\n`;
    if (text.startsWith(knownHeader)) {
      const licensePath=path.posix.normalize(path.posix.join(path.posix.dirname(file),'../temporal/LICENSE'));
      if ((await read(repository,licensePath)).equals(files.get('LICENSE'))) text=text.slice(knownHeader.length);
      else failures.push(`Source-local Base UI MIT differs from packed LICENSE: ${licensePath}`);
    }
    if (/solid-floating-ui|adobe\/react-spectrum|Adobe React Aria|theKashey\/aria-hidden|Copyright|SPDX-License|License:|fork of Floating UI/i.test(text) && !targets.has(file)) failures.push(`Unreconciled inherited attribution: ${file}`);
  }
  return { schemaVersion:1, complete:failures.length===0, failures, required:[...files.keys()] };
}
export async function auditTarball({ repository=root, tarball, bytes }={}) {
  const compressed=bytes ?? await read(repository,tarball);
  const archive=readArchive(compressed);
  const {ledger,files}=await requiredFiles(repository);
  const reconciliation=await reconcile(repository);
  const failures=[...reconciliation.failures];
  failures.push(...checkNotices(archive,files));
  const manifestBytes=archive.get('package/package.json');
  let manifest;
  try { manifest=JSON.parse(manifestBytes?.toString('utf8')); } catch { failures.push('Missing/invalid packed package.json'); }
  const identity=await json(repository,'packages/solid/package.json');
  if (manifest?.name!==identity.name || manifest?.version!==identity.version) failures.push('Packed identity/version mismatch');
  function targets(value) { return typeof value==='string' ? [value] : value && typeof value==='object' ? Object.values(value).flatMap(targets) : []; }
  if (!manifest?.exports || !Object.keys(manifest.exports).length) failures.push('Packed package has no exports');
  for (const target of targets(manifest?.exports)) {
    if (!target.startsWith('./') || target.includes('..') || !archive.has(`package/${target.slice(2)}`)) failures.push(`Missing/unsafe packed export: ${target}`);
  }
  for (const adoption of ledger.adoptions) {
    const stem=adoption.target.replace(/^packages\/solid\/src\//,'').replace(/\.[jt]sx?$/,'.js');
    for (const mode of ['dom','server']) {
      const name=`package/${mode}/${stem}`;
      if (!archive.has(name)) failures.push(`Missing adopted packed module: ${name}`);
      const mapBytes=archive.get(`${name}.map`);
      try {
        const map=JSON.parse(mapBytes?.toString('utf8'));
        if (!map.sourcesContent?.some(source => typeof source==='string' && hash(source)===adoption.targetSha256)) failures.push(`Packed adopted source/change markers not retained: ${name}.map`);
      } catch { failures.push(`Missing/invalid adopted source map: ${name}.map`); }
    }
  }
  return { schemaVersion:1, tarballSha256:hash(compressed), ledgerSha256:hash(await read(repository,ledgerPath)), complete:failures.length===0, archiveFiles:archive.size, requiredNotices:[...files.keys()], failures:[...new Set(failures)] };
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2); let result;
    if (args.length===1 && args[0]==='--reconcile') result=await reconcile();
    else if (args.length===2 && args[0]==='--tarball') result=await auditTarball({tarball:args[1]});
    else throw new Error('Usage: audit.mjs --reconcile | --tarball repository-relative.tgz (actual archive required)');
    console.log(JSON.stringify(result,null,2)); if (!result.complete) process.exitCode=1;
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
