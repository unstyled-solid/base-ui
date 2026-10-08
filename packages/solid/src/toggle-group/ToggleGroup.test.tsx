import { describe, expect, it, vi } from 'vitest';
import { createRenderer, browserCase, describeConformance, expectDiagnostic } from '#test-utils';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { DirectionProvider } from '../direction-provider';
import { Toggle } from '../toggle/Toggle';
import * as Toolbar from '../toolbar/index.parts';
import { useCompositeListContext } from '../internals/composite/list/CompositeList';
import { ToggleGroup, type ToggleGroupProps } from './ToggleGroup';
import { useToggleGroupContext } from './ToggleGroupContext';

// Source: upstream/base-ui@19511bb171f3b360b006c94cf6d07e53cb446505
// ToggleGroup.test.tsx and Toggle.test.tsx: exercise the actual consuming parts.
function Items() { return <><Toggle value="one">one</Toggle><Toggle value="two">two</Toggle><Toggle value="three">three</Toggle></>; }
function Initialized() {
  const context = useToggleGroupContext()!;
  return <output>{String(context.isValueInitialized)}</output>;
}

describe('ToggleGroup', () => {
  const { render, renderProps } = createRenderer();

  describeConformance<ToggleGroup.State, ConformantComponentProps<ToggleGroup.State>>((props) => <ToggleGroup {...props} />, {
    initialProps: {},
    refInstanceof: HTMLDivElement,
  });

  it('keeps state-derived classes live and forwards native refs and props', async () => {
    let ref: HTMLDivElement | undefined;
    const view = await renderProps<ToggleGroupProps>((props) => <ToggleGroup {...props}
      ref={(node) => { ref = node; }} class={(state) => ['group', { multiple: state.multiple }]} />,
    { 'aria-label': 'Formatting' });
    const host = view.getByRole('group', { name: 'Formatting' });
    expect(ref).toBe(host);
    expect(host).toHaveClass('group');
    expect(host).not.toHaveClass('multiple');
    await view.setProps({ multiple: true });
    expect(view.getByRole('group')).toBe(host);
    expect(host).toHaveClass('multiple');
  });

  it.each([false, true])('composes native ref arrays on the original host across selection updates (Toolbar=%s)', async (inToolbar) => {
    const first = vi.fn();
    const second = vi.fn();
    const refs = [first, second];
    function Group() {
      return <ToggleGroup ref={refs} defaultValue={['one']}><Items /></ToggleGroup>;
    }
    const view = await render(() => inToolbar ? <Toolbar.Root><Group /></Toolbar.Root> : <Group />);
    const group = view.getByRole('group');
    const one = view.getByRole('button', { name: 'one' });
    expect(first).toHaveBeenCalledExactlyOnceWith(group);
    expect(second).toHaveBeenCalledExactlyOnceWith(group);
    await view.user.click(one);
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(view.getByRole('group')).toBe(group);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(group.isConnected).toBe(false);
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenLastCalledWith(null);
  });

  it('provides an explicit null optional context outside a group', async () => {
    function Outside() {
      const context = useToggleGroupContext();
      return <output>{String(context === null)}</output>;
    }
    const view = await render(() => <Outside />);
    expect(view.getByRole('status')).toHaveTextContent('true');
  });

  it.each([false, true])('passes live props/state to render callbacks (Toolbar=%s)', async (inToolbar) => {
    function Group(props: ToggleGroupProps) {
      return <ToggleGroup {...props} render={(host, state) =>
        <section role={host.role} class={host.class} data-disabled-state={String(state.disabled)}>
          {host.children}
        </section>} />;
    }
    const view = await renderProps<ToggleGroupProps>((props) => inToolbar ?
      <Toolbar.Root><Group {...props} /></Toolbar.Root> :
      <Group {...props} />, { class: 'before' });
    const host = view.getByRole('group');
    expect(host.tagName).toBe('SECTION');
    expect(host).toHaveClass('before');
    expect(host).toHaveAttribute('data-disabled-state', 'false');
    await view.setProps({ class: ['after', { active: true }], disabled: true });
    expect(view.getByRole('group')).toBe(host);
    expect(host).toHaveClass('after', 'active');
    expect(host).toHaveAttribute('data-disabled-state', 'true');
  });

  it('renders live state on the same host without aria-orientation', async () => {
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Items /></ToggleGroup>, {});
    const host = view.getByRole('group');
    expect(host).toHaveAttribute('data-orientation', 'horizontal');
    expect(host).not.toHaveAttribute('aria-orientation');
    expect(host).not.toHaveAttribute('data-multiple');
    await view.setProps({ multiple: true, orientation: 'vertical', disabled: true });
    expect(view.getByRole('group')).toBe(host);
    expect(host).toHaveAttribute('data-multiple');
    expect(host).toHaveAttribute('data-orientation', 'vertical');
    await view.setProps({ multiple: false });
    expect(host).not.toHaveAttribute('data-multiple');
    expect(host).toHaveAttribute('data-disabled');
    expect(host).not.toHaveAttribute('aria-orientation');
    for (const button of view.getAllByRole('button')) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled');
    }
  });

  it('single mode replaces and deselects; default arrays remain immutable', async () => {
    const initial = Object.freeze(['two']);
    const view = await render(() => <ToggleGroup defaultValue={initial}><Items /></ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('data-pressed');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    await view.user.pointer({ keys: '[MouseLeft]', target: one! });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(one).toHaveAttribute('data-pressed');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(one!);
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(initial).toEqual(['two']);
  });

  it('multiple adds/removes immutably and changing mode preserves current selection', async () => {
    const initial = Object.freeze(['one']);
    const changes = vi.fn();
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Items /></ToggleGroup>, {
      defaultValue: initial, multiple: true, onValueChange: changes,
    });
    const [one, two] = view.getAllByRole('button');
    await view.user.click(two!);
    expect(changes.mock.calls[0]![0]).toEqual(['one', 'two']);
    await view.setProps({ multiple: false });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(two!);
    expect(changes.mock.calls[1]![0]).toEqual([]);
    await view.setProps({ multiple: true });
    await view.user.click(one!);
    await view.user.click(two!);
    await view.user.click(one!);
    expect(changes.mock.lastCall![0]).toEqual(['two']);
    expect(initial).toEqual(['one']);
  });

  it('controlled requests notify without overwriting external value and use current callbacks', async () => {
    const before = vi.fn();
    const after = vi.fn();
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Items /></ToggleGroup>, {
      value: ['two'], onValueChange: before,
    });
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one!);
    expect(before.mock.calls[0]![0]).toEqual(['one']);
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    await view.setProps({ value: ['one'], onValueChange: after });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(two!);
    expect(after.mock.calls[0]![0]).toEqual(['two']);
    expect(before).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('keeps current controlled context and item callbacks (multiple=%s)', async (multiple) => {
    const before = vi.fn();
    const after = vi.fn();
    const changed = vi.fn();
    const view = await renderProps<ToggleGroupProps & { itemChange?: Toggle.Props['onPressedChange'] }>((props) =>
      <ToggleGroup value={props.value} multiple={props.multiple} onValueChange={props.onValueChange}>
        <Toggle value="one" onPressedChange={props.itemChange} />
        <Toggle value="two" />
      </ToggleGroup>, { multiple, value: ['two'], onValueChange: before, itemChange: before });
    const [one, two] = view.getAllByRole('button');
    await view.setProps({ value: ['one'], onValueChange: changed, itemChange: after });
    await view.user.click(one!);
    expect(after).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'none' }));
    expect(changed.mock.lastCall![0]).toEqual([]);
    expect(changed.mock.lastCall![1]).toBe(after.mock.lastCall![1]);
    expect(before).not.toHaveBeenCalled();
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(two!);
    expect(changed.mock.lastCall![0]).toEqual(multiple ? ['one', 'two'] : ['two']);
  });

  it.each([false, true])('gives omitted and empty item values independent generated identities (multiple=%s)', async (multiple) => {
    const changed = vi.fn();
    const view = await render(() => <ToggleGroup multiple={multiple} onValueChange={changed}>
      <Toggle />
      <Toggle value="" />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one!);
    const first = changed.mock.lastCall![0][0];
    expect(first).toEqual(expect.any(String));
    expect(first).not.toBe('');
    await view.user.click(two!);
    const second = changed.mock.lastCall![0].at(-1);
    expect(second).not.toBe(first);
    expect(second).not.toBe('');
    expect(one).toHaveAttribute('aria-pressed', String(multiple));
    expect(two).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(two!);
    expect(changed.mock.lastCall![0]).toEqual(multiple ? [first] : []);
  });

  it('group selection takes precedence over individual default and controlled pressed props', async () => {
    const view = await render(() => <ToggleGroup defaultValue={['two']}>
      <Toggle value="one" defaultPressed pressed />
      <Toggle value="two" defaultPressed={false} pressed={false} />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(two).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(one!);
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
  });

  for (const multiple of [false, true]) {
    it.each(['item', 'group', 'neither'] as const)(`shares details, orders callbacks and respects %s cancellation (multiple=${multiple})`, async (cancelAt) => {
      const order: string[] = [];
      let itemDetails: ToggleGroup.ChangeEventDetails | undefined;
      const onValueChange = vi.fn((_value, details) => {
        order.push('group');
        expect(details).toBe(itemDetails);
        if (cancelAt === 'group') details.cancel();
      });
      const view = await render(() => <ToggleGroup multiple={multiple} defaultValue={['two']} onValueChange={onValueChange}>
        <Toggle value="one" onPressedChange={(_pressed, details) => {
          order.push('item');
          itemDetails = details;
          if (cancelAt === 'item') details.cancel();
        }}>One</Toggle>
        <Toggle value="two">Two</Toggle>
      </ToggleGroup>);
      const button = view.getByRole('button', { name: 'One' });
      await view.user.click(button);
      expect(order).toEqual(cancelAt === 'item' ? ['item'] : ['item', 'group']);
      expect(button).toHaveAttribute('aria-pressed', String(cancelAt === 'neither'));
      expect(view.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-pressed', String(multiple || cancelAt !== 'neither'));
      if (cancelAt !== 'item') expect(onValueChange.mock.lastCall![0]).toEqual(multiple ? ['two', 'one'] : ['one']);
    });
  }

  it('distinguishes omitted and defined-empty raw values reactively', async () => {
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Initialized /></ToggleGroup>, {});
    expect(view.getByRole('status')).toHaveTextContent('false');
    await view.setProps({ defaultValue: [] });
    expect(view.getByRole('status')).toHaveTextContent('true');
    await view.setProps({ defaultValue: undefined });
    expect(view.getByRole('status')).toHaveTextContent('false');
  });

  it('recognizes a controlled empty value as initialized', async () => {
    const view = await render(() => <ToggleGroup value={[]}><Initialized /></ToggleGroup>);
    expect(view.getByRole('status')).toHaveTextContent('true');
  });

  it('keeps a defined empty default initialized while preserving independent omitted item identities', async () => {
    let view!: Awaited<ReturnType<typeof render>>;
    await expectDiagnostic({ message: /^Base UI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop\. This will cause issues between the Toggle Group and Toggle values\. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type\.$/ }, async () => {
      view = await render(() => <ToggleGroup defaultValue={[]}>
        <Initialized /><Toggle /><Toggle value="" />
      </ToggleGroup>);
    });
    expect(view.getByRole('status')).toHaveTextContent('true');
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one!);
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
  });

  it('does not reinitialize selection when defaultValue changes', async () => {
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Items /></ToggleGroup>, { defaultValue: ['one'] });
    const [one, two] = view.getAllByRole('button');
    await expectDiagnostic({ message: /^Base UI: A component is changing the default value state of an uncontrolled ToggleGroup after being initialized\. To suppress this warning opt to use a controlled ToggleGroup\.$/ },
      () => view.setProps({ defaultValue: ['two'] }));
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
  });

  it.each([false, true])('does not leak control props or an extra wrapper into source DOM (Toolbar=%s)', async (inToolbar) => {
    function Group() {
      return <ToggleGroup data-testid="toggle-group" defaultValue={['one']} multiple disabled
        orientation="vertical" loopFocus={false} onValueChange={vi.fn()}>
        <Toggle value="one">One</Toggle>
      </ToggleGroup>;
    }
    const view = await render(() => inToolbar ? <Toolbar.Root><Group /></Toolbar.Root> : <Group />);
    const group = view.getByTestId('toggle-group');
    expect(group.tagName).toBe('DIV');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAttribute('data-disabled');
    expect(group).toHaveAttribute('data-multiple');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).not.toHaveAttribute('aria-orientation');
    for (const attribute of ['value', 'defaultvalue', 'disabled', 'multiple', 'orientation', 'loopfocus', 'onvaluechange', 'state', 'refs', 'props']) {
      expect(group).not.toHaveAttribute(attribute);
    }
    expect(group.children).toHaveLength(1);
    expect(group.firstElementChild).toBe(view.getByRole('button'));
    if (inToolbar) expect(group.parentElement).toBe(view.getByRole('toolbar'));
  });

  it('keeps omitted defaults isolated between groups', async () => {
    const view = await render(() => <>
      <ToggleGroup multiple><Toggle value="one" /></ToggleGroup>
      <ToggleGroup multiple><Toggle value="two" /></ToggleGroup>
    </>);
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one!);
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(two!);
    expect(one).toHaveAttribute('aria-pressed', 'true');
  });

  it('reuses the actual Toolbar registry across group boundaries', async () => {
    const lists: ReturnType<typeof useCompositeListContext>[] = [];
    function Registry() {
      lists.push(useCompositeListContext());
      return null;
    }
    const view = await render(() => <Toolbar.Root>
      <Registry />
      <Toolbar.Button>Before</Toolbar.Button>
      <Toolbar.Group><ToggleGroup orientation="vertical" loopFocus={false}>
        <Registry /><Items />
      </ToggleGroup></Toolbar.Group>
      <Toolbar.Button>After</Toolbar.Button>
    </Toolbar.Root>);
    expect(lists).toHaveLength(2);
    expect(lists[1]).toBe(lists[0]);
    const buttons = view.getAllByRole('button');
    await view.user.tab();
    expect(buttons[0]).toHaveFocus();
    await view.user.keyboard('[ArrowRight][ArrowRight][ArrowRight][ArrowRight]');
    expect(buttons[4]).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(buttons[0]).toHaveFocus();
    // ToggleGroup cannot enable Home/End or override the containing Toolbar axis.
    await view.user.keyboard('[ArrowDown][End]');
    expect(buttons[0]).toHaveFocus();
    const group = view.getAllByRole('group')[1]!;
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).not.toHaveAttribute('aria-orientation');
    expect(group.tagName).toBe('DIV');
    expect(view.getByRole('toolbar').children).toHaveLength(3);
  });

  it('skips an individually disabled Toggle during standalone navigation', async () => {
    const changed = vi.fn();
    const view = await render(() => <ToggleGroup onValueChange={changed}>
      <Toggle value="one" />
      <Toggle value="two" disabled />
      <Toggle value="three" />
    </ToggleGroup>);
    const [one, two, three] = view.getAllByRole('button');
    expect(one).toHaveAttribute('aria-disabled', 'false');
    expect(one).not.toHaveAttribute('data-disabled');
    expect(two).toHaveAttribute('aria-disabled', 'true');
    expect(two).toHaveAttribute('data-disabled');
    await view.user.tab();
    await view.user.keyboard('[ArrowRight]');
    expect(three).toHaveFocus();
    await view.user.click(two!);
    expect(changed).not.toHaveBeenCalled();
  });

  it.each(['root', 'group', 'own'] as const)('inherits disabled from %s inside Toolbar', async (source) => {
    const view = await renderProps((props: { disabled: boolean }) =>
      <Toolbar.Root disabled={source === 'root' && props.disabled}>
        <Toolbar.Group disabled={source === 'group' && props.disabled}>
          <ToggleGroup disabled={source === 'own' && props.disabled}><Items /></ToggleGroup>
        </Toolbar.Group>
      </Toolbar.Root>, { disabled: true });
    for (const button of view.getAllByRole('button')) expect(button).toBeDisabled();
    await view.setProps({ disabled: false });
    for (const button of view.getAllByRole('button')) expect(button).not.toBeDisabled();
  });

  const source = 'packages/react/src/toggle-group/ToggleGroup.test.tsx';
  for (const multiple of [false, true]) {
    it(`source omitted values preserve each pressed observation (multiple=${multiple})`, async () => {
      const view = await render(() => <ToggleGroup multiple={multiple}>
        {multiple ? <Toggle value="" /> : <Toggle />}
        {multiple ? <Toggle /> : <Toggle value="" />}
      </ToggleGroup>);
      const [one, two] = view.getAllByRole('button');
      expect(one).toHaveAttribute('aria-pressed', 'false');
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.user.click(one);
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.user.click(two);
      expect(one).toHaveAttribute('aria-pressed', String(multiple));
      expect(two).toHaveAttribute('aria-pressed', 'true');
      if (multiple) {
        await view.user.click(one);
        expect(one).toHaveAttribute('aria-pressed', 'false');
        expect(two).toHaveAttribute('aria-pressed', 'true');
      }
    });
  }
  for (const boundary of ['Home', 'End'] as const) {
    browserCase({ source, case: `source ${boundary} exact focus sequence`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <ToggleGroup><Items /></ToggleGroup>);
      const [one, two, three] = view.getAllByRole('button');
      await view.user.keyboard('[Tab]');
      expect(one).toHaveFocus();
      if (boundary === 'Home') {
        await view.user.keyboard('[ArrowRight][ArrowRight]');
        expect(three).toHaveFocus();
      }
      const selected = boundary === 'Home' ? one : three;
      await view.user.keyboard(`[${boundary}]`);
      expect(selected).toHaveAttribute('tabindex', '0');
      expect(selected).toHaveFocus();
      await view.user.keyboard(boundary === 'Home' ? '[ArrowRight]' : '[ArrowLeft]');
      expect(two).toHaveFocus();
      await view.user.keyboard(`[${boundary}]`);
      expect(selected).toHaveAttribute('tabindex', '0');
      expect(selected).toHaveFocus();
    });
  }
  it('source single selection and callback sequence uses one then two', async () => {
    const change = vi.fn();
    const view = await render(() => <ToggleGroup onValueChange={change}><Toggle value="one" /><Toggle value="two" /></ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    expect(change).not.toHaveBeenCalled();
    await view.user.pointer({ keys: '[MouseLeft]', target: one });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(one).toHaveAttribute('data-pressed');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toEqual(['one']);
    await view.user.pointer({ keys: '[MouseLeft]', target: two });
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('data-pressed');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls[1][0]).toEqual(['two']);
  });
  it('source controlled selection updates two to one to two', async () => {
    const view = await renderProps((props: ToggleGroupProps) => <ToggleGroup {...props}><Toggle value="one" /><Toggle value="two" /></ToggleGroup>, { value: ['two'] });
    const [one, two] = view.getAllByRole('button');
    for (const value of [['two'], ['one'], ['two']]) {
      await view.setProps({ value });
      const selected = value[0] === 'one' ? one : two;
      const other = selected === one ? two : one;
      expect(selected).toHaveAttribute('aria-pressed', 'true');
      expect(selected).toHaveAttribute('data-pressed');
      expect(other).toHaveAttribute('aria-pressed', 'false');
    }
  });
  for (const multiple of [false, true]) {
    it(`source default one selects two (multiple=${multiple})`, async () => {
      const view = await render(() => <ToggleGroup multiple={multiple} defaultValue={['one']}><Toggle value="one" /><Toggle value="two" /></ToggleGroup>);
      const [one, two] = view.getAllByRole('button');
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.user.pointer({ keys: '[MouseLeft]', target: two });
      expect(one).toHaveAttribute('aria-pressed', String(multiple));
      expect(two).toHaveAttribute('aria-pressed', 'true');
    });
  }
  for (const key of ['Enter', 'Space']) {
    browserCase({ source, case: `source callback first then second (${key})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const change = vi.fn();
      const view = await render(() => <ToggleGroup onValueChange={change}><Toggle value="one" /><Toggle value="two" /></ToggleGroup>);
      const [one, two] = view.getAllByRole('button');
      expect(change).not.toHaveBeenCalled();
      one.focus();
      await view.user.keyboard(`[${key}]`);
      expect(change).toHaveBeenCalledTimes(1);
      expect(change.mock.calls[0][0]).toEqual(['one']);
      two.focus();
      await view.user.keyboard(`[${key}]`);
      expect(change).toHaveBeenCalledTimes(2);
      expect(change.mock.calls[1][0]).toEqual(['two']);
    });
  }
  for (const inToolbar of [false, true]) {
    browserCase({ source, case: `multiple transitions preserve selection and roving focus (Toolbar=${inToolbar})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      function Group(props: ToggleGroupProps) {
        return <ToggleGroup {...props} data-testid="toggle-group"><Toggle value="one">One</Toggle><Toggle value="two">Two</Toggle></ToggleGroup>;
      }
      const view = await renderProps<ToggleGroupProps>((props) => inToolbar ?
        <Toolbar.Root><Toolbar.Group><Group {...props} /></Toolbar.Group></Toolbar.Root> :
        <Group {...props} />, { defaultValue: ['one'], multiple: false });
      const [one, two] = view.getAllByRole('button');
      const group = view.getByTestId('toggle-group');
      expect(group).not.toHaveAttribute('data-multiple');
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.user.tab();
      await view.user.keyboard('[ArrowRight]');
      expect(two).toHaveFocus();
      await view.user.click(two!);
      expect(one).toHaveAttribute('aria-pressed', 'false');
      expect(two).toHaveAttribute('aria-pressed', 'true');
      await view.setProps({ multiple: true });
      expect(group).toHaveAttribute('data-multiple');
      expect(view.getByTestId('toggle-group')).toBe(group);
      expect(two).toHaveFocus();
      await view.user.click(one!);
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'true');
      await view.user.click(two!);
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.setProps({ multiple: false });
      expect(group).not.toHaveAttribute('data-multiple');
      await view.user.click(two!);
      expect(one).toHaveAttribute('aria-pressed', 'false');
      expect(two).toHaveAttribute('aria-pressed', 'true');
      await view.user.keyboard('[ArrowLeft]');
      expect(one).toHaveFocus();
    });
  }
  for (const key of ['Enter', 'Space']) {
    browserCase({ source, case: `${key} toggles selection and fires onValueChange`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const onValueChange = vi.fn();
      const view = await render(() => <ToggleGroup onValueChange={onValueChange}><Items /></ToggleGroup>);
      const one = view.getAllByRole('button')[0]!;
      expect(one).toHaveAttribute('aria-pressed', 'false');
      await view.user.tab();
      await view.user.keyboard(`[${key}]`);
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(onValueChange.mock.calls[0]![0]).toEqual(['one']);
      await view.user.keyboard(`[${key}]`);
      expect(one).toHaveAttribute('aria-pressed', 'false');
      expect(onValueChange.mock.calls[1]![0]).toEqual([]);
      expect(onValueChange).toHaveBeenCalledTimes(2);
      const two = view.getAllByRole('button')[1]!;
      two.focus();
      await view.user.keyboard(`[${key}]`);
      expect(onValueChange).toHaveBeenCalledTimes(3);
      expect(onValueChange.mock.calls[2]![0]).toEqual(['two']);
    });
  }
  browserCase({ source, case: 'loopFocus=false stops at the boundary', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <ToggleGroup loopFocus={false}><Items /></ToggleGroup>);
    const [one, , three] = view.getAllByRole('button');
    await view.user.tab();
    await view.user.keyboard('[ArrowLeft]');
    expect(one).toHaveFocus();
    await view.user.keyboard('[End][ArrowRight]');
    expect(three).toHaveFocus();
  });
  for (const [direction, orientation, next, previous, ignored, ignoredPrevious] of [
    ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'],
    ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'],
    ['ltr', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'],
    ['rtl', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'],
  ] as const) {
    browserCase({ source, case: `keyboard ${direction}/${orientation}, looping, Home/End`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <DirectionProvider direction={direction}>
        <ToggleGroup orientation={orientation}><Items /></ToggleGroup>
      </DirectionProvider>);
      const [one, two, three] = view.getAllByRole('button');
      await view.user.tab();
      expect(one).toHaveFocus();
      expect(one).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${next}]`);
      expect(two).toHaveFocus();
      expect(two).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${next}]`);
      expect(three).toHaveFocus();
      expect(three).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${next}]`);
      expect(one).toHaveFocus();
      expect(one).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${previous}]`);
      expect(three).toHaveFocus();
      expect(three).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${previous}]`);
      expect(two).toHaveFocus();
      expect(two).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${ignored}]`);
      expect(two).toHaveFocus();
      expect(two).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${ignoredPrevious}]`);
      expect(two).toHaveFocus();
      expect(two).toHaveAttribute('tabindex', '0');
      await view.user.keyboard('[End]');
      expect(three).toHaveFocus();
      await view.user.keyboard(`[${next}]`);
      expect(one).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(three).toHaveFocus();
      await view.user.keyboard('[Home]');
      expect(one).toHaveFocus();
      expect(one).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${next}][Home]`);
      expect(one).toHaveFocus();
      expect(one).toHaveAttribute('tabindex', '0');
      await view.user.keyboard('[End]');
      expect(three).toHaveFocus();
      expect(three).toHaveAttribute('tabindex', '0');
      await view.user.keyboard(`[${previous}][End]`);
      expect(three).toHaveFocus();
      expect(three).toHaveAttribute('tabindex', '0');
    });
  }

  browserCase({ source, case: 'Toolbar registry reuse and multiple transition preserves focus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps<ToggleGroupProps>((props) =>
      <Toolbar.Root>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Group><ToggleGroup {...props}><Items /></ToggleGroup></Toolbar.Group>
        <Toolbar.Button>After</Toolbar.Button>
      </Toolbar.Root>, { defaultValue: ['one'] });
    const buttons = view.getAllByRole('button');
    await view.user.tab();
    expect(buttons[0]).toHaveFocus();
    await view.user.keyboard('[ArrowRight][ArrowRight]');
    expect(buttons[2]).toHaveFocus();
    await view.setProps({ multiple: true });
    expect(buttons[2]).toHaveFocus();
    await view.user.keyboard('[ArrowRight][ArrowRight]');
    expect(buttons[4]).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(buttons[0]).toHaveFocus();
  });
});
