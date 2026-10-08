import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { advanceFrame, createRenderer, expectDiagnostic, fireEvent, waitFor } from '../../../test';
import { reset as resetWarnings } from '../../utils/warn';
import { Accordion } from '../index';

describe('Accordion.Panel disclosure composition', () => {
  const { render, renderProps } = createRenderer();

  it('preserves the opening transition attribute through the Collapsible prop adapter', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Accordion.Root keepMounted>
      <Accordion.Item value="a">
        <Accordion.Trigger>Trigger</Accordion.Trigger>
        <Accordion.Panel style={{ 'transition-duration': '300ms', 'transition-property': 'height' }}>Content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>);
    const panel = view.getByText('Content');
    expect(panel).not.toHaveAttribute('data-starting-style');
    fireEvent.click(view.getByText('Trigger'));
    flush(); // Inspect the opening phase before its scheduled frame.
    expect(view.getByText('Content')).toBe(panel);
    expect(panel).toHaveAttribute('data-starting-style');
    expect(panel).toHaveAttribute('data-open');
    expect(panel).not.toHaveAttribute('hidden');
    await advanceFrame();
    expect(panel).toHaveAttribute('data-starting-style');
    // Starting style survives the first paint, then clears in the owned second
    // frame (the same native entry-transition contract as Checkbox/FieldError).
    await advanceFrame();
    expect(panel).not.toHaveAttribute('data-starting-style');
    view.unmount();
  });

  it('updates external refs once without replacing a kept panel or its search listener', async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const change = vi.fn();
    const view = await renderProps((props: { ref: Accordion.Panel.Props['ref'] }) => <Accordion.Root hiddenUntilFound onValueChange={change}>
      <Accordion.Item value="a"><Accordion.Trigger>Trigger</Accordion.Trigger><Accordion.Panel {...props}>Content</Accordion.Panel></Accordion.Item>
    </Accordion.Root>, { ref: firstRef });
    const panel = view.getByText('Content');
    expect(firstRef.mock.calls).toEqual([[panel]]);
    await view.setProps({ ref: secondRef });
    expect(view.getByText('Content')).toBe(panel);
    expect(firstRef.mock.calls).toEqual([[panel], [null]]);
    expect(secondRef.mock.calls).toEqual([[panel]]);
    fireEvent(panel, new Event('beforematch'));
    await waitFor(() => expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true'));
    expect(change).toHaveBeenCalledOnce();
    expect(secondRef.mock.calls).toEqual([[panel]]);
    view.unmount();
    expect(secondRef.mock.calls).toEqual([[panel], [null]]);
  });

  it('inherits root keepMounted and permits panel false overrides', async () => {
    const view = await render(() => <Accordion.Root keepMounted>
      <Accordion.Item><Accordion.Trigger>First</Accordion.Trigger><Accordion.Panel>Kept</Accordion.Panel></Accordion.Item>
      <Accordion.Item><Accordion.Panel keepMounted={false}>Absent</Accordion.Panel></Accordion.Item>
    </Accordion.Root>);
    expect(view.getByText('Kept')).toHaveAttribute('hidden');
    expect(view.queryByText('Absent')).toBeNull();
    const panel = view.getByText('Kept');
    await view.user.click(view.getByText('First'));
    expect(view.getByText('Kept')).toBe(panel);
    expect(panel).not.toHaveAttribute('hidden');
    await view.user.click(view.getByText('First'));
    await waitFor(() => expect(panel).toHaveAttribute('hidden'));
  });

  it('inherits hiddenUntilFound while permitting both panel defaults to be overridden', async () => {
    const view = await render(() => <Accordion.Root hiddenUntilFound keepMounted>
      <Accordion.Item><Accordion.Panel>Searchable</Accordion.Panel></Accordion.Item>
      <Accordion.Item><Accordion.Panel hiddenUntilFound={false} keepMounted={false}>Absent</Accordion.Panel></Accordion.Item>
    </Accordion.Root>);
    expect(view.getByText('Searchable')).toHaveAttribute('hidden', 'until-found');
    expect(view.queryByText('Absent')).toBeNull();
  });

  it('reacts to root defaults and per-panel overrides on the same kept host', async () => {
    const view = await renderProps<{ search: boolean; override?: boolean }>((props) => <Accordion.Root keepMounted hiddenUntilFound={props.search}>
      <Accordion.Item><Accordion.Panel hiddenUntilFound={props.override}>Content</Accordion.Panel></Accordion.Item>
    </Accordion.Root>, { search: false });
    const panel = view.getByText('Content');
    expect(panel).toHaveAttribute('hidden');
    await view.setProps({ search: true });
    expect(view.getByText('Content')).toBe(panel);
    expect(panel).toHaveAttribute('hidden', 'until-found');
    await view.setProps({ override: false });
    expect(panel).toHaveAttribute('hidden');
    expect(panel.getAttribute('hidden')).not.toBe('until-found');
  });

  it('warns for conflicting root defaults and keeps searchable contents mounted', async () => {
    resetWarnings();
    await expectDiagnostic({ message: /^Base UI: The `keepMounted=\{false\}` prop on `Accordion\.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed\.$/ }, async () => {
      const view = await render(() => <Accordion.Root hiddenUntilFound keepMounted={false}>
        <Accordion.Item><Accordion.Panel>Content</Accordion.Panel></Accordion.Item>
      </Accordion.Root>);
      expect(view.getByText('Content')).toHaveAttribute('hidden', 'until-found');
    });
  });

  it.each([false, true])('warns for panel keepMounted=false with root hiddenUntilFound=%s', async (rootSearch) => {
    resetWarnings();
    await expectDiagnostic({ message: /^Base UI: The `keepMounted=\{false\}` prop on an `Accordion\.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed\.$/ }, async () => {
      const view = await render(() => <Accordion.Root hiddenUntilFound={rootSearch}>
        <Accordion.Item><Accordion.Panel hiddenUntilFound={rootSearch ? undefined : true} keepMounted={false}>Content</Accordion.Panel></Accordion.Item>
      </Accordion.Root>);
      expect(view.getByText('Content')).toHaveAttribute('hidden', 'until-found');
    });
  });

  it('routes beforematch through item then root with the same none details', async () => {
    const order: string[] = [];
    const events: Accordion.Root.ChangeEventDetails[] = [];
    const change = vi.fn((next: string[], details: Accordion.Root.ChangeEventDetails) => { order.push('root'); events.push(details); });
    const view = await render(() => <Accordion.Root hiddenUntilFound onValueChange={change}>
      <Accordion.Item value="a" onOpenChange={(_next, details) => { order.push('item'); events.push(details); }}>
        <Accordion.Trigger>Trigger</Accordion.Trigger><Accordion.Panel>Content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>);
    const event = new Event('beforematch');
    fireEvent(view.getByText('Content'), event);
    await waitFor(() => expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true'));
    expect(order).toEqual(['item', 'root']);
    expect(events[0]).toBe(events[1]);
    expect(events[0].reason).toBe('none');
    expect(events[0].event).toBe(event);
    expect(change.mock.lastCall?.[0]).toEqual(['a']);
    expect(view.getByText('Content')).not.toHaveAttribute('hidden');
  });

  it.each(['item', 'root', 'controlled-ignore'] as const)('beforematch %s rejection restores browser-removed hidden attribute', async (veto) => {
    const rootChange = vi.fn((_next: string[], details: Accordion.Root.ChangeEventDetails) => {
      if (veto === 'root') details.cancel();
    });
    const view = await render(() => <Accordion.Root hiddenUntilFound value={veto === 'controlled-ignore' ? [] : undefined} onValueChange={rootChange}>
      <Accordion.Item value="a" onOpenChange={(_next, details) => { if (veto === 'item') details.cancel(); }}>
        <Accordion.Trigger>Trigger</Accordion.Trigger><Accordion.Panel>Content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>);
    const panel = view.getByText('Content');
    fireEvent(panel, new Event('beforematch'));
    panel.removeAttribute('hidden'); // The browser's same-task reveal after beforematch.
    await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'false');
    expect(rootChange).toHaveBeenCalledTimes(veto === 'item' ? 0 : 1);
  });

  it('uses accordion CSS variables and keeps user styles except initial animation suppression', async () => {
    const view = await render(() => <Accordion.Root defaultValue={['a']}>
      <Accordion.Item value="a"><Accordion.Panel style={(state) => ({
        color: state.open ? 'red' : 'blue', 'animation-name': 'slide-down', 'animation-duration': '100ms',
      })}>Content</Accordion.Panel></Accordion.Item>
    </Accordion.Root>);
    const panel = view.getByText('Content');
    expect(panel.style.getPropertyValue('--accordion-panel-height')).toBe('auto');
    expect(panel.style.getPropertyValue('--accordion-panel-width')).toBe('auto');
    expect(panel.style.animationName).toBe('none');
    expect(panel.style.animationDuration).toBe('100ms');
    expect(panel.style.color).toBe('red');
    expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('');
  });
});
