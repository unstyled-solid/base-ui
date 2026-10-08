import { gunzipSync } from 'node:zlib';

function field(header,start,length) { return header.subarray(start,start+length).toString('utf8').split('\0')[0]; }
function octal(value) {
  const text = value.replace(/\0/g,'').trim();
  if (!/^[0-7]+$/.test(text)) throw new Error('Unsupported/invalid tar numeric field');
  const number = parseInt(text,8);
  if (!Number.isSafeInteger(number)) throw new Error('Oversized tar member');
  return number;
}
function memberPath(value,type) {
  const name = value.replace(/\/$/,'');
  if (name==='package' && type==='5') return name;
  if (!name.startsWith('package/') || name.includes('\\') || name.split('/').some(part => !part || part === '.' || part === '..') || /[\x00-\x1f]/.test(name)) throw new Error(`Unsafe/non-package tar member: ${value}`);
  return name;
}
function pax(bytes) {
  const result = {};
  for (let cursor=0; cursor<bytes.length;) {
    const space = bytes.indexOf(32,cursor);
    if (space < 0) throw new Error('Invalid PAX length');
    const number = bytes.subarray(cursor,space).toString();
    if (!/^[1-9]\d*$/.test(number)) throw new Error('Invalid PAX length');
    const end = cursor + Number(number);
    if (end > bytes.length || end <= space+1 || bytes[end-1] !== 10) throw new Error('Truncated PAX record');
    const record = bytes.subarray(space+1,end-1).toString('utf8');
    const equals = record.indexOf('=');
    if (equals < 1) throw new Error('Invalid PAX key');
    const key = record.slice(0,equals);
    if (Object.hasOwn(result,key)) throw new Error('Duplicate PAX key');
    if (!['path','size','mtime','atime','ctime','uid','gid','uname','gname'].includes(key)) throw new Error(`Unsupported PAX metadata: ${key}`);
    result[key] = record.slice(equals+1); cursor = end;
  }
  return result;
}
/** Read actual gzip tar bytes without extraction or trusting a pack file list. */
export function readArchive(compressed) {
  const bytes = gunzipSync(compressed,{maxOutputLength:256*1024*1024});
  const files = new Map(), seen = new Set();
  let offset=0, extended=null, terminated=false;
  while (offset+512 <= bytes.length) {
    const header = bytes.subarray(offset,offset+512); offset += 512;
    if (header.every(byte => byte === 0)) {
      if (bytes.length-offset < 512 || !bytes.subarray(offset).every(byte => byte === 0)) throw new Error('Invalid tar end/trailing content');
      terminated=true; break;
    }
    const checksum = octal(header.subarray(148,156).toString('ascii'));
    const actual = header.reduce((sum,byte,index) => sum + (index >=148 && index<156 ? 32 : byte),0);
    if (checksum !== actual) throw new Error('Tar checksum mismatch');
    const type = field(header,156,1) || '0';
    const headerSize = octal(header.subarray(124,136).toString('ascii'));
    let size = headerSize;
    if (extended?.size !== undefined) {
      if (!/^\d+$/.test(extended.size)) throw new Error('Invalid PAX size');
      size=Number(extended.size);
    }
    if (!Number.isSafeInteger(size) || size < 0 || offset+Math.ceil(size/512)*512 > bytes.length) throw new Error('Truncated tar member');
    const content = bytes.subarray(offset,offset+size); offset += Math.ceil(size/512)*512;
    if (type === 'x') { if (extended) throw new Error('Stacked PAX headers'); extended=pax(content); continue; }
    if (!['0','5'].includes(type)) throw new Error(`Unsupported tar member type ${type}; links are forbidden`);
    const prefix = field(header,345,155);
    const name = memberPath(extended?.path ?? `${prefix ? prefix+'/' : ''}${field(header,0,100)}`,type);
    extended=null;
    if (seen.has(name)) throw new Error(`Duplicate tar member: ${name}`);
    seen.add(name);
    if (type === '0') files.set(name,Buffer.from(content));
    else if (size !== 0) throw new Error('Directory member contains data');
  }
  if (!terminated || extended) throw new Error('Truncated tar archive');
  return files;
}
