import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

function git(command, args, { cwd }) {
  const result = spawnSync('rtk', ['proxy', command, ...args], { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw result.error ?? new Error(result.stderr);
  return { stdout: result.stdout.trimEnd() };
}

// Coarse, explicit dependency: all versioned/unignored inputs and pinned submodules.
// Ignored build products, installs and evidence never become source inputs.
export async function sourceFingerprint(repository, execute = git) {
  const files = execute('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: repository }).stdout.split('\0').filter(Boolean).sort();
  const hash = createHash('sha256');
  for (const file of [...new Set(files)]) {
    const absolute = path.join(repository, file);
    const stat = await fs.lstat(absolute).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    hash.update(file + '\0');
    if (!stat) hash.update('deleted');
    else if (stat.isFile()) hash.update(await fs.readFile(absolute));
    else if (stat.isSymbolicLink()) hash.update(await fs.readlink(absolute));
    else {
      hash.update(execute('git', ['-C', absolute, 'rev-parse', 'HEAD'], { cwd: repository }).stdout);
      if (execute('git', ['-C', absolute, 'status', '--porcelain'], { cwd: repository }).stdout) throw new Error(`Pinned submodule has local changes: ${file}`);
    }
  }
  return hash.digest('hex');
}
