import { beforeEach, describe, expect, vi } from 'vitest';
import { createRenderer, screen, fireEvent, firePointer, advanceTimers, sourceCase, waitFor } from '../../../test';
import { Tooltip } from '../index';
import { hover, settle, upstream } from '../Tooltip.test-utils';

const { render } = createRenderer();
function Nested(props: { delay?: number; childDelay?: number; disabled?: boolean; childDisabled?: boolean; open?: boolean; detached?: boolean; changed?: Tooltip.Root.Props['onOpenChange']; }) {
  const handle = Tooltip.createHandle<string>();
  const OuterTrigger = () => <Tooltip.Trigger handle={props.detached ? handle : undefined} payload="Row" delay={props.delay ?? 100} disabled={props.disabled}
    render={p => <span {...p} tabindex={0} />} data-testid="outer-trigger">
    <span data-testid="outer-area">Outer area</span>
    <Tooltip.Root><Tooltip.Trigger disabled={props.childDisabled} delay={props.childDelay ?? 1000} data-testid="inner-trigger">Inner</Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="inner-popup">Inner tooltip</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>
    <button data-testid="after">After</button>
  </Tooltip.Trigger>;
  return <>
    {props.detached && <OuterTrigger />}
    <Tooltip.Root handle={handle} open={props.open} onOpenChange={props.changed}>
      {state => <>{!props.detached && <OuterTrigger />}
        <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="outer-popup">{props.detached ? `${state.payload} tooltip` : 'Outer tooltip'}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
      </>}
    </Tooltip.Root>
  </>;
}
const check = (title: string, run: () => Promise<void>) => sourceCase({ source: `${upstream}root/TooltipRoot.test.tsx`, case: `nested tooltips/${title}`, environment: 'jsdom' }, run);
function enterChild() {
  const child = screen.getByTestId('inner-trigger');
  // A hover is pointerenter, not a press: a bubbling pointerdown would dismiss
  // an already-open ancestor before nested-hover policy can observe it.
  fireEvent.pointerEnter(child, { pointerType: 'mouse' });
  fireEvent.mouseEnter(child); fireEvent.mouseOver(child); fireEvent.mouseMove(child);
}
function returnToParent() { fireEvent.mouseOut(screen.getByTestId('inner-trigger'), { relatedTarget: screen.getByTestId('outer-area') }); fireEvent.mouseOver(screen.getByTestId('outer-area')); }

describe('Tooltip nested source semantics', () => {
  // Only hover delays are simulated; native ResizeObserver and RAF share the
  // real browser clock, as in TooltipRoot's hover fixtures.
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }));
  check('moving between sibling nested triggers never opens their ancestor', async () => {
    const view = await render(() => <Tooltip.Root><Tooltip.Trigger render={props => <span {...props} />} data-testid="ancestor">
      {['A', 'B'].map(name => <Tooltip.Root><Tooltip.Trigger delay={100} data-testid={name}>{name}</Tooltip.Trigger>
        <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid={`popup-${name}`}>{name} content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
      </Tooltip.Root>)}
    </Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="ancestor-popup" /></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>);
    hover(screen.getByTestId('ancestor')); hover(screen.getByTestId('A')); fireEvent.mouseOver(screen.getByTestId('A')); await advanceTimers(100);
    expect(screen.getByTestId('popup-A')).toBeInTheDocument(); expect(screen.queryByTestId('ancestor-popup')).toBeNull();
    expect(screen.queryByTestId('popup-B')).toBeNull();
    fireEvent.mouseOut(screen.getByTestId('A'), { relatedTarget: screen.getByTestId('B') }); hover(screen.getByTestId('B')); fireEvent.mouseOver(screen.getByTestId('B')); await advanceTimers(100);
    expect(screen.getByTestId('popup-B')).toBeInTheDocument(); expect(screen.queryByTestId('popup-A')).toBeNull();
    expect(screen.queryByTestId('ancestor-popup')).toBeNull(); view.unmount();
  });
  check('third-level hover suppresses both ancestor tooltips', async () => {
    function Level(props: { level: number }) {
      return <Tooltip.Root><Tooltip.Trigger delay={100} render={p => props.level < 3 ? <span {...p} /> : <button {...p} />} data-testid={`level-${props.level}`}>
        Level {props.level}{props.level < 3 && <Level level={props.level + 1} />}
      </Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid={`popup-${props.level}`} /></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>;
    }
    const view = await render(() => <Level level={1} />);
    for (const level of [1, 2, 3]) hover(screen.getByTestId(`level-${level}`));
    fireEvent.mouseOver(screen.getByTestId('level-3')); await advanceTimers(100);
    expect(screen.getByTestId('popup-3')).toBeInTheDocument();
    expect(screen.queryByTestId('popup-1')).toBeNull(); expect(screen.queryByTestId('popup-2')).toBeNull(); view.unmount();
  });
  check('an externally controlled open before pending reopen does not reannounce', async () => {
    const changed = vi.fn();
    const { renderProps } = createRenderer();
    const view = await renderProps<{ open: boolean }>(props => <Nested open={props.open} changed={changed} />, { open: false });
    enterChild(); returnToParent(); await view.setProps({ open: true });
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument();
    await advanceTimers(100);
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); expect(changed).not.toHaveBeenCalled(); view.unmount();
  });
  for (const detached of [false, true]) {
    check(`suppresses parent and safePolygon reopening before delay expires/detached=${detached}`, async () => {
      const view = await render(() => <Nested detached={detached} />);
      hover(screen.getByTestId('outer-trigger')); await advanceTimers(50); enterChild();
      fireEvent.mouseMove(screen.getByTestId('inner-trigger'), { clientX: 51 });
      await advanceTimers(100); expect(screen.queryByTestId('outer-popup')).toBeNull();
      await advanceTimers(900); expect(screen.getByTestId('inner-popup')).toBeInTheDocument(); view.unmount();
    });
    for (const delay of [0, 100]) {
      check(`restarts the full parent delay on returning to parent area/detached=${detached}/delay=${delay}`, async () => {
        const view = await render(() => <Nested detached={detached} delay={delay} />);
        enterChild(); await settle();
        expect(screen.queryByTestId('outer-popup')).toBeNull();
        returnToParent();
        if (delay) { await advanceTimers(99); expect(screen.queryByTestId('outer-popup')).toBeNull(); await advanceTimers(1); }
        else await settle();
        expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); view.unmount();
      });
    }
  }
  for (const interruption of ['child-reentry', 'parent-leave', 'unmount'] as const) {
    check(`cancels pending parent reopen/${interruption}`, async () => {
      const view = await render(() => <Nested />); enterChild(); returnToParent(); await advanceTimers(50);
      if (interruption === 'child-reentry') enterChild();
      if (interruption === 'parent-leave') fireEvent.mouseLeave(screen.getByTestId('outer-trigger'), { relatedTarget: document.body });
      if (interruption === 'unmount') view.unmount();
      await advanceTimers(100); expect(screen.queryByTestId('outer-popup')).toBeNull(); view.unmount();
    });
  }
  check('closes a hover-opened parent on nested hover', async () => {
    const view = await render(() => <Nested />); hover(screen.getByTestId('outer-trigger')); await advanceTimers(100);
    expect(screen.queryByTestId('inner-popup')).toBeNull();
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); enterChild(); await settle();
    expect(screen.queryByTestId('outer-popup')).toBeNull(); view.unmount();
  });
  for (const opening of ['focus', 'controlled'] as const) {
    check(`keeps a ${opening}-opened parent open on nested hover`, async () => {
      const changed = vi.fn(); const view = await render(() => <Nested open={opening === 'controlled' ? true : undefined} changed={changed} />);
      if (opening === 'focus') { screen.getByTestId('outer-trigger').focus(); await settle(); }
      expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); changed.mockClear(); enterChild(); await advanceTimers(100);
      expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); expect(changed).not.toHaveBeenCalled(); view.unmount();
    });
  }
  check('does not open a disabled parent on local reopen', async () => {
    const view = await render(() => <Nested disabled delay={0} />); enterChild(); await advanceTimers(0);
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    returnToParent(); await advanceTimers(0);
    expect(screen.queryByTestId('outer-popup')).toBeNull(); view.unmount();
  });
  check('allows parent hover when the nested trigger is disabled', async () => {
    const view = await render(() => <Nested childDisabled />); hover(screen.getByTestId('outer-trigger')); enterChild(); await advanceTimers(100);
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); expect(screen.queryByTestId('inner-popup')).toBeNull(); view.unmount();
  });
  check('touch local reopen is excluded, then mouse-only reentry works after leaving', async () => {
    const view = await render(() => <Nested delay={0} />);
    const outer = screen.getByTestId('outer-trigger');
    firePointer.down(outer, { pointerType: 'touch', timeStamp: 1 }); fireEvent.mouseOver(screen.getByTestId('inner-trigger')); returnToParent(); await settle();
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    fireEvent.mouseLeave(outer); fireEvent.mouseOver(screen.getByTestId('inner-trigger')); returnToParent(); await settle();
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument(); view.unmount();
  });
  check('nested focus does not open the parent and blur closes the child', async () => {
    const view = await render(() => <Nested />); screen.getByTestId('inner-trigger').focus(); await settle();
    expect(screen.getByTestId('inner-popup')).toBeInTheDocument(); expect(screen.queryByTestId('outer-popup')).toBeNull();
    screen.getByTestId('after').focus(); await advanceTimers(600);
    expect(screen.queryByTestId('inner-popup')).toBeNull(); view.unmount();
  });
  for (const emptyPath of [false, true]) {
    check(`shadow traversal and event-target fallback/emptyPath=${emptyPath}`, async () => {
      const view = await render(() => <Tooltip.Root><Tooltip.Trigger render={p => <span {...p} />} data-testid="outer-trigger">
        <Tooltip.Root><Tooltip.Trigger render={p => <div {...p} />} data-testid="inner-trigger">Inner</Tooltip.Trigger></Tooltip.Root>
      </Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="outer-popup" /></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>);
      hover(screen.getByTestId('outer-trigger'));
      const child = screen.getByTestId('inner-trigger'); const target = emptyPath ? child : child.attachShadow({ mode: 'open' }).appendChild(document.createElement('span'));
      const event = new MouseEvent('mouseover', { bubbles: true, composed: true });
      if (emptyPath) Object.defineProperty(event, 'composedPath', { value: () => [] });
      target.dispatchEvent(event); await advanceTimers(600); expect(screen.queryByTestId('outer-popup')).toBeNull(); view.unmount();
    });
  }
  check('detached parent nested handoff retains Row payload', async () => {
    const view = await render(() => <Nested detached childDelay={0} />);
    fireEvent.pointerEnter(screen.getByTestId('outer-trigger'), { pointerType: 'mouse' });
    fireEvent.mouseEnter(screen.getByTestId('outer-trigger'));
    enterChild(); await advanceTimers(100);
    expect(screen.getByTestId('inner-popup')).toBeInTheDocument();
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    returnToParent(); await advanceTimers(100);
    expect(screen.getByTestId('outer-popup')).toHaveTextContent('Row tooltip');
    view.unmount();
  });
  check('hovering nested popup does not reopen the outer tooltip', async () => {
    const view = await render(() => <Nested childDelay={0} />);
    fireEvent.pointerEnter(screen.getByTestId('outer-trigger'), { pointerType: 'mouse' });
    fireEvent.mouseEnter(screen.getByTestId('outer-trigger'));
    enterChild(); await advanceTimers(100);
    const popup = screen.getByTestId('inner-popup');
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    fireEvent.mouseOver(popup); await advanceTimers(100);
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    view.unmount();
  });
  check('outer popup to nested trigger closes its hover-opened parent', async () => {
    const view = await render(() => <Nested />);
    const trigger = screen.getByTestId('outer-trigger');
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger); await advanceTimers(100);
    const popup = screen.getByTestId('outer-popup');
    fireEvent.pointerEnter(popup, { pointerType: 'mouse', clientX: 200, clientY: 200 });
    fireEvent.mouseOver(popup);
    await waitFor(() => expect(popup).toBeInTheDocument());
    enterChild();
    await waitFor(() => expect(screen.queryByTestId('outer-popup')).toBeNull());
    view.unmount();
  });
  check('Provider delay=0 suppresses ancestor and supports local parent reopen', async () => {
    const view = await render(() => <Tooltip.Provider delay={0}><Tooltip.Root>
      <Tooltip.Trigger render={props => <span {...props} />} data-testid="outer-trigger">
        <span data-testid="outer-area">Outer area</span>
        <Tooltip.Root><Tooltip.Trigger data-testid="inner-trigger">Inner</Tooltip.Trigger>
          <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="inner-popup">Inner tooltip</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="outer-popup">Outer tooltip</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root></Tooltip.Provider>);
    fireEvent.pointerEnter(screen.getByTestId('outer-trigger'), { pointerType: 'mouse' });
    fireEvent.mouseEnter(screen.getByTestId('outer-trigger'));
    enterChild(); await advanceTimers(0);
    expect(screen.queryByTestId('outer-popup')).toBeNull();
    expect(screen.getByTestId('inner-popup')).toBeInTheDocument();
    returnToParent(); await advanceTimers(0);
    expect(screen.getByTestId('outer-popup')).toBeInTheDocument();
    view.unmount();
  });
});
