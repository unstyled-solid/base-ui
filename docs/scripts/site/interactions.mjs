import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './paths.mjs';

const origin = process.env.DOCS_TEST_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch();
const results = [];
const checks = [
  [
    'button',
    async (page, host) => {
      await host.getByRole('button').first().click();
    },
  ],
  [
    'accordion',
    async (page, host) => {
      const trigger = host.locator('button[aria-expanded]').first();
      await trigger.click();
      await page.waitForFunction(
        () =>
          document
            .querySelector(
              '[data-demo-id="accordion/hero"] button[aria-expanded]',
            )
            ?.getAttribute('aria-expanded') === 'true',
      );
    },
  ],
  [
    'checkbox',
    async (page, host) => {
      const box = host.getByRole('checkbox');
      const before = await box.getAttribute('aria-checked');
      await box.click();
      await page.waitForFunction(
        (before) =>
          document
            .querySelector('[data-demo-id="checkbox/hero"] [role="checkbox"]')
            ?.getAttribute('aria-checked') !== before,
        before,
      );
    },
  ],
  [
    'switch',
    async (page, host) => {
      const control = host.getByRole('switch');
      const before = await control.getAttribute('aria-checked');
      await control.click();
      await page.waitForFunction(
        (before) =>
          document
            .querySelector('[data-demo-id="switch/hero"] [role="switch"]')
            ?.getAttribute('aria-checked') !== before,
        before,
      );
    },
  ],
  [
    'number-field',
    async (page, host) => {
      const input = host.locator('input:not([type=hidden])').first();
      const before = await input.inputValue();
      await host.locator('[data-demo] button').first().click();
      await page.waitForFunction(
        (before) =>
          document.querySelector(
            '[data-demo-id="number-field/hero"] input:not([type=hidden])',
          )?.value !== before,
        before,
      );
    },
  ],
  [
    'tabs',
    async (page, host) => {
      const tabs = host.locator('[data-demo]').getByRole('tab');
      await tabs.nth(1).click();
      assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
    },
  ],
  [
    'dialog',
    async (page, host) => {
      await host.locator('[data-demo] button').first().click();
      await page.getByRole('dialog').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    },
  ],
  [
    'select',
    async (page, host) => {
      await host.locator('[data-demo] button').first().click();
      await page.locator('[role="option"]').first().waitFor();
      await page.locator('[role="option"]').nth(1).click();
      await page.getByRole('listbox').waitFor({ state: 'hidden' });
    },
  ],
  [
    'autocomplete',
    async (page, host) => {
      await host.locator('input[role=combobox]').fill('feat');
      await page
        .getByRole('option', { name: 'feature', exact: true })
        .waitFor();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      assert.equal(
        await host.locator('input[role=combobox]').inputValue(),
        'feature',
      );
    },
  ],
  [
    'menu',
    async (page, host) => {
      await host.locator('[data-demo] button').first().click();
      await page.getByRole('menu').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('menu').waitFor({ state: 'hidden' });
    },
  ],
  [
    'toast',
    async (page, host) => {
      await host
        .getByRole('button', { name: 'Create toast', exact: true })
        .click();
      await page.getByText('Toast 1 created', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
      await page
        .getByText('Toast 1 created', { exact: true })
        .waitFor({ state: 'hidden' });
    },
  ],
];
try {
  for (const [family, run] of checks.filter(
    ([family]) =>
      !process.env.DOCS_TEST_FAMILIES ||
      process.env.DOCS_TEST_FAMILIES.split(',').includes(family),
  )) {
    const page = await browser.newPage();
    page.setDefaultTimeout(6000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.stack ?? String(e)));
    page.on('console', (m) => {
      if (
        ['error', 'warning'].includes(m.type()) &&
        !m.text().includes('Failed to load resource')
      )
        errors.push(m.text());
    });
    try {
      await page.goto(`${origin}/solid/components/${family}`);
      const host = page.locator(`[data-demo-id="${family}/hero"]`);
      await host.locator('[data-demo]').waitFor();
      await run(page, host);
      results.push({
        family,
        passed: errors.length === 0,
        diagnostics: [...new Set(errors)],
      });
    } catch (error) {
      results.push({
        family,
        passed: false,
        error: String(error),
        diagnostics: [...new Set(errors)],
      });
    }
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(`${origin}/solid/components/accordion`);
  await page.locator('[data-demo-id="accordion/hero"] [data-demo]').waitFor();
  await page.getByRole('button', { name: 'Search docs', exact: true }).click();
  await page.getByLabel('Search terms').fill('checkbox');
  await page.locator('.SiteSearch a').first().waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.SiteSearch').isVisible(), false);
  await fs.mkdir(path.join(root, 'docs/generated/browser'), {
    recursive: true,
  });
  await page.screenshot({
    path: path.join(root, 'docs/generated/browser/accordion-desktop.png'),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(root, 'docs/generated/browser/accordion-mobile.png'),
  });
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  await staticPage.goto(`${origin}/solid/components/accordion`);
  assert.equal(await staticPage.locator('h1').textContent(), 'Accordion');
  assert.ok(
    (await staticPage.locator('main').textContent()).includes('API reference'),
  );
  results.push({ family: 'shell-search-nojs', passed: true });
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(root, 'docs/generated/browser/interactions.json'),
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.passed)) process.exitCode = 1;
