import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium, expect } from 'playwright/test';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../../..');
const server = await createServer({
  configFile: false,
  root: import.meta.dirname,
  cacheDir: path.join(import.meta.dirname, '.cache'),
  plugins: [solid()],
  server: { host: '127.0.0.1', port: 0, fs: { allow: [root] } },
});
await server.listen();
const browser = await chromium.launch({ headless: true });
const diagnostics = [];
const page = await browser.newPage();
page.setDefaultTimeout(5000);
page.on('pageerror', error => diagnostics.push(error.message));
page.on('console', message => { if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text()); });
const names = ['hero', 'close-confirmation', 'detached-triggers-controlled', 'detached-triggers-simple', 'focus-management', 'inside-scroll', 'nested', 'open-from-menu', 'outside-scroll', 'uncontained'];
const failures = [];
try {
  for (const variant of ['css-modules', 'tailwind']) {
    for (const name of names) {
      diagnostics.length = 0;
      try {
      await page.goto(`${server.resolvedUrls.local[0]}?demo=${name}&variant=${variant}`);
      const button = label => page.getByRole('button', { name: label, exact: true });
      const dialog = page.getByRole('dialog');
      if (variant === 'tailwind') {
        const stylesheetReady = await page.locator('button').first().evaluate(element => getComputedStyle(element).display === 'flex');
        if (!stylesheetReady) throw new Error('Tailwind utilities are not compiled by the docs host; no Tailwind compiler is installed');
      }
      if (name === 'close-confirmation') {
        await button('Tweet').click();
        await page.getByRole('textbox').fill('Solid dialog draft');
        await button('Cancel').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await button('Go back').click();
        await expect(page.getByRole('alertdialog')).toHaveCount(0);
        await expect(page.getByRole('textbox')).toHaveValue('Solid dialog draft');
        await button('Cancel').click();
        await button('Discard').click();
        await expect(dialog).toHaveCount(0);
        await button('Tweet').click();
        await page.getByRole('textbox').fill('Submit this draft');
        await dialog.getByRole('button', { name: 'Tweet', exact: true }).click();
        await expect(dialog).toHaveCount(0);
      } else if (name === 'detached-triggers-controlled') {
        for (const [label, payload] of [['Open 1', 1], ['Open 3', 3], ['Open programmatically', 2]]) {
          await button(label).click();
          await expect(dialog).toHaveAccessibleName(`Dialog ${payload}`);
          await button('Close').click();
          await expect(dialog).toHaveCount(0);
        }
      } else {
        const trigger = name === 'focus-management' ? 'Open feedback' : name === 'open-from-menu' ? 'Playlist' : ['hero', 'nested', 'detached-triggers-simple'].includes(name) ? 'View notifications' : 'Open dialog';
        await button(trigger).click();
        if (name === 'open-from-menu') await page.getByRole('menuitem', { name: 'Details…' }).click();
        await expect(dialog).toBeVisible();
        if (name === 'focus-management') {
          await expect(page.getByRole('textbox', { name: 'Feedback', exact: true })).toBeFocused();
          await page.getByRole('textbox', { name: 'Feedback', exact: true }).fill('Feedback text');
        }
        if (name === 'nested') {
          await button('Customize').click();
          await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(2);
          await expect(page.getByRole('dialog', { name: 'Customize notifications', exact: true })).toBeVisible();
          await button('Close').click();
          await expect(page.getByRole('dialog', { name: 'Customize notifications', exact: true })).toHaveCount(0);
          await expect(dialog).toHaveCount(1);
          await page.keyboard.press('Escape');
        } else {
          if (name === 'outside-scroll') await expect(dialog).toBeFocused();
          if (['inside-scroll', 'outside-scroll'].includes(name)) {
            // Wheel input goes through the actual scroll container, not a mocked geometry.
            const section = page.getByRole('heading', { name: 'What a dialog is for' });
            await section.hover();
            await page.mouse.wheel(0, 650);
            await expect.poll(() => page.locator('[data-id$="-viewport"]').evaluateAll(elements => elements.some(element => element.scrollTop > 0))).toBe(true);
            if (name === 'outside-scroll') {
              await page.mouse.wheel(0, -2000);
              await expect.poll(() => page.locator('[data-id$="-viewport"]').evaluate(element => element.scrollTop)).toBe(0);
            }
          }
          await button('Close').click();
        }
        await expect(dialog).toHaveCount(0);
        if (name === 'focus-management') await expect(button('Final focus')).toBeFocused();
      }
      if (diagnostics.length) throw new Error(diagnostics.join('\n'));
      console.log(`PASS ${name}/${variant}`);
      } catch (error) {
        failures.push(`${name}/${variant}: ${error.message}`);
        console.error(`FAIL ${name}/${variant}: ${error.message}`);
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}
if (failures.length) throw new Error(`${failures.length} demo checks failed:\n${failures.join('\n')}`);
