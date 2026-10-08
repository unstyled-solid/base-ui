import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkExecution, requiredChecks, deferredChecks } from '../../scripts/qualification/execution.mjs';
import { hash, sourceSha, read, safe, unique } from '../../scripts/qualification/io.mjs';

async function fixture(t) {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'docs-evidence-')));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const variants=['button/hero/css','button/loading/css','dialog/hero/tailwind','form/validation/css','menu/checkbox/css','tooltip/hero/css','select/multiple/css'];
  const routes=['/solid/components/button','/solid/handbook/forms'];
  const put=async(file,value)=>{await fs.writeFile(path.join(root,file),typeof value==='string'?value:JSON.stringify(value));};
  await put('run.log','Actual command output\n');
  const preview={passed:variants,failures:[]};
  const deferred={suites:deferredChecks.map(kind=>({kind,status:'passed',executed:kind==='ssr-guidance'?routes.length:variants.length,failures:[],cases:(kind==='ssr-guidance'?routes:variants).map(id=>({id,status:'passed'}))}))};
  const execution={schemaVersion:1,sourceSha,bindingSha256:'bound',checks:requiredChecks.map(kind=>({kind,argv:['node','real-runner.mjs'],startedAt:'2026-10-06T00:00:00Z',finishedAt:'2026-10-06T00:01:00Z',exitCode:0,log:'run.log',logSha256:hash('Actual command output\n')}))};
  async function save() {
    await put('preview.json',preview); await put('deferred.json',deferred);
    for (const [kind,file] of [['registered-previews','preview.json'],['real-family-deferred','deferred.json']]) Object.assign(execution.checks.find(check=>check.kind===kind),{result:file,resultSha256:hash(await fs.readFile(path.join(root,file)))});
    await put('execution.json',execution);
  }
  await save();
  return {root,variants,routes,preview,deferred,execution,save,put,check:()=>checkExecution(root,'execution.json','bound',variants,routes)};
}
test('requires every registered variant and every deferred case, with retained execution logs',async t=>{
  const f=await fixture(t); assert.deepEqual(await f.check(),[]);
});
test('six-preview and hero-only replay cannot satisfy full inventory',async t=>{
  const f=await fixture(t); f.preview.passed=f.variants.slice(0,6); await f.save();
  assert.ok((await f.check()).some(message=>message.includes('preview execution: missing select/multiple/css')));
  f.deferred.suites[0].cases=f.deferred.suites[0].cases.slice(0,1); f.deferred.suites[0].executed=1; await f.save();
  assert.ok((await f.check()).some(message=>message.includes('lazy-preview coverage: missing')));
});
test('passed sequences with failures/diagnostics remain red',async t=>{
  const f=await fixture(t); f.preview.failures.push({id:'button/hero',diagnostics:['unexpected warning']}); await f.save();
  assert.ok((await f.check()).includes('Registered preview replay has failures/diagnostics'));
});
test('rejects stale artifact bindings, changed logs and failed or missing checks',async t=>{
  const f=await fixture(t); f.execution.bindingSha256='old'; f.execution.checks[0].exitCode=1; f.execution.checks=f.execution.checks.filter(check=>check.kind!=='route-anchor-crawl'); await f.save();
  await f.put('run.log','Edited log');
  const failures=await f.check();
  for (const text of ['Missing/stale execution binding','Unexecuted/failed check: docs-check','execution checks: missing route-anchor-crawl','changed execution log']) assert.ok(failures.some(message=>message.includes(text)));
});
test('no unexecuted, missing, duplicate or generic excluded deferred suite can pass',async t=>{
  const f=await fixture(t); f.deferred.suites[0].executed=0; f.deferred.suites[1].cases[0].status='not-applicable'; f.deferred.suites.pop(); await f.save();
  const failures=await f.check();
  assert.ok(failures.includes('deferred suites: missing cleanup'));
  assert.ok(failures.some(message=>message.includes('Unexecuted/unreviewed variant-source-equality')));
  f.preview.passed.push(f.preview.passed[0]); await f.save();
  await assert.rejects(f.check(),/duplicate preview outcomes/);
});
test('result checksums bind outcomes and partial old-style reports are rejected',async t=>{
  const f=await fixture(t); await f.put('preview.json',{passed:f.variants,failures:[]});
  f.execution.checks.find(check=>check.kind==='registered-previews').resultSha256='false'; await f.put('execution.json',f.execution);
  await assert.rejects(f.check(),/Missing\/changed full registered preview result/);
  await f.put('execution.json',{passed:f.variants,failures:[]});
  await assert.rejects(f.check(),/Empty or malformed execution checks/);
});
test('safe I/O rejects path escapes, duplicate inventory rows and symlink ancestors',async t=>{
  const f=await fixture(t);
  for (const file of ['../NOTICE','/NOTICE','docs/../NOTICE','docs\\NOTICE','docs//NOTICE']) assert.throws(()=>safe(f.root,file),/Unsafe/);
  assert.throws(()=>unique([{id:'same'},{id:'same'}],'id','inventory'),/duplicate/);
  await fs.symlink(f.root,path.join(f.root,'alias'));
  await assert.rejects(read(f.root,'alias/run.log'),/Symlink input/);
});
