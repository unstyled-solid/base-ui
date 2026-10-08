import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium } from 'playwright';

const server = await createServer({ configFile: false, cacheDir: 'docs/demos/toast/.cache', optimizeDeps: { entries: ['docs/demos/toast/preview.html'] }, plugins: [solid({ compiler: 'babel' })], server: { port: 5198, strictPort: true, watch: { ignored: ['**/docs/demos/!(toast)/**'] } } });
await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(5000);
const errors = [];
const failures = [];
page.on('pageerror', (error) => errors.push(error.stack));
const source = 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos';
const demos = ['hero', 'custom', 'deduplicate', 'promise', 'varying-heights', 'undo', 'position', 'anchored'];
let count = 0;
try {
  for (const demo of demos) {
    for (const variant of ['css-modules', 'tailwind']) {
      if (!fs.existsSync(path.join(source, demo, variant))) continue;
      if (variant === 'css-modules') assert.equal(fs.readFileSync(`docs/demos/toast/${demo}/${variant}/index.module.css`, 'utf8'), fs.readFileSync(path.join(source, demo, variant, 'index.module.css'), 'utf8'));
      await page.goto(`http://localhost:5198/docs/demos/toast/preview.html?demo=${demo}&variant=${variant}`);
      await page.getByRole('button').first().waitFor();
      count++;
      console.log(`Mounted ${demo}/${variant}`);
    }
  }
  for (const demo of demos) {
    try {
    await page.goto(`http://localhost:5198/docs/demos/toast/preview.html?demo=${demo}`);
    if (demo === 'anchored') {
      await page.getByRole('button', { name: 'Copy to clipboard' }).click();
      await page.getByText('Copied', { exact: true }).waitFor();
      await page.getByText('Copied', { exact: true }).waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: 'Stacked toast' }).click();
      await page.getByText('Copied', { exact: true }).waitFor();
    } else {
      await page.getByRole('button').first().click();
      if (demo === 'promise') {
        await page.getByText('Loading data…', { exact: true }).waitFor();
        await page.getByText(/Success: operation completed|Error: operation failed/).waitFor();
      } else if (demo === 'undo') {
        await page.locator('button').filter({ hasText: /^Undo$/ }).click();
        await page.getByText('Action undone', { exact: true }).waitFor();
      } else {
        await page.locator('button').filter({ hasText: /^Dismiss$/ }).waitFor();
        if (demo === 'deduplicate') {
          await page.getByRole('button', { name: 'Save draft' }).click();
          assert.equal(await page.getByText('Draft saved', { exact: true }).count(), 1);
        }
        if (demo === 'custom') await page.getByText('data.userId is 123').waitFor();
        await page.locator('button').filter({ hasText: /^Dismiss$/ }).click();
        await page.locator('button').filter({ hasText: /^Dismiss$/ }).waitFor({ state: 'hidden' });
      }
    }
    console.log(`Interaction passed: ${demo}`);
    } catch (error) {
      failures.push(`${demo}: ${error.message.split('\n')[0]}`);
    }
  }
  console.log('Interaction blockers:', failures);
  assert.deepEqual(failures, []);
  assert.deepEqual(errors, []);
  console.log(`${count} variants mounted; 8 focused interactions passed; CSS byte parity passed`);
} catch (error) {
  console.error(errors);
  console.error(await page.locator('body').innerHTML());
  throw error;
} finally {
  await browser.close();
  await server.close();
}
