import { execFileSync } from 'node:child_process';

export const BASELINE = '19511bb171f3b360b006c94cf6d07e53cb446505';

export function git(repo, args, options = {}) {
  return execFileSync('rtk', ['proxy', 'git', '-C', repo, ...args], {
    maxBuffer: 128 * 1024 * 1024, ...options,
  });
}

// Read objects, not checkout bytes; neither checkout nor index is modified.
export function readTree(repo, sha = BASELINE) {
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Expected immutable full SHA');
  const actual = git(repo, ['rev-parse', `${sha}^{commit}`]).toString().trim();
  if (actual !== sha) throw new Error(`Not an exact commit: ${sha}`);
  const entries = git(repo, ['ls-tree', '-r', '-z', '--full-tree', sha]).toString()
    .split('\0').filter(Boolean).map((line) => {
      const [header, path] = line.split('\t');
      const [mode, type, blob] = header.split(' ');
      if (type !== 'blob') throw new Error(`Unaccounted Git object ${type}: ${path}`);
      return { path, blob, mode };
    });
  const readable = entries.filter((e) => /\.(?:[cm]?[jt]sx?|json)$/.test(e.path) && e.mode !== '120000');
  const objects = [...new Set(readable.map((e) => e.blob))];
  const batch = git(repo, ['cat-file', '--batch'], { input: `${objects.join('\n')}\n` });
  let offset = 0;
  const contents = new Map();
  for (const expected of objects) {
    const end = batch.indexOf(10, offset);
    const [blob, type, length] = batch.subarray(offset, end).toString().split(' ');
    if (blob !== expected || type !== 'blob') throw new Error(`Invalid batch object ${expected}`);
    const start = end + 1;
    contents.set(blob, batch.subarray(start, start + Number(length)).toString('utf8'));
    offset = start + Number(length) + 1;
  }
  return entries.map((e) => ({ ...e, content: contents.get(e.blob) }));
}
