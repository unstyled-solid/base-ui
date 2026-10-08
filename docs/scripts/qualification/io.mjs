import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export function safe(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || path.isAbsolute(relative) || relative.split('/').some(p => !p || p === '.' || p === '..')) throw new Error(`Unsafe relative path: ${relative}`);
  return path.join(root, relative);
}
export async function read(root, relative) {
  const file = safe(root, relative);
  if (await fs.realpath(file) !== file) throw new Error(`Symlink input: ${relative}`);
  if (!(await fs.stat(file)).isFile()) throw new Error(`Not a file: ${relative}`);
  return fs.readFile(file);
}
export async function json(root, relative) { return JSON.parse((await read(root, relative)).toString('utf8')); }
export async function noSymlinks(root, relative) {
  safe(root,relative);
  if (await fs.realpath(root)!==root) throw new Error('Root must be a canonical absolute directory');
  let cursor=root;
  for (const segment of relative.split('/')) {
    cursor=path.join(cursor,segment);
    try { if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error(`Symlink destination: ${relative}`); }
    catch(error) { if (error.code!=='ENOENT') throw error; }
  }
}
export async function walk(root, relative) {
  const results = [];
  for (const entry of (await fs.readdir(safe(root, relative), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const file = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlink input: ${file}`);
    if (entry.isDirectory()) results.push(...await walk(root, file));
    else if (entry.isFile()) results.push(file);
    else throw new Error(`Unsupported input: ${file}`);
  }
  return results;
}
export function unique(rows, key, name) {
  if (!Array.isArray(rows) || !rows.length) throw new Error(`Empty or malformed ${name}`);
  const map = new Map();
  for (const row of rows) {
    const value = row[key];
    if (typeof value !== 'string' || !value || map.has(value)) throw new Error(`Missing/duplicate ${name} ${key}: ${value}`);
    map.set(value, row);
  }
  return map;
}
export function sameKeys(expected, actual, name, failures) {
  for (const key of expected.keys()) if (!actual.has(key)) failures.push(`${name}: missing ${key}`);
  for (const key of actual.keys()) if (!expected.has(key)) failures.push(`${name}: unexpected ${key}`);
}
