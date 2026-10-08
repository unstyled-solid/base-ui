import { afterEach, beforeEach, expect } from 'vitest';
import { browserCase, createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { Popover } from '../index';

const environment = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
let previous: boolean | undefined;
beforeEach(() => { previous = environment.BASE_UI_ANIMATIONS_DISABLED; environment.BASE_UI_ANIMATIONS_DISABLED = false; });
afterEach(() => { environment.BASE_UI_ANIMATIONS_DISABLED = previous; });
const { renderProps } = createRenderer();

for (const mode of ['prop-close', 'requested-close', 'late-controlled-close'] as const) {
  browserCase({ source: 'packages/react/src/popover/root/PopoverRoot.detached-triggers.test.tsx', case: `trigger-change instant never leaks into ${mode} or reopen`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const ending: Popover.Popup.State['instant'][] = [];
    const pending: Popover.Popup.State['instant'][] = [];
    let closeRequested = false;
    const view = await renderProps((props: { open: boolean; triggerId: string }) => <>
      <style>{`
        .popover-switch-positioner { transition: top 10s linear, left 10s linear, transform 10s linear; }
        .popover-switch-popup { opacity: 1; transition: opacity 10s linear; }
        .popover-switch-popup[data-ending-style] { opacity: 0; }
        .popover-switch-popup[data-instant] { transition: none; }
      `}</style>
      <Popover.Root open={props.open} triggerId={props.triggerId} onOpenChange={(open) => { if (!open) closeRequested = true; }}>
        <Popover.Trigger id="one" style={{ position: 'fixed', left: '200px', top: '100px' }}>One</Popover.Trigger>
        <Popover.Trigger id="two" style={{ position: 'fixed', left: '400px', top: '100px' }}>Two</Popover.Trigger>
        <Popover.Portal><Popover.Positioner data-testid="positioner" class="popover-switch-positioner">
          <Popover.Popup data-testid="popup" class={(state) => {
            if (state.transitionStatus === 'ending') ending.push(state.instant);
            else if (closeRequested) pending.push(state.instant);
            return 'popover-switch-popup';
          }}><Popover.Close>Close</Popover.Close></Popover.Popup>
        </Popover.Positioner></Popover.Portal>
      </Popover.Root>
    </>, { open: true, triggerId: 'one' });
    const popup = screen.getByTestId('popup'), positioner = screen.getByTestId('positioner');
    await waitFor(() => expect(positioner.style.transform).not.toBe(''));
    // Finish the initial placement/entry epoch before asking for a handoff.
    // Otherwise getAnimations can still describe the move from the async
    // placeholder to trigger one, rather than the new move to trigger two.
    await waitFor(() => expect(popup).not.toHaveAttribute('data-starting-style'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    positioner.getAnimations().forEach((animation) => animation.finish());
    await waitFor(() => expect(positioner.getAnimations()).toHaveLength(0));
    await view.setProps({ triggerId: 'two' });
    await waitFor(() => expect(positioner.getAnimations().length).toBeGreaterThan(0));
    await Promise.all(positioner.getAnimations().map((animation) => animation.ready));
    if (mode === 'late-controlled-close') fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    positioner.getAnimations().forEach((animation) => animation.finish());
    await waitFor(() => expect(popup).toHaveAttribute('data-instant', 'trigger-change'));
    if (mode === 'late-controlled-close') expect(pending).toContain('trigger-change');
    if (mode === 'requested-close') fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    ending.length = 0;
    await view.setProps({ open: false });
    await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'));
    expect(ending).not.toContain('trigger-change');
    expect(popup).not.toHaveAttribute('data-instant', 'trigger-change');
    await waitFor(() => expect(popup.getAnimations().length).toBeGreaterThan(0));
    popup.getAnimations().forEach((animation) => animation.finish());
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    await view.setProps({ open: true });
    expect(screen.getByTestId('popup')).not.toHaveAttribute('data-instant', 'trigger-change');
  });
}
