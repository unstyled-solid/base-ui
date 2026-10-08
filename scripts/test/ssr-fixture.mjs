import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = fileURLToPath(new URL('../../test/ssr-harness/.generated/', import.meta.url));
mkdirSync(output, { recursive: true });
// Keep each compiler and its fresh server process in an exclusive directory.
// Never empty the shared artifact directory while another runner is using it.
const buildOutput = mkdtempSync(join(output, 'run-'));
try {
await build({
  root, configFile: false, logLevel: 'error', plugins: [solid({ compiler: 'babel', ssr: true })],
  build: { ssr: 'test/ssr-harness/emit.tsx', outDir: buildOutput, emptyOutDir: true, minify: false, rollupOptions: { output: { entryFileNames: 'server.mjs' } } },
});
// A fresh Node process resolves server conditions. Only serialized HTML crosses into the client.
const result = spawnSync(process.execPath, [join(buildOutput, 'server.mjs')], { cwd: root, encoding: 'utf8' });
if (result.status !== 0 || result.stderr) throw new Error(`SSR fixture failed: ${result.stderr || result.stdout}`);
const artifact = JSON.parse(result.stdout);
if (artifact.isServer !== true) throw new Error('HARNESS_SERVER_CONDITIONS');
// The fixture is deterministic across invocations. Publish the complete JSON
// atomically so existing hydration consumers cannot read a partial write.
const temporaryArtifact = join(buildOutput, 'html.json');
writeFileSync(temporaryArtifact, JSON.stringify(artifact, null, 2));
renameSync(temporaryArtifact, process.env.HARNESS_SSR_ARTIFACT ?? join(output, 'html.json'));
console.log('PASS: isolated production SSR compilation and HTML artifact');
} finally {
  rmSync(buildOutput, { recursive: true, force: true });
}
