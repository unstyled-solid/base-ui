import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { markdownInventory, formattedPage } from '../../scripts/qualification/audit.mjs';
import { stageMarkdown } from '../../scripts/qualification/stage-markdown.mjs';
import { checkPackedMarkdown } from '../../scripts/qualification/audit-packed.mjs';
import { markdownPage } from '../../scripts/site/markdown.mjs';
import { markdown } from '../../scripts/api/engine.mjs';
import { hash, sourceSha } from '../../scripts/qualification/io.mjs';

async function fixture(t) {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'docs-markdown-')));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const put=async(file,value)=>{const target=path.join(root,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,typeof value==='string'?value:JSON.stringify(value));};
  const page={schemaVersion:1,route:'/solid/components/button',source:'docs/src/app/(docs)/react/components/button/page.mdx',provenance:{sourceSha},semanticOverlay:{version:1},nodes:[],ast:{type:'root',children:[{type:'heading',depth:1,children:[{type:'text',value:'Button'}]},{type:'code',lang:'ts',value:'const x={foo:"bar"}'}]}};
  const module={entrypoint:'./button',markdown:'button-api.md',exports:[{name:'Button',anchor:'api-button',kind:'value',source:null,description:'',signatures:[],type:'string',props:[],properties:[],dataAttributes:[],cssVariables:[],relatedTypes:[]}]};
  const api={schemaVersion:1,sourceSha,modules:[module]};
  await put('page.json',page);
  const manifest={schemaVersion:1,sourceSha,pages:[{route:page.route,source:page.source,destination:'page.json',sha256:hash(await fs.readFile(path.join(root,'page.json')))}]};
  await put('docs/upstream-manifest.json',manifest);await put('docs/generated/api/catalog.json',api);await put('docs/generated/api/button-api.md',markdown(module));
  await put('docs/generated/demos/catalog.json',{schemaVersion:1,sourceSha,entries:[],references:{}});
  await put('packages/solid/package.json',{name:'baseui-solid2',version:'0.0.0',private:true});
  await put('distribution/package-contract.json',{identity:{publicationName:'@unstyled-solid/base-ui',version:'0.0.1'}});
  await put('docs/generated/site/solid/components/button.md',markdownPage(await formattedPage(structuredClone(page)),{api,demos:[],demoReferences:{}}));
  return {root,put,manifest};
}
test('stages every page and API Markdown with a versioned immutable inventory',async t=>{
  const f=await fixture(t), ledger=await stageMarkdown({repository:f.root});
  assert.equal(ledger.files.length,2);assert.equal(ledger.stagingVersion,'bsolid-markdown-stage/1');
  assert.deepEqual(await stageMarkdown({repository:f.root,check:true}),ledger);
  assert.equal(await fs.readFile(path.join(f.root,'docs/public/api/button-api.md'),'utf8'),await fs.readFile(path.join(f.root,'docs/generated/api/button-api.md'),'utf8'));
});
test('refuses missing/stale page and API output instead of staging one preview',async t=>{
  const f=await fixture(t);
  await f.put('docs/generated/site/solid/components/button.md','# Hero only\n');
  await assert.rejects(markdownInventory(f.root),/Stale\/empty page Markdown/);
  await assert.rejects(stageMarkdown({repository:f.root}),/Stale\/empty page Markdown/);
  await assert.rejects(fs.access(path.join(f.root,'docs/public')),/ENOENT/);
});
test('identity/version drift and unexpected staging files fail closed without cleanup',async t=>{
  const f=await fixture(t);await stageMarkdown({repository:f.root});
  await f.put('distribution/package-contract.json',{identity:{publicationName:'@unstyled-solid/base-ui',version:'0.1.0'}});
  await assert.rejects(stageMarkdown({repository:f.root,check:true}),/staged Markdown: docs\/public\/markdown-manifest.json/);
  await f.put('docs/public/user-work.md','Retain me\n');
  await assert.rejects(stageMarkdown({repository:f.root}),/Unowned\/stale staging files/);
  assert.equal(await fs.readFile(path.join(f.root,'docs/public/user-work.md'),'utf8'),'Retain me\n');
});
test('refuses arbitrary destinations and mismatched imported-page provenance',async t=>{
  const f=await fixture(t);
  await assert.rejects(stageMarkdown({repository:f.root,destination:'upstream/base-ui/docs/public'}),/destination must be docs\/public/);
  f.manifest.pages[0].sha256='old';await f.put('docs/upstream-manifest.json',f.manifest);
  await assert.rejects(markdownInventory(f.root),/Imported page hash mismatch/);
});
test('actual archive-member audit rejects missing API/page Markdown, manifest and checksum/version drift',async t=>{
  const f=await fixture(t),ledger=await stageMarkdown({repository:f.root});
  const archive=new Map(await Promise.all(ledger.files.map(async file=>[`package/docs/${file.destination}`,await fs.readFile(path.join(f.root,'docs/public',file.destination))])));
  archive.set('package/docs/markdown-manifest.json',Buffer.from(JSON.stringify(ledger)));
  archive.set('package/package.json',Buffer.from(JSON.stringify(ledger.package)));
  assert.deepEqual(checkPackedMarkdown(archive,ledger),[]);
  archive.delete('package/docs/api/button-api.md');archive.set('package/docs/solid/components/button.md',Buffer.from('# Preview only'));
  archive.delete('package/docs/markdown-manifest.json');archive.set('package/package.json',Buffer.from(JSON.stringify({...ledger.package,version:'old'})));
  const failures=checkPackedMarkdown(archive,ledger);
  for (const fragment of ['Missing packed Markdown: api/button-api.md','Changed/stale packed Markdown: solid/components/button.md','Missing packed versioned Markdown inventory','identity/version/private']) assert.ok(failures.some(message=>message.includes(fragment)));
});
test('staging rejects ancestor symlinks before creating or writing outside its destination',async t=>{
  const f=await fixture(t);
  const external=path.join(f.root,'external');await fs.mkdir(external);
  await fs.symlink(external,path.join(f.root,'docs/public'));
  await assert.rejects(stageMarkdown({repository:f.root}),/Symlink destination/);
  assert.deepEqual(await fs.readdir(external),[]);
});
