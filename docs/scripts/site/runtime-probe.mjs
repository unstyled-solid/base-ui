import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { root } from './paths.mjs';

// Reuse only this worker's agent-browser session, including its dark scheme.
const origin = process.env.DOCS_TEST_URL ?? 'http://127.0.0.1:5173';
const agent = (...args) => {
  const result = spawnSync('rtk', ['proxy', 'agent-browser', '--session', 'docs-runtime', '--color-scheme', 'dark', ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
};
agent('open', `${origin}/solid/components/button`);
const { data: { cdpUrl } } = JSON.parse(agent('get', 'cdp-url', '--json'));
const browser = await chromium.connectOverCDP(cdpUrl);
const page = browser.contexts()[0].pages()[0];
page.setDefaultTimeout(5000);
const results = [];
let diagnostics = [];
const describeError = error => error.stack ?? String(error);
page.on('pageerror', error => diagnostics.push(describeError(error)));
page.on('console', message => {
  if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text());
});

const checks = {
  avatar: async host => {
    await host.locator('[data-demo] > div > span').first().waitFor();
    assert.equal(await host.locator('[data-demo] > div > span').count(), 2);
  },
  tabs: async host => {
    const tabs = host.locator('[data-demo] [role=tab]');
    await tabs.nth(1).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-demo-id="tabs/hero"] [data-demo] [role=tab]')[1]?.getAttribute('aria-selected') === 'true');
  },
  accordion: async host => {
    const trigger = host.locator('[data-demo] button[aria-expanded]').first();
    await trigger.click();
    await page.waitForFunction(() => document.querySelector('[data-demo-id="accordion/hero"] [data-demo] button[aria-expanded]')?.getAttribute('aria-expanded') === 'true');
  },
  'number-field': async host => {
    const input = host.locator('[data-demo] input:not([type=hidden])').first();
    const before = await input.inputValue();
    await host.locator('[data-demo] button').first().click();
    await page.waitForFunction(before => document.querySelector('[data-demo-id="number-field/hero"] input:not([type=hidden])')?.value !== before, before);
  },
  toast: async host => {
    await host.getByRole('button', { name: 'Create toast', exact: true }).click();
    await page.getByText('Toast 1 created', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await page.getByText('Toast 1 created', { exact: true }).waitFor({ state: 'hidden' });
  },
};

try {
  await page.locator('[data-demo-id="button/hero"] [data-demo]').waitFor({ state: 'attached' });
  await page.evaluate(() => { Error.stackTraceLimit = 70; });
  diagnostics = [];
  const minimal = await page.evaluate(async moduleUrl => {
    const { mountContextProbe } = await import(moduleUrl);
    const host = document.createElement('div');
    document.body.append(host);
    const probe = mountContextProbe(host);
    const solidUrl = performance.getEntriesByType('resource').map(entry => entry.name).find(url => url.includes('/deps/solid-js.js?'));
    if (!solidUrl) throw new Error('The docs page did not load its optimized Solid runtime');
    const { flush } = await import(solidUrl);
    let error;
    try { probe.update(); flush(); } catch (failure) { error = failure.stack ?? String(failure); }
    const evidence = probe.evidence();
    probe.dispose();
    host.remove();
    return { error, ...evidence };
  }, '/@fs/' + path.join(root, 'docs/tests/runtime-probe/context.tsx')).catch(describeError);
  results.push({ id: 'solid-only-lazy-jsx-record', passed: typeof minimal === 'object' && !minimal.error && minimal.reads === 0, evidence: minimal, diagnostics });

  // A fresh document clears the halted reactive graph after a failed probe.
  await page.goto(`${origin}/solid/components/button`);
  await page.evaluate(() => { Error.stackTraceLimit = 70; });
  diagnostics = [];
  const direct = await page.evaluate(async moduleUrl => {
    const { mountAvatarProbe } = await import(moduleUrl);
    const host = document.createElement('div');
    document.body.append(host);
    let dispose;
    try { dispose = mountAvatarProbe(host); return { html: host.innerHTML }; }
    catch (error) { return { error: error.stack ?? String(error) }; }
    finally { dispose?.(); host.remove(); }
  }, '/@fs/' + path.join(root, 'docs/tests/runtime-probe/avatar.tsx'));
  results.push({ id: 'direct-avatar-without-docs-runtime', passed: !direct.error, evidence: direct, diagnostics });

  for (const [family, check] of Object.entries(checks)) {
    for (const variant of ['css-modules', 'tailwind']) {
      diagnostics = [];
      await page.goto(`${origin}/solid/components/${family}`);
      await page.evaluate(() => { Error.stackTraceLimit = 70; });
      const host = page.locator(`[data-demo-id="${family}/hero"]`);
      const result = { id: `${family}/hero/${variant}`, passed: false };
      try {
        await host.locator('[data-demo]').waitFor({ state: 'attached' });
        if (variant === 'tailwind') await host.getByLabel('Styling method').selectOption(variant);
        const alert = host.locator('[role=alert]');
        if (await alert.count()) throw new Error(await alert.textContent());
        await check(host);
        assert.equal(await alert.count(), 0, 'Preview must remain mounted after interaction');
        result.passed = diagnostics.length === 0;
      } catch (error) { result.error = describeError(error); }
      result.diagnostics = [...new Set(diagnostics)];
      result.preview = await host.locator('[data-demo]').innerHTML().catch(() => '');
      results.push(result);
    }
  }
  const metadata = await fs.readFile(path.join(root, 'docs/node_modules/.vite/deps/_metadata.json'), 'utf8').then(JSON.parse);
  const report = { origin, session: 'docs-runtime', colorScheme: 'dark', generatedAt: new Date().toISOString(), runtime: metadata.optimized, results };
  const destination = path.join(root, 'docs/tests/runtime-probe/browser-evidence.json');
  await fs.writeFile(destination, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ evidence: destination, results: results.map(({ id, passed, error }) => ({ id, passed, error: error?.split('\n')[0] })) }, null, 2));
  if (results.some(result => !result.passed)) process.exitCode = 1;
} finally {
  await browser.close();
}
