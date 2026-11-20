import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { renderToString, generateHydrationScript } from '@solidjs/web';
import { QualificationApp } from './qualification-app.js';
const results = [];
for (const vertical of [false, true]) for (const rtl of [false, true]) {
  const errors: string[] = [];
  const html = renderToString(() => <QualificationApp prefix="ssr" vertical={vertical} rtl={rtl} />, { renderId: 'qualification-', onError: e => errors.push(String(e)) });
  assert.deepEqual(errors, []);
  assert(html.includes('nonce="qualification-nonce"'));
  assert(html.includes('--active-tab-') && html.includes('--position'));
  results.push({ vertical, rtl, html, bootstrap: generateHydrationScript({ nonce: 'qualification-nonce', eventNames: ['click', 'input', 'keydown', 'pointerdown', 'pointerup'] }) });
}
await fs.writeFile('qualification-ssr.json', JSON.stringify(results, null, 2));
