import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { observe, differences } from './observe.mjs';

let browser;
let page;
before(async () => {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});
after(async () => { await browser?.close(); });

async function baseline(prefix = 'base-ui-_r_') {
  await page.setContent(`<form><label for="${prefix}0">Name</label><input id="${prefix}0" name="name" value="Ada" aria-describedby="${prefix}1"><span id="${prefix}1">Description</span><!----><!--$--></form>`);
  await page.evaluate(() => {
    window.__qualification = { ready: true, log: [{ callback: 'request', value: true, reason: 'trigger-press', canceled: false }, { callback: 'commit', value: true }] };
  });
  return page.evaluate(observe);
}

test('generated IDs and compiler markers normalize while preserving references', async () => {
  const react = await baseline();
  const solid = await baseline('base-ui-solid-');
  assert.deepEqual(solid, react);
  await page.locator('input').evaluate((node) => node.setAttribute('aria-describedby', node.id));
  assert.ok(differences(react, await page.evaluate(observe)).some((difference) => difference.path.endsWith('aria-describedby')));
});

test('DOM/ARIA, hidden controls, CSS values and authored comments cannot be normalized away', async () => {
  const expected = await baseline();
  await page.locator('input').evaluate((node) => {
    node.setAttribute('aria-invalid', 'true');
    node.style.setProperty('--transform-origin', '49.000000000000014px 0px');
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.name = 'extra'; hidden.value = 'payload';
    node.parentElement.append(hidden, document.createComment('authored comment'));
  });
  const changes = differences(expected, await page.evaluate(observe));
  assert.ok(changes.some((difference) => difference.path.endsWith('aria-invalid')));
  assert.ok(changes.some((difference) => difference.path.endsWith('style')));
  assert.ok(changes.some((difference) => difference.path.startsWith('$.forms')));
  assert.ok(changes.some((difference) => difference.solid?.comment === 'authored comment'));
});

test('regenerated IDs across mounted checkpoints remain an observable difference', async () => {
  const expected = await baseline();
  await page.locator('input').evaluate((node) => {
    const previous = node.id;
    node.id = 'base-ui-recreated-99';
    document.querySelector('label').htmlFor = node.id;
    if (previous === node.id) throw new Error('Probe must change the ID');
  });
  assert.ok(differences(expected, await page.evaluate(observe)).some((difference) => difference.path.endsWith('attrs.id')));
});

test('callback order, reason and cancellation are independent failure surfaces', async () => {
  const expected = await baseline();
  await page.evaluate(() => {
    window.__qualification.log.reverse();
    window.__qualification.log[1].reason = 'none';
    window.__qualification.log[1].canceled = true;
  });
  const changes = differences(expected, await page.evaluate(observe));
  for (const field of ['callback', 'reason', 'canceled']) assert.ok(changes.some((difference) => difference.path.endsWith(field)));
});
