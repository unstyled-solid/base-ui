import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';

export const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export function verifiedSource(root) {
  if (!process.env.QUALIFICATION_REACT_CHECKOUT) throw new Error('Set QUALIFICATION_REACT_CHECKOUT to an isolated, frozen-installed exact-SHA Git checkout.');
  const source = realpathSync(process.env.QUALIFICATION_REACT_CHECKOUT);
  const temporary = realpathSync('/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode');
  if (!source.startsWith(`${temporary}/`) || source.startsWith(`${realpathSync(root)}/`)) {
    throw new Error('React qualification requires a throwaway checkout under the pre-approved tmp parent, never upstream/reference.');
  }
  const git = (...args) => execFileSync('rtk', ['proxy', 'git', '-C', source, ...args], { encoding: 'utf8' }).trim();
  if (git('rev-parse', 'HEAD') !== sourceSha) throw new Error(`React checkout must be ${sourceSha}`);
  if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('React checkout has tracked modifications.');
  // Dependencies must come from its own frozen lockfile, not the Solid workspace or a published Base UI release.
  const requirePath = resolve(source, 'node_modules/vite/dist/node/index.js');
  return { path: source, vite: requirePath };
}
