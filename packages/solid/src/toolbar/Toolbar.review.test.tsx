import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../test';
import { DirectionProvider } from '../direction-provider';
import { Toolbar } from './index';

// Source-derived regressions: pinned ToolbarRoot/ToolbarButton/ToolbarInput suites
// and CompositeRoot's isolated, orientation-aware item registration.
describe('Toolbar source integration regressions', () => {
  const { render, renderProps } = createRenderer();

  it('preserves the six source hosts, parts topology, attributes and live orientation', async () => {
    const view = await renderProps((props: { disabled: boolean; orientation: 'horizontal' | 'vertical' }) =>
      <Toolbar.Root disabled={props.disabled} orientation={props.orientation}>
        <Toolbar.Group><Toolbar.Button>button</Toolbar.Button><Toolbar.Input defaultValue="text" />
          <Toolbar.Link href="#target">link</Toolbar.Link></Toolbar.Group><Toolbar.Separator />
      </Toolbar.Root>, { disabled: false, orientation: 'horizontal' });
    const root = view.getByRole('toolbar');
    const group = view.getByRole('group');
    const button = view.getByRole('button');
    const input = view.getByRole('textbox');
    const link = view.getByRole('link');
    const separator = view.getByRole('separator');
    expect([root, group, button, input, link, separator].map((node) => node.tagName)).toEqual(['DIV', 'DIV', 'BUTTON', 'INPUT', 'A', 'DIV']);
    expect([...root.children]).toEqual([group, separator]);
    expect([...group.children]).toEqual([button, input, link]);
    expect(button).toHaveAttribute('type', 'button');
    expect(input).toHaveValue('text');
    expect(button).toHaveAttribute('data-focusable');
    expect(input).toHaveAttribute('data-focusable');
    expect(link).not.toHaveAttribute('data-focusable');
    await view.user.click(input);
    await view.setProps({ disabled: true, orientation: 'vertical' });
    expect(view.getByRole('toolbar')).toBe(root);
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toHaveFocus();
    for (const node of [root, group, button, input, link]) expect(node).toHaveAttribute('data-orientation', 'vertical');
    for (const node of [button, input]) {
      expect(node).toHaveAttribute('aria-disabled', 'true');
      expect(node).not.toHaveAttribute('disabled');
    }
    expect(link).not.toHaveAttribute('data-disabled');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it.each(['ltr', 'rtl'] as const)('navigates a mixed %s toolbar after orientation changes on the same host', async (direction) => {
    const view = await renderProps((props: { orientation: 'horizontal' | 'vertical' }) =>
      <DirectionProvider direction={direction}><Toolbar.Root orientation={props.orientation}>
        <Toolbar.Button>first</Toolbar.Button><Toolbar.Link href="#">link</Toolbar.Link>
        <Toolbar.Group><Toolbar.Input defaultValue="" /><Toolbar.Button>last</Toolbar.Button></Toolbar.Group>
      </Toolbar.Root></DirectionProvider>, { orientation: 'horizontal' });
    const root = view.getByRole('toolbar');
    await view.user.tab();
    await view.user.keyboard(direction === 'rtl' ? '[ArrowLeft]' : '[ArrowRight]');
    expect(view.getByRole('link')).toHaveFocus();
    await view.setProps({ orientation: 'vertical' });
    expect(view.getByRole('toolbar')).toBe(root);
    await view.user.keyboard('[ArrowDown]');
    expect(view.getByRole('textbox')).toHaveFocus();
    await view.user.keyboard('[ArrowDown]');
    expect(view.getByRole('button', { name: 'last' })).toHaveFocus();
    await view.user.keyboard('[ArrowDown]');
    expect(view.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('recomputes disabled metadata when focusableWhenDisabled changes without replacing items', async () => {
    const view = await renderProps((props: { focusable: boolean }) => <Toolbar.Root>
      <Toolbar.Button disabled focusableWhenDisabled={props.focusable}>first</Toolbar.Button>
      <Toolbar.Button>last</Toolbar.Button>
    </Toolbar.Root>, { focusable: true });
    const first = view.getByRole('button', { name: 'first' });
    const last = view.getByRole('button', { name: 'last' });
    expect(first).toHaveAttribute('tabindex', '0');
    await view.setProps({ focusable: false });
    expect(view.getByRole('button', { name: 'first' })).toBe(first);
    expect(first).toHaveAttribute('disabled');
    expect(first).not.toHaveAttribute('tabindex', '0');
    expect(last).toHaveAttribute('tabindex', '0');
    await view.user.tab();
    await view.user.keyboard('[ArrowRight]');
    expect(last).toHaveFocus();
    await view.setProps({ focusable: true });
    await view.user.keyboard('[ArrowRight]');
    expect(first).toHaveFocus();
    expect(first).not.toHaveAttribute('disabled');
  });

  it.each(['horizontal', 'vertical'] as const)('isolates nested %s navigation from a navigable outer toolbar', async (orientation) => {
    const view = await render(() => <Toolbar.Root orientation={orientation}>
      <Toolbar.Button>outer first</Toolbar.Button><Toolbar.Button>outer last</Toolbar.Button>
      <Toolbar.Root orientation={orientation}><Toolbar.Button>inner first</Toolbar.Button><Toolbar.Button>inner last</Toolbar.Button></Toolbar.Root>
    </Toolbar.Root>);
    const outerFirst = view.getByRole('button', { name: 'outer first' });
    await view.user.click(view.getByRole('button', { name: 'inner first' }));
    await view.user.keyboard(orientation === 'horizontal' ? '[ArrowRight]' : '[ArrowDown]');
    expect(view.getByRole('button', { name: 'inner last' })).toHaveFocus();
    expect(outerFirst).toHaveAttribute('tabindex', '0');
    await view.user.keyboard(orientation === 'horizontal' ? '[ArrowRight]' : '[ArrowDown]');
    expect(view.getByRole('button', { name: 'inner first' })).toHaveFocus();
  });

  it('replaces public refs on the existing raw hosts and clears them on disposal', async () => {
    const rootBefore = vi.fn<(node: HTMLDivElement | null) => void>();
    const rootAfter = vi.fn<(node: HTMLDivElement | null) => void>();
    const buttonBefore = vi.fn<(node: HTMLButtonElement | null) => void>();
    const buttonAfter = vi.fn<(node: HTMLButtonElement | null) => void>();
    const view = await renderProps((props: {
      rootRef: (node: HTMLDivElement | null) => void;
      buttonRef: (node: HTMLButtonElement | null) => void;
    }) => <Toolbar.Root {...{ get ref() { return props.rootRef; } }}>
      <Toolbar.Button {...{ get ref() { return props.buttonRef; } }}>button</Toolbar.Button>
    </Toolbar.Root>, { rootRef: rootBefore, buttonRef: buttonBefore });
    const root = view.getByRole('toolbar');
    const button = view.getByRole('button');
    expect(rootBefore).toHaveBeenLastCalledWith(root);
    expect(buttonBefore).toHaveBeenLastCalledWith(button);
    await view.setProps({ rootRef: rootAfter, buttonRef: buttonAfter });
    expect(rootBefore).toHaveBeenLastCalledWith(null);
    expect(buttonBefore).toHaveBeenLastCalledWith(null);
    expect(rootAfter).toHaveBeenLastCalledWith(root);
    expect(buttonAfter).toHaveBeenLastCalledWith(button);
    expect(view.getByRole('button')).toBe(button);
    await view.user.tab();
    expect(button).toHaveFocus();
    view.unmount();
    expect(rootAfter).toHaveBeenLastCalledWith(null);
    expect(buttonAfter).toHaveBeenLastCalledWith(null);
  });
});
