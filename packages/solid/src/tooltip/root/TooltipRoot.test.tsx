import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, screen, fireEvent, firePointer, advanceTimers, sourceCase, popupConformanceTests, waitFor } from '../../../test';
import { Tooltip } from '../index';
import { Fixture, hover, settle, upstream, type Arrangement, type FixtureProps } from '../Tooltip.test-utils';

const { render, renderProps } = createRenderer();
const source = `${upstream}root/TooltipRoot.test.tsx`;

describe('Tooltip.Root', () => {
  popupConformanceTests({
    createComponent: props => <Tooltip.Root {...props.root}>
      <Tooltip.Trigger delay={0} {...props.trigger}>Open menu</Tooltip.Trigger>
      <Tooltip.Portal {...props.portal}><Tooltip.Positioner><Tooltip.Popup {...props.popup}>Content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>,
    triggerMouseAction: 'hover', browserIssue: 'bsolid-browser',
  });

  for (const arrangement of ['contained', 'detached', 'multiple-detached'] as const satisfies readonly Arrangement[]) {
    describe(arrangement, () => {
      // Hover delays are controlled; native ResizeObserver and its reobserve
      // animation frame must share the real browser clock.
      beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }));
      const check = (title: string, run: () => Promise<void>) => sourceCase({ source, case: `${arrangement}/${title}`, environment: 'jsdom', adaptation: 'owned factory, live props, native events and explicit RC13 observations' }, run);
      check('should open when the trigger is hovered / should close when the trigger is unhovered', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} />);
        const trigger = screen.getByText('Toggle');
        hover(trigger);
        await advanceTimers(599);
        expect(screen.queryByText('Content')).toBeNull();
        await advanceTimers(1);
        expect(screen.getByTestId('popup')).toHaveTextContent('Content');
        expect(trigger).not.toHaveAttribute('aria-describedby');
        expect(screen.getByTestId('popup')).not.toHaveAttribute('role');
        fireEvent.mouseLeave(trigger); await settle();
        expect(screen.queryByText('Content')).toBeNull();
        view.unmount();
      });
      check('does not open when a touch pointer hovers the trigger', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} />);
        hover(screen.getByText('Toggle'), 'touch'); await advanceTimers(600);
        expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      for (const [defaultOpen, open, expected] of [[true, undefined, true], [true, false, false], [true, true, true]] as const) {
        check(`defaultOpen=${defaultOpen}/open=${open}`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement} root={{ defaultOpen, open, defaultTriggerId: 'trigger' }} />);
          expect(Boolean(screen.queryByText('Content'))).toBe(expected); view.unmount();
        });
      }
      check('should remain uncontrolled', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} root={{ defaultOpen: true, defaultTriggerId: 'trigger' }} />);
        expect(screen.getByText('Content')).toBeInTheDocument();
        fireEvent.mouseLeave(screen.getByText('Toggle')); await settle();
        expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      check('should call onOpenChange when the open state changes / should not call onChange when the open state does not change', async () => {
        const changed = vi.fn();
        const view = await render(() => {
          const [open, setOpen] = createSignal(false);
          return <Fixture arrangement={arrangement} root={{ get open() { return open(); }, onOpenChange(next) { changed(open()); setOpen(next); } }} trigger={{ delay: 0 }} />;
        });
        expect(screen.queryByText('Content')).toBeNull();
        const trigger = screen.getByText('Toggle'); hover(trigger); await settle();
        expect(screen.getByText('Content')).toBeInTheDocument();
        fireEvent.mouseMove(trigger); await settle();
        expect(changed.mock.calls).toEqual([[false]]);
        fireEvent.mouseLeave(trigger); await settle();
        expect(screen.queryByText('Content')).toBeNull();
        expect(changed.mock.calls).toEqual([[false], [true]]); view.unmount();
      });
      check('should open after rest delay / should close after delay / live callback and delay freshness', async () => {
        const old = vi.fn(); const current = vi.fn();
        const view = await renderProps((props: FixtureProps) => <Fixture {...props} arrangement={arrangement} />,
          { trigger: { delay: 100, closeDelay: 100 }, root: { onOpenChange: old } });
        const trigger = screen.getByText('Toggle'); hover(trigger);
        await view.setProps({ root: { onOpenChange: current } });
        await advanceTimers(99); expect(screen.queryByText('Content')).toBeNull();
        await advanceTimers(1); expect(screen.getByText('Content')).toBeInTheDocument();
        expect(old).not.toHaveBeenCalled(); expect(current).toHaveBeenCalledTimes(1);
        await view.setProps({ trigger: { delay: 100, closeDelay: 250 } });
        expect(screen.getByText('Toggle')).toBe(trigger);
        fireEvent.mouseLeave(trigger); await advanceTimers(249);
        expect(screen.getByText('Content')).toBeInTheDocument();
        await advanceTimers(1); expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      for (const input of ['click', 'pointerdown'] as const) for (const closeOnClick of [true, false]) {
        check(`pending open/${input}/closeOnClick=${closeOnClick}`, async () => {
          const changed = vi.fn();
          const view = await render(() => <Fixture arrangement={arrangement} root={{ onOpenChange: changed }} trigger={{ closeOnClick }} />);
          const trigger = screen.getByText('Toggle'); hover(trigger); await advanceTimers(300);
          if (input === 'click') fireEvent.click(trigger);
          else firePointer.down(trigger, { pointerType: 'mouse', timeStamp: 301 });
          await advanceTimers(300);
          expect(Boolean(screen.queryByText('Content'))).toBe(!closeOnClick);
          expect(changed).toHaveBeenCalledTimes(closeOnClick ? 0 : 1); view.unmount();
        });
      }
      for (const closeOnClick of [true, false]) {
        check(`click after opening/closeOnClick=${closeOnClick}/reopens on hover`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement} trigger={{ closeOnClick, delay: 100 }} />);
          const trigger = screen.getByText('Toggle'); hover(trigger); await advanceTimers(100);
          expect(screen.getByText('Content')).toBeInTheDocument();
          fireEvent.click(trigger); await settle();
          expect(Boolean(screen.queryByText('Content'))).toBe(!closeOnClick);
          fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger); await advanceTimers(100);
          expect(screen.getByText('Content')).toBeInTheDocument(); view.unmount();
        });
      }
      for (const rootDisabled of [true, false]) for (const triggerDisabled of [undefined, true, false]) {
        check(`disabled root=${rootDisabled}/trigger=${triggerDisabled}`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement} root={{ disabled: rootDisabled }} trigger={{ disabled: triggerDisabled, delay: 0 }} />);
          const trigger = screen.getByText('Toggle');
          expect(trigger.hasAttribute('data-trigger-disabled')).toBe(triggerDisabled ?? rootDisabled);
          expect(trigger).not.toHaveAttribute('disabled'); hover(trigger); await advanceTimers(600);
          expect(Boolean(screen.queryByText('Content'))).toBe(!(rootDisabled || triggerDisabled)); view.unmount();
        });
      }
      check('should close if open when becoming disabled / disabled reason', async () => {
        const changed = vi.fn();
        const view = await renderProps((props: { disabled: boolean }) => <Fixture arrangement={arrangement} root={{ defaultOpen: true, defaultTriggerId: 'trigger', disabled: props.disabled, onOpenChange: changed }} />, { disabled: false });
        expect(screen.getByText('Content')).toBeInTheDocument();
        await view.setProps({ disabled: true });
        expect(screen.queryByText('Content')).toBeNull();
        expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'disabled' })); view.unmount();
      });
      check('does not throw error when combined with defaultOpen', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} root={{ defaultOpen: true, disabled: true }} />);
        expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      check('disabled suppresses controlled-open presence even when the disabled close is canceled', async () => {
        const changed = vi.fn((_: boolean, details: Tooltip.Root.ChangeEventDetails) => details.cancel());
        const view = await render(() => <Fixture arrangement={arrangement}
          root={{ open: true, disabled: true, defaultTriggerId: 'trigger', onOpenChange: changed }} />);
        expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'disabled' }));
        expect(screen.queryByTestId('popup')).toBeNull();
        view.unmount();
      });
      for (const trackCursorAxis of ['none', 'x', 'y', 'both'] as const) for (const disableHoverablePopup of [false, true]) {
        check(`trackCursorAxis=${trackCursorAxis}/disableHoverablePopup=${disableHoverablePopup}`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement} root={{ defaultOpen: true, defaultTriggerId: 'trigger', trackCursorAxis, disableHoverablePopup }} />);
          expect(screen.getByTestId('positioner').style.pointerEvents).toBe(disableHoverablePopup || trackCursorAxis === 'both' ? 'none' : ''); view.unmount();
        });
      }
      check('onOpenChange cancel() prevents opening while uncontrolled', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} root={{ onOpenChange: (_, details) => details.cancel() }} trigger={{ delay: 0 }} />);
        hover(screen.getByText('Toggle')); await settle(); expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      for (const allowPropagation of [false, true]) {
        check(`Escape dismissal/allowPropagation=${allowPropagation}`, async () => {
          const changed = vi.fn((_: boolean, details: Tooltip.Root.ChangeEventDetails) => { if (allowPropagation) details.allowPropagation(); });
          const view = await render(() => <Fixture arrangement={arrangement} root={{ defaultOpen: true, defaultTriggerId: 'trigger', onOpenChange: changed }} />);
          expect(screen.getByText('Content')).toBeInTheDocument();
          const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
          const stopped = vi.spyOn(event, 'stopPropagation'); document.body.dispatchEvent(event); await settle();
          expect(screen.queryByText('Content')).toBeNull();
          expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape-key', event }));
          expect(stopped).toHaveBeenCalledTimes(allowPropagation ? 0 : 1); view.unmount();
        });
      }
      check('preventUnmountOnClose / actions close and unmount / later normal close', async () => {
        let prevent = true;
        const actions = { current: null as Tooltip.Root.Actions | null };
        const view = await render(() => <Fixture arrangement={arrangement} root={{ actionsRef: actions, onOpenChange(open, details) { if (!open && prevent) details.preventUnmountOnClose(); } }} trigger={{ delay: 0 }} />);
        const trigger = screen.getByText('Toggle'); hover(trigger); await settle();
        actions.current!.close(); await settle();
        expect(trigger).not.toHaveAttribute('data-popup-open'); expect(screen.getByText('Content')).toBeInTheDocument();
        actions.current!.unmount(); await settle(); expect(screen.queryByText('Content')).toBeNull();
        prevent = false; hover(trigger); await settle(); fireEvent.mouseLeave(trigger); await settle();
        expect(screen.queryByText('Content')).toBeNull(); view.unmount(); expect(actions.current).toBeNull();
      });
      check('does not open once the hovered trigger has unmounted', async () => {
        const view = await renderProps((props: { showTrigger: boolean }) => <Fixture arrangement={arrangement} showTrigger={props.showTrigger} />, { showTrigger: true });
        hover(screen.getByText('Toggle')); await advanceTimers(1); await view.setProps({ showTrigger: false });
        await advanceTimers(600); expect(screen.queryByText('Content')).toBeNull(); view.unmount();
      });
      for (const disabled of ['root', 'trigger'] as const) {
        check(`disabled suppresses native focus/${disabled}`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement}
            root={{ disabled: disabled === 'root' }} trigger={{ disabled: disabled === 'trigger', delay: 0 }} />);
          const trigger = screen.getByText('Toggle');
          if (disabled === 'root') {
            fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
            await advanceTimers(0);
            expect(screen.queryByText('Content')).toBeNull();
          }
          trigger.focus(); await advanceTimers(0);
          expect(screen.queryByText('Content')).toBeNull();
          view.unmount();
        });
      }
      check('preventUnmountOnClose does not prevent unmounting on later hover closes', async () => {
        let preventNextClose = true;
        const view = await render(() => <Fixture arrangement={arrangement} trigger={{ delay: 0, closeDelay: 0 }}
          root={{ onOpenChange(open, details) {
            if (!open && preventNextClose) { preventNextClose = false; details.preventUnmountOnClose(); }
          } }} />);
        const trigger = screen.getByText('Toggle');
        await view.user.hover(trigger);
        await waitFor(() => expect(screen.queryByTestId('positioner')).not.toBeNull());
        await view.user.unhover(trigger);
        expect(trigger).not.toHaveAttribute('data-popup-open');
        expect(screen.getByTestId('positioner')).toBeInTheDocument();
        await view.user.hover(trigger);
        await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
        await view.user.unhover(trigger);
        await waitFor(() => expect(screen.queryByTestId('positioner')).toBeNull());
        view.unmount();
      });
      check('actions close reports imperative-action and unmounts the positioner', async () => {
        const changed = vi.fn();
        const actions = { current: null as Tooltip.Root.Actions | null };
        const view = await render(() => <Fixture arrangement={arrangement} trigger={{ delay: 0 }}
          root={{ actionsRef: actions, onOpenChange: changed }} />);
        const trigger = screen.getByText('Toggle');
        await view.user.hover(trigger);
        await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeNull());
        actions.current!.close();
        await waitFor(() => expect(screen.queryByTestId('positioner')).toBeNull());
        expect(trigger).not.toHaveAttribute('data-popup-open');
        expect(changed).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'imperative-action' }));
        view.unmount();
      });
      check('canonical unchanged closeDelay=100 closes after hover and leave', async () => {
        const view = await render(() => <Fixture arrangement={arrangement} trigger={{ closeDelay: 100 }} />);
        const trigger = screen.getByText('Toggle');
        fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
        await advanceTimers(600);
        expect(screen.getByText('Content')).toBeInTheDocument();
        fireEvent.mouseLeave(trigger);
        await Promise.resolve();
        expect(screen.getByText('Content')).toBeInTheDocument();
        await advanceTimers(100);
        expect(screen.queryByText('Content')).toBeNull();
        view.unmount();
      });
      check('actions unmount after a retained hover close', async () => {
        const actions = { current: null as Tooltip.Root.Actions | null };
        const view = await render(() => <Fixture arrangement={arrangement} root={{ actionsRef: actions,
          onOpenChange(_open, details) { details.preventUnmountOnClose(); } }} />);
        const trigger = screen.getByText('Toggle');
        await view.user.hover(trigger);
        await advanceTimers(600);
        expect(screen.getByTestId('positioner')).toBeInTheDocument();
        await view.user.unhover(trigger);
        expect(screen.getByTestId('positioner')).toBeInTheDocument();
        actions.current!.unmount();
        await waitFor(() => expect(screen.queryByTestId('positioner')).toBeNull());
        view.unmount();
      });
      for (const [trackCursorAxis, disableHoverablePopup, expected] of [
        ['none', true, 'none'], ['none', false, ''], ['both', false, 'none'], ['x', false, ''],
      ] as const) {
        check(`hover-open positioner policy axis=${trackCursorAxis}/disabled=${disableHoverablePopup}`, async () => {
          const view = await render(() => <Fixture arrangement={arrangement}
            root={{ trackCursorAxis, disableHoverablePopup }} trigger={{ delay: 0 }} />);
          hover(screen.getByText('Toggle'));
          await advanceTimers(0);
          expect(screen.getByTestId('positioner').style.pointerEvents).toBe(expected);
          view.unmount();
        });
      }
    });
  }
});
