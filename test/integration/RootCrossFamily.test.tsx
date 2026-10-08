import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, flushMicrotasks, waitFor } from '../../packages/solid/test';
import { Toolbar, ToggleGroup, Toggle, DirectionProvider, Form, Field, Fieldset, Input, NumberField, Checkbox, CheckboxGroup, Radio, RadioGroup, Dialog, Button, Tooltip, Menu, Select, Combobox, CSPProvider, ScrollArea } from '../../packages/solid/src/index';
import { Switch } from 'baseui-solid2/switch';
import { useDirection, type TextDirection } from '../../packages/solid/src/internals/direction-context';

const { render, renderProps } = createRenderer();

describe('Root integration real cross-family replay', () => {
  // Pinned DirectionProvider.test.tsx: native accessor consumption replaces React's value read.
  function DirectionProbe() {
    const direction = useDirection();
    return <span data-testid="direction">{direction()}</span>;
  }

  it('defaults useDirection to ltr outside a provider', async () => {
    const view = await render(() => <DirectionProbe />);
    expect(view.getByTestId('direction')).toHaveTextContent('ltr');
  });

  it('provides the configured direction to descendants', async () => {
    const view = await renderProps((props: { direction: TextDirection }) => (
      <DirectionProvider direction={props.direction}><DirectionProbe /></DirectionProvider>
    ), { direction: 'rtl' });
    const probe = view.getByTestId('direction');
    expect(probe).toHaveTextContent('rtl');
    await view.setProps({ direction: 'ltr' });
    expect(view.getByTestId('direction')).toBe(probe);
    expect(probe).toHaveTextContent('ltr');
  });

  // Pinned Toggle.test.tsx: cancellation in a grouped Toggle prevents group change.
  it('preserves grouped cancellation inside a real RTL Toolbar without replacing hosts', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) =>
      <DirectionProvider direction="rtl"><Toolbar.Root>
        <ToggleGroup onValueChange={change} disabled={props.disabled}>
          <Toggle value="one" onPressedChange={(_value, details) => details.cancel()}>one</Toggle>
          <Toggle value="two">two</Toggle>
        </ToggleGroup>
        <Toolbar.Button>last</Toolbar.Button>
      </Toolbar.Root></DirectionProvider>, { disabled: false });
    const one = view.getByRole('button', { name: 'one' });
    const two = view.getByRole('button', { name: 'two' });
    await view.user.click(one);
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('[ArrowLeft]');
    expect(two).toHaveFocus();
    await view.user.keyboard('[Space]');
    expect(change).toHaveBeenCalledWith(['two'], expect.objectContaining({ reason: 'none' }));
    expect(two).toHaveAttribute('aria-pressed', 'true');
    await view.setProps({ disabled: true });
    expect(view.getByRole('button', { name: 'two' })).toBe(two);
    await view.user.click(two);
    expect(change).toHaveBeenCalledTimes(1);
  });

  // Pinned Form.test.tsx: disabled fieldsets excluded; typed NumberField projection.
  it('submits current real Input/NumberField/Switch values and omits disabled Fieldset fields', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="username"><Input defaultValue="alice132" /></Field.Root>
      <Field.Root name="quantity"><NumberField.Root defaultValue={5}><NumberField.Input /></NumberField.Root></Field.Root>
      <Field.Root name="enabled"><Switch.Root defaultChecked /></Field.Root>
      <Fieldset.Root disabled><Field.Root name="disabled"><Field.Control required /></Field.Root></Fieldset.Root>
      <Button type="submit">submit</Button>
    </Form>);
    await view.user.click(view.getByRole('button', { name: 'submit' }));
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual({ username: 'alice132', quantity: 5, enabled: true });
    expect(submitted.mock.lastCall?.[1].event.defaultPrevented).toBe(true);
  });

  // Pinned Form.test.tsx: real controls in disconnected/portal trees still validate.
  it('validates and focuses an actual Checkbox in a Dialog portal using Form context', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form data-testid="form" onFormSubmit={submitted}>
      <Dialog.Root defaultOpen modal={false}>
        <Dialog.Portal><Dialog.Popup><Dialog.Title>Consent</Dialog.Title>
          <Field.Root name="consent"><Checkbox.Root required data-testid="consent" />
            <Field.Error data-testid="error" /></Field.Root>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>
    </Form>);
    const checkbox = await waitFor(() => view.getByTestId('consent'));
    const form = view.getByTestId('form');
    expect(form.contains(checkbox)).toBe(false);
    fireEvent.submit(form);
    expect(submitted).not.toHaveBeenCalled();
    expect(checkbox).toHaveFocus();
    await flushMicrotasks();
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toBeInTheDocument();
    await view.user.click(checkbox);
    fireEvent.submit(form);
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual({ consent: true });
  });

  // Pinned CheckboxGroup.test.tsx: logical validation value vs enabled projection.
  it('validates the logical CheckboxGroup value but submits only enabled registered children', async () => {
    const submitted = vi.fn();
    const validate = vi.fn(() => null);
    const view = await renderProps((props: { disabled: boolean }) => <Form onFormSubmit={submitted}>
      <Field.Root name="fruits" validate={validate}><CheckboxGroup defaultValue={['apple', 'banana']}>
        <Checkbox.Root value="apple" aria-label="Apple" />
        <Checkbox.Root value="banana" disabled={props.disabled} aria-label="Banana" />
      </CheckboxGroup></Field.Root>
      <Button type="submit">submit</Button>
    </Form>, { disabled: true });
    await view.user.click(view.getByRole('button', { name: 'submit' }));
    expect(validate).toHaveBeenLastCalledWith(['apple', 'banana'], { fruits: ['apple'] });
    expect(submitted.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('button', { name: 'submit' }));
    expect(validate).toHaveBeenLastCalledWith(['apple', 'banana'], { fruits: ['apple', 'banana'] });
    expect(submitted.mock.lastCall?.[0]).toEqual({ fruits: ['apple', 'banana'] });
  });

  // Pinned RadioGroup.test.tsx: required native constraint clears on selection.
  it('blocks a required real RadioGroup then clears Field validity and projects its selection', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="choice"><RadioGroup required>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
      </RadioGroup><Field.Error match="valueMissing">required</Field.Error></Field.Root>
      <Button type="submit">submit</Button>
    </Form>);
    await view.user.click(view.getByRole('button', { name: 'submit' }));
    expect(submitted).not.toHaveBeenCalled();
    expect(view.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByText('required')).toBeInTheDocument();
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    expect(view.queryByText('required')).toBeNull();
    expect(view.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid', 'true');
    await view.user.click(view.getByRole('button', { name: 'submit' }));
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual({ choice: 'b' });
  });

  // Pinned TooltipTrigger.test.tsx: a custom rendered trigger owns its actual ID.
  it('opens a Tooltip through a real Button render callback and retains custom trigger identity', async () => {
    const changed = vi.fn();
    const view = await render(() => <Tooltip.Root onOpenChange={changed}>
      <Tooltip.Trigger render={(attributes) => <Button {...attributes} id="custom-trigger" />}>Help</Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="tip">Help text</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>);
    const trigger = view.getByRole('button', { name: 'Help' });
    await view.user.tab();
    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
    expect(trigger).toHaveAttribute('id', 'custom-trigger');
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-focus', trigger }));
    expect(view.getByTestId('tip')).toHaveTextContent('Help text');
    expect(view.getByRole('button', { name: 'Help' })).toBe(trigger);
  });

  it('dismisses nested real Menu/Select/Combobox popups without closing their Dialog', async () => {
    const dialogChange = vi.fn();
    const view = await render(() => <Dialog.Root defaultOpen modal={false} onOpenChange={dialogChange}>
      <Dialog.Portal><Dialog.Popup><Dialog.Title>Editor</Dialog.Title>
        <Menu.Root><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
        <Select.Root><Select.Trigger aria-label="Fruit">Choose</Select.Trigger><Select.Portal>
          <Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.List>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.List></Select.Popup></Select.Positioner>
        </Select.Portal></Select.Root>
        <Combobox.Root items={['Alice', 'Bob']}><Combobox.Input aria-label="Person" /><Combobox.Portal>
          <Combobox.Positioner><Combobox.Popup><Combobox.List>
            {(person: string) => <Combobox.Item value={person}>{person}</Combobox.Item>}
          </Combobox.List></Combobox.Popup></Combobox.Positioner>
        </Combobox.Portal></Combobox.Root>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const dialog = view.getByRole('dialog');
    await view.user.click(view.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(view.getByRole('menu')).toBeInTheDocument());
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('menu')).toBeNull());
    expect(view.getByRole('dialog')).toBe(dialog);
    for (const name of ['Fruit', 'Person']) {
      const trigger = view.getByRole('combobox', { name });
      await view.user.click(trigger);
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
      await view.user.keyboard('{Escape}');
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
      expect(view.getByRole('dialog')).toBe(dialog);
    }
    expect(dialogChange).not.toHaveBeenCalled();
  });

  it('shares live CSP policy with real ScrollArea style elements', async () => {
    const view = await renderProps((props: { nonce: string; disabled: boolean }) =>
      <CSPProvider nonce={props.nonce} disableStyleElements={props.disabled}>
        <ScrollArea.Root><ScrollArea.Viewport><ScrollArea.Content>Content</ScrollArea.Content></ScrollArea.Viewport></ScrollArea.Root>
      </CSPProvider>, { nonce: 'first-nonce', disabled: false });
    const styles = () => [...view.container.ownerDocument.querySelectorAll<HTMLStyleElement>('style[data-base-ui-style="base-ui-disable-scrollbar"]')];
    expect(styles().length).toBeGreaterThan(0);
    for (const style of styles()) expect(style.nonce).toBe('first-nonce');
    await view.setProps({ nonce: 'second-nonce' });
    for (const style of styles()) expect(style.nonce).toBe('second-nonce');
    await view.setProps({ disabled: true });
    expect(styles()).toHaveLength(0);
  });

  // Pinned CSPProvider.test.tsx: absence must hold on initial mount, including Select portals.
  it('does not render inline style tags when disableStyleElements is true', async () => {
    await render(() => <CSPProvider disableStyleElements>
      <ScrollArea.Root><ScrollArea.Viewport /></ScrollArea.Root>
    </CSPProvider>);
    expect([...document.querySelectorAll('style')].find((style) =>
      style.textContent?.includes('.base-ui-disable-scrollbar')) ?? null).toBeNull();
  });

  it('does not render Select inline style tags when disableStyleElements is true', async () => {
    await render(() => <CSPProvider disableStyleElements><Select.Root defaultOpen>
      <Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner><Select.Popup>
        <Select.Item value="a">a</Select.Item>
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root></CSPProvider>);
    expect([...document.querySelectorAll('style')].find((style) =>
      style.textContent?.includes('.base-ui-disable-scrollbar')) ?? null).toBeNull();
  });

  it('renders inline style tags by default', async () => {
    await render(() => <ScrollArea.Root><ScrollArea.Viewport /></ScrollArea.Root>);
    expect([...document.querySelectorAll('style')].find((style) =>
      style.textContent?.includes('.base-ui-disable-scrollbar')) ?? null).not.toBeNull();
  });
});
