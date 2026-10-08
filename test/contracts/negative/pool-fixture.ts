import { existsSync, watch, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { onTestFinished } from 'vitest';

export function rendezvous(name: 'a' | 'b') {
  const directory = process.env.HARNESS_POOL_PROBE;
  if (!directory) throw new Error('HARNESS_POOL_PROBE is required');
  const peer = join(directory, name === 'a' ? 'b' : 'a');
  return new Promise<void>((resolve, reject) => {
    let finished = false;
    const check = () => {
      if (!existsSync(peer)) return;
      finished = true;
      watcher.close();
      resolve();
    };
    const watcher = watch(directory, check);
    onTestFinished(() => {
      watcher.close();
      if (!finished) reject(new Error('HARNESS_POOL_PROBE: peer never started concurrently'));
    });
    writeFileSync(join(directory, name), JSON.stringify({ pid: process.pid, timezone: process.env.TZ }));
    check();
  });
}
