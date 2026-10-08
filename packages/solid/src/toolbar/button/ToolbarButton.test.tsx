import { createSignal } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import type { ComponentProps } from '@solidjs/web';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { mergeProps } from '../../merge-props';
import { Toolbar } from '../index';
import type { ToolbarButtonProps, ToolbarButtonState } from './ToolbarButton';

describe('Toolbar.Button', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<ToolbarButtonState, ToolbarConformanceProps<ToolbarButtonProps, ToolbarButtonState>>((props) => <Toolbar.Root><Toolbar.Button {...props} /></Toolbar.Root>, {
    initialProps: {}, refInstanceof: HTMLButtonElement, testRenderPropWith: 'button', button: true,
  });

  it.each(['Space', 'Enter'])('dispatches a real custom-host %s click through render and ancestor handlers', async (key) => {
    const calls: string[] = [];
    const view = await render(() => <div onClick={() => calls.push('ancestor')}><Toolbar.Root>
      <Toolbar.Button nativeButton={false} onClick={() => calls.push('toolbar')}
        render={(props) => <span {...mergeProps<'span'>(props, { onClick: () => calls.push('render') })} />}>Save</Toolbar.Button>
    </Toolbar.Root></div>);
    await view.user.tab();
    expect(view.getByRole('button', { name: 'Save' })).toHaveFocus();
    const button = view.getByRole('button', { name: 'Save' });
    const capture = () => { calls.push('capture'); };
    button.addEventListener('click', capture, true);
    try { await view.user.keyboard(`[${key}]`); }
    finally { button.removeEventListener('click', capture, true); }
    expect(calls).toEqual(['capture', 'render', 'toolbar', 'ancestor']);
  });

  it('blocks activation handlers while disabled but stays natively enabled and focusable', async () => {
    const click = vi.fn(); const mouseDown = vi.fn(); const pointerDown = vi.fn(); const keyDown = vi.fn();
    const view = await render(() => <Toolbar.Root><Toolbar.Button disabled onClick={click} onMouseDown={mouseDown} onPointerDown={pointerDown} onKeyDown={keyDown} /></Toolbar.Root>);
    const button = view.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await view.user.click(button);
    await view.user.keyboard('[Space][Enter]');
    for (const handler of [click, mouseDown, pointerDown, keyDown]) expect(handler).not.toHaveBeenCalled();
  });

  it('uses native disabled only when focusableWhenDisabled is false', async () => {
    const view = await render(() => <Toolbar.Root><Toolbar.Button disabled focusableWhenDisabled={false} /></Toolbar.Root>);
    expect(view.getByRole('button')).toHaveAttribute('disabled');
    expect(view.getByRole('button')).toHaveAttribute('data-disabled');
    expect(view.getByRole('button')).not.toHaveAttribute('aria-disabled');
  });

  browserCase({ source: 'packages/react/src/toolbar/button/ToolbarButton.test.tsx', case: 'allows hover handlers while blocking activation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const hover = vi.fn(); const click = vi.fn();
    const view = await render(() => <Toolbar.Root><Toolbar.Button disabled onMouseMove={hover} onClick={click} /></Toolbar.Root>);
    expect(view.getByRole('button')).not.toHaveAttribute('disabled');
    expect(view.getByRole('button')).toHaveAttribute('data-disabled');
    expect(view.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await view.user.hover(view.getByRole('button'));
    expect(hover).toHaveBeenCalled();
    await view.user.click(view.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
  });

  it('reads live disabled/render state and current event handlers on the same host', async () => {
    const before = vi.fn(); const after = vi.fn();
    const view = await renderProps((props: ToolbarButtonProps) => <Toolbar.Root><Toolbar.Button {...props} /></Toolbar.Root>, {
      disabled: true, onClick: before,
      class: (state: ToolbarButtonState) => state.disabled ? 'disabled' : 'enabled',
    });
    const button = view.getByRole('button');
    expect(button).toHaveClass('disabled');
    await view.setProps({ disabled: false, onClick: after });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveClass('enabled');
    await view.user.click(button);
    expect(before).not.toHaveBeenCalled();
    expect(after).toHaveBeenCalledOnce();
  });

  // Contract fixtures only. The corresponding real-family interaction/focus replays
  // are owned by bsolid-integration (including Switch/Select native-host diagnostics).
  for (const family of ['Switch', 'Menu', 'Select', 'Dialog', 'AlertDialog', 'Popover', 'Toggle', 'ToggleGroup']) {
    it(`${family} render contract: one host, activation and forwarded disabled state`, async () => {
      const view = await renderProps((props: { disabled: boolean }) => {
        const [active, setActive] = createSignal(false);
        return <Toolbar.Root><Toolbar.Button disabled={props.disabled} render={(host, state) =>
          <button {...mergeProps<'button'>(host as ComponentProps<'button'>, { onClick() { if (!state.disabled) setActive((value) => !value); } })}
            disabled={false} data-forwarded-disabled={String(Reflect.get(host, 'disabled'))} aria-pressed={active() ? 'true' : 'false'} />
        }>fixture</Toolbar.Button></Toolbar.Root>;
      }, { disabled: false });
      const button = view.getByRole('button');
      await view.user.tab();
      await view.user.keyboard('[Enter]');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      await view.setProps({ disabled: true });
      expect(view.getByRole('button')).toBe(button);
      expect(button).toHaveAttribute('data-forwarded-disabled', 'true');
      await view.user.keyboard('[Space][Enter]');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  }
});
