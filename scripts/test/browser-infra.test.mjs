import { it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../', import.meta.url));
it('automatic long-name failure screenshots remain real PNGs and the final failure audit survives', async () => {
  const result = await new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, ['scripts/test/run.mjs', 'chromium', 'screenshot.probe', '--no-watch', '--reporter=dot'], {
      cwd, env: { ...process.env, HARNESS_PROBE: 'screenshot', HARNESS_BROWSERS: 'chromium' },
    });
    let output = '';
    child.stdout.on('data', value => { output += value; });
    child.stderr.on('data', value => { output += value; });
    child.on('error', reject);
    child.on('close', status => resolveResult({ status, output }));
  });
  assert.equal(result.status, 1, result.output);
  assert.doesNotMatch(result.output, /ENAMETOOLONG|Failed to take a screenshot/);
  assert.match(result.output, /HARNESS_FAILURE.*HARNESS_LONG_SCREENSHOT_PROBE/);
  assert.match(result.output, /HARNESS_FINAL.*failed=1.*unhandled=0/);
  const path = result.output.match(/- (test\/harness\/\.cache\/screenshots\/[^\r\n]+\.png)/)?.[1];
  assert.ok(path, result.output);
  assert.ok(Buffer.byteLength(basename(path)) < 255, path);
  assert.equal(readFileSync(resolve(cwd, path)).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});
