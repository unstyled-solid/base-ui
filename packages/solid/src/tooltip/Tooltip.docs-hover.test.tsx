/// <reference types="vite/client" />
import { expect, it, vi } from 'vitest';
import { Errored } from '@solidjs/web';
import { createRenderer, screen, fireEvent, advanceTimers, waitSingleFrame, waitForAnimations } from '../../test';
import ExampleTooltip from '../../../../docs/demos/tooltip/hero/css-modules';
import { mountDemo } from '../../../../docs/demos/shared/runtime';
import { settle } from './Tooltip.test-utils';

it('opens the docs hero on a no-click hover over the trigger icon after the default rest delay', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  const view = await createRenderer().render(() => <Errored fallback={error => <p role="alert">{String(error())}</p>}><ExampleTooltip /></Errored>);
  const trigger = screen.getByRole('button', { name: 'Bold' });
  const icon = trigger.querySelector('path')!;
  await view.user.hover(icon);
  await advanceTimers(599);
  expect(screen.queryByText('Bold')).toBeNull();
  await advanceTimers(1);
  await waitSingleFrame(); await waitSingleFrame();
  if (typeof screen.getByText('Bold').getAnimations === 'function') await waitForAnimations(screen.getByText('Bold'));
  expect(screen.getByText('Bold')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Bold' })).toBe(trigger);
  expect(trigger).toHaveAttribute('data-popup-open');
  const popup = screen.getByText('Bold');
  fireEvent.mouseLeave(trigger, { relatedTarget: document.body });
  await waitSingleFrame(); await waitSingleFrame();
  if (typeof popup.getAnimations === 'function') await waitForAnimations(popup);
  await settle();
  expect(screen.queryByText('Bold')).toBeNull();
  view.unmount();
  await advanceTimers(400);
  expect(vi.getTimerCount()).toBe(0);
});

it('opens the asynchronously mounted docs island on a no-click hover', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  const host = document.createElement('div');
  document.body.append(host);
  const dispose = mountDemo(host, 'tooltip/hero', {
    loadDemo: async () => ({ id: 'tooltip/hero', upstream: 'docs/upstream/base-ui/tooltip/hero', variants: [
      { id: 'css-modules', label: 'CSS Modules', component: ExampleTooltip, files: [] },
    ] }),
    loadSource: async () => '',
  });
  try {
    await settle();
    const trigger = screen.getByRole('button', { name: 'Bold' });
    // The event targets the SVG subtree, then bubbles through the native figure
    // mount, just as it does in the asynchronously loaded docs preview.
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger.querySelector('path')!);
    await advanceTimers(600);
    await waitSingleFrame(); await waitSingleFrame();
    if (typeof screen.getByText('Bold').getAnimations === 'function') await waitForAnimations(screen.getByText('Bold'));
    expect(screen.getByText('Bold')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Bold' })).toBe(trigger);
    expect(screen.queryByRole('alert')).toBeNull();
  } finally {
    dispose();
    host.remove();
    await advanceTimers(0);
  }
  expect(vi.getTimerCount()).toBe(0);
});
