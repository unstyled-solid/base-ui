import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { Combobox } from '../index';

// Pinned AriaCombobox role props, triggerStateAttributesMapping, and
// FOCUSABLE_POPUP_PROPS; assertions inspect the real native attributes.
describe('Combobox source attribute parity', () => {
  const { render, renderProps } = createRenderer();

  it('retains the input-like spelling defaults and allows consumer overrides', async () => {
    const view = await renderProps(
      (props: { spellcheck?: 'true' | 'false' }) => <Combobox.Root>
        <Combobox.Input {...props} />
      </Combobox.Root>,
      {},
    );
    const input = view.getByRole('combobox');
    expect(input).toHaveAttribute('spellcheck', 'false');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    await view.setProps({ spellcheck: 'true' });
    expect(view.getByRole('combobox')).toBe(input);
    expect(input).toHaveAttribute('spellcheck', 'true');
    await view.setProps({ spellcheck: undefined });
    expect(input).not.toHaveAttribute('spellcheck');
  });

  it('adds and removes both pressable attributes on the same input host', async () => {
    const view = await renderProps(
      (props: { open: boolean }) => <Combobox.Root open={props.open}>
        <Combobox.Input />
      </Combobox.Root>,
      { open: false },
    );
    const input = view.getByRole('combobox');
    expect(input).not.toHaveAttribute('data-popup-open');
    expect(input).not.toHaveAttribute('data-pressed');
    await view.setProps({ open: true });
    expect(view.getByRole('combobox')).toBe(input);
    expect(input).toHaveAttribute('data-popup-open', '');
    expect(input).toHaveAttribute('data-pressed', '');
    await view.setProps({ open: false });
    expect(view.getByRole('combobox')).toBe(input);
    expect(input).not.toHaveAttribute('data-popup-open');
    expect(input).not.toHaveAttribute('data-pressed');
  });

  it('preserves the popup focusable marker alongside the source role and tabindex', async () => {
    const view = await render(() => <Combobox.Root defaultOpen>
      <Combobox.Input />
      <Combobox.Portal><Combobox.Positioner>
        <Combobox.Popup data-testid="popup" />
      </Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>);
    const popup = await view.findByTestId('popup');
    expect(popup).toHaveAttribute('data-base-ui-focusable', '');
    expect(popup).toHaveAttribute('tabindex', '-1');
    expect(popup).toHaveAttribute('role', 'presentation');
    expect(popup).toHaveAttribute('data-open', '');
  });
});
