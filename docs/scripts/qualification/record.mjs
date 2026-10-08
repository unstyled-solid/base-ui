import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, binding, requiredChecks } from './audit.mjs';
import { sourceSha, hash, read, json, safe, noSymlinks } from './io.mjs';

export async function record({ repository = root, kind, argv, result = null, site = 'docs/generated/site', artifact = `${site}/dist` }) {
  if (!requiredChecks.includes(kind) || !Array.isArray(argv) || !argv.length) throw new Error('Required check kind and command arguments are missing');
  if (process.env.DOCS_DEMO_IDS) throw new Error('Unset DOCS_DEMO_IDS; qualification requires every registered preview');
  const before = await binding(repository,{site,artifact});
  const directory = 'docs/tests/qualification/evidence';
  const file = `${directory}/execution.json`;
  let execution;
  try { execution = await json(repository,file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (execution && execution.bindingSha256 !== before.sha256) throw new Error('Previous execution belongs to another artifact; coordinator must archive/reset evidence');
  for (const target of [file,`${directory}/${kind}.log`]) await noSymlinks(repository,target);
  const startedAt = new Date().toISOString();
  const chunks = [];
  const exitCode = await new Promise((resolve,reject) => {
    const child = spawn('rtk',['proxy',...argv],{cwd:repository,env:process.env,stdio:['ignore','pipe','pipe']});
    child.on('error',reject);
    for (const stream of [child.stdout,child.stderr]) stream.on('data',chunk => { chunks.push(chunk); process.stdout.write(chunk); });
    child.on('close',(code,signal) => resolve(signal ? 1 : code ?? 1));
  });
  const after = await binding(repository,{site,artifact});
  if (before.sha256 !== after.sha256) throw new Error('Artifacts/implementation changed during replay; evidence rejected');
  const log = `${directory}/${kind}.log`;
  const bytes = Buffer.concat(chunks);
  const check = { kind, argv, startedAt, finishedAt:new Date().toISOString(), exitCode, log, logSha256:hash(bytes) };
  if (result) { check.result = result; check.resultSha256 = hash(await read(repository,result)); }
  await fs.mkdir(safe(repository,directory),{recursive:true});
  if (await fs.realpath(safe(repository,directory)) !== safe(repository,directory)) throw new Error('Symlink evidence directory');
  await fs.writeFile(safe(repository,log),bytes,{flag:'w'});
  execution ??= { schemaVersion:1, sourceSha, bindingSha256:after.sha256, checks:[] };
  execution.checks = [...execution.checks.filter(item => item.kind !== kind),check];
  await fs.writeFile(safe(repository,file),JSON.stringify(execution,null,2)+'\n');
  return check;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), kind = args.shift(); let result = null;
    if (args[0] === '--result') { args.shift(); result = args.shift(); }
    if (args.shift() !== '--') throw new Error('Usage: record.mjs <check-kind> [--result relative-json] -- <executable> <args...>');
    const check = await record({kind,result,argv:args}); process.exitCode = check.exitCode;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
