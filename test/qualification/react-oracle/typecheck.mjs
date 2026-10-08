import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { verifiedSource } from './source.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = fileURLToPath(new URL('./', import.meta.url));
const source = verifiedSource(root).path;
const cache = resolve(directory, '.cache');
await mkdir(cache, { recursive: true });
const config = resolve(cache, 'tsconfig.json');
await writeFile(config, JSON.stringify({
  compilerOptions: {
    target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler',
    jsx: 'react-jsx', jsxImportSource: 'react', strict: true, noEmit: true, skipLibCheck: false,
    allowJs: true, checkJs: true, allowImportingTsExtensions: true,
    types: ['node', 'react', 'react-dom'], typeRoots: [resolve(source, 'node_modules/@types'), resolve(source, 'packages/react/node_modules/@types')],
    paths: {
      'react': [resolve(source, 'node_modules/@types/react/index.d.ts')],
      'react/*': [resolve(source, 'node_modules/@types/react/*')],
      'react-dom/*': [resolve(source, 'packages/react/node_modules/@types/react-dom/*')],
      '@base-ui/react/*': [resolve(source, 'packages/react/src/*')],
      '@base-ui/utils/*': [resolve(source, 'packages/utils/src/*')],
    },
  },
  files: [resolve(directory, 'host.jsx'), resolve(directory, '../browser/protocol.ts'), resolve(source, 'packages/react/src/global.d.ts')],
}, null, 2));
const compiler = resolve(source, 'node_modules/typescript');
const manifest = JSON.parse(await readFile(resolve(compiler, 'package.json'), 'utf8'));
const entry = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin.tsc ?? manifest.bin.tsc6;
if (!entry) throw new Error('Pinned upstream TypeScript package has no compiler entrypoint');
const result = spawnSync('rtk', ['proxy', process.env.QUALIFICATION_REACT_NODE ?? process.execPath, resolve(compiler, entry), '-p', config], {
  cwd: root, stdio: 'inherit', timeout: 120_000,
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status === 0 ? 0 : 1;
