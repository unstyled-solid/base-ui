import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';

export function isolatedEnvironment(directory) {
  const env = {};
  for (const name of ['PATH', 'SYSTEMROOT', 'SystemRoot', 'LANG', 'LC_ALL', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY']) if (process.env[name]) env[name] = process.env[name];
  return { ...env, HOME: path.join(directory, 'home'), TMPDIR: directory, NODE_ENV: 'production',
    npm_config_userconfig: path.join(directory, 'empty.npmrc'), npm_config_globalconfig: path.join(directory, 'empty-global.npmrc'),
    npm_config_cache: path.join(directory, 'npm-cache'), npm_config_workspaces: 'false', npm_config_legacy_peer_deps: 'true',
    PLAYWRIGHT_BROWSERS_PATH: path.join(directory, 'browsers') };
}
export async function command(directory, output, label, executable, args, { timeout = 300_000, env = isolatedEnvironment(directory), allowFailure = false } = {}) {
  await fs.mkdir(output, { recursive: true });
  const prefix = path.join(output, label);
  const stdout = createWriteStream(`${prefix}.stdout.log`), stderr = createWriteStream(`${prefix}.stderr.log`);
  const started = new Date().toISOString();
  // Every executable, including child npm/node processes, goes through RTK proxy.
  const child = spawn('rtk', ['proxy', executable, ...args], { cwd: directory, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(stdout); child.stderr.pipe(stderr);
  let timedOut = false, spawnError;
  const killGroup = signal => { if (child.pid) { try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; } } };
  let killTimer;
  const timer = setTimeout(() => { timedOut = true; killGroup('SIGTERM'); killTimer = setTimeout(() => killGroup('SIGKILL'), 5000); killTimer.unref(); }, timeout);
  timer.unref();
  const result = await new Promise(resolve => {
    child.on('error', error => { spawnError = error.stack; });
    child.on('close', (code, signal) => resolve({ code, signal }));
  });
  clearTimeout(timer);
  clearTimeout(killTimer);
  await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
  const record = { command: ['rtk', 'proxy', executable, ...args], cwd: directory, started, ended: new Date().toISOString(), ...result, timedOut, spawnError,
    stdout: `${prefix}.stdout.log`, stderr: `${prefix}.stderr.log` };
  await fs.writeFile(`${prefix}.command.json`, JSON.stringify(record, null, 2));
  if (!allowFailure && (result.code !== 0 || timedOut || spawnError)) throw new Error(`Command failed: ${label}; exact stdout/stderr retained at ${prefix}.*.log`);
  return record;
}
