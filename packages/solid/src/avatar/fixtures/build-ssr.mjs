// Qualification preparation: rtk proxy node packages/solid/src/avatar/fixtures/build-ssr.mjs
// Produces independently compiled server markup for Avatar.browser.test.tsx.
import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const output = fileURLToPath(new URL('./.generated/', import.meta.url));
await build({
  root, configFile: false, logLevel: 'error',
  plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true } })],
  build: {
    ssr: fileURLToPath(new URL('./emit.tsx', import.meta.url)), outDir: output,
    emptyOutDir: true, minify: false,
    rollupOptions: { output: { entryFileNames: 'server.mjs' } },
  },
});
const result = spawnSync(process.execPath, [output + 'server.mjs'], { cwd: root, encoding: 'utf8' });
if (result.status !== 0 || result.stderr) throw new Error(result.stderr || result.stdout);
for (const line of result.stdout.trim().split('\n')) {
  const record = JSON.parse(line);
  if (record.isServer !== true) throw new Error('Avatar was not server compiled');
  writeFileSync(output + record.renderId + '.html', record.bootstrap + '<main>' + record.html + '</main>');
}
console.log('Avatar server fixtures compiled; browser hydration has not been qualified.');
