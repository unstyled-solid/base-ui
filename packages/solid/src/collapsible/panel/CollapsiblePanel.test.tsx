import { describe, expect, it, vi } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer, describeConformance, fireEvent, waitFor, expectDiagnostic } from '../../../test';
import { Collapsible } from '../index';
import { createCollapsibleRoot } from '../root/createCollapsibleRoot';
import { createCollapsiblePanel } from './createCollapsiblePanel';
import { createRenderElement } from '../../internals/createRenderElement';
import { collapsibleStateAttributesMapping } from '../root/stateAttributesMapping';

describe('Collapsible.Panel', () => {
  const { render, renderProps } = createRenderer();
  describeConformance((props) => <Collapsible.Root defaultOpen><Collapsible.Panel {...props} /></Collapsible.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it('keeps closed contents hidden and removes hidden on open', async () => {
    const view = await render(() => <Collapsible.Root>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel keepMounted>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    const panel = view.getByText('Contents');
    const trigger = view.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
    expect(panel).toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('data-closed');
    await view.user.click(view.getByRole('button'));
    expect(view.getByText('Contents')).toBe(panel);
    expect(panel).not.toHaveAttribute('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(trigger).toHaveAttribute('data-panel-open');
    expect(panel).toBeVisible();
    expect(panel).toHaveAttribute('data-open');
    await view.user.click(view.getByRole('button'));
    expect(panel).toHaveAttribute('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(panel).not.toBeVisible();
    expect(panel).toHaveAttribute('data-closed');
  });
  it('suppresses initial inline keyframes, preserving other authored styles', async () => {
    const view = await render(() => <Collapsible.Root defaultOpen>
      <Collapsible.Panel style={{ 'animation-name': 'entrance', 'animation-duration': '100ms' }}>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    expect(view.getByText('Contents').style.animationName).toBe('none');
    expect(view.getByText('Contents').style.animationDuration).toBe('100ms');
  });
  it('warns when hiddenUntilFound overrides explicit keepMounted=false', async () => {
    await expectDiagnostic({ message: /keepMounted=\{false\}/ }, async () => {
      const view = await render(() => <Collapsible.Root>
        <Collapsible.Panel hiddenUntilFound keepMounted={false}>Contents</Collapsible.Panel>
      </Collapsible.Root>);
      expect(view.getByText('Contents')).toHaveAttribute('hidden', 'until-found');
    });
  });
  for (const canceled of [true, false]) {
    it(`re-collapses a native reveal when ${canceled ? 'canceled' : 'controlled open is refused'}`, async () => {
      const change = vi.fn((_: boolean, details: Collapsible.Root.ChangeEventDetails) => { if (canceled) details.cancel(); });
      const view = await render(() => <Collapsible.Root open={false} onOpenChange={change}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel hiddenUntilFound>Contents</Collapsible.Panel>
      </Collapsible.Root>);
      const panel = view.getByText('Contents');
      expect(panel).toHaveAttribute('data-starting-style');
      fireEvent(panel, new Event('beforematch', { bubbles: true }));
      if (!canceled) expect(panel).not.toHaveAttribute('data-starting-style');
      panel.removeAttribute('hidden'); // Native reveal occurs even for cancellation.
      expect(change).toHaveBeenCalledOnce();
      expect(change.mock.calls[0][1].reason).toBe('none');
      await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
      expect(panel).toHaveAttribute('data-starting-style');
    });
  }
  it('uses the current callback for beforematch and removes collapsed styles synchronously', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((p: { callback: typeof first }) => <Collapsible.Root onOpenChange={p.callback}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel hiddenUntilFound>Contents</Collapsible.Panel>
    </Collapsible.Root>, { callback: first });
    await view.setProps({ callback: second });
    const panel = view.getByText('Contents');
    let startingDuringEvent: boolean | undefined;
    panel.addEventListener('beforematch', () => { startingDuringEvent = panel.hasAttribute('data-starting-style'); });
    fireEvent(panel, new Event('beforematch'));
    expect(startingDuringEvent).toBe(false);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    await waitFor(() => expect(panel).toHaveAttribute('data-open'));
  });
  it('exposes absent starting-style keys to adapter consumers without masking presence', async () => {
    let adapter!: ReturnType<typeof createCollapsiblePanel>;
    const view = await renderProps((p: { open: boolean }) => {
      const root = createCollapsibleRoot(p);
      adapter = createCollapsiblePanel({
        hiddenUntilFound: true, keepMounted: false, id: 'adapter-panel',
        get open() { return root.open; }, get mounted() { return root.mounted; },
        get transitionStatus() { return root.transitionStatus; },
        setMounted: root.setMounted, setOpen: root.setOpen, onOpenChange() {},
      });
      return createRenderElement('div', {}, {
        state: {
          get open() { return root.open; }, disabled: false,
          get transitionStatus() { return adapter.transitionStatus; },
        }, ref: adapter.ref, stateAttributesMapping: collapsibleStateAttributesMapping,
        props: [adapter.props, { style: { 'transition-duration': '100ms' }, children: 'Adapter' }],
      });
    }, { open: false });
    const panel = view.getByText('Adapter');
    expect(untrack(() => Object.keys(adapter.props))).toContain('data-starting-style');
    expect(panel).toHaveAttribute('hidden', 'until-found');
    await view.setProps({ open: true });
    expect(untrack(() => 'data-starting-style' in adapter.props)).toBe(false);
    expect(untrack(() => Object.keys(adapter.props))).not.toContain('data-starting-style');
    expect(untrack(() => adapter.props.hidden)).toBe(false);
    expect(panel).toHaveAttribute('data-starting-style');
    expect(panel).not.toHaveAttribute('hidden');
  });
  it('retains the panel while changing external ref arrays and detaches only the previous refs', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((p: { ref: ((node: HTMLDivElement | null) => void)[] }) => <Collapsible.Root>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel keepMounted {...p}>Contents</Collapsible.Panel>
    </Collapsible.Root>, { ref: [first] });
    const panel = view.getByText('Contents');
    expect(first.mock.calls).toEqual([[panel]]);
    await view.user.click(view.getByRole('button'));
    await view.user.click(view.getByRole('button'));
    expect(first.mock.calls).toEqual([[panel]]);
    await view.setProps({ ref: [second] });
    expect(first.mock.calls).toEqual([[panel], [null]]);
    expect(second.mock.calls).toEqual([[panel]]);
    expect(second.mock.calls[0][0]).toBe(panel);
    expect(view.getByText('Contents')).toBe(panel);
    view.unmount();
    expect(second.mock.calls).toEqual([[panel], [null]]);
  });
  it('disposes the beforematch listener when its panel is removed', async () => {
    const change = vi.fn();
    const view = await renderProps((p: { visible: boolean }) => <Collapsible.Root onOpenChange={change}>
      {p.visible && <Collapsible.Panel hiddenUntilFound>Contents</Collapsible.Panel>}
    </Collapsible.Root>, { visible: true });
    const panel = view.getByText('Contents');
    await view.setProps({ visible: false });
    fireEvent(panel, new Event('beforematch'));
    expect(change).not.toHaveBeenCalled();
  });
  it('supports a render callback that removes the host on close and mounts during ending', async () => {
    const view = await render(() => <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel render={(props, state) => <>
        {(state.open || state.transitionStatus === 'ending') && <div {...props} />}
      </>}>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    fireEvent.click(view.getByRole('button')); flush();
    await waitFor(() => expect(view.queryByText('Contents')).toBeNull());
    expect(view.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    await view.user.click(view.getByRole('button'));
    expect(view.getByText('Contents')).toHaveAttribute('data-open');
  });
  it('detaches the ref when a retained render callback removes its host', async () => {
    const ref = vi.fn();
    const view = await render(() => <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel keepMounted ref={ref} render={(props, state) => <>
        {state.open && <div {...props} />}
      </>}>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    const panel = view.getByText('Contents');
    expect(ref.mock.calls[0][0]).toBe(panel);
    await view.user.click(view.getByRole('button'));
    expect(view.queryByText('Contents')).toBeNull();
    expect(ref.mock.calls.at(-1)).toEqual([null]);
    await view.user.click(view.getByRole('button'));
    expect(ref.mock.calls.at(-1)?.[0]).toBe(view.getByText('Contents'));
    expect(view.getByText('Contents')).not.toBe(panel);
  });
  it('hides a retained panel after an external controlled close with no motion', async () => {
    const change = vi.fn();
    const view = await renderProps((p: { open: boolean }) => <Collapsible.Root open={p.open} onOpenChange={change}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel keepMounted>Contents</Collapsible.Panel>
    </Collapsible.Root>, { open: true });
    const panel = view.getByText('Contents');
    await view.setProps({ open: false });
    expect(view.getByText('Contents')).toBe(panel);
    expect(panel).toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('data-closed');
    expect(panel).not.toHaveAttribute('data-ending-style');
    expect(change).not.toHaveBeenCalled();
    await view.setProps({ open: true });
    expect(panel).not.toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('data-open');
  });
});
