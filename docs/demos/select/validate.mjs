import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const upstream = 'upstream/base-ui/docs/src/app/(docs)/react/components/select/demos';
const demos = ['hero', 'grouped', 'multiple', 'object-values'];
for (const demo of demos) {
  assert.equal(fs.readFileSync(`docs/demos/select/${demo}/css-modules/index.module.css`, 'utf8'), fs.readFileSync(`${upstream}/${demo}/css-modules/index.module.css`, 'utf8'));
}
const server = await createServer({
  configFile: false,
  cacheDir: 'docs/demos/select/.cache/vite',
  optimizeDeps: { entries: ['docs/demos/select/validation.tsx'] },
  plugins: [solid(), {
    name: 'select-demo-validation',
    configureServer(server) {
      server.middlewares.use('/select-validation', async (_request, response) => {
        response.setHeader('Content-Type', 'text/html');
        response.end(await server.transformIndexHtml('/select-validation', '<html><body><div id="root"></div><script type="module" src="/docs/demos/select/validation.tsx"></script></body></html>'));
      });
    },
  }],
  server: { host: '127.0.0.1', port: 0 },
});
let browser;
let passed = 0;
const failures = [];
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  for (const demo of demos) {
    for (const variant of ['css-modules', 'tailwind']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(`${server.resolvedUrls.local[0]}select-validation?demo=${demo}&variant=${variant}`);
        const trigger = page.getByRole('combobox');
        await trigger.waitFor();
        if (demo === 'multiple') await assertText(trigger, 'JavaScript (+1 more)');
        if (demo === 'object-values') await assertText(trigger, 'Standard');
        await trigger.click();
        const label = { hero: 'Fuji', grouped: 'Carrot', multiple: 'Python', 'object-values': 'Express' }[demo];
        const option = page.getByRole('option').filter({ hasText: label });
        await option.click();
        await assertText(trigger, demo === 'multiple' ? 'JavaScript (+2 more)' : label);
        if (demo === 'multiple') {
          await option.click();
          await assertText(trigger, 'JavaScript (+1 more)');
        } else {
          await trigger.click();
        }
        await page.keyboard.press('Escape');
        await page.getByRole('listbox').waitFor({ state: 'hidden' });
        assert.equal(errors.length, 0, errors.join('\n'));
        passed++;
        console.log(`PASS ${demo}/${variant}: open, select, live value, ${demo === 'multiple' ? 'deselect, ' : ''}Escape`);
      } catch (error) {
        failures.push(`${demo}/${variant}: ${error.message}; runtime: ${errors.join('; ')}`);
      } finally { await page.close(); }
    }
  }
} finally {
  await browser?.close();
  await server.close();
}
console.log(`${passed}/8 variants passed; 4/4 CSS modules byte-identical`);
for (const failure of failures) console.error(failure);
if (failures.length) process.exitCode = 1;

async function assertText(locator, expected) {
  await locator.page().waitForFunction(({ expected }) => document.querySelector('[role="combobox"]')?.textContent?.includes(expected), { expected }, { timeout: 5000 });
  assert.ok((await locator.textContent()).includes(expected));
}
