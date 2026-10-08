import assert from 'node:assert/strict';
import { transform } from '@solidjs/compiler';
import { parseSync, transformSync } from '@babel/core';
import solid from '@solidjs/babel-plugin';

const source = 'export const Proof = (props) => <button class={props.class}>{props.label}</button>;';
for (const generate of ['dom', 'ssr']) {
  for (const [name, compile] of [
    ['native', () => transform(source, { filename: 'proof.jsx', generate, hydratable: true, dev: true }).code],
    ['babel', () => transformSync(source, {
      filename: 'proof.jsx', configFile: false, babelrc: false,
      plugins: [[solid, { generate, hydratable: true, dev: true, moduleName: '@solidjs/web' }]],
    }).code],
  ]) {
    const code = compile();
    assert.ok(code.includes('@solidjs/web'), `${name}/${generate}: renderer ownership`);
    // HTML template strings are expected; parsing without the JSX syntax plugin rejects uncompiled JSX.
    assert.ok(parseSync(code, { configFile: false, babelrc: false, sourceType: 'module' }), `${name}/${generate}: valid JavaScript`);
    console.log(`PASS: ${name} ${generate} JSX compilation`);
  }
}
