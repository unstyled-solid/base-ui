import assert from 'node:assert/strict';

const testid = (page, id) => page.getByTestId(id);
async function attribute(page, id, name, value) {
  await page.waitForFunction(({ id, name, value }) => document.querySelector(`[data-testid="${id}"]`)?.getAttribute(name) === value, { id, name, value });
}
async function focused(page, id) {
  await page.waitForFunction((id) => document.activeElement === document.querySelector(`[data-testid="${id}"]`), id);
}
// Actual Tab dispatch to enter controls, bounded search fails rather than programmatic focusing.
async function tabTo(page, id) {
  for (let n = 0; n < 30; n++) {
    if (await testid(page, id).evaluate((node) => node === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Keyboard cannot reach ${id} in 30 tabs`);
}
async function relationship(page, id, attr, expectedText) {
  const text = await testid(page, id).evaluate((node, attr) => {
    const ids = node.getAttribute(attr)?.split(/\s+/).filter(Boolean) ?? [];
    if (!ids.length || ids.some((id) => !document.getElementById(id))) throw new Error(`Missing/dangling ${attr}`);
    return ids.map((id) => document.getElementById(id).textContent).join(' ');
  }, attr);
  if (expectedText) assert.match(text, expectedText);
}
async function visible(page, id) {
  await testid(page, id).waitFor({ state: 'visible' });
  assert.ok(await testid(page, id).evaluate((node) => {
    const r = node.getBoundingClientRect(), s = getComputedStyle(node);
    return r.width > 0 && r.height > 0 && Number(s.opacity) > 0 && s.visibility === 'visible';
  }), `${id} must have visible nonzero geometry`);
}
async function identity(page, id, work) {
  const original = await testid(page, id).elementHandle();
  assert.ok(original, `Missing original control ${id}`);
  try {
    await work();
    const stable = await original.evaluate((node, id) => node.isConnected && node === document.querySelector(`[data-testid="${id}"]`), id);
    await page.evaluate(({ id, stable }) => window.__a11yIdentity.push({ control: id, originalHostRetained: stable }), { id, stable });
    assert.equal(stable, true,
      `Original ${id} host replaced`);
  } finally { await original.dispose(); }
}

export async function runScenario({ page, scenario, environment, checkpoint, browser }) {
  const rtl = environment === 'rtl';
  await tabTo(page, 'before');
  await checkpoint('initial');
  switch (scenario) {
    case 'button':
      await page.keyboard.press('Tab'); await focused(page, 'control');
      assert.equal(await page.getByRole('button', { name: 'Save', exact: true }).count(), 1);
      await identity(page, 'control', async () => {
        await page.keyboard.press('Enter'); await page.keyboard.press('Space');
        assert.equal(await page.evaluate(() => window.__a11y.events.filter((r) => r.kind === 'activate').length), 2);
      });
      await page.keyboard.press('Tab'); await focused(page, 'custom');
      await identity(page, 'custom', async () => { await page.keyboard.press('Enter'); await page.keyboard.press('Space'); });
      assert.equal(await page.evaluate(() => window.__a11y.events.filter((r) => r.kind === 'custom').length), 2);
      assert.equal(await page.evaluate(() => window.__a11y.events.some((r) => r.kind === 'disabled')), false);
      break;
    case 'toggle':
      await tabTo(page, 'control');
      await identity(page, 'control', async () => {
        await page.keyboard.press('Space'); await attribute(page, 'control', 'aria-pressed', 'true');
        await page.keyboard.press('Space'); await attribute(page, 'control', 'aria-pressed', 'false');
      });
      await tabTo(page, 'cancel'); await page.keyboard.press('Space'); await attribute(page, 'cancel', 'aria-pressed', 'false');
      await page.keyboard.press('Tab'); await focused(page, 'after');
      break;
    case 'checks':
      for (const [id, role, name] of [['checkbox', 'checkbox', 'Accept terms'], ['switch', 'switch', 'Notifications']]) {
        assert.equal(await page.getByRole(role, { name, exact: true }).count(), 1);
        await tabTo(page, id); await identity(page, id, async () => {
          await page.keyboard.press('Space'); await attribute(page, id, 'aria-checked', 'true');
        });
      }
      await attribute(page, 'checkbox', 'aria-required', 'true');
      for (const id of ['readonly-check', 'readonly-switch']) {
        await tabTo(page, id); await page.keyboard.press('Space'); await attribute(page, id, 'aria-checked', 'false');
      }
      await page.keyboard.press('Tab'); await focused(page, 'after');
      for (const id of ['disabled-check', 'disabled-switch']) await attribute(page, id, 'aria-disabled', 'true');
      break;
    case 'radio':
      assert.equal(await page.getByRole('radiogroup', { name: 'Fruit', exact: true }).count(), 1);
      await tabTo(page, 'apple');
      await identity(page, 'apple', async () => {
        await page.keyboard.press('ArrowDown'); await focused(page, 'banana'); await attribute(page, 'banana', 'aria-checked', 'true');
        await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await focused(page, 'cherry');
        await attribute(page, 'cherry', 'aria-checked', 'true');
      });
      await tabTo(page, 'unselected-radio'); await page.keyboard.press('Enter'); await attribute(page, 'unselected-radio', 'aria-checked', 'false');
      await page.keyboard.down('Space'); await attribute(page, 'unselected-radio', 'aria-checked', 'false');
      await page.keyboard.up('Space'); await attribute(page, 'unselected-radio', 'aria-checked', 'true');
      await tabTo(page, 'readonly-radio');
      await attribute(page, 'readonly-group', 'aria-readonly', 'true');
      await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await attribute(page, 'readonly-radio', 'aria-checked', 'false');
      await attribute(page, 'disabled-group', 'aria-disabled', 'true');
      await page.keyboard.press('Tab'); await focused(page, 'after');
      break;
    case 'tabs':
      await tabTo(page, 'tab-a'); await relationship(page, 'tab-a', 'aria-controls', /Overview content/);
      await relationship(page, 'panel-a', 'aria-labelledby', /Overview/);
      await identity(page, 'tab-a', async () => {
        await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await focused(page, 'tab-b');
        await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await focused(page, 'tab-disabled');
        await page.keyboard.press('Space'); await attribute(page, 'tab-disabled', 'aria-selected', 'false');
        await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft'); await focused(page, 'tab-b');
        await page.evaluate(() => window.__a11y.removeItem());
        await page.waitForFunction(() => !document.querySelector('[data-testid="tab-b"]'));
        await attribute(page, 'tab-a', 'tabindex', '0');
        await tabTo(page, 'tab-a'); await page.keyboard.press('End'); await focused(page, 'tab-c');
        await page.keyboard.press('Enter'); await attribute(page, 'tab-c', 'aria-selected', 'true');
      });
      break;
    case 'accordion':
      await tabTo(page, 'control'); await identity(page, 'control', async () => {
        await page.keyboard.press('Space'); await attribute(page, 'control', 'aria-expanded', 'true');
        await visible(page, 'panel'); await relationship(page, 'control', 'aria-controls', /Ships tomorrow/);
        await checkpoint('expanded');
        await page.keyboard.press('Space'); await attribute(page, 'control', 'aria-expanded', 'false');
        assert.equal(await page.getByText('Ships tomorrow').isVisible(), false);
      });
      await page.keyboard.press('Tab'); await focused(page, 'after');
      break;
    case 'form':
      assert.equal(await page.getByRole('textbox', { name: 'Custom name', exact: true }).count(), 1);
      assert.equal(await page.getByRole('group', { name: 'Account', exact: true }).count(), 1);
      await relationship(page, 'control', 'aria-describedby', /Enter ok/);
      await tabTo(page, 'control');
      await identity(page, 'control', async () => {
        await tabTo(page, 'readonly'); await page.keyboard.type('ignored'); assert.equal(await testid(page, 'readonly').inputValue(), 'fixed');
        await page.keyboard.press('Tab'); await focused(page, 'submit'); await page.keyboard.press('Enter');
        await focused(page, 'control'); await attribute(page, 'control', 'aria-invalid', 'true');
        await relationship(page, 'control', 'aria-describedby', /Use ok/); await visible(page, 'custom-error');
        await checkpoint('invalid');
        await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('ok');
        assert.equal(await testid(page, 'control').inputValue(), 'ok');
        assert.deepEqual(await testid(page, 'control').evaluate((node) => [node.selectionStart, node.selectionEnd]), [2, 2]);
        await tabTo(page, 'submit'); await page.keyboard.press('Enter'); await focused(page, 'required');
        await attribute(page, 'required', 'aria-invalid', 'true');
        assert.equal(await page.evaluate(() => window.__a11y.events.filter((r) => r.kind === 'submit').length), 0);
      });
      break;
    case 'dialog':
      await tabTo(page, 'control'); await identity(page, 'control', async () => {
        await page.keyboard.press('Enter'); await visible(page, 'outer'); await focused(page, 'outer-input');
        await relationship(page, 'outer', 'aria-labelledby', /Account settings/);
        await relationship(page, 'outer', 'aria-describedby', /Edit account settings/);
        await attribute(page, 'outer', 'role', 'dialog');
        for (let n = 0; n < 5; n++) { await page.keyboard.press('Tab'); assert.equal(await testid(page, 'outer').evaluate((node) => node.contains(document.activeElement)), true); }
        await tabTo(page, 'inner-trigger'); await page.keyboard.press('Enter'); await visible(page, 'inner'); await focused(page, 'inner-input');
        await relationship(page, 'inner', 'aria-labelledby', /Confirm change/);
        await checkpoint('nested');
        await page.keyboard.press('Escape'); await testid(page, 'inner').waitFor({ state: 'hidden' }); await focused(page, 'inner-trigger');
        await visible(page, 'outer'); await page.keyboard.press('Escape'); await testid(page, 'outer').waitFor({ state: 'hidden' }); await focused(page, 'control');
      });
      break;
    case 'combobox':
      await tabTo(page, 'control');
      assert.equal(await page.getByRole('combobox', { name: 'Choose fruit', exact: true }).count(), 1);
      await identity(page, 'control', async () => {
        await page.keyboard.press('ArrowDown'); await visible(page, 'popup'); await attribute(page, 'control', 'aria-expanded', 'true');
        await relationship(page, 'control', 'aria-controls');
        await page.keyboard.press('ArrowDown'); await relationship(page, 'control', 'aria-activedescendant', /banana/);
        await checkpoint('highlighted'); await page.evaluate(() => window.__a11y.removeItem());
        await page.waitForFunction(() => !document.querySelector('[data-testid="banana"]'));
        const active = await testid(page, 'control').getAttribute('aria-activedescendant');
        if (active) await relationship(page, 'control', 'aria-activedescendant');
        await page.keyboard.press('Escape'); await attribute(page, 'control', 'aria-expanded', 'false'); await focused(page, 'control');
        await page.keyboard.type('apple'); await page.keyboard.press('Home');
        assert.equal(await testid(page, 'control').evaluate((node) => node.selectionStart), rtl && browser === 'firefox' ? 5 : 0);
        await page.keyboard.press('End');
        assert.equal(await testid(page, 'control').evaluate((node) => node.selectionStart), rtl && browser === 'firefox' ? 0 : 5);
      });
      break;
    case 'select':
      await tabTo(page, 'control'); await identity(page, 'control', async () => {
        await page.keyboard.press('ArrowDown'); await visible(page, 'popup'); await attribute(page, 'control', 'aria-expanded', 'true');
        assert.equal(await page.getByRole('listbox').count(), 1); assert.equal(await page.getByRole('option').count(), 2);
        await page.keyboard.press('End'); await page.keyboard.press('Enter'); await focused(page, 'control');
        assert.match(await testid(page, 'control').innerText(), /Banana/);
        await page.keyboard.press('Enter'); await visible(page, 'popup'); await page.keyboard.press('Escape'); await focused(page, 'control');
      });
      break;
    case 'toast':
      await tabTo(page, 'add-low'); await page.keyboard.press('Enter'); await visible(page, 'toast-low');
      await relationship(page, 'toast-low', 'aria-labelledby', /Saved/); await relationship(page, 'toast-low', 'aria-describedby', /Changes saved/);
      await page.waitForFunction(() => [...document.querySelectorAll('[aria-live="polite"], [role="status"]')].some((node) => /Saved/.test(node.textContent)));
      await checkpoint('polite'); await tabTo(page, 'add-high'); await page.keyboard.press('Enter');
      await page.waitForFunction(() => [...document.querySelectorAll('[aria-live="assertive"], [role="alert"]')].some((node) => /Failed/.test(node.textContent)));
      await checkpoint('assertive');
      // The viewport hotkey is a separate canonical contract retained as an open source row.
      await tabTo(page, 'toast-low'); await page.keyboard.press('Escape'); await testid(page, 'toast-low').waitFor({ state: 'hidden' });
      break;
    case 'ranges':
      for (const [id, role, name, value] of [['progress', 'progressbar', 'Upload', '40'], ['meter', 'meter', 'Storage', '60']]) {
        assert.equal(await page.getByRole(role, { name, exact: true }).count(), 1);
        await visible(page, id); await attribute(page, id, 'aria-valuenow', value);
        await attribute(page, id, 'aria-valuemin', '0'); await attribute(page, id, 'aria-valuemax', '100');
      }
      await attribute(page, 'separator', 'aria-orientation', 'vertical');
      await page.keyboard.press('Tab'); await focused(page, 'after');
      break;
    default: throw new Error(`Missing actions for ${scenario}`);
  }
  await checkpoint('final');
}
