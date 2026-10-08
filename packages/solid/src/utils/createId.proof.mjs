import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const output = mkdtempSync(join(tmpdir(), 'baseui-lifecycle-'));
try {
  await build({
    root, configFile: false, logLevel: 'silent', plugins: [solid({ ssr: true })],
    ssr: { noExternal: true },
    build: { ssr: 'packages/solid/src/utils/createId.emit.tsx', outDir: output, emptyOutDir: false, minify: false,
      rollupOptions: { output: { entryFileNames: 'server.mjs' } } },
  });
  const result = spawnSync(process.execPath, [join(output, 'server.mjs')], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0 || result.stderr) throw new Error(result.stderr || result.stdout);
  process.stdout.write(result.stdout);
} finally { rmSync(output, { recursive: true, force: true }); }
