import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const read = (path) => readFileSync(resolve(root, path));
const captured = JSON.parse(read('docs/upstream-manifest.json'));
const check = process.argv.includes('--check');
if (process.argv.slice(2).some((arg) => arg !== '--check')) throw Error('Only --check is supported');
if (captured.sourceSha !== sha) throw Error('Captured source SHA mismatch');
if (execFileSync('git', ['-C', resolve(root, 'upstream/base-ui'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha) throw Error('Upstream SHA mismatch');
const output = (path, bytes) => {
  if (!path.startsWith('docs/content/assets/')) throw Error('Write boundary');
  if (check) {
    if (!existsSync(resolve(root, path)) || !read(path).equals(Buffer.from(bytes))) throw Error(`Stale output: ${path}`);
  } else if (!existsSync(resolve(root, path)) || !read(path).equals(Buffer.from(bytes))) {
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    writeFileSync(resolve(root, path), bytes);
  }
};
const sourceUrl = (path) => `https://github.com/mui/base-ui/blob/${sha}/${path}`;
const rawUrl = (path) => `https://raw.githubusercontent.com/mui/base-ui/${sha}/${path}`;
const licensePath = 'docs/content/assets/licenses/PaperMono-OFL.txt';
const mitPath = 'docs/content/assets/licenses/BaseUI-MIT.txt';
output(mitPath, read('docs/upstream/base-ui/LICENSE'));
const entries = [];
for (const name of ['die-grotesk-a-bold.woff2', 'die-grotesk-a-regular.woff2', 'die-grotesk-b-bold.woff2', 'die-grotesk-b-regular.woff2', 'paper-mono.woff2']) {
  const source = `docs/public/fonts/${name}`;
  const record = captured.entries.find((entry) => entry.source === source);
  if (!record) throw Error(`Missing captured font: ${source}`);
  const bytes = read(record.destination);
  if (hash(bytes) !== record.sha256 || !bytes.equals(read(`upstream/base-ui/${source}`))) throw Error(`Font mismatch: ${source}`);
  const paper = name === 'paper-mono.woff2';
  const destination = paper ? `docs/content/assets/public/fonts/${name}` : null;
  if (paper) output(destination, bytes);
  entries.push({
    kind: 'font', source, capturedPath: record.destination, sourceUrl: sourceUrl(source), rawUrl: rawUrl(source),
    sha256: hash(bytes), bytes: bytes.length, sourcePublicUrl: `/fonts/${name}`,
    publishable: paper, destination, publicUrl: paper ? `/fonts/${name}` : null,
    license: paper ? {
      spdx: 'OFL-1.1', copyright: 'Copyright 2025 The Paper Mono Project Authors https://github.com/paper-design/paper-mono',
      basis: 'Embedded name-table ID 13 explicitly licenses this exact captured binary under SIL OFL 1.1; ID 0 identifies its authors and project. Redistributed unmodified with copyright and complete OFL text.',
      sourceUrl: 'https://github.com/paper-design/paper-mono/blob/e17d7d737987a4595a50cff2cb5ca4b32dbd0b8f/OFL.txt',
      path: licensePath, publicUrl: '/licenses/PaperMono-OFL.txt', sha256: hash(read(licensePath)),
    } : {
      spdx: 'NOASSERTION', copyright: `Copyright ${name.includes('bold') ? '2026' : '2025'} Klim Type Foundry. All Rights Reserved.`,
      basis: 'Embedded name-table ID 13: The use of this file is subject to the respective Klim Type Foundry Font Licence Agreement(s)',
      sourceUrl: 'https://klim.co.nz/licences/', path: null, publicUrl: null,
    },
    blocker: paper ? null : 'No applicable Klim agreement or grant authorizing redistribution/publication by this Solid documentation site is present in the pinned repository. Obtain an applicable grant or approve and visually replay a source-parity typography adaptation. Repository MIT does not resolve the embedded third-party restriction.',
  });
}
for (const name of ['apple-touch-icon.png', 'favicon-dev.ico', 'favicon-dev.svg', 'favicon.ico', 'favicon.svg', 'logo.svg']) {
  const source = `docs/public/static/${name}`;
  const bytes = read(`upstream/base-ui/${source}`);
  const destination = `docs/content/assets/public/static/${name}`;
  output(destination, bytes);
  entries.push({ kind: 'image', source, capturedPath: captured.entries.find((entry) => entry.source === source)?.destination ?? null,
    sourceUrl: sourceUrl(source), rawUrl: rawUrl(source), sha256: hash(bytes), bytes: bytes.length,
    sourcePublicUrl: `/static/${name}`, publishable: true, destination, publicUrl: `/static/${name}`,
    license: { spdx: 'MIT', sourceUrl: sourceUrl('LICENSE'), path: mitPath, publicUrl: '/licenses/BaseUI-MIT.txt', sha256: hash(read(mitPath)),
      basis: 'Pinned repository MIT license covers these documentation images; no separate asset license was found. This is copyright provenance, not permission to imply MUI endorsement.' }, blocker: null });
}
const cssSource = 'docs/src/css/fonts/index.css';
const cssRecord = captured.entries.find((entry) => entry.source === cssSource);
const sourceCss = read(cssRecord.destination);
if (hash(sourceCss) !== cssRecord.sha256 || !sourceCss.equals(read(`upstream/base-ui/${cssSource}`))) throw Error('CSS mismatch');
const css = sourceCss.toString().slice(sourceCss.toString().indexOf("@font-face {\n  font-family: 'Paper Mono';"));
output('docs/content/assets/public/fonts/paper-mono.css', css);
output('docs/content/assets/public/licenses/PaperMono-OFL.txt', read(licensePath));
output('docs/content/assets/public/licenses/BaseUI-MIT.txt', read(mitPath));
const manifest = {
  schemaVersion: 1, owner: 'bsolid-docs-content-font-provenance', sourceSha: sha, repository: 'https://github.com/mui/base-ui',
  publication: { readyForTypographyParity: false, blockerTicket: 'bsolid-docs-content-font-provenance',
    publicRoot: 'docs/content/assets/public', instruction: 'Copy only publicRoot into site public output, preserving relative paths, and serve licenses. Never serve docs/upstream or blocked sourcePublicUrl entries. publicUrl is null for blocked entries. Source links are evidence, not a hosting workaround.' },
  entries,
  stylesheets: [{ source: cssSource, capturedPath: cssRecord.destination, sourceUrl: sourceUrl(cssSource), sha256: hash(sourceCss),
    publishable: false, publicUrl: null, reason: 'Original stylesheet references four unresolved Klim fonts.' },
  { source: cssSource, destination: 'docs/content/assets/public/fonts/paper-mono.css', publicUrl: '/fonts/paper-mono.css',
    sha256: hash(Buffer.from(css)), publishable: true, license: 'MIT', adaptation: 'Only the two original Paper Mono rules; original weights 415/650 and size-adjust preserved. No sans-serif substitution or complete typography-parity approval.' }],
};
output('docs/content/assets/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${check ? 'Verified' : 'Prepared'} 7 publishable assets, 4 blocked fonts; source/captured hashes and publication paths checked.`);
