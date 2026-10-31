import { afterEach, beforeEach, expect } from 'vitest';
import { browserCase, createRenderer, flushMicrotasks, screen, waitFor, waitForPositioned, waitSingleFrame } from '../../../test';
import { Popover } from '../index';
import type { Side, Align } from '../../internals/createAnchorPositioning';

const source = 'packages/react/src/popover/positioner/PopoverPositioner.test.tsx';
const { render, renderProps } = createRenderer();
const animationEnvironment = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
let previousAnimationsDisabled: boolean | undefined;
beforeEach(() => { previousAnimationsDisabled = animationEnvironment.BASE_UI_ANIMATIONS_DISABLED; animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = false; });
afterEach(() => { animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = previousAnimationsDisabled; });

for (const functional of [false, true]) {
  browserCase({ source, case: `numeric/function side and align offsets functional=${functional}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const observed: { side: Side; align: Align }[] = [];
    await render(() => <Popover.Root defaultOpen>
      <Popover.Trigger style={{ position: 'fixed', left: '200px', top: '200px', width: '72px', height: '36px' }}>Toggle</Popover.Trigger>
      <Popover.Portal><Popover.Positioner data-testid="positioner" side="bottom" align="start" collisionAvoidance={{ side: 'none', align: 'none' }}
        sideOffset={functional ? (data) => { observed.push({ side: data.side, align: data.align }); return data.anchor.width + data.positioner.width; } : 7}
        alignOffset={functional ? (data) => data.positioner.width : 9}>
        <Popover.Popup style={{ width: '52px', height: '24px' }}>Content</Popover.Popup>
      </Popover.Positioner></Popover.Portal>
    </Popover.Root>);
    const anchor = screen.getByRole('button', { name: 'Toggle' }).getBoundingClientRect();
    await waitFor(() => expect(Math.round(screen.getByTestId('positioner').getBoundingClientRect().top - anchor.bottom)).toBe(functional ? 124 : 7));
    expect(Math.round(screen.getByTestId('positioner').getBoundingClientRect().left - anchor.left)).toBe(functional ? 52 : 9);
    if (functional) expect(observed.at(-1)).toEqual({ side: 'bottom', align: 'start' });
  });
}

for (const keepMounted of [false, true]) {
  browserCase({ source, case: `retains visible geometry for manual exit keepMounted=${keepMounted} (GitHub #2)`, environment: 'browser', issue: 'bsolid-7hko' }, async () => {
    let actions: Popover.Root.Actions | null = null;
    const view = await renderProps((props: { top: number }) => (
      <Popover.Root actionsRef={(value) => { actions = value; }}
        onOpenChange={(open, details) => { if (!open) details.preventUnmountOnClose(); }}>
        <Popover.Trigger style={{ position: 'fixed', left: '200px', top: `${props.top}px`, width: '72px', height: '36px' }}>Toggle</Popover.Trigger>
        <Popover.Portal keepMounted={keepMounted}>
          <Popover.Positioner data-testid="positioner" side="bottom" align="start" collisionAvoidance={{ side: 'none', align: 'none' }}>
            <Popover.Popup style={{ width: '100px', height: '40px' }}>Content</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    ), { top: 200 });
    if (keepMounted) {
      expect(screen.getByTestId('positioner')).toHaveAttribute('hidden');
      expect(getComputedStyle(screen.getByTestId('positioner')).opacity).toBe('0');
    } else {
      expect(screen.queryByTestId('positioner')).toBeNull();
    }
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.user.click(trigger);
    const positioner = screen.getByTestId('positioner');
    await waitForPositioned(positioner);
    await waitFor(() => expect(Math.round(positioner.getBoundingClientRect().top)).toBe(236));
    const before = positioner.getBoundingClientRect();
    const transform = positioner.style.transform;
    await view.user.click(trigger);
    expect(positioner).not.toHaveAttribute('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(positioner.style.pointerEvents).toBe('none');
    expect(getComputedStyle(positioner).opacity).toBe('1');
    expect(positioner.getBoundingClientRect().top).toBe(before.top);
    expect(positioner.getBoundingClientRect().left).toBe(before.left);
    expect(positioner.style.transform).toBe(transform);
    // Retention must survive frame-driven animation work, not just the close turn.
    await waitSingleFrame();
    await waitSingleFrame();
    expect(screen.getByTestId('positioner')).toBe(positioner);
    expect(getComputedStyle(positioner).opacity).toBe('1');
    expect(positioner.getBoundingClientRect().top).toBe(before.top);
    actions!.unmount();
    await flushMicrotasks();
    if (keepMounted) {
      expect(positioner).toHaveAttribute('hidden');
      expect(getComputedStyle(positioner).opacity).toBe('0');
    } else {
      expect(screen.queryByTestId('positioner')).toBeNull();
    }
    await view.setProps({ top: 300 });
    await view.user.click(trigger);
    const reopened = screen.getByTestId('positioner');
    await waitForPositioned(reopened);
    await waitFor(() => expect(Math.round(reopened.getBoundingClientRect().top)).toBe(336));
    expect(getComputedStyle(reopened).opacity).toBe('1');
    expect(reopened.style.pointerEvents).not.toBe('none');
  });

  browserCase({ source, case: `tracks live anchor geometry keepMounted=${keepMounted}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps((props: { top: number }) => <Popover.Root open>
      <Popover.Trigger style={{ position: 'fixed', left: '200px', top: `${props.top}px`, width: '100px', height: '100px' }}>Toggle</Popover.Trigger>
      <Popover.Portal keepMounted={keepMounted}><Popover.Positioner data-testid="positioner" collisionAvoidance={{ side: 'none', align: 'none' }}>
        <Popover.Popup style={{ width: '100px', height: '100px' }}>Content</Popover.Popup>
      </Popover.Positioner></Popover.Portal>
    </Popover.Root>, { top: 100 });
    const positioner = screen.getByTestId('positioner');
    await waitFor(() => expect(Math.round(positioner.getBoundingClientRect().top)).toBe(200));
    await view.setProps({ top: 200 });
    await waitFor(() => expect(Math.round(positioner.getBoundingClientRect().top)).toBe(300));
    expect(screen.getByTestId('positioner')).toBe(positioner);
  });
}

browserCase({ source, case: 'disableAnchorTracking prevents ancestor scroll updates', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await render(() => <div data-testid="scroller" style={{ height: '72px', overflow: 'auto' }}><div style={{ height: '500px' }}>
    <Popover.Root open><Popover.Trigger style={{ width: '72px', height: '36px' }}>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner disableAnchorTracking data-testid="positioner">
      <Popover.Popup style={{ width: '52px', height: '24px' }}>Content</Popover.Popup>
    </Popover.Positioner></Popover.Portal></Popover.Root>
  </div></div>);
  const anchor = screen.getByRole('button', { name: 'Toggle' });
  const positioner = screen.getByTestId('positioner');
  // Capture the positioned baseline, not the shared asynchronous measurement placeholder.
  await waitForPositioned(positioner);
  const anchorY = anchor.getBoundingClientRect().y;
  const y = positioner.getBoundingClientRect().y;
  screen.getByTestId('scroller').scrollTop = 20;
  await waitSingleFrame(); await waitSingleFrame();
  expect(anchor.getBoundingClientRect().y).toBe(anchorY - 20);
  expect(positioner.getBoundingClientRect().y).toBe(y);
});

browserCase({ source, case: 'collisionPadding remains exact after flip', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await render(() => <Popover.Root open>
    <Popover.Trigger style={{ position: 'fixed', bottom: '8px', left: '16px', width: '72px', height: '36px' }}>Toggle</Popover.Trigger>
    <Popover.Portal><Popover.Positioner data-testid="positioner" side="bottom" sideOffset={8} collisionPadding={12} collisionAvoidance={{ fallbackAxisSide: 'none' }}>
      <Popover.Popup style={{ width: '200px', height: '1000px', 'max-height': 'var(--available-height)' }}>Content</Popover.Popup>
    </Popover.Positioner></Popover.Portal>
  </Popover.Root>);
  await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top'));
  await waitFor(() => expect(Math.round(screen.getByTestId('positioner').getBoundingClientRect().top)).toBe(12));
});
import { useUnscaledBrowserFrame } from '../../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
