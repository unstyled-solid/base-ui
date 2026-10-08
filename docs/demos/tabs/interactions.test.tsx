import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@solidjs/web';
import { userEvent } from 'vitest/browser';
import demos from './entry';

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach(dispose => dispose());
});

function mount(Component: (typeof demos)[number]['variants'][number]['component']) {
  const host = document.createElement('div');
  document.body.append(host);
  const dispose = render(() => <Component />, host);
  cleanups.push(() => { dispose(); host.remove(); });
  return host;
}

function selected(host: HTMLElement) {
  return host.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
}

for (const demo of demos) {
  describe(demo.id, () => {
    for (const variant of demo.variants) {
      it(`${variant.id}: initial selection, clicks, keyboard navigation and panel association`, async () => {
        const host = mount(variant.component);
        await expect.poll(() => host.querySelectorAll('[role="tab"]').length).toBe(3);
        expect(selected(host)?.textContent).toBe('Overview');
        const tabs = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const list = host.querySelector('[role="tablist"]');
        await userEvent.click(tabs[1]);
        await expect.poll(() => selected(host)?.textContent).toBe('Projects');
        await expect.poll(() => host.querySelector('[role="tabpanel"]:not([inert])')?.textContent).toBe('Milestones and deadlines.');
        const panel = host.querySelector<HTMLElement>('[role="tabpanel"]:not([inert])')!;
        expect(panel.getAttribute('aria-labelledby')).toBe(tabs[1].id);
        expect(tabs[1].getAttribute('aria-controls')).toBe(panel.id);
        await userEvent.keyboard('{ArrowRight}');
        await expect.poll(() => document.activeElement).toBe(tabs[2]);
        expect(selected(host)?.textContent).toBe('Projects');
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => selected(host)?.textContent).toBe('Account');
        expect(document.activeElement).toBe(tabs[2]);
        expect(host.querySelector('[role="tablist"]')).toBe(list);
        expect(host.querySelectorAll('[role="tab"]')[1]).toBe(tabs[1]);
        await userEvent.keyboard('{Home}');
        await expect.poll(() => document.activeElement).toBe(tabs[0]);
        expect(selected(host)?.textContent).toBe('Account');
        await userEvent.keyboard(' ');
        await expect.poll(() => selected(host)?.textContent).toBe('Overview');
        await userEvent.keyboard('{End}');
        await expect.poll(() => document.activeElement).toBe(tabs[2]);
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => selected(host)?.textContent).toBe('Account');
        await userEvent.keyboard('{ArrowLeft}');
        await expect.poll(() => document.activeElement).toBe(tabs[1]);
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => selected(host)?.textContent).toBe('Projects');
        await expect.poll(() => host.querySelectorAll('[role="tabpanel"]').length).toBe(1);
      });
    }
    it('CSS Modules: measured indicator follows selection and source panel transitions execute', async () => {
      const host = mount(demo.variants[0].component);
      await expect.poll(() => host.querySelectorAll('[role="tab"]').length).toBe(3);
      const tabs = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const indicator = host.querySelector<HTMLElement>('[role="tablist"]')!.lastElementChild as HTMLElement;
      await expect.poll(() => parseFloat(indicator.style.getPropertyValue('--active-tab-width'))).toBeGreaterThan(0);
      const initialLeft = indicator.style.getPropertyValue('--active-tab-left');
      const initialPanel = host.querySelector<HTMLElement>('[role="tabpanel"]')!;
      expect(getComputedStyle(initialPanel).fontSize).toBe('14px');
      if (demo.id === 'tabs/animated-panels') {
        expect(getComputedStyle(initialPanel).transitionProperty).toBe('opacity, transform');
      }
      await userEvent.click(tabs[2]);
      await expect.poll(() => selected(host)?.textContent).toBe('Account');
      await expect.poll(() => indicator.style.getPropertyValue('--active-tab-left')).not.toBe(initialLeft);
      const active = host.querySelector<HTMLElement>('[role="tabpanel"]:not([inert])')!;
      expect(active.getAttribute('data-activation-direction')).toBe('right');
      await expect.poll(() => host.querySelectorAll('[role="tabpanel"]').length).toBe(1);
      expect(initialPanel.isConnected).toBe(false);
      await userEvent.click(tabs[0]);
      await expect.poll(() => selected(host)?.textContent).toBe('Overview');
      expect(host.querySelector('[role="tabpanel"]:not([inert])')?.getAttribute('data-activation-direction')).toBe('left');
      await expect.poll(() => host.querySelectorAll('[role="tabpanel"]').length).toBe(1);
    });
  });
}
