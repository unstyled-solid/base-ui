import { describe, expect, it } from 'vitest';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { Toolbar } from '../index';
import type { ToolbarRootProps, ToolbarRootState } from './ToolbarRoot';
import { useToolbarRootContext } from './ToolbarRootContext';
import { DirectionProvider } from '../../direction-provider';

// Canonical source: toolbar/root/ToolbarRoot.test.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505.
describe('Toolbar.Root', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<ToolbarRootState, ToolbarConformanceProps<ToolbarRootProps, ToolbarRootState>>((props) => <Toolbar.Root {...props} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });

  it('provides optional context inside and outside, role and default orientation', async () => {
    function Consumer() {
      const context = useToolbarRootContext(true);
      return <span>{context?.orientation ?? 'outside'}</span>;
    }
    const view = await renderProps((props: { orientation: 'horizontal' | 'vertical' }) =>
      <><Consumer /><Toolbar.Root orientation={props.orientation}><Consumer /></Toolbar.Root></>, { orientation: 'horizontal' });
    expect(view.getByText('outside')).toBeVisible();
    expect(view.getByText('horizontal')).toBeVisible();
    expect(view.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
    await view.setProps({ orientation: 'vertical' });
    expect(view.getByText('outside')).toBeVisible();
    expect(view.getByText('vertical')).toBeVisible();
  });

  it('has role="toolbar" on its root host', async () => {
    const view = await render(() => <Toolbar.Root />);
    expect(view.container.firstElementChild).toHaveAttribute('role', 'toolbar');
  });

  it('propagates disabled state to all controls except links', async () => {
    const view = await render(() => <Toolbar.Root disabled>
      <Toolbar.Button /><Toolbar.Input /><Toolbar.Link href="#">outside group</Toolbar.Link>
      <Toolbar.Group><Toolbar.Button /><Toolbar.Input /><Toolbar.Link href="#">inside group</Toolbar.Link></Toolbar.Group>
    </Toolbar.Root>);
    for (const node of [...view.getAllByRole('button'), ...view.getAllByRole('textbox'), view.getByRole('group')]) {
      expect(node).toHaveAttribute('data-disabled');
    }
    for (const link of view.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('data-disabled');
      expect(link).not.toHaveAttribute('aria-disabled');
    }
    for (const control of [...view.getAllByRole('button'), ...view.getAllByRole('textbox')]) {
      expect(control).toHaveAttribute('aria-disabled', 'true');
    }
  });

  for (const [direction, orientation, next, previous] of [
    ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft'],
    ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight'],
    ['ltr', 'vertical', 'ArrowDown', 'ArrowUp'],
    ['rtl', 'vertical', 'ArrowDown', 'ArrowUp'],
  ] as const) {
    browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx', case: `navigation ${direction}/${orientation}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <DirectionProvider direction={direction}>
        <Toolbar.Root orientation={orientation} dir={direction}>
          <Toolbar.Button>first</Toolbar.Button><Toolbar.Link href="#">link</Toolbar.Link>
          <Toolbar.Group><Toolbar.Button>grouped one</Toolbar.Button><Toolbar.Button>grouped two</Toolbar.Button></Toolbar.Group>
          <Toolbar.Input defaultValue="" />
        </Toolbar.Root>
      </DirectionProvider>);
      const nodes = [view.getByRole('button', { name: 'first' }), view.getByRole('link'), view.getByRole('button', { name: 'grouped one' }), view.getByRole('button', { name: 'grouped two' }), view.getByRole('textbox')];
      await view.user.tab();
      expect(nodes[0]).toHaveFocus();
      for (const node of nodes.slice(1)) {
        await view.user.keyboard(`[${next}]`);
        expect(node).toHaveFocus();
      }
      await view.user.keyboard(`[${next}]`);
      expect(nodes[0]).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(nodes.at(-1)).toHaveFocus();
      await view.user.keyboard(`[${previous}]`);
      expect(nodes[3]).toHaveFocus();
    });
  }

  const doesNotWrap = async () => {
    const view = await render(() => <Toolbar.Root loopFocus={false}><Toolbar.Button>first</Toolbar.Button><Toolbar.Button>last</Toolbar.Button></Toolbar.Root>);
    await view.user.tab();
    expect(view.getByRole('button', { name: 'first' })).toHaveFocus();
    await view.user.keyboard('[ArrowLeft]');
    expect(view.getByRole('button', { name: 'first' })).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'last' })).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'last' })).toHaveFocus();
  };
  it('does not wrap when loopFocus is false', doesNotWrap);
  browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx', case: 'does not wrap focus when loopFocus is false', environment: 'browser', issue: 'bsolid-browser' }, doesNotWrap);

  for (const optOut of [false, true]) {
    browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx',
      case: optOut ? 'toolbar items can individually disable focusableWhenDisabled' : 'toolbar items can be focused when disabled by default',
      environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <Toolbar.Root>
        <Toolbar.Button disabled />
        <Toolbar.Group><Toolbar.Button disabled /><Toolbar.Button disabled {...(optOut ? { focusableWhenDisabled: false } : {})} /></Toolbar.Group>
        <Toolbar.Input defaultValue="" disabled />
      </Toolbar.Root>);
      const [first, groupedOne, groupedTwo] = view.getAllByRole('button');
      const input = view.getByRole('textbox');
      for (const item of [first, groupedOne, input, ...(optOut ? [] : [groupedTwo])]) {
        expect(item).not.toHaveAttribute('disabled');
      }
      if (optOut) expect(groupedTwo).toHaveAttribute('disabled');
      const expectFocusedDisabled = (item: HTMLElement) => {
        expect(item).toHaveAttribute('data-disabled');
        expect(item).toHaveAttribute('aria-disabled', 'true');
        expect(item).toHaveFocus();
      };
      await view.user.tab();
      expect(first).toHaveFocus();
      await view.user.keyboard('[ArrowRight]');
      expectFocusedDisabled(groupedOne);
      if (!optOut) {
        await view.user.keyboard('[ArrowRight]');
        expectFocusedDisabled(groupedTwo);
      }
      await view.user.keyboard('[ArrowRight]');
      expectFocusedDisabled(input);
      await view.user.keyboard('[ArrowRight]');
      expect(first).toHaveAttribute('tabindex', '0');
      await view.user.keyboard('[ArrowLeft]');
      expectFocusedDisabled(input);
      await view.user.keyboard('[ArrowLeft]');
      expectFocusedDisabled(optOut ? groupedOne : groupedTwo);
    });
  }

  it('keeps disabled buttons and inputs in the focus order by default', async () => {
    const view = await render(() => <Toolbar.Root disabled>
      <Toolbar.Button>first</Toolbar.Button>
      <Toolbar.Group><Toolbar.Button>second</Toolbar.Button><Toolbar.Button>third</Toolbar.Button></Toolbar.Group>
      <Toolbar.Input defaultValue="" />
    </Toolbar.Root>);
    const nodes = [...view.getAllByRole('button'), view.getByRole('textbox')];
    await view.user.tab();
    for (const node of nodes) {
      expect(node).not.toHaveAttribute('disabled');
      expect(node).toHaveAttribute('aria-disabled', 'true');
      expect(node).toHaveFocus();
      await view.user.keyboard('[ArrowRight]');
    }
    expect(nodes[0]).toHaveFocus();
  });

  it('moves the initial tab stop and skips only disabled non-focusable items', async () => {
    const view = await render(() => <Toolbar.Root>
      <Toolbar.Button disabled focusableWhenDisabled={false}>skipped first</Toolbar.Button>
      <Toolbar.Button focusableWhenDisabled={false}>enabled</Toolbar.Button>
      <Toolbar.Button disabled>focusable</Toolbar.Button>
      <Toolbar.Input disabled focusableWhenDisabled={false} />
      <Toolbar.Button>last</Toolbar.Button>
    </Toolbar.Root>);
    expect(view.getByRole('button', { name: 'skipped first' })).not.toHaveAttribute('tabindex', '0');
    expect(view.getByRole('button', { name: 'enabled' })).toHaveAttribute('tabindex', '0');
    await view.user.tab();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'focusable' })).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'last' })).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'enabled' })).toHaveFocus();
  });

  browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx', case: 'moves the initial tab stop off a disabled, non-focusable first item', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Toolbar.Root>
      <Toolbar.Button disabled focusableWhenDisabled={false} /><Toolbar.Button /><Toolbar.Button />
    </Toolbar.Root>);
    const [first, second, third] = view.getAllByRole('button');
    expect(first).toHaveAttribute('disabled');
    expect(first).not.toHaveAttribute('tabindex', '0');
    expect(second).toHaveAttribute('tabindex', '0');
    await view.user.tab();
    expect(second).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(third).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(second).toHaveFocus();
  });

  browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx', case: 'keeps an enabled item with focusableWhenDisabled={false} navigable', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Toolbar.Root>
      <Toolbar.Button /><Toolbar.Button focusableWhenDisabled={false} /><Toolbar.Button />
    </Toolbar.Root>);
    const [first, second, third] = view.getAllByRole('button');
    expect(second).not.toHaveAttribute('disabled');
    await view.user.tab();
    expect(first).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(second).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(third).toHaveFocus();
  });

  browserCase({ source: 'packages/react/src/toolbar/root/ToolbarRoot.test.tsx', case: 'skips a disabled Toolbar.Input with focusableWhenDisabled={false}', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Toolbar.Root>
      <Toolbar.Button /><Toolbar.Input defaultValue="" disabled focusableWhenDisabled={false} /><Toolbar.Button />
    </Toolbar.Root>);
    const [first, second] = view.getAllByRole('button');
    await view.user.tab();
    expect(first).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('textbox')).not.toHaveFocus();
    expect(second).toHaveFocus();
  });

  it('updates disabled metadata and DOM ordering after removal without replacing survivors', async () => {
    const view = await renderProps((props: { disabled: boolean; show: boolean }) => <Toolbar.Root>
      <Toolbar.Button>first</Toolbar.Button>
      {props.show && <Toolbar.Button disabled={props.disabled} focusableWhenDisabled={false}>middle</Toolbar.Button>}
      <Toolbar.Button>last</Toolbar.Button>
    </Toolbar.Root>, { disabled: false, show: true });
    const first = view.getByRole('button', { name: 'first' });
    const last = view.getByRole('button', { name: 'last' });
    await view.user.tab();
    await view.setProps({ disabled: true });
    await view.user.keyboard('[ArrowRight]');
    expect(last).toHaveFocus();
    await view.setProps({ show: false });
    expect(view.getByRole('button', { name: 'last' })).toBe(last);
    await view.user.keyboard('[ArrowRight]');
    expect(first).toHaveFocus();
  });

  it('isolates nested toolbar navigation', async () => {
    const view = await render(() => <Toolbar.Root>
      <Toolbar.Button>outer</Toolbar.Button>
      <Toolbar.Root><Toolbar.Button>inner one</Toolbar.Button><Toolbar.Button>inner two</Toolbar.Button></Toolbar.Root>
    </Toolbar.Root>);
    await view.user.click(view.getByRole('button', { name: 'inner one' }));
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'inner two' })).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(view.getByRole('button', { name: 'inner one' })).toHaveFocus();
  });
});
