import assert from 'node:assert/strict';

const source = (family, file, cases) => ({ source: `packages/react/src/${family}/${file}`, cases });
export const scenarios = [
  { id: 'button', ...source('button', 'Button.test.tsx', ['button conformance: keyboard activation']), run: button },
  { id: 'button-custom', ...source('button', 'Button.test.tsx', ['custom element: applies button semantics and dispatches real clicks from keyboard activation']), run: button },
  { id: 'button-disabled', ...source('button', 'Button.test.tsx', ['native button: prevents interactions but remains focusable']), run: button },
  { id: 'toggle', ...source('toggle', 'Toggle.test.tsx', ['pressed state > uncontrolled', 'is called when the pressed state changes']), run: toggle },
  { id: 'toggle-cancel', ...source('toggle', 'Toggle.test.tsx', ['does not change the pressed state when the event is canceled']), run: toggle },
  { id: 'form', ...source('form', 'Form.test.tsx', ['does not submit if there are errors', 'prop: onFormSubmit']), run: form },
  { id: 'dialog', ...source('dialog', 'root/DialogRoot.test.tsx', ['calls onOpenChange with the reason for change when pressed Esc while the dialog is open', 'detects clicks on user backdrop']), run: dialog },
  { id: 'dialog-cancel', ...source('dialog', 'root/DialogRoot.test.tsx', ['cancel() prevents opening while uncontrolled']), run: canceledPopup },
  { id: 'dialog-pointerdown', ...source('dialog', 'root/DialogRoot.test.tsx', ['ignores a native click whose pointerdown opened the dialog']), browsers: ['chromium'], restriction: 'Canonical source restricts trusted gesture to Blink', run: pointerDownDialog },
  { id: 'select', ...source('select', 'root/SelectRoot.test.tsx', ['should call onValueChange when an item is selected', 'is not called twice on select']), run: select },
  { id: 'select-cancel', ...source('select', 'root/SelectRoot.test.tsx', ['onOpenChange cancel() prevents opening while uncontrolled']), run: canceledPopup },
  { id: 'combobox', ...source('combobox', 'root/ComboboxRoot.test.tsx', ['opens, navigates with ArrowDown, and Enter selects']), run: combobox },
  { id: 'combobox-escape', ...source('combobox', 'root/ComboboxRoot.test.tsx', ['Escape closes the popup without committing when nothing highlighted']), run: comboboxEscape },
  { id: 'tooltip', ...source('tooltip', 'root/TooltipRoot.test.tsx', ['should open when the trigger is hovered', 'should close when the trigger is unhovered', 'should open when the trigger is focused', 'should close when the trigger is blurred']), run: tooltip },
];

async function button({ page, checkpoint, id }) {
  const trigger = page.getByTestId('trigger');
  await page.keyboard.press('Tab');
  assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
  if (id === 'button-custom') {
    assert.equal(await trigger.evaluate((node) => node.tagName), 'SPAN');
    assert.equal(await trigger.getAttribute('role'), 'button');
    assert.equal(await trigger.getAttribute('tabindex'), '0');
  }
  if (id === 'button-disabled') assert.equal(await trigger.getAttribute('aria-disabled'), 'true');
  await checkpoint('focused');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  const log = await page.evaluate(() => window.__qualification.log);
  const activation = id === 'button-custom' ? ['capture-click', 'render-click', 'button-click', 'ancestor-click']
    : ['button-click', 'ancestor-click'];
  assert.deepEqual(log.map((entry) => entry.callback), id === 'button-disabled' ? [] : [...activation, ...activation]);
  await checkpoint('keyboard-activated');
  if (id !== 'button-disabled') {
    await trigger.click();
    assert.deepEqual((await page.evaluate(() => window.__qualification.log)).map((entry) => entry.callback), [...activation, ...activation, ...activation]);
    await checkpoint('pointer-activated');
  }
}

async function toggle({ page, checkpoint, id }) {
  const trigger = page.getByTestId('trigger');
  assert.equal(await trigger.getAttribute('aria-pressed'), 'false');
  await trigger.click();
  await page.waitForFunction((pressed) => document.querySelector('[data-testid="trigger"]')?.getAttribute('aria-pressed') === pressed,
    id === 'toggle-cancel' ? 'false' : 'true');
  assert.equal((await page.evaluate(() => window.__qualification.log)).filter((entry) => entry.callback === 'pressed').length, 1);
  await checkpoint('pointer-toggle');
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('[data-testid="trigger"]')?.getAttribute('aria-pressed') === 'false');
  assert.equal((await page.evaluate(() => window.__qualification.log)).filter((entry) => entry.callback === 'pressed').length, 2);
  await checkpoint('keyboard-toggle');
}

async function form({ page, checkpoint }) {
  await page.getByTestId('submit').click();
  await page.getByTestId('error').waitFor({ state: 'visible' });
  assert.equal(await page.getByTestId('input').evaluate((node) => node === document.activeElement), true);
  assert.deepEqual(await page.evaluate(() => window.__qualification.log), []);
  await checkpoint('invalid-submit');
  await page.getByTestId('input').pressSequentially('Ada');
  await page.getByTestId('submit').click();
  await page.waitForFunction(() => window.__qualification.log.some((entry) => entry.callback === 'form-submit'));
  const log = await page.evaluate(() => window.__qualification.log);
  assert.deepEqual(log.map((entry) => entry.callback), ['submit', 'form-submit']);
  assert.deepEqual(log[0].value, [['name', 'Ada']]);
  assert.deepEqual(log[1].value, { name: 'Ada' });
  await checkpoint('valid-submit');
}

async function dialog({ page, checkpoint }) {
  await page.getByTestId('trigger').click();
  await page.getByRole('dialog', { name: 'Example' }).waitFor();
  await page.waitForFunction(() => window.__qualification.log.some((entry) => entry.callback === 'open-complete' && entry.value === true));
  assert.equal(await page.getByTestId('trigger').getAttribute('aria-expanded'), 'true');
  // Pinned DialogPopup intentionally uses focus-manager inertness, not aria-modal.
  assert.equal(await page.getByTestId('popup').getAttribute('aria-modal'), null);
  assert.equal(await page.getByTestId('popup').evaluate((node) =>
    document.getElementById(node.getAttribute('aria-describedby'))?.textContent), 'Dialog content');
  await checkpoint('opened');
  await page.keyboard.press('Escape');
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-testid="trigger"]'));
  assert.equal((await page.evaluate(() => window.__qualification.log)).find((entry) => entry.callback === 'open' && entry.value === false)?.reason, 'escape-key');
  await checkpoint('escape-focus-return');
  await page.getByTestId('trigger').click();
  await page.getByTestId('popup').waitFor({ state: 'visible' });
  await checkpoint('reopened');
  // Trusted native press on the user backdrop, away from the popup.
  await page.getByTestId('backdrop').click({ position: { x: 10, y: 10 } });
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  assert.equal((await page.evaluate(() => window.__qualification.log)).filter((entry) => entry.callback === 'open').at(-1)?.reason, 'outside-press');
  await checkpoint('outside-dismiss');
}

async function canceledPopup({ page, checkpoint }) {
  await page.getByTestId('trigger').click();
  await page.waitForFunction(() => window.__qualification.log.some((entry) => entry.callback === 'open'));
  // Source queryByRole excludes hidden force-mounted Select content; preserve it in DOM evidence.
  assert.equal(await page.getByRole('listbox').count() + await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByTestId('popup').isVisible(), false);
  assert.equal(await page.getByTestId('trigger').getAttribute('aria-expanded'), 'false');
  const log = await page.evaluate(() => window.__qualification.log);
  assert.equal(log.filter((entry) => entry.callback === 'open').length, 1);
  assert.equal(log[0].canceled, true);
  await checkpoint('canceled-open');
}

async function pointerDownDialog({ page, checkpoint }) {
  const bounds = await page.getByTestId('trigger').boundingBox();
  assert.ok(bounds);
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.getByTestId('popup').waitFor({ state: 'visible' });
  await page.mouse.up();
  await page.waitForFunction(() => window.__qualificationNativeEvents.some((event) => event.type === 'click' && event.trusted));
  const first = await page.evaluate(() => window.__qualificationNativeEvents.find((event) => event.type === 'click' && event.trusted));
  assert.notEqual(first.target, 'trigger');
  assert.equal(first.insidePopup, false);
  assert.equal(await page.getByTestId('popup').isVisible(), true);
  assert.equal((await page.evaluate(() => window.__qualification.log)).some((entry) => entry.value === false && entry.reason === 'outside-press'), false);
  await checkpoint('opening-gesture-ignored');
  await page.mouse.down();
  await page.mouse.up();
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  assert.equal((await page.evaluate(() => window.__qualification.log)).at(-1)?.reason, 'outside-press');
  await checkpoint('fresh-gesture-dismisses');
}

async function select({ page, checkpoint }) {
  await page.getByTestId('trigger').click();
  await page.getByRole('listbox').waitFor();
  await checkpoint('opened');
  await page.getByRole('option', { name: 'b', exact: true }).click();
  // Select.Trigger's native focus intentionally force-mounts its items even after closing.
  await page.getByTestId('popup').waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('listbox').count(), 0);
  await page.waitForFunction(() => document.querySelector('[data-testid="value"]')?.textContent === 'b');
  const changes = (await page.evaluate(() => window.__qualification.log)).filter((entry) => entry.callback === 'value');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].value, 'b');
  assert.deepEqual(await page.getByTestId('form').evaluate((node) => [...new FormData(node).entries()]), [['choice', 'b']]);
  await checkpoint('selected-form-projection');
}

async function combobox({ page, checkpoint }) {
  await page.getByTestId('input').click();
  await page.getByRole('listbox').waitFor();
  await checkpoint('opened');
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => {
    const input = document.querySelector('[data-testid="input"]');
    return document.getElementById(input?.getAttribute('aria-activedescendant') ?? '')?.textContent === 'apple';
  });
  await checkpoint('keyboard-highlight');
  await page.keyboard.press('Enter');
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  assert.equal(await page.getByTestId('input').inputValue(), 'apple');
  assert.deepEqual(await page.getByTestId('form').evaluate((node) => [...new FormData(node).entries()]), [['fruit', 'apple']]);
  await checkpoint('keyboard-selection');
}

async function comboboxEscape({ page, checkpoint }) {
  await page.getByRole('listbox').waitFor();
  assert.equal(await page.getByTestId('input').inputValue(), '');
  await page.keyboard.press('Escape');
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  assert.equal(await page.getByTestId('input').inputValue(), '');
  assert.equal((await page.evaluate(() => window.__qualification.log)).some((entry) => entry.callback === 'value'), false);
  await checkpoint('escape-uncommitted-query');
}

async function tooltip({ page, checkpoint }) {
  await page.getByTestId('trigger').hover();
  await page.getByTestId('popup').waitFor({ state: 'visible' });
  await checkpoint('hover-open');
  await page.mouse.move(900, 700);
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  await checkpoint('unhover-close');
  await page.keyboard.press('Tab');
  await page.getByTestId('popup').waitFor({ state: 'visible' });
  assert.equal(await page.getByTestId('trigger').evaluate((node) => node === document.activeElement), true);
  await checkpoint('keyboard-focus-open');
  await page.keyboard.press('Tab');
  await page.getByTestId('popup').waitFor({ state: 'detached' });
  assert.equal(await page.getByTestId('after').evaluate((node) => node === document.activeElement), true);
  await checkpoint('blur-close');
}
