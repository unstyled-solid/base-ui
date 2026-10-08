import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readArchive } from '../../../scripts/distribution/notices/archive.mjs';
import { requiredFiles, checkNotices, root, auditTarball } from '../../../scripts/distribution/notices/audit.mjs';
import { read, json, hash } from '../../../docs/scripts/qualification/io.mjs';

function tar(entries) {
  const blocks=[];
  for (const [name,content,type='0'] of entries) {
    const bytes=Buffer.from(content),header=Buffer.alloc(512);
    header.write(name,0,100);header.write('0000644\0',100);header.write('0000000\0',108);header.write('0000000\0',116);
    header.write(bytes.length.toString(8).padStart(11,'0')+'\0',124);header.write('00000000000\0',136);header.fill(32,148,156);
    header.write(type,156);header.write('ustar\0',257);header.write('00',263);
    const checksum=header.reduce((sum,byte)=>sum+byte,0);header.write(checksum.toString(8).padStart(6,'0')+'\0 ',148);
    blocks.push(header,bytes,Buffer.alloc((512-bytes.length%512)%512));
  }
  blocks.push(Buffer.alloc(1024));return gzipSync(Buffer.concat(blocks));
}
test('checks actual gzip/tar bytes, every full copied text and the scoped inherited NOTICE',async()=>{
  const {files}=await requiredFiles();
  const bytes=tar([...files].map(([file,content])=>[`package/${file}`,content]));
  assert.deepEqual(checkNotices(readArchive(bytes),files),[]);
  for (const [missing] of files) {
    const incomplete=tar([...files].filter(([file])=>file!==missing).map(([file,content])=>[`package/${file}`,content]));
    assert.ok(checkNotices(readArchive(incomplete),files).includes(`Missing packed notice: ${missing}`));
  }
  const truncated=new Map([...files].map(([file,content])=>[`package/${file}`,content.subarray(0,content.length-1)]));
  assert.equal(checkNotices(truncated,files).length,files.size);
});
test('refuses traversal, duplicate members, symlinks, checksum corruption and truncation',()=>{
  for (const name of ['../NOTICE','package/../NOTICE','/package/NOTICE','package//NOTICE','package\\NOTICE']) assert.throws(()=>readArchive(tar([[name,'x']])),/Unsafe/);
  assert.throws(()=>readArchive(tar([['package/NOTICE','first'],['package/NOTICE','second']])),/Duplicate/);
  assert.throws(()=>readArchive(tar([['package/NOTICE','', '2']])),/links are forbidden/);
  const raw=Buffer.alloc(1024);raw[0]=1;
  assert.throws(()=>readArchive(gzipSync(raw)),/numeric field|checksum/);
  assert.throws(()=>readArchive(gzipSync(Buffer.alloc(512))),/end\/trailing/);
  assert.throws(()=>readArchive(Buffer.from('not a gzip archive')));
});
test('supports local PAX long paths without extracting; rejects PAX link metadata',()=>{
  const pax=(key,value)=>{let length=key.length+value.length+4;for (;;) {const record=`${length} ${key}=${value}\n`;if (Buffer.byteLength(record)===length)return record;length=Buffer.byteLength(record);}};
  const name='package/notices/'+ 'long-'.repeat(25)+'.txt';
  const archive=readArchive(tar([['package/PaxHeader',pax('path',name),'x'],['package/short','license']]));
  assert.equal(archive.get(name).toString(),'license');
  assert.throws(()=>readArchive(tar([['package/PaxHeader',pax('linkpath','../NOTICE'),'x'],['package/short','license']])),/Unsupported PAX metadata/);
});
test('full packed-notice audit cannot green unresolved adoption mapping or a missing module',async()=>{
  const {files,ledger}=await requiredFiles();
  const identity=await json(root,'packages/solid/package.json');
  const entries=[...files].map(([name,bytes])=>[`package/${name}`,bytes]);
  entries.push(['package/package.json',JSON.stringify({name:identity.name,version:identity.version,exports:{'.':'./dom/missing.js'}})]);
  for (const adoption of ledger.adoptions) for (const mode of ['dom','server']) {
    const stem=adoption.target.replace(/^packages\/solid\/src\//,'').replace(/\.[jt]sx?$/,'.js');
    entries.push([`package/${mode}/${stem}`,'export {};'],[`package/${mode}/${stem}.map`,JSON.stringify({sourcesContent:[(await read(root,adoption.target)).toString('utf8')]})]);
  }
  const bytes=tar(entries),report=await auditTarball({bytes});
  assert.equal(report.tarballSha256,hash(bytes));assert.equal(report.complete,false);
  assert.ok(report.failures.some(message=>message.includes('Unresolved donor source mapping: root-tree')));
  assert.ok(report.failures.includes('Missing/unsafe packed export: ./dom/missing.js'));
  assert.ok(!report.failures.some(message=>message.includes('Missing packed notice:')));
  assert.ok(report.failures.some(message=>message.includes('Missing prominent file-local change notice:')));
});
