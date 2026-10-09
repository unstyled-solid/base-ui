import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { audit, binding, formattedPage } from '../../scripts/qualification/audit.mjs';
import { markdownPage } from '../../scripts/site/markdown.mjs';
import { hash, sourceSha } from '../../scripts/qualification/io.mjs';
import { extract, markdown } from '../../scripts/api/engine.mjs';
import { generateCatalog } from '../../scripts/demos/catalog.mjs';

async function fixture(t) {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'docs-audit-')));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const put=async(file,value)=>{const target=path.join(root,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,typeof value==='string'?value:JSON.stringify(value));};
  for (const directory of ['docs/site','docs/content','docs/scripts/site','docs/scripts/api','docs/scripts/demos','docs/scripts/qualification','docs/tests','docs/patches']) await fs.mkdir(path.join(root,directory),{recursive:true});
  for (const file of ['package.json','pnpm-lock.yaml','docs/package.json','docs/vite.config.ts','docs/tsconfig.json','docs/tsconfig.demos.json']) await put(file,'{}');
  const source='docs/src/app/(docs)/react/components/button/page.mdx';
  const page={schemaVersion:1,source,route:'/solid/components/button',publishable:true,provenance:{sourceSha,sourceSha256:hash('# Button\n')},semanticOverlay:{version:1,pending:[]},title:'Button',metadata:{},adaptations:[],nodes:[],headings:[{properties:{id:'button'},location:`${source}:1:1`}],ast:{type:'root',children:[{type:'heading',depth:1,children:[{type:'text',value:'Button'}]}]}};
  await put('upstream/base-ui/'+source,'# Button\n');await put('docs/upstream/generated/pages/button.json',page);
  await put('upstream/base-ui/LICENSE','fixture MIT\n');await put('docs/generated/site/dist/LICENSE.txt','fixture MIT\n');
  const manifest={schemaVersion:1,sourceSha,pages:[{route:page.route,source,destination:'docs/upstream/generated/pages/button.json',sha256:hash(await fs.readFile(path.join(root,'docs/upstream/generated/pages/button.json')))}]};
  await put('docs/upstream-manifest.json',manifest);
  await put('distribution/exports.json',{exports:{'./button':{target:'./src/button/index.ts'}}});
  await put('packages/solid/package.json',{name:'baseui-solid2',version:'0.0.0',private:true});
  await put('distribution/package-contract.json',{identity:{publicationName:'@unstyled-solid/base-ui',version:'0.0.1'}});
  await put('packages/solid/src/button/index.ts','export const answer = 42;');
  await put('packages/solid/build/types/button/index.d.ts','export declare const answer: 42;');
  const api=await extract({root,entries:[{entrypoint:'./button',file:path.join(root,'packages/solid/build/types/button/index.d.ts')}]});
  await put('docs/generated/api/catalog.json',api);await put('docs/generated/api/report.json',{schemaVersion:1,missingMetadata:[],missingDocumentation:[]});
  await put('docs/generated/api/'+api.modules[0].markdown,markdown(api.modules[0]));
  const upstream='docs/src/app/(docs)/react/components/button/demos/hero/index.ts';
  await put('upstream/base-ui/'+upstream,'export const DemoButtonHero = createDemo({});');
  await put('docs/upstream/base-ui/'+upstream,'export const DemoButtonHero = createDemo({});');
  await put('docs/demos/button/preview.tsx','export default function Preview() { return "real fixture"; }');
  await put('docs/demos/button/entry.ts',`export default [{id:'button/hero',upstream:${JSON.stringify(upstream)},variants:[{id:'css',label:'CSS',component:Preview,files:['docs/demos/button/preview.tsx']}]}];`);
  await put('docs/generated/demos/catalog.json',await generateCatalog(root));
  const report={schemaVersion:1,sourceSha,base:'/',routes:[{route:page.route,source,file:'solid/components/button/index.html',publishable:true}],issues:[],blockers:[]};
  await put('docs/generated/site/report.json',report);
  await put('docs/generated/site/solid/components/button.md', markdownPage(await formattedPage(structuredClone(page)), { api, demos: [], demoReferences: {} }));
  await put('docs/generated/site/dist/solid/components/button/index.html',`<!doctype html><html><head><title>Button</title><link rel="canonical" href="https://example.org/solid/components/button"></head><body><main><h1 id="button">Button</h1><a href="#button">Button</a><footer class="SiteFooter">@unstyled-solid/base-ui 0.0.1 · Solid 2.0.0-rc.13<a href="https://github.com/mui/base-ui/tree/${sourceSha}">Upstream</a></footer></main></body></html>`);
  return {root,put,manifest,report,api};
}
test('complete inventory/output fixture still fails without execution, never treating build success as coverage',async t=>{
  const f=await fixture(t),result=await audit({repository:f.root});
  assert.equal(result.complete,false);assert.deepEqual(result.counts,{pages:1,apiModules:1,demoVariants:1,markdown:2});
  assert.equal(result.failures.length,1,result.failures.join('\n'));assert.match(result.failures[0],/execution evidence: ENOENT/);
});
test('independent canonical inventory catches shrinking both manifest and routes',async t=>{
  const f=await fixture(t);
  await f.put('upstream/base-ui/docs/src/app/(docs)/react/components/dialog/page.mdx','# Dialog');
  const result=await audit({repository:f.root});
  assert.ok(result.failures.some(message=>message.includes('canonical pages: missing docs/src/app/(docs)/react/components/dialog/page.mdx')));
});
test('rejects omitted route, fabricated demo inventory, broken anchor and stale exported API graph',async t=>{
  const f=await fixture(t);
  f.report.routes[0].file='preview.html';await f.put('docs/generated/site/report.json',f.report);
  await f.put('docs/generated/site/dist/solid/components/button/index.html','<head><title>Button</title><link rel="canonical" href="https://example.org"></head><main><h1 id="button">Button</h1><a href="#gone">Broken</a></main>');
  f.api.modules[0].exports[0].name='fake';await f.put('docs/generated/api/catalog.json',f.api);
  await f.put('docs/generated/demos/catalog.json',{schemaVersion:1,sourceSha,entries:[],references:{},missing:[],exclusions:[]});
  const failures=(await audit({repository:f.root})).failures;
  for (const fragment of ['route output/source mismatch','Missing anchor #gone','API catalog differs from the complete','Demo catalog differs from live','Empty or malformed demo entries']) assert.ok(failures.some(message=>message.includes(fragment)),fragment+'\n'+failures.join('\n'));
});
test('artifact binding changes when a live library/demo or actual static artifact changes',async t=>{
  const f=await fixture(t),first=await binding(f.root);
  await f.put('packages/solid/src/button/index.ts','export const answer = 43;');
  const second=await binding(f.root);assert.notEqual(first.sha256,second.sha256);
  await f.put('docs/generated/site/dist/solid/components/button/index.html','changed artifact');
  assert.notEqual(second.sha256,(await binding(f.root)).sha256);
});
