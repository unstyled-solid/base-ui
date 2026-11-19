import type { Plugin } from 'vite';
import { readFile } from 'node:fs/promises';

/** Test-only runtime instrumentation. The installed packages are never edited.
 * Both functions reserve from the first nontransparent ancestor; observing that
 * ancestor before the original body gives the exact allocation position.
 */
export function allocationTracePlugin(): Plugin {
  const instrument = (code: string) => code.replace(/function (nextChildIdFor|childId)(\w*)\((\w+),\s*(\w+)\)\s*\{/g,
    (declaration, _name, _suffix, owner, consume) => `${declaration}
if (${consume} && globalThis.__baseUIAllocationTrace) {
  let tracedOwner = ${owner};
  while (tracedOwner._parent && (tracedOwner._transparent || (tracedOwner._config & 4))) tracedOwner = tracedOwner._parent;
  if (tracedOwner.id != null) globalThis.__baseUIAllocationTrace({ owner: tracedOwner.id, next: tracedOwner._childCount, stack: new Error().stack });
}
`);
  return {
    name: 'harness-solid-allocation-trace',
    enforce: 'pre',
    config() {
      return { optimizeDeps: { esbuildOptions: { plugins: [{
        name: 'harness-solid-allocation-trace',
        setup(build: { onLoad(options: { filter: RegExp }, callback: (args: { path: string }) => Promise<{ contents: string; loader: 'js' }>): void }) {
          build.onLoad({ filter: /(?:signals|solid-js).*\.js$/ }, async ({ path }) => ({ contents: instrument(await readFile(path, 'utf8')), loader: 'js' }));
        },
      }] } } };
    },
    transform(code, id) {
      if (!id.includes('node_modules') || !code.includes('function ')) return;
      const transformed = instrument(code);
      if (transformed !== code) return { code: transformed, map: null };
    },
  };
}
