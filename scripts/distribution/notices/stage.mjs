import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requiredFiles, root } from './audit.mjs';
import { read, safe, walk, noSymlinks } from '../../../docs/scripts/qualification/io.mjs';

// Coordinator calls AFTER package build (which currently copies only NOTICE
// and LICENSE). Notice preparation is allowed with unresolved mappings; the
// independent archive/reconciliation gate stays red until owners resolve them.
export async function stageNotices({repository=root, destination='packages/solid/build', check=false}={}) {
  if (destination!=='packages/solid/build') throw new Error('Stage notices only into the existing package build directory');
  await read(repository,`${destination}/package.json`);
  const {files}=await requiredFiles(repository);
  for (const name of files.keys()) await noSymlinks(repository,`${destination}/${name}`);
  let existing=[]; try { existing=await walk(repository,`${destination}/notices`); } catch(error) { if (error.code!=='ENOENT') throw error; }
  for (const file of existing) if (!files.has(file.slice(destination.length+1))) throw new Error(`Unexpected staged notice: ${file}; coordinator must reconcile`);
  for (const [name,bytes] of files) {
    const file=`${destination}/${name}`; let current;
    try { current=await read(repository,file); } catch(error) { if (error.code!=='ENOENT') throw error; }
    if (current?.equals(bytes)) continue;
    if (check) throw new Error(`Missing/changed staged notice: ${name}`);
    await fs.mkdir(path.dirname(safe(repository,file)),{recursive:true});
    if (await fs.realpath(path.dirname(safe(repository,file)))!==path.dirname(safe(repository,file))) throw new Error('Symlink staging destination');
    await fs.writeFile(safe(repository,file),bytes);
  }
  return [...files.keys()];
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { const args=process.argv.slice(2); if (args.some(arg=>arg!=='--check')) throw new Error('Usage: stage.mjs [--check]'); console.log(JSON.stringify(await stageNotices({check:args.includes('--check')}))); }
  catch(error) { console.error(error.message); process.exitCode=1; }
}
