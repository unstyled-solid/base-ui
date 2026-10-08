// Behavioral source: Base UI accordion/*/*.test.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it, vi } from 'vitest';
import { createSignal, Show } from 'solid-js';
import { dynamic } from '@solidjs/web';
import { createRenderer, fireEvent, waitFor } from '../../test';
import { Accordion } from './index';

const Span = dynamic(() => 'span', { static: true });
const spanTrigger: NonNullable<Accordion.Trigger.Props['render']> = (props) => <Span {...props} />;

function Items(props: {
  root?: Accordion.Root.Props;
  item?: Accordion.Item.Props;
  trigger?: Accordion.Trigger.Props;
  panel?: Accordion.Panel.Props;
}) {
  return (
    <Accordion.Root {...props.root} data-testid="root">
      <Accordion.Item value="a" {...props.item} data-testid="item-a">
        <Accordion.Header data-testid="header-a">
          <Accordion.Trigger {...props.trigger}>First</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel {...props.panel} data-testid="panel-a">First content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b" data-testid="item-b">
        <Accordion.Header><Accordion.Trigger>Second</Accordion.Trigger></Accordion.Header>
        <Accordion.Panel data-testid="panel-b">Second content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion selection and transactions', () => {
  const { render, renderProps } = createRenderer();

  it.each([false, true])('single/multiple=%s preserves callback order and selection order', async (multiple) => {
    const order: string[] = [];
    const details: Accordion.Root.ChangeEventDetails[] = [];
    const change = vi.fn((value: unknown[], event: Accordion.Root.ChangeEventDetails) => {
      order.push('root'); details.push(event);
    });
    const view = await render(() => <Items root={{ multiple, onValueChange: change }} item={{
      onOpenChange: (_open, event) => { order.push('item'); details.push(event); },
    }} />);
    const [first, second] = view.getAllByRole('button');
    await view.user.click(first);
    expect(order).toEqual(['item', 'root']);
    expect(details[0]).toBe(details[1]);
    expect(details[0].reason).toBe('trigger-press');
    expect(details[0].event.type).toBe('click');
    expect(change).toHaveBeenLastCalledWith(['a'], details[0]);
    await view.user.click(second);
    expect(change.mock.lastCall?.[0]).toEqual(multiple ? ['a', 'b'] : ['b']);
    expect(first).toHaveAttribute('aria-expanded', String(multiple));
    expect(second).toHaveAttribute('aria-expanded', 'true');
    await view.user.click(second);
    expect(change.mock.lastCall?.[0]).toEqual(multiple ? ['a'] : []);
    await view.user.click(second);
    await view.user.click(first);
    expect(change.mock.lastCall?.[0]).toEqual(multiple ? ['b'] : ['a']);
  });

  for (const multiple of [false, true]) {
    for (const controlled of [false, true]) {
      for (const initiallyOpen of [false, true]) {
        for (const veto of ['item', 'root'] as const) {
          it(`honors ${veto} veto: multiple=${multiple}, controlled=${controlled}, open=${initiallyOpen}`, async () => {
            const calls: string[] = [];
            const change = vi.fn((_value: unknown[], event: Accordion.Root.ChangeEventDetails) => {
              calls.push('root');
              if (veto === 'root') event.cancel();
            });
            const initial = initiallyOpen ? ['a'] : [];
            const view = await render(() => <Items root={{
              multiple, ...(controlled ? { value: initial } : { defaultValue: initial }), onValueChange: change,
            }} item={{ onOpenChange: (_open, event) => {
              calls.push('item');
              if (veto === 'item') event.cancel();
            } }} />);
            const trigger = view.getByRole('button', { name: 'First' });
            await view.user.click(trigger);
            expect(calls).toEqual(veto === 'item' ? ['item'] : ['item', 'root']);
            expect(trigger).toHaveAttribute('aria-expanded', String(initiallyOpen));
            expect(Boolean(view.queryByText('First content'))).toBe(initiallyOpen);
            if (initiallyOpen) expect(view.getByText('First content')).toHaveAttribute('data-open');
            if (veto === 'root') expect(change.mock.lastCall?.[0]).toEqual(initiallyOpen ? [] : ['a']);
          });
        }
      }
    }
  }

  it('appends array item values without flattening and retains raw identity', async () => {
    const firstValue = ['section', 'details'];
    const secondValue = { id: 'other' };
    const change = vi.fn();
    const view = await render(() => <Accordion.Root multiple onValueChange={change}>
      <Accordion.Item value={firstValue}><Accordion.Trigger>Array</Accordion.Trigger><Accordion.Panel>Array content</Accordion.Panel></Accordion.Item>
      <Accordion.Item value={secondValue}><Accordion.Trigger>Object</Accordion.Trigger></Accordion.Item>
    </Accordion.Root>);
    await view.user.click(view.getByText('Array'));
    expect(change.mock.lastCall?.[0]).toEqual([firstValue]);
    expect(change.mock.lastCall?.[0][0]).toBe(firstValue);
    expect(view.getByText('Array')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('Array content')).toBeInTheDocument();
    await view.user.click(view.getByText('Object'));
    expect(change.mock.lastCall?.[0][1]).toBe(secondValue);
    await view.user.click(view.getByText('Array'));
    expect(change.mock.lastCall?.[0]).toEqual([secondValue]);
  });

  it('generates distinct stable identities for omitted values, not positional indices', async () => {
    const change = vi.fn();
    const view = await render(() => <Accordion.Root multiple onValueChange={change}>
      <Accordion.Item><Accordion.Trigger>One</Accordion.Trigger></Accordion.Item>
      <Accordion.Item><Accordion.Trigger>Two</Accordion.Trigger></Accordion.Item>
    </Accordion.Root>);
    await view.user.click(view.getByText('One'));
    const first = change.mock.lastCall?.[0][0];
    expect(typeof first).toBe('string');
    await view.user.click(view.getByText('Two'));
    expect(change.mock.lastCall?.[0][0]).toBe(first);
    expect(change.mock.lastCall?.[0][1]).not.toBe(first);
    await view.user.click(view.getByText('One'));
    await view.user.click(view.getByText('One'));
    expect(change.mock.lastCall?.[0][1]).toBe(first);
  });

  it('controlled requests do not imply acknowledgement; external updates preserve focus and host identity', async () => {
    const change = vi.fn();
    const view = await renderProps<{ value: string[] }>((props) => <Items root={{ value: props.value, onValueChange: change }} />, { value: [] });
    const first = view.getByRole('button', { name: 'First' });
    await view.user.click(first);
    expect(change.mock.lastCall?.[0]).toEqual(['a']);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    await view.setProps({ value: ['a'] });
    expect(view.getByRole('button', { name: 'First' })).toBe(first);
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ value: [] });
    expect(first).toHaveFocus();
    await waitFor(() => expect(view.queryByText('First content')).toBeNull());
  });

  it('controlled callback may acknowledge the explicit proposal', async () => {
    const view = await render(() => {
      const [value, setValue] = createSignal<string[]>([]);
      return <Items root={{ get value() { return value(); }, onValueChange: (next) => { setValue(next); } }} />;
    });
    await view.user.click(view.getByText('First'));
    expect(view.getByText('First')).toHaveAttribute('aria-expanded', 'true');
  });

  it('controlled cancellation exposes isCanceled before the parent accepts a proposal', async () => {
    const change = vi.fn();
    const view = await render(() => {
      const [value, setValue] = createSignal<string[]>([]);
      return <Items root={{ get value() { return value(); }, onValueChange(next, details) {
        change(next, details);
        details.cancel();
        if (!details.isCanceled) setValue(next);
      } }} />;
    });
    await view.user.click(view.getByText('First'));
    expect(view.getByText('First')).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByText('First content')).toBeNull();
    expect(change).toHaveBeenCalledOnce();
  });

  it('reads the current item callback and shares native event identity in user/item/root order', async () => {
    const oldItemChange = vi.fn();
    const order: string[] = [];
    let clickEvent: MouseEvent | undefined;
    let clickTarget: EventTarget | null | undefined;
    let itemDetails: Accordion.Item.ChangeEventDetails | undefined;
    const currentItemChange = vi.fn((_open: boolean, details: Accordion.Item.ChangeEventDetails) => {
      order.push('item');
      itemDetails = details;
      expect(details.event).toBe(clickEvent);
    });
    const rootChange = vi.fn((_value: unknown[], details: Accordion.Root.ChangeEventDetails) => {
      order.push('root');
      expect(details).toBe(itemDetails);
    });
    const view = await renderProps((props: { onOpenChange: Accordion.Item.Props['onOpenChange'] }) => <Items
      root={{ onValueChange: rootChange }} item={{ onOpenChange: props.onOpenChange }}
      trigger={{ onClick(event) { order.push('user'); clickEvent = event; clickTarget = event.currentTarget; } }}
    />, { onOpenChange: oldItemChange });
    await view.setProps({ onOpenChange: currentItemChange });
    const trigger = view.getByText('First');
    await view.user.click(trigger);
    expect(clickTarget).toBe(trigger);
    expect(order).toEqual(['user', 'item', 'root']);
    expect(oldItemChange).not.toHaveBeenCalled();
    expect(currentItemChange).toHaveBeenCalledOnce();
    expect(rootChange).toHaveBeenCalledOnce();
  });

  it('reads current callbacks, multiple mode and item value; defaultValue is initial only', async () => {
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    const view = await renderProps<{
      onValueChange: Accordion.Root.Props['onValueChange']; multiple: boolean; value: string; defaultValue: string[];
    }>((props) => <Items root={{ onValueChange: props.onValueChange, multiple: props.multiple, defaultValue: props.defaultValue }} item={{ value: props.value }} />, {
      onValueChange: oldCallback, multiple: false, value: 'a', defaultValue: [],
    });
    await view.setProps({ onValueChange: newCallback, multiple: true, value: 'new-a', defaultValue: ['b'] });
    expect(view.getByText('Second')).toHaveAttribute('aria-expanded', 'false');
    await view.user.click(view.getByText('Second'));
    await view.user.click(view.getByText('First'));
    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback.mock.lastCall?.[0]).toEqual(['b', 'new-a']);
  });

  it('distinguishes native default prevention from Base UI handler prevention', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { block: boolean }) => <Items root={{ onValueChange: change }} trigger={{ onClick(event) {
      if (props.block) event.preventBaseUIHandler();
      else event.preventDefault();
    }, onMouseUp: (event) => event.preventBaseUIHandler() }} />, { block: true });
    const first = view.getByText('First');
    expect(() => fireEvent.mouseUp(first)).not.toThrow();
    await view.user.click(first);
    expect(change).not.toHaveBeenCalled();
    await view.setProps({ block: false });
    await view.user.click(first);
    expect(change).toHaveBeenCalledOnce();
    expect(first).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion keyboard and disabled semantics', () => {
  const { render, renderProps } = createRenderer();

  it.each([true, false])('nativeButton=%s: Space activates on keyup, Enter toggles, and focus stays on the trigger', async (nativeButton) => {
    const onOpenChange = vi.fn();
    const view = await render(() => <Items item={{ onOpenChange }} trigger={{ nativeButton, render: nativeButton ? undefined : spanTrigger }} />);
    const trigger = view.getByRole('button', { name: 'First' });
    await view.user.tab();
    expect(trigger).toHaveFocus();
    await view.user.keyboard('[Space>]');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByText('First content')).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    await view.user.keyboard('[/Space]');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.anything());
    expect(view.getByText('First content')).toBeInTheDocument();
    await view.user.keyboard('[Space>]');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('First content')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[/Space]');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    expect(view.queryByText('First content')).not.toBeInTheDocument();
    await view.user.keyboard('[Enter]');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveFocus();
  });

  it.each(['vertical', 'horizontal'] as const)('%s orientation/loopFocus do not add arrow/Home/End navigation', async (orientation) => {
    const view = await render(() => <Items root={{ orientation, loopFocus: true }} />);
    const [first, second] = view.getAllByRole('button');
    await view.user.tab();
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      await view.user.keyboard(`[${key}]`);
      expect(first).toHaveFocus();
      expect(first).toHaveAttribute('aria-expanded', 'false');
    }
    await view.user.tab();
    expect(second).toHaveFocus();
    await view.user.tab({ shift: true });
    expect(first).toHaveFocus();
  });

  for (const nativeButton of [true, false]) {
    it.each(['root', 'item', 'trigger'] as const)(`nativeButton=${nativeButton}: %s disabled cannot be overridden`, async (part) => {
      const change = vi.fn();
      const openChange = vi.fn();
      const view = await renderProps((props: { disabled: boolean }) => <Items
        root={{ disabled: part === 'root' && props.disabled, onValueChange: change }}
        item={{ disabled: part === 'item' && props.disabled, onOpenChange: openChange }}
        trigger={{ disabled: part === 'trigger' && props.disabled, nativeButton, render: nativeButton ? undefined : spanTrigger }}
      />, { disabled: true });
      const first = view.getByRole('button', { name: 'First' });
      if (nativeButton) {
        expect(first).toBeDisabled();
        expect(first).not.toHaveAttribute('aria-disabled');
      } else {
        expect(first).toHaveAttribute('aria-disabled', 'true');
        expect(first).toHaveAttribute('tabindex', '-1');
        expect(first).not.toHaveAttribute('disabled');
      }
      await view.user.tab();
      expect(first).not.toHaveFocus();
      await view.user.click(first);
      first.focus();
      await view.user.keyboard('[Space][Enter]');
      expect(change).not.toHaveBeenCalled();
      expect(openChange).not.toHaveBeenCalled();
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(view.queryByText('First content')).toBeNull();
      await view.setProps({ disabled: false });
      await view.user.click(first);
      expect(first).toHaveAttribute('aria-expanded', 'true');
      if (!nativeButton) expect(first).toHaveAttribute('tabindex', '0');
    });
  }
});

describe('Accordion labels, registration, and state attributes', () => {
  const { render, renderProps } = createRenderer();

  it('links generated and manual IDs, including live changes/removal without host replacement', async () => {
    const view = await renderProps<{ triggerId?: string; panelId?: string }>((props) => <Items
      root={{ defaultValue: ['a'] }} trigger={{ id: props.triggerId }} panel={{ id: props.panelId }}
    />, {});
    const trigger = view.getByText('First');
    const panel = view.getByRole('region');
    const generatedTrigger = trigger.id;
    const generatedPanel = panel.id;
    expect(trigger).toHaveAttribute('id');
    expect(panel).toHaveAttribute('role', 'region');
    expect(trigger).toHaveAttribute('aria-controls', generatedPanel);
    expect(panel).toHaveAttribute('aria-labelledby', generatedTrigger);
    expect(panel).toHaveAccessibleName('First');
    for (const id of ['custom-1', 'custom-2']) {
      await view.setProps({ triggerId: `${id}-trigger`, panelId: `${id}-panel` });
      expect(view.getByText('First')).toBe(trigger);
      expect(view.getByRole('region')).toBe(panel);
      expect(trigger).toHaveAttribute('id', `${id}-trigger`);
      expect(panel).toHaveAttribute('id', `${id}-panel`);
      expect(trigger).toHaveAttribute('aria-controls', `${id}-panel`);
      expect(panel).toHaveAttribute('aria-labelledby', `${id}-trigger`);
    }
    await view.setProps({ triggerId: undefined, panelId: undefined });
    expect(trigger.id).toBe(generatedTrigger);
    expect(panel.id).toBe(generatedPanel);
    expect(trigger).toHaveAttribute('aria-controls', generatedPanel);
    expect(panel).toHaveAttribute('aria-labelledby', generatedTrigger);
  });

  it('uses manual part IDs on the initial open mount', async () => {
    const view = await render(() => <Items root={{ defaultValue: ['a'] }}
      trigger={{ id: 'custom-trigger-id' }} panel={{ id: 'custom-panel-id' }} />);
    const trigger = view.getByText('First');
    const panel = view.getByRole('region');
    expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id');
    expect(panel).toHaveAttribute('id', 'custom-panel-id');
    expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id');
  });

  it.each([false, true])('unregisters and restores generated/manual=%s IDs after part removal/replacement', async (manual) => {
    const view = await renderProps((props: { trigger: boolean; panel: boolean; replacement: boolean }) => <Accordion.Root defaultValue={['a']}>
      <Accordion.Item value="a">
        <Show when={props.trigger}>
          <Show when={props.replacement} fallback={<Accordion.Trigger id={manual ? 'old-trigger' : undefined}>First</Accordion.Trigger>}>
            <Accordion.Trigger id={manual ? 'new-trigger' : undefined}>First</Accordion.Trigger>
          </Show>
        </Show>
        <Show when={props.panel}>
          <Show when={props.replacement} fallback={<Accordion.Panel id={manual ? 'old-panel' : undefined}>Content</Accordion.Panel>}>
            <Accordion.Panel id={manual ? 'new-panel' : undefined}>Content</Accordion.Panel>
          </Show>
        </Show>
      </Accordion.Item>
    </Accordion.Root>, { trigger: true, panel: true, replacement: false });
    await view.setProps({ trigger: false });
    expect(view.getByRole('region')).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ trigger: true });
    expect(view.getByRole('region')).toHaveAttribute('aria-labelledby', view.getByRole('button').id);
    await view.setProps({ panel: false });
    expect(view.getByRole('button')).not.toHaveAttribute('aria-controls');
    await view.setProps({ panel: true, replacement: true });
    expect(view.getByRole('button')).toHaveAttribute('aria-controls', view.getByRole('region').id);
    expect(view.getByRole('region')).toHaveAttribute('aria-labelledby', view.getByRole('button').id);
  });

  it('does not set aria-controls on a closed trigger even when the panel is kept mounted', async () => {
    const view = await render(() => <Items root={{ keepMounted: true }} />);
    expect(view.getByText('First')).not.toHaveAttribute('aria-controls');
    expect(view.getByTestId('panel-a')).toHaveAttribute('aria-labelledby', view.getByText('First').id);
  });

  it('renders every index including zero, suppresses data-value, and maps trigger open separately', async () => {
    const view = await render(() => <Items root={{ value: ['a', 'b'], multiple: true }} />);
    const [first, second] = view.getAllByRole('button');
    expect(first).toHaveAttribute('data-index', '0');
    expect(second).toHaveAttribute('data-index', '1');
    for (const node of [first, second]) {
      expect(node).not.toHaveAttribute('data-value');
      expect(node).toHaveAttribute('data-panel-open');
      expect(node).not.toHaveAttribute('data-open');
      expect(node).not.toHaveAttribute('data-closed');
    }
    for (const id of ['root', 'item-a', 'header-a', 'panel-a']) {
      const node = view.getByTestId(id);
      expect(node).not.toHaveAttribute('data-value');
      if (id !== 'root') {
        expect(node).toHaveAttribute('data-index', '0');
        expect(node).toHaveAttribute('data-open');
      }
    }
  });

  it('updates ordered registration when an earlier item unmounts', async () => {
    const view = await renderProps((props: { first: boolean }) => <Accordion.Root>
      <Show when={props.first}><Accordion.Item><Accordion.Trigger>First</Accordion.Trigger></Accordion.Item></Show>
      <Accordion.Item><Accordion.Trigger>Second</Accordion.Trigger></Accordion.Item>
    </Accordion.Root>, { first: true });
    const second = view.getByText('Second');
    expect(second).toHaveAttribute('data-index', '1');
    await view.setProps({ first: false });
    await waitFor(() => expect(second).toHaveAttribute('data-index', '0'));
    expect(view.getByText('Second')).toBe(second);
  });

  it('keeps nested accordions in independent selection, labeling and composite index scopes', async () => {
    const outerChange = vi.fn();
    const innerChange = vi.fn();
    const view = await render(() => <Accordion.Root defaultValue={['outer']} onValueChange={outerChange}>
      <Accordion.Item value="outer"><Accordion.Trigger>Outer</Accordion.Trigger><Accordion.Panel>
        <Accordion.Root multiple onValueChange={innerChange}>
          <Accordion.Item value="inner-a"><Accordion.Trigger>Inner A</Accordion.Trigger><Accordion.Panel>Inner content</Accordion.Panel></Accordion.Item>
          <Accordion.Item value="inner-b"><Accordion.Trigger>Inner B</Accordion.Trigger></Accordion.Item>
        </Accordion.Root>
      </Accordion.Panel></Accordion.Item>
      <Accordion.Item value="other"><Accordion.Trigger>Other</Accordion.Trigger></Accordion.Item>
    </Accordion.Root>);
    const outer = view.getByText('Outer');
    const inner = view.getByText('Inner A');
    expect(outer).toHaveAttribute('data-index', '0');
    expect(inner).toHaveAttribute('data-index', '0');
    expect(view.getByText('Inner B')).toHaveAttribute('data-index', '1');
    expect(view.getByText('Other')).toHaveAttribute('data-index', '1');
    await view.user.click(inner);
    expect(innerChange.mock.lastCall?.[0]).toEqual(['inner-a']);
    expect(outerChange).not.toHaveBeenCalled();
    expect(outer).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('Inner content')).toHaveAttribute('aria-labelledby', inner.id);
    expect(outer.getAttribute('aria-controls')).not.toBe(inner.getAttribute('aria-controls'));
  });

  it.each(['root', 'item'] as const)('propagates %s disabled state to every part', async (part) => {
    const view = await render(() => <Items root={{ defaultValue: ['a'], disabled: part === 'root' }} item={{ disabled: part === 'item' }} />);
    for (const id of ['item-a', 'header-a', 'panel-a']) expect(view.getByTestId(id)).toHaveAttribute('data-disabled');
    expect(view.getByText('First')).toHaveAttribute('data-disabled');
    expect(view.getByTestId('item-b').hasAttribute('data-disabled')).toBe(part === 'root');
    expect(view.getByText('Second').hasAttribute('data-disabled')).toBe(part === 'root');
    expect(view.getAllByRole('heading')[1].hasAttribute('data-disabled')).toBe(part === 'root');
  });

  it.each(['defaultValue', 'value'] as const)('%s selects a custom item value initially', async (prop) => {
    const view = await render(() => <Items root={{ [prop]: ['a'] }} />);
    expect(view.getByText('First content')).toBeVisible();
    expect(view.getByText('First content')).toHaveAttribute('data-open');
    expect(view.queryByText('Second content')).toBeNull();
  });

  it('exposes live render/class state without reporting open and hidden simultaneously', async () => {
    const seen: Array<{ open: boolean; hidden: boolean }> = [];
    const Div = dynamic(() => 'div');
    const view = await render(() => <Items item={{
      render: (props, state) => <Div {...props} data-live-open={String(state.open)} data-live-hidden={String(state.hidden)} />,
      class: (state) => {
        seen.push({ open: state.open, hidden: state.hidden });
        return ['item', { expanded: state.open }];
      },
    }} />);
    const item = view.getByTestId('item-a');
    expect(item).toHaveAttribute('data-live-hidden', 'true');
    await view.user.click(view.getByText('First'));
    expect(view.getByTestId('item-a')).toBe(item);
    expect(item).toHaveClass('item', 'expanded');
    expect(item).toHaveAttribute('data-live-open', 'true');
    expect(item).toHaveAttribute('data-live-hidden', 'false');
    expect(seen.some((state) => state.open && state.hidden)).toBe(false);
  });

  it('supports numeric zero identities', async () => {
    const view = await render(() => <Accordion.Root defaultValue={[0]}>
      <Accordion.Item value={0}><Accordion.Trigger>Zero</Accordion.Trigger><Accordion.Panel>Content</Accordion.Panel></Accordion.Item>
    </Accordion.Root>);
    expect(view.getByText('Zero')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByRole('region')).toBeVisible();
  });
});
