import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const outDir = path.join(root, 'docs/tests/demos/.build');
await build({
  configFile: false,
  root,
  cacheDir: 'docs/tests/demos/.cache',
  plugins: [solid({ compiler: 'babel' })],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(root, 'docs/tests/demos/fixtures/browser.html'),
    },
  },
});
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    const file = path.resolve(outDir, `.${pathname}`);
    if (!file.startsWith(`${outDir}/`)) {
      response.writeHead(403).end();
      return;
    }
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'",
    );
    response.setHeader(
      'Content-Type',
      file.endsWith('.js')
        ? 'text/javascript'
        : file.endsWith('.css')
          ? 'text/css'
          : 'text/html',
    );
    response.end(await fs.readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) =>
      window.cspViolations.push(event.violatedDirective),
    );
  });
  await page.goto(
    `http://127.0.0.1:${server.address().port}/docs/tests/demos/fixtures/browser.html`,
  );
  await page.getByRole('button', { name: 'Count 0', exact: true }).click();
  await page.getByRole('button', { name: 'Count 1', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  assert.equal(
    await page
      .getByRole('button', { name: 'Hide code', exact: true })
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await page
    .getByRole('button', { name: 'Hide code', exact: true })
    .press('Enter');
  assert.equal(
    await page
      .getByRole('button', { name: 'Show code', exact: true })
      .evaluate((node) => node === document.activeElement),
    true,
  );
  assert.equal(
    await page
      .getByRole('button', { name: 'Count 1', exact: true })
      .isVisible(),
    true,
  );
  await page.getByRole('tab', { name: 'state.tsx', exact: true }).focus();
  await page.keyboard.press('End');
  const css = await fs.readFile(
    path.join(root, 'docs/tests/demos/fixtures/style.module.css'),
    'utf8',
  );
  await page.waitForFunction(
    (css) => document.querySelector('code')?.textContent === css,
    css,
  );
  assert.equal(await page.locator('code').textContent(), css);
  await page.keyboard.press('Home');
  await page.waitForFunction(() =>
    document.querySelector('code')?.textContent?.startsWith('import'),
  );
  const original = await fs.readFile(
    path.join(root, 'docs/tests/demos/fixtures/state.tsx'),
    'utf8',
  );
  assert.equal(await page.locator('code').textContent(), original);
  await page.getByRole('button', { name: 'Copy code' }).click();
  await page.getByRole('status').filter({ hasText: 'Code copied.' }).waitFor();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    original,
  );
  const variantSelect = page.getByRole('combobox', { name: 'Styling method' });
  await variantSelect.focus();
  await variantSelect.press('p');
  await variantSelect.press('Enter');
  await page.locator('[data-demo-fixture-portal]').waitFor();
  const lifecycle = await page.evaluate(() => {
    const before = { ...window.fixtureLifecycle };
    document.dispatchEvent(new Event('fixture-event'));
    return { before, after: { ...window.fixtureLifecycle } };
  });
  assert.equal(lifecycle.after.cleanups, 1);
  assert.equal(lifecycle.after.events, lifecycle.before.events);
  await page.waitForFunction(
    () => document.querySelector('.DemoCodeReveal')?.hidden === true,
  );
  await page.locator('summary[aria-label="More actions"]').click();
  assert.equal(
    await page
      .getByRole('menuitem')
      .first()
      .evaluate((node) => node === document.activeElement),
    true,
  );
  assert.equal(
    await page
      .getByRole('menu')
      .evaluate((node) => node.matches(':popover-open')),
    true,
  );
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.getByRole('status').filter({ hasText: 'Link copied!' }).waitFor();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /19511bb171f3b360b006c94cf6d07e53cb446505\/docs\/example\/portal$/,
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page.locator('details').evaluate((node) => node.open),
    false,
  );
  assert.equal(
    await page
      .locator('summary')
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await page.getByRole('button', { name: 'Remount island' }).click();
  await page.getByRole('button', { name: 'Count 0', exact: true }).waitFor();
  assert.equal(await page.locator('[data-demo-fixture-portal]').count(), 0);
  await page
    .getByRole('combobox', { name: 'Styling method' })
    .selectOption('portal');
  await page.locator('[data-demo-fixture-portal]').waitFor();
  await page.getByRole('button', { name: 'Unmount island' }).click();
  await page
    .locator('[data-demo-fixture-portal]')
    .waitFor({ state: 'detached' });
  assert.deepEqual(await page.evaluate(() => window.cspViolations), []);
  assert.deepEqual(errors, []);
  console.log(
    'Production Chromium fixture passed: reveal focus/state, keyboard files, raw source/copy, source menu, CSS Modules, variant/remount/portal disposal, strict response CSP.',
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
