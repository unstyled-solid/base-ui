import { createSignal, flush, untrack } from 'solid-js';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, describeConformance, sourceCase } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Separator, SeparatorDataAttributes } from './index';

const source = 'packages/react/src/separator/Separator.test.tsx';

describe('<Separator />', () => {
  const { render, renderProps } = createRenderer();

  describeConformance<Separator.State, Separator.Props & ConformantComponentProps<Separator.State>>(
    (props) => <Separator {...props} />,
    {
      initialProps: {},
      refInstanceof: HTMLDivElement,
      state: {
        change: { orientation: 'vertical' },
        assert: (state, changed) => {
          expect(untrack(() => state.orientation)).toBe(changed ? 'vertical' : 'horizontal');
        },
        class: (state) => state.orientation,
        before: 'horizontal',
        after: 'vertical',
      },
    },
  );

  sourceCase({ source, case: 'renders a div with the `separator` role', environment: 'jsdom' }, async () => {
    const view = await render(() => <Separator />);
    const node = view.getByRole('separator');
    expect(node).toBeVisible();
    expect(node.tagName).toBe('DIV');
    expect(node).toHaveAttribute('aria-orientation', 'horizontal');
    expect(node).toHaveAttribute(SeparatorDataAttributes.orientation, 'horizontal');
    expect(node).not.toHaveAttribute('orientation');
  });

  for (const orientation of ['horizontal', 'vertical'] as const) {
    sourceCase({ source, case: `orientation[${orientation}]`, environment: 'jsdom' }, async () => {
      const view = await render(() => <Separator orientation={orientation} />);
      expect(view.getByRole('separator')).toHaveAttribute('aria-orientation', orientation);
      expect(view.getByRole('separator')).toHaveAttribute('data-orientation', orientation);
    });
  }

  it('updates signal-driven orientation, live callbacks and styles on the same host', async () => {
    let setOrientation!: (value: Separator.Props['orientation']) => void;
    const ref = vi.fn();
    const renderHost = vi.fn((props: Parameters<NonNullable<Separator.Props['render']>>[0], state: Separator.State) => (
      <div {...props} data-render-orientation={state.orientation} />
    ));
    const view = await render(() => {
      const [orientation, set] = createSignal<Separator.Props['orientation']>('horizontal');
      setOrientation = set;
      return <Separator orientation={orientation()} ref={ref} render={renderHost}
        class={(state) => state.orientation}
        style={(state) => ({ 'border-top-width': state.orientation === 'horizontal' ? '1px' : '2px' })} />;
    });
    const node = view.getByRole('separator');
    for (const orientation of ['vertical', undefined] as const) {
      setOrientation(orientation);
      flush();
      const expected = orientation ?? 'horizontal';
      expect(view.getByRole('separator')).toBe(node);
      expect(node).toHaveAttribute('aria-orientation', expected);
      expect(node).toHaveAttribute('data-orientation', expected);
      expect(node).toHaveAttribute('data-render-orientation', expected);
      expect(node).toHaveClass(expected);
      expect(node.style.borderTopWidth).toBe(expected === 'horizontal' ? '1px' : '2px');
    }
    expect(renderHost).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it('lets consumer props override defaults, including explicit undefined', async () => {
    const view = await renderProps((props: Separator.Props) => <Separator {...props} data-testid="root" />,
      { role: 'presentation', 'aria-orientation': 'vertical', orientation: 'horizontal' });
    const node = view.getByTestId('root');
    expect(node).toHaveAttribute('role', 'presentation');
    expect(node).toHaveAttribute('aria-orientation', 'vertical');
    expect(node).toHaveAttribute('data-orientation', 'horizontal');
    await view.setProps({ role: undefined, 'aria-orientation': undefined });
    expect(view.getByTestId('root')).toBe(node);
    expect(node).not.toHaveAttribute('role');
    expect(node).not.toHaveAttribute('aria-orientation');
  });

  it('allows a consumer data attribute override without changing callback state', async () => {
    const view = await render(() => <Separator data-orientation="custom" class={(state) => state.orientation} />);
    expect(view.getByRole('separator')).toHaveAttribute('data-orientation', 'custom');
    expect(view.getByRole('separator')).toHaveClass('horizontal');
  });

  it('defaults only undefined and does not normalize invalid runtime values', async () => {
    const view = await renderProps((props: Separator.Props) => <Separator {...props} />, {});
    const node = view.getByRole('separator');
    await view.setProps({ orientation: null as unknown as Separator.Props['orientation'] });
    expect(node).not.toHaveAttribute('aria-orientation');
    expect(node).not.toHaveAttribute('data-orientation');
    await view.setProps({ orientation: 'diagonal' as Separator.Props['orientation'] });
    expect(node).toHaveAttribute('aria-orientation', 'diagonal');
    expect(node).toHaveAttribute('data-orientation', 'diagonal');
  });

  it('keeps original getter receivers while forwarding live props and state', async () => {
    let setOrientation!: (value: Separator.State['orientation']) => void;
    const view = await render(() => {
      const [orientation, set] = createSignal<Separator.State['orientation']>('horizontal');
      setOrientation = set;
      const props: Separator.Props = {
        get orientation() {
          expect(this).toBe(props);
          return orientation();
        },
        get title() {
          expect(this).toBe(props);
          return this.orientation;
        },
        get class() {
          expect(this).toBe(props);
          return this.orientation;
        },
      };
      return Separator(props);
    });
    const node = view.getByRole('separator');
    expect(node).toHaveAttribute('title', 'horizontal');
    setOrientation('vertical');
    flush();
    expect(view.getByRole('separator')).toBe(node);
    expect(node).toHaveAttribute('title', 'vertical');
    expect(node).toHaveAttribute('aria-orientation', 'vertical');
    expect(node).toHaveClass('vertical');
  });

  it('uses replacement class/style callbacks and removes their previous output', async () => {
    const beforeClass = vi.fn((state: Separator.State) => `before-${state.orientation}`);
    const afterClass = vi.fn((state: Separator.State) => `after-${state.orientation}`);
    const view = await renderProps<Separator.Props>((props) => <Separator {...props} />, {
      class: beforeClass,
      style: () => ({ color: 'red', 'border-top-width': '1px' }),
    });
    const node = view.getByRole('separator');
    expect(node).toHaveClass('before-horizontal');
    expect(node.style.color).toBe('red');
    await view.setProps({ orientation: 'vertical', class: afterClass,
      style: (state) => ({ color: state.orientation === 'vertical' ? 'blue' : 'green' }) });
    expect(view.getByRole('separator')).toBe(node);
    expect(node).toHaveClass('after-vertical');
    expect(node).not.toHaveClass('before-horizontal');
    expect(node.style.color).toBe('blue');
    expect(node.style.borderTopWidth).toBe('');
    beforeClass.mockClear();
    await view.setProps({ orientation: undefined });
    expect(node).toHaveClass('after-horizontal');
    expect(node.style.color).toBe('green');
    expect(beforeClass).not.toHaveBeenCalled();
    await view.setProps({ class: undefined, style: undefined });
    expect(node.className).toBe('');
    expect(node.style.color).toBe('');
  });

  for (const customized of [false, true]) {
    it(`replaces/removes ref arrays without recreating the ${customized ? 'custom' : 'default'} host`, async () => {
      const first = vi.fn<(node: HTMLDivElement | null) => void>();
      const second = vi.fn<(node: HTMLDivElement | null) => void>();
      const view = await renderProps<Separator.Props>((props) => <Separator {...props} />, {
        ref: [first],
        ...(customized ? { render: (props) => <div {...props} /> } satisfies Partial<Separator.Props> : {}),
      });
      const node = view.getByRole('separator');
      expect(first.mock.calls).toEqual([[node]]);
      await view.setProps({ ref: [second] });
      expect(view.getByRole('separator')).toBe(node);
      expect(first.mock.calls).toEqual([[node], [null]]);
      expect(second.mock.calls).toEqual([[node]]);
      await view.setProps({ orientation: 'vertical' });
      expect(second.mock.calls).toEqual([[node]]);
      await view.setProps({ ref: undefined });
      expect(second.mock.calls).toEqual([[node], [null]]);
      await view.setProps({ ref: [first, second] });
      expect(first.mock.calls).toEqual([[node], [null], [node]]);
      expect(second.mock.calls).toEqual([[node], [null], [node]]);
      view.unmount();
      expect(node.isConnected).toBe(false);
      expect(first.mock.calls).toEqual([[node], [null], [node], [null]]);
      expect(second.mock.calls).toEqual([[node], [null], [node], [null]]);
    });
  }

  const preservesChildFocusAndSelection = async () => {
    const view = await renderProps<Separator.Props>((props) => (
      <Separator {...props} render={(hostProps) => <div {...hostProps} />}>
        <input aria-label="selection probe" value="separator" />
      </Separator>
    ), { orientation: 'horizontal' });
    const node = view.getByRole('separator');
    const input = view.getByRole('textbox') as HTMLInputElement;
    await view.user.click(input);
    input.setSelectionRange(2, 6);
    await view.setProps({ orientation: 'vertical', class: (state) => state.orientation });
    expect(view.getByRole('separator')).toBe(node);
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(6);
    expect(node).toHaveAttribute('aria-orientation', 'vertical');
    expect(node).toHaveAttribute('data-orientation', 'vertical');
    view.unmount();
    expect(input.isConnected).toBe(false);
  };

  it('preserves child identity, focus and selection during live orientation updates', preservesChildFocusAndSelection);
  browserCase({ source, case: 'live orientation preserves child focus and selection', environment: 'browser',
    issue: 'bsolid-c-separator.2', adaptation: 'Solid live props and browser focus/selection qualification' }, preservesChildFocusAndSelection);
});
