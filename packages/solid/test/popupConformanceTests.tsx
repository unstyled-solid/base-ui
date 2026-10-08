// Adapted from Base UI (MIT); React rerender replaced by nested live getter props.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isInaccessible, screen, waitFor } from '@testing-library/dom';
import type { JSX } from '@solidjs/web';
import { createRenderer } from './createRenderer';
import { browserCase } from './sourceCase';
export interface TestedComponentProps {
  root?: { open?: boolean; onOpenChange?: (open: boolean | null) => void };
  trigger?: { 'data-testid'?: string };
  popup?: { class?: string; id?: string; 'data-testid'?: string; onAnimationEnd?: () => void };
  portal?: { keepMounted?: boolean };
}
export interface PopupTestConfig {
  createComponent: (props: TestedComponentProps) => JSX.Element;
  triggerMouseAction: 'click' | 'hover';
  expectedPopupRole?: string;
  expectedAriaHasPopupValue?: string;
  alwaysMounted?: boolean | 'only-after-open';
  combobox?: boolean;
  browserIssue: string;
}
export function popupConformanceTests(config: PopupTestConfig) {
  const { renderProps } = createRenderer();
  const mount = (props: TestedComponentProps = {}) => renderProps((live) => config.createComponent({
    get root() { return live.root; },
    get trigger() { return { 'data-testid': 'trigger', ...live.trigger }; },
    get popup() { return { 'data-testid': 'popup', ...live.popup }; },
    get portal() { return live.portal; },
  }), props);
  const popup = () => screen.queryByTestId('popup');
  const trigger = () => screen.getByTestId('trigger');
  const assertClosed = (afterOpen = false) => {
    if (config.alwaysMounted === true || (afterOpen && config.alwaysMounted === 'only-after-open')) {
      expect(popup()).not.toBeNull();
      expect(isInaccessible(popup()!)).toBe(true);
    } else expect(popup()).toBeNull();
  };
  describe('Popup conformance', () => {
    it('opens with controlled props on the same trigger', async () => {
      const view = await mount({ root: { open: false } });
      const node = trigger();
      assertClosed();
      await view.setProps({ root: { open: true } });
      expect(popup()).not.toBeNull();
      expect(trigger()).toBe(node);
    });
    if (config.triggerMouseAction === 'click') {
      it('opens uncontrolled with click and reports expanded state', async () => {
        const change = vi.fn();
        const view = await mount({ root: { onOpenChange: change } });
        assertClosed();
        expect(trigger()).toHaveAttribute('aria-expanded', 'false');
        await view.user.click(trigger());
        await waitFor(() => expect(popup()).not.toBeNull());
        if (config.combobox) expect(popup()).toHaveAttribute('role', 'listbox');
        else expect(popup()).toHaveAttribute('data-open');
        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
        expect(change.mock.calls.map(([open]) => open)).toEqual([true]);
      });
      it('links aria-controls and supports a custom popup ID', async () => {
        const view = await mount({ root: { open: true } });
        expect(popup()?.id).toBeTruthy();
        expect(trigger()).toHaveAttribute('aria-controls', popup()!.id);
        await view.setProps({ popup: { id: 'TestId' } });
        expect(popup()).toHaveAttribute('id', 'TestId');
        expect(trigger()).toHaveAttribute('aria-controls', 'TestId');
      });
      const hasPopup = config.expectedAriaHasPopupValue ?? config.expectedPopupRole;
      if (hasPopup) it('sets aria-haspopup', async () => {
        await mount({ root: { open: true } });
        expect(trigger()).toHaveAttribute('aria-haspopup', hasPopup);
      });
    }
    if (config.expectedPopupRole) it('exposes the popup role', async () => {
      await mount({ root: { open: true } });
      expect(popup()).toHaveAttribute('role', config.expectedPopupRole);
      expect(screen.getByRole(config.expectedPopupRole!)).toBe(popup());
    });
    describe('animations', () => {
      let previous: boolean | undefined;
      beforeEach(() => {
        previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
        globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
      });
      afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; });
      browserCase({ source: 'packages/react/test/popupConformanceTests.tsx', case: 'removes without exit animation', environment: 'browser', issue: config.browserIssue }, async () => {
        const view = await mount({ root: { open: true } });
        expect(popup()).not.toBeNull();
        await view.setProps({ root: { open: false } });
        await waitFor(() => assertClosed(true));
      });
      browserCase({ source: 'packages/react/test/popupConformanceTests.tsx', case: 'removes when animation finishes (upstream unconditional skip)', environment: 'browser', issue: config.browserIssue }, async () => {
        const end = vi.fn();
        const style = document.createElement('style');
        style.textContent = '@keyframes harness-exit { to { opacity: 0 } } .harness-animation[data-ending-style] { animation: harness-exit 150ms; }';
        document.head.append(style);
        try {
          const view = await mount({ root: { open: true }, portal: { keepMounted: true }, popup: { class: 'harness-animation', onAnimationEnd: end } });
          await view.setProps({ root: { open: false } });
          await waitFor(() => expect(end).toHaveBeenCalledTimes(1));
          expect(popup()).not.toBeNull();
          expect(isInaccessible(popup()!)).toBe(true);
        } finally { style.remove(); }
      });
    });
  });
}
