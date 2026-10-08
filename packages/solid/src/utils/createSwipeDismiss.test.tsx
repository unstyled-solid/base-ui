import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, firePointer } from '../../test';
import { createSwipeDismiss } from './createSwipeDismiss';

it('createSwipeDismiss uses explicit first-move rebase and release timestamps', async () => {
  const release = vi.fn(), dismiss = vi.fn();
  const view = await createRenderer().render(() => {
    const [element, setElement] = createSignal<HTMLElement | null>(null);
    const swipe = createSwipeDismiss({ enabled: true, directions: ['right'], elementRef: element, movementCssVars: { x: '--x', y: '--y' }, onRelease: release, onDismiss: dismiss });
    return <div ref={setElement} data-testid="swipe" {...swipe.getPointerProps()}>Swipe</div>;
  });
  const element = view.getByTestId('swipe');
  firePointer.down(element, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 0, timeStamp: 100 });
  firePointer.move(element, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 10, timeStamp: 110 });
  expect(element.style.getPropertyValue('--x')).toBe('0px');
  firePointer.move(element, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 70, timeStamp: 140 });
  expect(element.style.getPropertyValue('--x')).toBe('60px');
  firePointer.up(element, { pointerId: 1, pointerType: 'mouse', buttons: 0, clientX: 70, timeStamp: 150 });
  expect(release.mock.calls[0]![0]).toMatchObject({ deltaX: 60, velocityX: 1.2, direction: 'right' });
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(element.style.transform).toBe('');
});

it('createSwipeDismiss reversals cancel and interactive descendants do not start a mouse swipe', async () => {
  const dismiss = vi.fn();
  const view = await createRenderer().render(() => {
    const [element, setElement] = createSignal<HTMLElement | null>(null);
    const swipe = createSwipeDismiss({ enabled: true, directions: ['right'], elementRef: element, movementCssVars: { x: '--x', y: '--y' }, trackDrag: false, onDismiss: dismiss });
    return <div ref={setElement} data-testid="swipe" {...swipe.getPointerProps()}><button style={{ width: '200px' }}>Ignore</button></div>;
  });
  const node = view.getByTestId('swipe');
  firePointer.down(node, { pointerType: 'mouse', buttons: 1, clientX: 0, timeStamp: 100 });
  firePointer.move(node, { pointerType: 'mouse', buttons: 1, clientX: 80, timeStamp: 120 });
  firePointer.move(node, { pointerType: 'mouse', buttons: 1, clientX: 50, timeStamp: 140 });
  firePointer.up(node, { pointerType: 'mouse', buttons: 0, clientX: 50, timeStamp: 160 });
  expect(dismiss).not.toHaveBeenCalled();
  const button = view.getByRole('button');
  const rect = button.getBoundingClientRect();
  const clientX = rect.left + 10, clientY = rect.top + rect.height / 2;
  firePointer.down(button, { pointerType: 'mouse', buttons: 1, clientX, clientY, timeStamp: 200 });
  firePointer.move(button, { pointerType: 'mouse', buttons: 1, clientX: clientX + 100, clientY, timeStamp: 240 });
  firePointer.up(button, { pointerType: 'mouse', buttons: 0, clientX: clientX + 100, clientY, timeStamp: 260 });
  expect(dismiss).not.toHaveBeenCalled();
});
