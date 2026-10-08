import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './audit.mjs';
import { hash, read } from '../../../docs/scripts/qualification/io.mjs';

export const remoteTexts = [
  { file:'react-spectrum-Apache-2.0.txt', url:'https://raw.githubusercontent.com/adobe/react-spectrum/b35d5c02fe900badccd0cf1a8f23bb593419f238/LICENSE' },
  { file:'aria-hidden-MIT.txt', url:'https://raw.githubusercontent.com/theKashey/aria-hidden/9220c8f4a4fd35f63bee5510a9f41a37264382d4/LICENSE' },
  { file:'react-spectrum-React-NOTICE.txt', url:'https://raw.githubusercontent.com/adobe/react-spectrum/b35d5c02fe900badccd0cf1a8f23bb593419f238/NOTICE.txt', start:'-------------------------------------------------------------------------------\nThis codebase contains a portion of code from react', end:'-------------------------------------------------------------------------------\nThis codebase contains a modified portion of code from Modernizr' },
];
export async function verifyRemote() {
  const results=[];
  for (const entry of remoteTexts) {
    const response=await fetch(entry.url); if (!response.ok) throw new Error(`${entry.url}: HTTP ${response.status}`);
    const remote=Buffer.from(await response.arrayBuffer());
    let scoped=remote;
    if (entry.start) {
      const text=remote.toString('utf8'), start=text.indexOf(entry.start), end=text.indexOf(entry.end,start);
      if (start<0 || end<start) throw new Error('Pinned NOTICE section boundaries missing');
      // Scope ends at the license's line terminator, excluding the padding
      // blank line that separates this subsection from Modernizr.
      if (text.slice(end-2,end)!=='\n\n') throw new Error('Pinned NOTICE separator padding changed');
      scoped=Buffer.from(text.slice(start,end-1));
    }
    const local=await read(root,`scripts/distribution/notices/licenses/${entry.file}`);
    results.push({file:entry.file,url:entry.url,upstreamSha256:hash(remote),sha256:hash(local),byteIdentical:local.equals(scoped),expectedSha256:hash(scoped),expectedBytes:scoped.length,actualBytes:local.length,scope:entry.start?'React subsection only':'whole file'});
  }
  const local=await read(root,'scripts/distribution/notices/licenses/solid-floating-ui-MIT.txt');
  results.push({file:'solid-floating-ui-MIT.txt',sha256:hash(local),byteIdentical:local.equals(await read(root,'upstream/solid-floating-ui/LICENSE')),scope:'whole file'});
  return results;
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).join(' ')!=='--verify-remote') throw new Error('Usage: provenance.mjs --verify-remote (read-only pinned retrieval)');
    const results=await verifyRemote();
    console.log(JSON.stringify(results,null,2));
    const fingerprints=[];
    for (const file of ['LICENSE','tracking/donors/solid-floating-ui/source-map.json','packages/solid/src/floating-ui-react/hooks/createFloating.ts','packages/solid/src/floating-ui-react/middleware/arrow.ts','packages/solid/src/floating-ui-react/utils/event.ts','packages/solid/src/floating-ui-react/utils/markOthers.ts','upstream/base-ui/packages/react/src/floating-ui-react/utils/event.ts','upstream/base-ui/packages/react/src/floating-ui-react/utils/markOthers.ts','upstream/solid-floating-ui/packages/solid-floating-ui/src/hooks/usePosition.ts','upstream/solid-floating-ui/packages/solid-floating-ui/src/hooks/useFloating.ts','upstream/solid-floating-ui/packages/solid-floating-ui/src/utils/dpr.ts']) fingerprints.push({file,sha256:hash(await read(root,file))});
    console.log(JSON.stringify(fingerprints,null,2));
    if (results.some(result=>!result.byteIdentical)) process.exitCode=1;
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
