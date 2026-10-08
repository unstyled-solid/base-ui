import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root } from './paths.mjs';

const origin = process.env.DOCS_TEST_URL ?? 'http://127.0.0.1:5173';
const output = path.join(root, 'docs/generated/browser/click-diagnostics.json');
const selected = process.env.DOCS_TEST_FAMILIES?.split(',');
const styles = process.env.DOCS_TEST_STYLES?.split(',') ?? ['css-modules', 'tailwind'];
const results = [];
const browser = await chromium.launch();
const checks = {
  tooltip: async (page, demo) => {
    for (const name of ['Bold', 'Italic', 'Underline', 'Bold']) {
      const trigger = demo.getByRole('button', { name, exact: true });
      await trigger.locator('svg').hover();
      // Pinned upstream Popup intentionally has no tooltip role.
      const popup = page.locator('[data-base-ui-focusable][data-side]').filter({ hasText: new RegExp(`^${name}$`) });
      await popup.waitFor();
      const popupNode = await popup.elementHandle();
      try { await page.waitForFunction(node => Number(getComputedStyle(node).opacity) === 1, popupNode, { timeout: 10000 }); }
      finally { await popupNode.dispose(); }
      assert.ok((await popup.textContent()).includes(name));
      const rect = await popup.boundingBox();
      assert.ok(rect?.width > 0 && rect?.height > 0);
      await page.mouse.move(0, 0);
      await popup.waitFor({ state: 'hidden' });
    }
  },
  popover: async (page, demo) => {
    const trigger = demo.getByRole('button', { name: 'Notifications', exact: true });
    for (let index = 0; index < 4; index++) {
      await trigger.click();
      await page.getByRole('dialog').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
      assert.ok(await trigger.evaluate(node => node.ownerDocument.activeElement === node));
    }
  },
  tabs: async (_page, demo) => {
    const tabs = demo.getByRole('tab');
    for (const index of [1, 2, 0, 2, 1, 0]) {
      await tabs.nth(index).click();
      assert.equal(await tabs.nth(index).getAttribute('aria-selected'), 'true');
      const id = await tabs.nth(index).getAttribute('aria-controls');
      assert.ok(id);
      assert.equal(await demo.locator(`[id="${id}"]`).getAttribute('aria-labelledby'), await tabs.nth(index).getAttribute('id'));
    }
  },
  accordion: async (_page, demo) => {
    const triggers = demo.locator('button[aria-expanded]');
    for (const index of [0, 1, 2, 0, 1]) {
      const trigger = triggers.nth(index);
      const before = await trigger.getAttribute('aria-expanded');
      await trigger.click();
      assert.notEqual(await trigger.getAttribute('aria-expanded'), before);
    }
  },
  collapsible: async (_page, demo) => {
    const trigger = demo.locator('button[aria-expanded]').first();
    for (let index = 0; index < 4; index++) {
      const before = await trigger.getAttribute('aria-expanded');
      await trigger.click();
      assert.notEqual(await trigger.getAttribute('aria-expanded'), before);
    }
  },
};
for (const [family, role] of [['checkbox', 'checkbox'], ['switch', 'switch'], ['toggle', 'button']]) {
  checks[family] = async (_page, demo) => {
    const control = demo.getByRole(role).first();
    const attribute = family === 'toggle' ? 'aria-pressed' : 'aria-checked';
    for (let index = 0; index < 4; index++) {
      const before = await control.getAttribute(attribute);
      await control.click();
      assert.notEqual(await control.getAttribute(attribute), before);
    }
  };
}
for (const family of ['radio-group', 'toggle-group']) {
  checks[family] = async (_page, demo) => {
    const controls = demo.getByRole(family === 'radio-group' ? 'radio' : 'button');
    for (const index of [1, 0, 1, 0]) await controls.nth(index).click();
  };
}
for (const family of ['dialog', 'alert-dialog', 'drawer', 'menu', 'select']) {
  checks[family] = async (page, demo) => {
    const role = family === 'menu' ? 'menu' : family === 'select' ? 'listbox' : family === 'alert-dialog' ? 'alertdialog' : 'dialog';
    const trigger = demo.getByRole(family === 'select' ? 'combobox' : 'button').first();
    for (let index = 0; index < 3; index++) {
      await trigger.click();
      const popup = page.getByRole(role).first();
      await popup.waitFor();
      await page.keyboard.press('Escape');
      await popup.waitFor({ state: 'hidden' });
    }
  };
}
checks.toast = async (page, demo) => {
  for (let index = 1; index <= 3; index++) {
    await demo.getByRole('button', { name: 'Create toast', exact: true }).click();
    await page.getByText(`Toast ${index} created`, { exact: true }).waitFor();
    await page.getByText(`Toast ${index} created`, { exact: true }).hover();
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await page.getByText(`Toast ${index} created`, { exact: true }).waitFor({ state: 'hidden' });
  }
};
checks['checkbox-group'] = async (_page, demo) => {
  const controls = demo.getByRole('checkbox');
  for (const index of [0, 1, 2, 1, 0]) {
    const node = controls.nth(index), before = await node.getAttribute('aria-checked');
    await node.click();
    assert.notEqual(await node.getAttribute('aria-checked'), before);
  }
};
checks['number-field'] = async (page, demo) => {
  const input = demo.getByRole('textbox');
  await input.fill('118');
  assert.equal(await input.inputValue(), '118');
  for (let index = 0; index < 36; index++) await input.press(index % 2 ? 'ArrowDown' : 'ArrowUp');
  assert.equal(await input.inputValue(), '118');
  for (let index = 0; index < 12; index++) await demo.getByRole('button', { name: index % 2 ? 'Decrease' : 'Increase', exact: true }).click();
  assert.equal(await input.inputValue(), '118');
  const rect = await demo.getByRole('button', { name: 'Increase', exact: true }).boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  assert.ok(Number(await input.inputValue()) > 118);
  assert.ok(await input.evaluate(node => node.ownerDocument.activeElement === node));
};
checks.slider = async (_page, demo) => {
  const slider = demo.getByRole('slider');
  const before = Number(await slider.getAttribute('aria-valuenow'));
  await slider.focus();
  await slider.press('ArrowRight');
  assert.ok(Number(await slider.getAttribute('aria-valuenow')) > before);
  await slider.press('ArrowLeft');
  assert.equal(Number(await slider.getAttribute('aria-valuenow')), before);
};
for (const family of ['input', 'field']) {
  checks[family] = async (_page, demo) => {
    const input = demo.getByRole('textbox');
    await input.fill('Scientific interaction test');
    assert.equal(await input.inputValue(), 'Scientific interaction test');
    await input.press('Tab');
    await input.fill('');
    await input.press('Tab');
    assert.equal(await input.inputValue(), '');
  };
}
for (const family of ['combobox', 'autocomplete']) {
  checks[family] = async (page, demo) => {
    const input = demo.getByRole('combobox');
    const search = family === 'combobox' ? 'App' : 'feat';
    const label = family === 'combobox' ? 'Apple' : 'feature';
    for (let index = 0; index < 3; index++) {
      await input.fill(search);
      const option = page.getByRole('option', { name: label, exact: true });
      await option.waitFor();
      await option.click();
      assert.equal(await input.inputValue(), label);
      await input.press('Escape');
    }
  };
}
checks.toolbar = async (_page, demo) => {
  const left = demo.getByRole('button', { name: 'Align left', exact: true });
  const right = demo.getByRole('button', { name: 'Align right', exact: true });
  for (const button of [left, right, left, right]) {
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
  }
  await right.focus();
  await right.press('ArrowLeft');
  assert.ok(await left.evaluate(node => node.ownerDocument.activeElement === node));
};
try {
  for (const [family, check] of Object.entries(checks)) {
    if (selected && !selected.includes(family)) continue;
    for (const style of styles) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.setDefaultTimeout(10000);
    const diagnostics = [];
    const errors = [];
    let attributionUrl;
    page.on('response', response => { if (response.url().includes('solid-js_attribution.js')) attributionUrl = response.url(); });
    page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.stack ?? String(error)));
    const result = { family, style, interactionPassed: false, diagnostics, errors };
    let profiler;
    try {
      await page.goto(`${origin}/solid/components/${family}`);
      const host = page.locator(`[data-demo-id="${family}/hero"]`);
      const demo = host.locator('[data-demo]');
      await demo.waitFor();
      const variant = host.getByLabel('Styling method');
      if (style === 'tailwind') {
        if (!await variant.locator('option[value="tailwind"]').count()) {
          result.skipped = 'No Tailwind source variant';
          results.push(result);
          await page.close();
          continue;
        }
        await variant.selectOption(style);
        await host.locator(`[data-demo="${style}"]`).waitFor();
      }
      await demo.evaluate(node => {
        window.__interactionNodes = [...node.querySelectorAll('button,input,[role="tab"],[role="radio"],[role="switch"]')];
      });
      if (family === 'number-field') {
        if (attributionUrl) await page.evaluate(async url => { window.__interactionAttribution = await import(url); }, attributionUrl);
        profiler = await page.context().newCDPSession(page);
        await profiler.send('Profiler.enable');
        await profiler.send('Profiler.setSamplingInterval', { interval: 100 });
        await profiler.send('Profiler.start');
      }
      await check(page, demo);
      assert.ok(await demo.evaluate(node => window.__interactionNodes.every(original => node.contains(original))), 'Interaction replaced an existing control');
      result.interactionPassed = true;
    } catch (error) { errors.push(String(error)); }
    finally {
      if (profiler) {
        const { profile } = await profiler.send('Profiler.stop');
        const nodes = new Map(profile.nodes.map(node => [node.id, node]));
        const samples = new Map();
        for (let index = 0; index < profile.samples.length; index++) {
          const frame = nodes.get(profile.samples[index]).callFrame;
          const key = `${frame.functionName} ${frame.url}:${frame.lineNumber}`;
          samples.set(key, (samples.get(key) ?? 0) + (profile.timeDeltas[index] ?? 0));
        }
        result.profile = [...samples].filter(([frame]) => frame.includes('/packages/solid/')).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([frame, us]) => ({ frame, ms: us / 1000 }));
        result.costs = await page.evaluate(() => window.__interactionAttribution?.costs?.());
      }
    }
    await page.waitForTimeout(100);
    result.diagnostics = [...new Set(diagnostics)];
    result.passed = result.interactionPassed && errors.length === 0 && diagnostics.length === 0;
    results.push(result);
    // Evidence retains the full diagnostics. These measurements are classified,
    // never filtered or used to turn a warning-bearing result green.
    result.layoutMeasurements = result.diagnostics.filter(message => ['accordion', 'collapsible'].includes(family) &&
      message.startsWith('[EFFECT_RELAY_TEAR]') && message.includes('createCollapsiblePanel.dimensions') && message.includes('<NativeHost>'));
    console.log(JSON.stringify({ family, style, passed: result.passed, interactionPassed: result.interactionPassed,
      diagnostics: result.diagnostics.map(message => message.split('\n')[0]), errors }));
    await page.close();
    }
  }
} finally { await browser.close(); }
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(results, null, 2) + '\n');
console.log(`Evidence: ${output}`);
if (results.some(result => !result.passed)) process.exitCode = 1;
