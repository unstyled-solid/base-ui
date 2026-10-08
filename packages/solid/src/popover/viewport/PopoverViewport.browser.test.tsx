import { afterEach, beforeEach, expect, vi } from 'vitest';
import { createEffect, createMemo, Loading, onCleanup, untrack } from 'solid-js';
import { browserCase, createRenderer, screen, waitFor, waitForAnimations } from '../../../test';
import { Popover } from '../index';

const source = 'packages/react/src/popover/viewport/PopoverViewport.test.tsx';
const { render, renderProps } = createRenderer();
const animationEnvironment = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
let previousAnimationsDisabled: boolean | undefined;
beforeEach(() => { previousAnimationsDisabled = animationEnvironment.BASE_UI_ANIMATIONS_DISABLED; animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = false; });
afterEach(() => { animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = previousAnimationsDisabled; });
const animationCSS = `
  [data-transitioning] [data-previous] { animation: popover-out 10s ease-out forwards; }
  [data-transitioning] [data-current] { animation: popover-in 10s ease-out forwards; }
  @keyframes popover-out { from { transform: translateX(0); opacity: 1 } to { transform: translateX(-30%); opacity: 0 } }
  @keyframes popover-in { from { transform: translateX(30%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
`;

async function finishCurrentMorph(popup: HTMLElement) {
  const current = popup.querySelector<HTMLElement>('[data-current]');
  expect(current).not.toBeNull();
  // Source usePopupViewport removes starting style in a frame, then arms cleanup.
  // Measuring the new content can cancel/recreate CSS animations before that epoch starts.
  await waitFor(() => expect(current).not.toHaveAttribute('data-starting-style'));
  let animations: Animation[] = [];
  await waitFor(() => {
    const entry = current!.getAnimations();
    const snapshot = popup.getAnimations({ subtree: true });
    expect(entry.length > 0 && snapshot.every((animation) => !animation.pending)).toBe(true);
    animations = snapshot;
  });
  expect(popup.querySelector('[data-current]')).toBe(current);
  await Promise.all(animations.map((animation) => animation.ready));
  expect(current!.getAnimations().every((animation) => animations.includes(animation))).toBe(true);
  animations.forEach((animation) => animation.finish());
}

browserCase({ source, case: 'Loading-delayed content cannot let obsolete work replace the latest owner', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  function deferred() {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((done) => { resolve = done; });
    return { promise, resolve };
  }
  const requests = { one: deferred(), two: deferred(), three: deferred() };
  const disposed: string[] = [];
  function Content(props: { id: keyof typeof requests | undefined }) {
    const id = untrack(() => props.id);
    onCleanup(() => { if (id) disposed.push(id); });
    const value = createMemo<string>(async () => props.id ? requests[props.id].promise : 'empty');
    return <Loading fallback={<span>Loading content</span>}><span data-testid="resolved-content">{value()}</span></Loading>;
  }
  const view = await render(() => <><style>{animationCSS}</style><Popover.Root<keyof typeof requests>>{(state) => <>
    <Popover.Trigger payload="one">One</Popover.Trigger><Popover.Trigger payload="two">Two</Popover.Trigger><Popover.Trigger payload="three">Three</Popover.Trigger>
    <Popover.Portal><Popover.Positioner><Popover.Popup data-testid="popup"><Popover.Viewport><Content id={state.payload} /></Popover.Viewport></Popover.Popup></Popover.Positioner></Popover.Portal>
  </>}</Popover.Root></>);
  await view.user.click(screen.getByRole('button', { name: 'One' }));
  requests.one.resolve('First content');
  await waitFor(() => expect(screen.getByTestId('resolved-content')).toHaveTextContent('First content'));
  const popup = screen.getByTestId('popup');
  await view.user.click(screen.getByRole('button', { name: 'Two' }));
  await view.user.click(screen.getByRole('button', { name: 'Three' }));
  requests.three.resolve('Latest content');
  await waitFor(() => expect(popup.querySelector('[data-current]')).toHaveTextContent('Latest content'));
  requests.two.resolve('Obsolete content');
  await Promise.resolve(); await Promise.resolve();
  expect(popup.querySelector('[data-current]')).toHaveTextContent('Latest content');
  expect(popup.querySelector('[data-current]')).not.toHaveTextContent('Obsolete content');
  await finishCurrentMorph(popup);
  await waitFor(() => expect(popup.querySelector('[data-previous]')).toBeNull());
  view.unmount();
  expect(disposed).toContain('one');
  expect(disposed).toContain('three');
});

for (const keepMounted of [false, true]) {
  browserCase({ source, case: `morphing/rapid switches/close-reopen keepMounted=${keepMounted}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const completed = vi.fn();
    const view = await render(() => <><style>{animationCSS}</style><Popover.Root<number> onOpenChangeComplete={completed}>{(state) => <>
      <Popover.Trigger id="one" payload={1}>One</Popover.Trigger>
      <Popover.Trigger id="two" payload={2}>Two</Popover.Trigger>
      <Popover.Trigger id="three" payload={3}>Three</Popover.Trigger>
      <Popover.Portal keepMounted={keepMounted}><Popover.Positioner data-testid="positioner"><Popover.Popup data-testid="popup">
        <Popover.Viewport data-testid="viewport"><span>Content {state.payload}</span></Popover.Viewport>
        <Popover.Close>Close</Popover.Close>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </>}</Popover.Root></>);
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    const popup = screen.getByTestId('popup');
    const positioner = screen.getByTestId('positioner');
    const first = popup.querySelector('[data-current]');
    await waitFor(() => expect(completed).toHaveBeenCalledExactlyOnceWith(true));
    expect(popup.querySelector('[data-current]')).toBeVisible();
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    await waitFor(() => expect(popup.querySelector('[data-previous]')).not.toBeNull());
    expect(popup.querySelector('[data-previous]')).toHaveAttribute('inert');
    expect(popup.querySelector('[data-previous]')).toHaveTextContent('Content 1');
    expect(popup.querySelector('[data-current]')).toHaveTextContent('Content 2');
    expect(popup.querySelector('[data-current]')).not.toBe(first);
    await view.user.click(screen.getByRole('button', { name: 'Three' }));
    expect(popup.querySelector('[data-previous]')).toHaveTextContent('Content 2');
    expect(popup.querySelector('[data-current]')).toHaveTextContent('Content 3');
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(screen.getByTestId('positioner')).toBe(positioner);
    await finishCurrentMorph(popup);
    await waitFor(() => expect(popup.querySelector('[data-previous]')).toBeNull());
    expect(screen.getByTestId('viewport')).not.toHaveAttribute('data-transitioning');
    expect(popup.querySelector('[data-current]')).toHaveTextContent('Content 3');
    expect(popup.querySelector('[data-current]')).toBeVisible();
    expect(completed).toHaveBeenCalledExactlyOnceWith(true);
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(popup).not.toBeVisible());
    await waitFor(() => expect(completed.mock.calls.filter(([open]) => !open)).toHaveLength(1));
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    if (keepMounted) expect(screen.getByTestId('popup')).toBe(popup);
    await waitFor(() => expect(completed.mock.calls.filter(([open]) => open)).toHaveLength(2));
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    const reopened = screen.getByTestId('popup');
    expect(reopened.querySelector('[data-previous]')).toHaveTextContent('Content 1');
    await finishCurrentMorph(reopened);
    await waitFor(() => expect(reopened.querySelector('[data-previous]')).toBeNull());
    expect(reopened.querySelector('[data-current]')).toHaveTextContent('Content 2');
    expect(reopened.querySelector('[data-current]')).toBeVisible();
    expect(screen.getByTestId('viewport')).not.toHaveAttribute('data-transitioning');
    expect(completed.mock.calls.map(([open]) => open)).toEqual([true, false, true]);
  });
}

for (const [x, y, expected] of [[190, 90, 'right down'], [-190, -90, 'left up'], [190, 2, 'right'], [2, 90, 'down'], [2, 2, ''], [-190, 90, 'left down'], [190, -90, 'right up']] as const) {
  browserCase({ source, case: `activation direction dx=${x},dy=${y}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <><style>{animationCSS}</style><Popover.Root>
      <Popover.Trigger style={{ position: 'fixed', left: '250px', top: '150px', width: '100px', height: '50px' }}>One</Popover.Trigger>
      <Popover.Trigger style={{ position: 'fixed', left: `${250 + x}px`, top: `${150 + y}px`, width: '100px', height: '50px' }}>Two</Popover.Trigger>
      <Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Viewport data-testid="viewport">Content</Popover.Viewport></Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root></>);
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    await waitFor(() => expect(screen.getByTestId('viewport')).toHaveAttribute('data-activation-direction'));
    expect(screen.getByTestId('viewport').getAttribute('data-activation-direction')?.trim()).toBe(expected);
  });
}

browserCase({ source, case: 'removing Viewport restores transform positioning', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await renderProps((props: { viewport: boolean }) => <Popover.Root defaultOpen>
    <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner data-testid="positioner"><Popover.Popup>
      {props.viewport ? <Popover.Viewport>Content</Popover.Viewport> : <span>Content</span>}
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>, { viewport: true });
  const positioner = screen.getByTestId('positioner');
  await waitFor(() => expect(positioner.style.left).not.toBe(''));
  expect(positioner.style.transform).toBe('');
  await view.setProps({ viewport: false });
  expect(screen.getByTestId('positioner')).toBe(positioner);
  await waitFor(() => expect(positioner.style.transform).not.toBe(''));
});

browserCase({ source: 'packages/react/src/popover/popup/PopoverPopupTransitionState.test.tsx', case: 'each kept-mounted opening starts once and completes once', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const completed = vi.fn();
  const states: { open: boolean; transitionStatus: Popover.Popup.State['transitionStatus'] }[] = [];
  function TrackedPopup(props: { host: Parameters<NonNullable<Popover.Popup.Props['render']>>[0]; state: Popover.Popup.State }) {
    createEffect(() => ({ open: props.state.open, transitionStatus: props.state.transitionStatus }), (next) => {
      const previous = states.at(-1);
      if (previous?.open !== next.open || previous?.transitionStatus !== next.transitionStatus) states.push(next);
    });
    return <div {...props.host} data-enter={props.state.open && props.state.transitionStatus !== 'starting' || undefined} />;
  }
  const view = await render(() => <><style>{`
    .popover-phase { opacity: 0; transition: opacity 10s linear; }
    .popover-phase[data-enter] { opacity: 1; }
  `}</style><Popover.Root onOpenChangeComplete={completed}>
    <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal keepMounted><Popover.Positioner><Popover.Popup class="popover-phase" data-testid="popup"
      render={(host, state) => <TrackedPopup host={host} state={state} />}>Content</Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root></>);
  let original: HTMLElement | undefined;
  for (let cycle = 0; cycle < 2; cycle += 1) {
    completed.mockClear();
    states.length = 0;
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    const popup = screen.getByTestId('popup');
    if (original) expect(popup).toBe(original);
    original = popup;
    await waitFor(() => expect(popup.getAnimations().length).toBeGreaterThan(0));
    expect(completed).not.toHaveBeenCalled();
    popup.getAnimations().forEach((animation) => animation.finish());
    await waitFor(() => expect(completed).toHaveBeenCalledExactlyOnceWith(true));
    expect(states.filter((state) => state.open)).toEqual([
      { open: true, transitionStatus: 'starting' },
      { open: true, transitionStatus: undefined },
    ]);
    completed.mockClear();
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(popup.getAnimations().length).toBeGreaterThan(0));
    expect(completed).not.toHaveBeenCalled();
    popup.getAnimations().forEach((animation) => animation.finish());
    await waitForAnimations(popup);
    await waitFor(() => expect(completed).toHaveBeenCalledExactlyOnceWith(false));
    expect(popup.isConnected).toBe(true);
  }
});

browserCase({ source: 'packages/react/src/utils/usePopupViewport.tsx', case: 'lagging payload remount re-arms entry/exit animation cleanup', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await renderProps((props: { triggerId: string; nextPayload: string }) => <>
    <style>{`
      .popover-lag [data-current] { opacity: 1; transition: opacity 10s linear; }
      .popover-lag [data-current][data-starting-style] { opacity: 0; }
      .popover-lag [data-previous] { opacity: 1; transition: opacity 10s linear; }
      .popover-lag [data-previous][data-ending-style] { opacity: 0; }
    `}</style>
    <Popover.Root<string> open triggerId={props.triggerId}>{(state) => <>
      <Popover.Trigger id="one" payload="first">One</Popover.Trigger>
      <Popover.Trigger id="two" payload={props.nextPayload}>Two</Popover.Trigger>
      <Popover.Portal><Popover.Positioner><Popover.Popup data-testid="popup">
        <Popover.Viewport class="popover-lag"><img src="about:blank" alt={state.payload} /></Popover.Viewport>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </>}</Popover.Root>
  </>, { triggerId: 'one', nextPayload: 'first' });
  const popup = screen.getByTestId('popup');
  const first = popup.querySelector('[data-current]');
  await view.setProps({ triggerId: 'two' });
  await waitFor(() => expect(popup.querySelector('[data-previous]')).not.toBeNull());
  const pending = popup.querySelector('[data-current]');
  expect(pending).not.toBe(first);
  await view.setProps({ nextPayload: 'second' });
  const latest = popup.querySelector('[data-current]');
  expect(latest).not.toBe(pending);
  expect(latest?.querySelector('img')).toHaveAttribute('alt', 'second');
  expect(popup.querySelector('[data-previous]')?.querySelector('img')).toHaveAttribute('alt', 'first');
  await waitFor(() => expect(latest?.getAnimations().length).toBeGreaterThan(0));
  expect(popup.querySelector('[data-previous]')).not.toBeNull();
  await finishCurrentMorph(popup);
  await waitFor(() => expect(popup.querySelector('[data-previous]')).toBeNull());
  expect(popup.querySelector('[data-current]')).toBe(latest);
});
