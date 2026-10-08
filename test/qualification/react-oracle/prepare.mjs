import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { sourceSha, verifiedSource } from './source.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const parent = '/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode';
const tools = resolve(parent, 'bsolid-browser-tools');
const checkout = resolve(parent, 'bsolid-browser-react');
function run(args, cwd = root, timeout = 120_000) {
  const result = spawnSync('rtk', args, { cwd, stdio: 'inherit', timeout });
  if (result.error || result.status !== 0) throw new Error(`rtk ${args.join(' ')} failed: ${result.error?.message ?? result.status}`);
}
// Verify the exact approved parent before any directory/tool/checkout creation.
run(['ls', parent]);
if (!existsSync(tools)) run(['proxy', 'mkdir', tools]);
if (realpathSync(tools) !== resolve(realpathSync(parent), 'bsolid-browser-tools')) throw new Error('Tool directory must not be a redirected symlink');
const node = resolve(tools, 'node_modules/node/bin/node');
if (!existsSync(node)) run(['proxy', 'npm', 'install', '--prefix', tools, '--no-audit', '--no-fund', 'node@24.21.0', 'pnpm@12.8.1'], tools, 180_000);
run(['proxy', node, '--version']);
if (!existsSync(checkout)) {
  run(['proxy', 'git', 'clone', '--no-hardlinks', '--no-checkout', resolve(root, 'upstream/base-ui'), checkout]);
  run(['git', 'checkout', '--detach', sourceSha], checkout);
}
process.env.QUALIFICATION_REACT_CHECKOUT = checkout;
verifiedSource(root);
// A single frozen install with a ten-minute bound. Existing partial installs can be retried once manually.
run(['proxy', 'env', `PATH=${resolve(tools, 'node_modules/node/bin')}:${resolve(tools, 'node_modules/.bin')}:${process.env.PATH}`,
  'pnpm', 'install', '--frozen-lockfile', '--ignore-scripts'], checkout, 600_000);
verifiedSource(root);
console.log(`QUALIFICATION_REACT_CHECKOUT=${checkout}`);
console.log(`QUALIFICATION_REACT_NODE=${node}`);
