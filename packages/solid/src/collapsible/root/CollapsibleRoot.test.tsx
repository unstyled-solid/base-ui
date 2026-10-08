import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, describeConformance } from '../../../test';
import { Collapsible } from '../index';

describe('Collapsible.Root', () => {
  const { render, renderProps } = createRenderer();
  describeConformance((props) => <Collapsible.Root {...props} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it('toggles uncontrolled state and reports native trigger-press details', async () => {
    const change = vi.fn();
    const view = await render(() => <Collapsible.Root onOpenChange={change}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    const trigger = view.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(view.queryByText('Contents')).toBeNull();
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', view.getByText('Contents').id);
    expect(view.getByText('Contents')).toBeVisible();
    expect(view.getByText('Contents')).toHaveAttribute('data-open');
    expect(trigger).toHaveAttribute('data-panel-open');
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toBe(true);
    expect(typeof change.mock.calls[0][1].cancel).toBe('function');
    expect(typeof change.mock.calls[0][1].allowPropagation).toBe('function');
    expect(change.mock.calls[0][1].event).toBeInstanceOf(MouseEvent);
    expect(change.mock.calls[0][1].reason).toBe('trigger-press');
    expect(change.mock.calls[0][1].isCanceled).toBe(false);
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).not.toHaveAttribute('data-panel-open');
    expect(view.queryByText('Contents')).toBeNull();
  });
  for (const initial of [false, true]) {
    it(`honors details.cancel() with defaultOpen=${initial}`, async () => {
      const change = vi.fn((_: boolean, details: Collapsible.Root.ChangeEventDetails) => details.cancel());
      const view = await render(() => <Collapsible.Root defaultOpen={initial} onOpenChange={change}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel>Contents</Collapsible.Panel>
      </Collapsible.Root>);
      await view.user.click(view.getByRole('button'));
      expect(view.getByRole('button')).toHaveAttribute('aria-expanded', String(initial));
      expect(change).toHaveBeenCalledTimes(1);
      if (initial) expect(view.getByText('Contents')).toBeInTheDocument();
      else expect(view.queryByText('Contents')).toBeNull();
    });
  }
  it('keeps controlled refusal, current callbacks, live state styles and host identity', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((p: { open: boolean; onOpenChange: typeof first }) =>
      <Collapsible.Root open={p.open} onOpenChange={p.onOpenChange}>
        <Collapsible.Trigger class={(state) => state.open ? 'opened' : 'closed'}>Toggle</Collapsible.Trigger>
        <Collapsible.Panel keepMounted style={(state) => ({ opacity: state.open ? 1 : 0.5 })}>Contents</Collapsible.Panel>
      </Collapsible.Root>, { open: false, onOpenChange: first });
    const trigger = view.getByRole('button');
    const panel = view.getByText('Contents');
    await view.user.click(trigger);
    expect(first).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await view.setProps({ open: true, onOpenChange: second });
    expect(view.getByRole('button')).toBe(trigger);
    expect(trigger).toHaveClass('opened');
    expect(panel).toHaveStyle({ opacity: '1' });
    await view.user.click(trigger);
    expect(second).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('unregisters manual/generated IDs on removal and reconnects replacements', async () => {
    const view = await renderProps((p: { visible: boolean; id?: string }) =>
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        {p.visible && <Collapsible.Panel id={p.id}>Contents</Collapsible.Panel>}
      </Collapsible.Root>, { visible: true, id: 'manual' });
    const trigger = view.getByRole('button');
    expect(trigger).toHaveAttribute('aria-controls', 'manual');
    expect(view.getByText('Contents')).toHaveAttribute('id', 'manual');
    await view.setProps({ id: undefined });
    expect(trigger).toHaveAttribute('aria-controls', view.getByText('Contents').id);
    await view.setProps({ visible: false });
    expect(trigger).not.toHaveAttribute('aria-controls');
    await view.setProps({ visible: true });
    expect(trigger).toHaveAttribute('aria-controls', view.getByText('Contents').id);
  });
  it('commits controlled requests only through the current consumer callback', async () => {
    const requests: boolean[] = [];
    const view = await render(() => {
      const [open, setOpen] = createSignal(false);
      return <Collapsible.Root open={open()} onOpenChange={(next, details) => {
        requests.push(next);
        expect(details.reason).toBe('trigger-press');
        setOpen(next);
      }}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel>Contents</Collapsible.Panel>
      </Collapsible.Root>;
    });
    const trigger = view.getByRole('button');
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', view.getByText('Contents').id);
    await view.user.click(trigger);
    expect(requests).toEqual([true, false]);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(view.queryByText('Contents')).toBeNull();
  });
  it('projects live state callbacks and source data attributes across all parts', async () => {
    const view = await render(() => <Collapsible.Root data-testid="root"
      class={(state) => state.open ? 'root-open' : 'root-closed'}
      style={(state) => ({ opacity: state.open ? 1 : 0.5 })}>
      <Collapsible.Trigger class={(state) => state.open ? 'trigger-open' : 'trigger-closed'}
        style={(state) => ({ opacity: state.open ? 1 : 0.5 })}>Toggle</Collapsible.Trigger>
      <Collapsible.Panel keepMounted class={(state) => state.open ? 'panel-open' : 'panel-closed'}
        style={(state) => ({ opacity: state.open ? 1 : 0.5 })}>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    const root = view.getByTestId('root');
    const trigger = view.getByRole('button');
    const panel = view.getByText('Contents');
    for (const [name, node] of [['root', root], ['trigger', trigger], ['panel', panel]] as const) {
      expect(node).toHaveClass(`${name}-closed`);
      expect(node).toHaveStyle({ opacity: '0.5' });
    }
    expect(root).toHaveAttribute('data-closed');
    expect(panel).toHaveAttribute('data-closed');
    expect(trigger).not.toHaveAttribute('data-panel-open');
    await view.user.click(trigger);
    for (const [name, node] of [['root', root], ['trigger', trigger], ['panel', panel]] as const) {
      expect(node).toHaveClass(`${name}-open`);
      expect(node).toHaveStyle({ opacity: '1' });
    }
    expect(root).toHaveAttribute('data-open');
    expect(panel).toHaveAttribute('data-open');
    expect(trigger).toHaveAttribute('data-panel-open');
    expect(view.getByTestId('root')).toBe(root);
    expect(view.getByText('Contents')).toBe(panel);
  });
});
