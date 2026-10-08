import { expect } from 'vitest';
import { userEvent, page, server } from 'vitest/browser';
import { browserCase, createRenderer, waitForAnimations, resetBrowserPointer } from '#test-utils';

browserCase({ source: 'packages/react/test/resetBrowserPointer.ts', case: 'native browser pointer, layout and Web Animations runner', environment: 'browser', issue: 'bsolid-harness-browser-replay' }, async () => {
  const clicks: EventTarget[] = [];
  const { render } = createRenderer();
  const view = await render(() => <button style={{ width: '160px', height: '40px' }} onClick={(event) => { clicks.push(event.currentTarget); }}>Browser runner</button>);
  const button = view.getByRole('button');
  expect(button.getBoundingClientRect().width).toBe(160);
  await userEvent.click(button);
  expect(clicks).toEqual([button]);
  // macOS WebKit intentionally does not focus native buttons on a mouse click.
  if (server.browser === 'webkit') expect(document.activeElement).toBe(document.body);
  else expect(button).toHaveFocus();
  button.focus();
  expect(button).toHaveFocus();
  await userEvent.hover(button);
  expect(button.matches(':hover')).toBe(true);
  await resetBrowserPointer();
  expect(button.matches(':hover')).toBe(false);
  const animation = button.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: 32, fill: 'forwards' });
  await waitForAnimations(button);
  expect(animation.playState).toBe('finished');
  animation.cancel();
  await expect.element(page.getByRole('button', { name: 'Browser runner' })).toBeVisible();
});
