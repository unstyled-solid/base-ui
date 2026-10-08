import { createServer, build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = path.resolve('docs/demos/combobox');
const config = {
  configFile: false, root, plugins: [solid()], cacheDir: path.join(root, '.cache/vite'),
  css: { postcss: { plugins: [] } },
};
await build({ ...config, build: { outDir: path.join(root, '.build'), emptyOutDir: true, rolldownOptions: { input: path.join(root, 'preview.html') } } });
const server = await createServer({ ...config, server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
const base = server.resolvedUrls.local[0];
try {
  for (const variant of ['css-modules', 'tailwind']) {
    for (const [demo, label, query, result] of [
      ['hero', 'Choose a fruit', 'Apple', 'Apple'],
      ['multiple', 'Programming languages', 'TypeScript', 'TypeScript'],
      ['grouped', 'Select produce', 'Carrot', 'Carrot'],
      ['create-items', 'Choose a fruit', 'Apple', 'Apple'],
      ['creatable', 'Labels', 'new label', 'Create "new label"'],
      ['async-single', 'Assign reviewer', 'Michael', 'Michael Foster'],
      ['async-multiple', 'Assign reviewers', 'Michael', 'Michael Foster'],
      ['virtualized', 'Search 10,000 items', 'Item 9999', 'Item 9999'],
    ]) {
      await page.goto(`${base}preview.html?demo=${demo}&variant=${variant}`);
      await page.evaluate(() => { Math.random = () => 0.5; });
      const input = page.getByLabel(label, { exact: true });
      if (demo === 'create-items') await input.fill('');
      if (demo === 'virtualized' && variant === 'tailwind') await input.fill(query);
      else await input.pressSequentially(query);
      if (demo === 'virtualized' && variant === 'tailwind') {
        await page.getByRole('option', { name: result, exact: true }).waitFor({ state: 'attached' });
        assert.equal(await page.getByRole('option').count(), 1);
        console.log('PASS Chromium virtualized/tailwind filtered DOM; visual interaction blocked by missing shared Tailwind stylesheet');
        continue;
      }
      await page.getByRole('option', { name: result, exact: !demo.startsWith('async') }).waitFor();
      if (demo === 'virtualized') assert.equal(await page.getByRole('option').count(), 1);
      if (demo === 'hero' && variant === 'css-modules') assert.equal(await input.evaluate((node) => getComputedStyle(node).fontSize), '14px');
      await page.getByRole('option', { name: result, exact: !demo.startsWith('async') }).click();
      if (demo === 'creatable') {
        await page.getByRole('dialog').waitFor();
        assert.equal(await page.getByPlaceholder('Label name').inputValue(), 'new label');
        if (variant === 'css-modules') await page.getByRole('button', { name: 'Create', exact: true }).click();
        else await page.getByPlaceholder('Label name').press('Enter');
        await page.getByRole('button', { name: 'Remove new label' }).waitFor();
      }
      console.log(`PASS Chromium ${demo}/${variant}`);
    }
    await page.goto(`${base}preview.html?demo=input-inside-popup&variant=${variant}`);
    await page.getByRole('combobox', { name: 'Country' }).click();
    await page.getByPlaceholder('e.g. United Kingdom').pressSequentially('United Kingdom');
    await page.getByRole('option', { name: 'United Kingdom', exact: true }).click();
    assert.match(await page.getByRole('combobox', { name: 'Country' }).textContent(), /United Kingdom/);
    console.log(`PASS Chromium input-inside-popup/${variant}`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS native production build + 17 Chromium interaction flows + virtualized Tailwind filtered DOM; no browser errors. Tailwind visual/pointer qualification requires the shared Tailwind stylesheet.');
} finally {
  await browser.close();
  await server.close();
}
