import { spawnSync } from 'node:child_process';

export class UpstreamError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Do not use `rtk git`: its human-oriented filtering changes NUL-delimited output.
export function git(cwd, args, { allowFailure = false } = {}) {
  const result = spawnSync('rtk', ['proxy', 'git', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' },
  });
  if (result.error || result.signal || (result.status !== 0 && !allowFailure)) {
    throw new UpstreamError('GIT_FAILED',
      `Git ${args[0]} failed in ${cwd}: ${result.error?.message ?? result.stderr.trim()}. ` +
      'Check the remote/network and recorded source configuration; no reset or stash was attempted.');
  }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

export function gitText(cwd, args) {
  return git(cwd, args).stdout.trim();
}
