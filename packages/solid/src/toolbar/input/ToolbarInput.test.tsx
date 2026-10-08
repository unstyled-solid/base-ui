import { createSignal } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import type { ComponentProps } from '@solidjs/web';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { mergeProps } from '../../merge-props';
import { DirectionProvider } from '../../direction-provider';
import { Toolbar } from '../index';
import { NumberField } from '../../number-field';
import type { ToolbarInputProps, ToolbarInputState } from './ToolbarInput';

describe('Toolbar.Input', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<ToolbarInputState, ToolbarConformanceProps<ToolbarInputProps, ToolbarInputState>>((props) => <Toolbar.Root><Toolbar.Input {...props} /></Toolbar.Root>, {
    initialProps: {}, refInstanceof: HTMLInputElement, testRenderPropWith: 'input',
  });

  it('preserves pointer focus when disabled and becomes pointer-focusable when enabled', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Toolbar.Root>
      <Toolbar.Button /><Toolbar.Input disabled={props.disabled} />
    </Toolbar.Root>, { disabled: true });
    await view.user.tab();
    expect(view.getByRole('button')).toHaveFocus();
    await view.user.click(view.getByRole('textbox'));
    expect(view.getByRole('button')).toHaveFocus();
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('textbox'));
    expect(view.getByRole('textbox')).toHaveFocus();
  });

  it('prevents disabled click default actions', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Toolbar.Root><Toolbar.Input type="checkbox" disabled={props.disabled} /></Toolbar.Root>, { disabled: true });
    await view.user.click(view.getByRole('checkbox'));
    expect(view.getByRole('checkbox')).not.toBeChecked();
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('checkbox'));
    expect(view.getByRole('checkbox')).toBeChecked();
  });

  it('retains normal typing and native onInput delivery', async () => {
    const input = vi.fn();
    const view = await render(() => <Toolbar.Root><Toolbar.Input defaultValue="a" onInput={input} /></Toolbar.Root>);
    await view.user.click(view.getByRole('textbox'));
    (view.getByRole('textbox') as HTMLInputElement).setSelectionRange(1, 1);
    await view.user.keyboard('bc');
    expect(view.getByRole('textbox')).toHaveValue('abc');
    expect(input).toHaveBeenCalledTimes(2);
  });

  it.each(['horizontal', 'vertical'] as const)('releases %s roving navigation and Tab from a disabled nonempty input', async (orientation) => {
    const view = await render(() => <><Toolbar.Root orientation={orientation}>
      <Toolbar.Button>before</Toolbar.Button><Toolbar.Input disabled defaultValue="abcd" />
      <Toolbar.Button>after</Toolbar.Button>
    </Toolbar.Root><button>outside</button></>);
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const previous = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const input = view.getByRole('textbox');
    await view.user.tab();
    await view.user.keyboard(`[${next}]`);
    expect(input).toHaveFocus();
    await view.user.keyboard(`[${next}]`);
    expect(view.getByRole('button', { name: 'after' })).toHaveFocus();
    await view.user.keyboard(`[${previous}]`);
    expect(input).toHaveFocus();
    await view.user.tab();
    expect(view.getByRole('button', { name: 'outside' })).toHaveFocus();
    await view.user.tab({ shift: true });
    expect(input).toHaveFocus();
    await view.user.keyboard(`[${previous}]`);
    expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
  });

  for (const [direction, next, previous] of [['ltr', 'ArrowRight', 'ArrowLeft'], ['rtl', 'ArrowLeft', 'ArrowRight']] as const) {
    browserCase({ source: 'packages/react/src/toolbar/input/ToolbarInput.test.tsx', case: `caret and selection boundaries horizontal ${direction}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <DirectionProvider direction={direction}><Toolbar.Root>
        <Toolbar.Button>before</Toolbar.Button><Toolbar.Input defaultValue="abcd" /><Toolbar.Button>after</Toolbar.Button>
      </Toolbar.Root></DirectionProvider>);
      const input = view.getByRole('textbox') as HTMLInputElement;
      await view.user.tab();
      await view.user.keyboard(`[${next}]`);
      expect(input).toHaveFocus();
      input.setSelectionRange(1, 3);
      await view.user.keyboard(`[${next}]`);
      expect(input).toHaveFocus();
      input.setSelectionRange(2, 2);
      await view.user.keyboard(`[ShiftLeft>][${next}][/ShiftLeft]`);
      expect(input).toHaveFocus();
      input.setSelectionRange(4, 4);
      await view.user.keyboard(`[${next}]`);
      expect(view.getByRole('button', { name: 'after' })).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(input).toHaveFocus();
      input.setSelectionRange(0, 0);
      await view.user.keyboard(`[${previous}]`);
      expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
    });
  }

  for (const [orientation, next, previous] of [['horizontal', 'ArrowRight', 'ArrowLeft'], ['vertical', 'ArrowDown', 'ArrowUp']] as const) {
    browserCase({ source: 'packages/react/src/toolbar/input/ToolbarInput.test.tsx', case: `editing and selected entry ${orientation}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const { userEvent } = await import('vitest/browser');
      const view = await render(() => <Toolbar.Root orientation={orientation}>
        <Toolbar.Button>before</Toolbar.Button><Toolbar.Input defaultValue="abcd" /><Toolbar.Button>after</Toolbar.Button>
      </Toolbar.Root>);
      const input = view.getByRole('textbox') as HTMLInputElement;
      await userEvent.keyboard('[Tab]');
      expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
      await userEvent.keyboard(`[${next}]`);
      expect(input).toHaveFocus();
      expect(input).toHaveValue('abcd');
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(4);
      await userEvent.keyboard(`[ArrowRight][${next}]`);
      expect(view.getByRole('button', { name: 'after' })).toHaveFocus();
      await userEvent.keyboard(`[${previous}]`);
      expect(input).toHaveFocus();
      await userEvent.keyboard(`[ArrowLeft][${previous}]`);
      expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
    });

    browserCase({ source: 'packages/react/src/toolbar/input/ToolbarInput.test.tsx', case: `disabled input releases ${orientation} navigation and Tab`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <><Toolbar.Root orientation={orientation}>
        <Toolbar.Button>before</Toolbar.Button><Toolbar.Input disabled defaultValue="abcd" /><Toolbar.Button>after</Toolbar.Button>
      </Toolbar.Root><button>outside</button></>);
      await view.user.tab();
      expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
      await view.user.keyboard(`[${next}]`);
      expect(view.getByRole('textbox')).toHaveFocus();
      if (orientation === 'horizontal') {
        await view.user.tab();
        expect(view.getByRole('button', { name: 'outside' })).toHaveFocus();
        await view.user.tab({ shift: true });
        expect(view.getByRole('textbox')).toHaveFocus();
      }
      await view.user.keyboard('x');
      expect(view.getByRole('textbox')).toHaveValue('abcd');
      await view.user.keyboard(`[${next}]`);
      expect(view.getByRole('button', { name: 'after' })).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(view.getByRole('textbox')).toHaveFocus();
      if (orientation === 'vertical') {
        await view.user.keyboard(`[${previous}]`);
        expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
        await view.user.keyboard(`[${next}]`);
        expect(view.getByRole('textbox')).toHaveFocus();
      }
      await view.user.tab();
      expect(view.getByRole('button', { name: 'outside' })).toHaveFocus();
      await view.user.tab({ shift: true });
      expect(view.getByRole('textbox')).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(view.getByRole('button', { name: 'before' })).toHaveFocus();
    });
  }

  it('renders a textbox on the source host', async () => {
    const view = await render(() => <Toolbar.Root><Toolbar.Input data-testid="input" /></Toolbar.Root>);
    expect(view.getByTestId('input')).toBe(view.getByRole('textbox'));
  });

  // Pinned ToolbarInput.test.tsx: real NumberField composition, not the contract fixture below.
  it('renders NumberField.Input', async () => {
    const view = await render(() => <Toolbar.Root><NumberField.Root><NumberField.Group>
      <Toolbar.Input render={(props) => <NumberField.Input {...props} />} />
    </NumberField.Group></NumberField.Root></Toolbar.Root>);
    expect(view.getByRole('textbox')).toHaveAttribute('aria-roledescription', 'Number field');
  });

  it('handles NumberField interactions', async () => {
    const change = vi.fn();
    const view = await render(() => <Toolbar.Root>
      <NumberField.Root min={1} max={10} defaultValue={5} onValueChange={change}><NumberField.Group>
        <NumberField.Decrement />
        <Toolbar.Input render={(props) => <NumberField.Input {...props} />} />
        <NumberField.Increment />
      </NumberField.Group></NumberField.Root>
    </Toolbar.Root>);
    const input = view.getByRole('textbox');
    await view.user.tab();
    expect(input).toHaveAttribute('tabindex', '0');
    expect(input).toHaveFocus();
    await view.user.keyboard('[ArrowUp]');
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toBe(6);
    await view.user.keyboard('[ArrowDown]');
    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls[1][0]).toBe(5);
  });

  it('blocks disabled NumberField interactions', async () => {
    const change = vi.fn();
    const view = await render(() => <Toolbar.Root>
      <NumberField.Root min={1} max={10} defaultValue={5} onValueChange={change}><NumberField.Group>
        <NumberField.Decrement />
        <Toolbar.Input disabled render={(props) => <NumberField.Input {...props} />} />
        <NumberField.Increment />
      </NumberField.Group></NumberField.Root>
    </Toolbar.Root>);
    const input = view.getByRole('textbox');
    expect(input).not.toHaveAttribute('disabled');
    expect(input).toHaveAttribute('data-disabled');
    expect(input).toHaveAttribute('aria-disabled', 'true');
    await view.user.tab();
    expect(input).toHaveAttribute('tabindex', '0');
    expect(input).toHaveFocus();
    await view.user.keyboard('[ArrowUp]');
    await view.user.keyboard('[ArrowDown]');
    expect(change).not.toHaveBeenCalled();
  });

  // Retain the Solid-specific editing-key contract fixture independently of real-family parity.
  it('composes an editing-key consumer and blocks it when disabled', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) => {
      const [value, setValue] = createSignal(5);
      return <Toolbar.Root><Toolbar.Input disabled={props.disabled} render={(host) => <input
        {...mergeProps<'input'>({ onKeyDown(event: KeyboardEvent) {
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            const next = value() + (event.key === 'ArrowUp' ? 1 : -1);
            setValue(next); change(next);
          }
        } }, host as ComponentProps<'input'>)} value={value()} aria-roledescription="Number field"
      />} /></Toolbar.Root>;
    }, { disabled: false });
    const input = view.getByRole('textbox');
    expect(input).toHaveAttribute('aria-roledescription', 'Number field');
    await view.user.tab();
    await view.user.keyboard('[ArrowUp]');
    expect(change).toHaveBeenLastCalledWith(6);
    await view.user.keyboard('[ArrowDown]');
    expect(change).toHaveBeenLastCalledWith(5);
    await view.setProps({ disabled: true });
    await view.user.keyboard('[ArrowUp][ArrowDown]');
    expect(change).toHaveBeenCalledTimes(2);
    expect(view.getByRole('textbox')).toBe(input);
  });
});
