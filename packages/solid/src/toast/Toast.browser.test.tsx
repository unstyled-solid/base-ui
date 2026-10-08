import { expect } from 'vitest';
import { createSignal, For, flush } from 'solid-js';
import { browserCase, createRenderer, firePointer, fireEvent, isInaccessible, waitFor } from '../../test';
import { Toast } from './index';
import type { ToastRootProps } from './root/ToastRoot';

const { render, renderProps } = createRenderer();
const rootSource = 'packages/react/src/toast/root/ToastRoot.test.tsx';
const viewportSource = 'packages/react/src/toast/viewport/ToastViewport.test.tsx';
function browser(source: string, name: string, run: () => Promise<void>) {
  browserCase({ source, case: name, environment: 'browser', issue: 'bsolid-review-toast-browser' }, run);
}
function animatedBrowser(source: string, name: string, run: () => Promise<void>) {
  browser(source, name, async () => {
    const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    try { await run(); } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
  });
}
async function fixture(directions: ToastRootProps['swipeDirection'] = ['down', 'right'], anchored = false) {
  const manager = Toast.createToastManager();
  function List() {
    const local = Toast.useToastManager();
    return <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()} swipeDirection={directions} data-testid={toast().id} style={{ width: '120px' }}>
      <Toast.Content><Toast.Title /><Toast.Description /></Toast.Content>
      <div data-base-ui-swipe-ignore data-testid="ignore">Ignore</div>
      <div data-swipe-ignore data-testid="legacy-ignore">Legacy ignore</div>
    </Toast.Root>}</For>;
  }
  const view = await render(() => <Toast.Provider timeout={0} toastManager={manager}><Toast.Viewport data-testid="viewport"><List /></Toast.Viewport></Toast.Provider>);
  manager.add({ id: 'a', title: 'Title', description: 'Short', ...(anchored ? { positionerProps: { anchor: view.getByTestId('viewport') } } : {}) }); flush();
  return { view, manager, node: view.getByTestId('a') };
}
let timestamp = 1;
function move(node: Element, x: number, y: number, movementX = 0, movementY = 0) {
  firePointer.move(node, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, movementX, movementY, bubbles: true, timeStamp: ++timestamp }); flush();
}
function start(node: Element, button = 0) {
  firePointer.down(node, { pointerId: 1, pointerType: 'touch', button, clientX: 100, clientY: 100, bubbles: true, timeStamp: ++timestamp }); flush();
  move(node, 100, 100); // canonical iOS first-move rebasing
}
function release(node: Element, x: number, y: number) {
  firePointer.up(node, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, timeStamp: ++timestamp }); flush();
}
const offsets = { up: [0, -60], down: [0, 60], left: [-60, 0], right: [60, 0] } as const;
for (const direction of ['up', 'down', 'left', 'right'] as const) {
  browser(rootSource, `dismisses in allowed direction [${direction}]`, async () => {
    const { view, node } = await fixture(direction); const [x, y] = offsets[direction];
    start(node); move(node, 100 + x, 100 + y, x, y);
    expect(node).toHaveAttribute('data-swipe-direction', direction); expect(node).toHaveAttribute('data-swiping');
    release(node, 100 + x, 100 + y); await waitFor(() => expect(view.queryByTestId('a')).toBeNull());
  });
  browser(rootSource, `below threshold and opposite-direction damping [${direction}]`, async () => {
    const { view, node } = await fixture(direction); const [x, y] = offsets[direction];
    start(node); move(node, 100 + x / 6, 100 + y / 6); release(node, 100 + x / 6, 100 + y / 6);
    expect(view.getByTestId('a')).toBe(node);
    start(node); move(node, 100 - x, 100 - y); release(node, 100 - x, 100 - y);
    expect(view.getByTestId('a')).toBe(node); expect(node).not.toHaveAttribute('data-swiping');
  });
}
for (const directions of [['up', 'right'], ['left', 'right'], ['up', 'down']] as const) browser(rootSource, `supports multiple directions [${directions.join(',')}]`, async () => {
  for (const direction of directions) {
    const { view, node } = await fixture([...directions]); const [x, y] = offsets[direction];
    start(node); move(node, 100 + x, 100 + y); release(node, 100 + x, 100 + y);
    await waitFor(() => expect(view.queryByTestId('a')).toBeNull()); view.unmount();
  }
});
for (const axis of ['horizontal', 'vertical'] as const) browser(rootSource, `locks axis and cancels direction reversal [${axis}]`, async () => {
  const { view, node } = await fixture(['down', 'right']);
  start(node); move(node, axis === 'horizontal' ? 105 : 102, axis === 'vertical' ? 105 : 102);
  move(node, 160, 160);
  expect(node.style.getPropertyValue(axis === 'horizontal' ? '--toast-swipe-movement-y' : '--toast-swipe-movement-x')).toBe('0px');
  fireEvent.pointerCancel(node, { pointerId: 1, pointerType: 'touch' }); flush(); expect(node).not.toHaveAttribute('data-swiping');
  view.unmount();
  const reversal = await fixture(axis === 'horizontal' ? 'right' : 'up'); start(reversal.node);
  move(reversal.node, axis === 'horizontal' ? 190 : 100, axis === 'vertical' ? 10 : 100, axis === 'horizontal' ? 90 : 0, axis === 'vertical' ? -90 : 0);
  move(reversal.node, axis === 'horizontal' ? 150 : 100, axis === 'vertical' ? 50 : 100, axis === 'horizontal' ? -40 : 0, axis === 'vertical' ? 40 : 0);
  release(reversal.node, 150, 50); expect(reversal.view.getByTestId('a')).toBe(reversal.node);
  expect(reversal.node).not.toHaveAttribute('data-swipe-direction');
});
browser(rootSource, 'primary-button gate, both ignore attributes and anchored disable', async () => {
  const { view, node } = await fixture('right'); start(node, 2); move(node, 200, 100); release(node, 200, 100);
  expect(view.getByTestId('a')).toBe(node);
  for (const id of ['ignore', 'legacy-ignore']) {
    start(view.getByTestId(id)); expect(node).not.toHaveAttribute('data-swiping');
  }
  view.unmount(); const anchored = await fixture('right', true); start(anchored.node); move(anchored.node, 200, 100); release(anchored.node, 200, 100);
  expect(anchored.view.getByTestId('a')).toBe(anchored.node);
});
browser(rootSource, 'document release/pointercancel clears drag styles and touchmove prevention', async () => {
  const { view, node } = await fixture();
  const before = new Event('touchmove', { bubbles: true, cancelable: true }); node.dispatchEvent(before); expect(before.defaultPrevented).toBe(false);
  start(node); const during = new Event('touchmove', { bubbles: true, cancelable: true }); node.dispatchEvent(during); expect(during.defaultPrevented).toBe(true);
  move(node, -5000, 100); fireEvent.pointerCancel(document, { pointerId: 1, pointerType: 'touch' }); flush();
  expect(node.style.transform).toBe(''); expect(node.style.transition).toBe(''); expect(node).not.toHaveAttribute('data-swiping');
  const after = new Event('touchmove', { bubbles: true, cancelable: true }); node.dispatchEvent(after); expect(after.defaultPrevented).toBe(false);
  start(node); move(node, -5000, 100); fireEvent.pointerUp(document, { pointerId: 1, pointerType: 'touch' }); flush();
  expect(node.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px'); expect(view.getByTestId('a')).toBe(node);
});
browser(rootSource, 'remeasures content mutation and publishes frontmost height and offsets', async () => {
  const { view, node, manager } = await fixture();
  await waitFor(() => expect(parseInt(node.style.getPropertyValue('--toast-height'))).toBeGreaterThan(0));
  const initial = parseInt(node.style.getPropertyValue('--toast-height'));
  manager.update('a', { description: 'Long content that wraps over many more lines and increases the natural measured height of this notification.' }); flush();
  await waitFor(() => expect(parseInt(node.style.getPropertyValue('--toast-height'))).toBeGreaterThan(initial));
  expect(view.getByTestId('viewport').style.getPropertyValue('--toast-frontmost-height')).toBe(node.style.getPropertyValue('--toast-height'));
  manager.add({ id: 'b', title: 'Front' }); flush();
  await waitFor(() => expect(parseInt(node.style.getPropertyValue('--toast-offset-y'))).toBeGreaterThan(0));
});
animatedBrowser(rootSource, 'retained ending ID resets swipe/starting state and restores natural height', async () => {
  const { view, node, manager } = await fixture('right');
  node.style.transition = 'opacity 10s';
  const style = document.createElement('style'); style.textContent = '[data-ending-style]{opacity:0}'; document.head.append(style);
  try {
    await waitFor(() => expect(parseInt(node.style.getPropertyValue('--toast-height'))).toBeGreaterThan(0));
    const initial = node.style.getPropertyValue('--toast-height');
    start(node); move(node, 160, 100, 60); release(node, 160, 100);
    expect(node).toHaveAttribute('data-ending-style'); expect(node).toHaveAttribute('data-swipe-direction', 'right');
    manager.add({ id: 'a', title: 'Title', description: 'Short' }); flush();
    expect(view.getByTestId('a')).toBe(node);
    await waitFor(() => expect(node).not.toHaveAttribute('data-starting-style'));
    expect(node.style.getPropertyValue('--toast-height')).toBe(initial);
    expect(node.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px');
    expect(node).not.toHaveAttribute('data-swipe-direction');
  } finally { style.remove(); }
});
browser(rootSource, 'registers an active toast after remount and remeasures changed content', async () => {
  const manager = Toast.createToastManager(); let setShown!: (value: boolean) => void;
  let setLong!: (value: boolean) => void;
  function List() {
    const local = Toast.useToastManager(); const [shown, show] = createSignal(true), [long, longer] = createSignal(false);
    setShown = show; setLong = longer;
    return <>{shown() && <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) =>
      <Toast.Root toast={toast()} data-testid="a" style={{ width: '30px' }}><Toast.Title>{long() ? 'A much longer title that requires several lines' : undefined}</Toast.Title></Toast.Root>
    }</For>}</>;
  }
  const view = await render(() => <Toast.Provider timeout={0} toastManager={manager}><Toast.Viewport data-testid="viewport"><List /></Toast.Viewport></Toast.Provider>);
  manager.add({ id: 'a', title: 'Saved' }); flush(); const original = view.getByTestId('a');
  await waitFor(() => expect(parseInt(original.style.getPropertyValue('--toast-height'))).toBeGreaterThan(0));
  const height = parseInt(original.style.getPropertyValue('--toast-height'));
  setShown(false); flush(); expect(view.queryByTestId('a')).toBeNull();
  setLong(true); setShown(true); flush(); const remounted = view.getByTestId('a'); expect(remounted).not.toBe(original);
  await waitFor(() => expect(parseInt(remounted.style.getPropertyValue('--toast-height'))).toBeGreaterThan(height));
  await view.user.keyboard('{F6}'); await view.user.tab(); expect(remounted).toHaveFocus();
});
animatedBrowser(rootSource, 'revived toast returns to front while unrelated toast remains behind', async () => {
  const { view, manager, node } = await fixture(); manager.add({ id: 'b', title: 'Two' }); flush();
  node.style.transition = 'opacity 10s';
  const style = document.createElement('style'); style.textContent = '[data-ending-style]{opacity:0}'; document.head.append(style);
  try {
    manager.close('a'); flush(); manager.add({ id: 'a', title: 'Revived' }); flush();
    expect(view.getByTestId('a')).toBe(node);
    await waitFor(() => expect(node).not.toHaveAttribute('data-starting-style'));
    expect(node.style.getPropertyValue('--toast-index')).toBe('0');
    expect(view.getByTestId('b').style.getPropertyValue('--toast-index')).toBe('1');
    expect(node.querySelector('[data-behind]')).toBeNull();
    expect(view.getByTestId('b').querySelector('[data-behind]')).not.toBeNull();
  } finally { style.remove(); }
});
animatedBrowser(rootSource, 'retained index-keyed root resets swipe state on ID reuse and registers focus per ID', async () => {
  const manager = Toast.createToastManager();
  function List() { const local = Toast.useToastManager(); return <For each={local.toasts} keyed={false}>{(toast, index) =>
    <Toast.Root toast={toast()} swipeDirection="right" data-testid={`root-${index}`} style={{ transition: 'opacity 10s' }}><Toast.Title /></Toast.Root>
  }</For>; }
  const view = await render(() => <Toast.Provider timeout={0} toastManager={manager}><Toast.Viewport><List /></Toast.Viewport><button>Outside</button></Toast.Provider>);
  const style = document.createElement('style'); style.textContent = '[data-ending-style]{opacity:0}'; document.head.append(style);
  try {
    for (const id of ['a', 'b', 'c']) manager.add({ id, title: id }); flush();
    const middle = view.getByTestId('root-1'); start(middle); move(middle, 160, 100, 60); release(middle, 160, 100);
    expect(middle).toHaveAttribute('data-swipe-direction', 'right');
    manager.add({ id: 'd', title: 'd' }); flush(); expect(view.getByTestId('root-1')).toBe(middle);
    await waitFor(() => expect(middle).not.toHaveAttribute('data-swipe-direction'));
    expect(middle.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px');
    await view.user.keyboard('{F6}'); await view.user.tab(); expect(view.getByTestId('root-0')).toHaveFocus();
    await view.user.keyboard('{Escape}'); await waitFor(() => expect(middle).toHaveFocus());
  } finally { style.remove(); }
});
for (const direction of ['left', 'right', 'up', 'down'] as const) browser(rootSource, `real user touch pointer sequence [${direction}]`, async () => {
  const { view, node } = await fixture(direction); const [x, y] = offsets[direction];
  const rect = node.getBoundingClientRect(); const startX = rect.left + rect.width / 2, startY = rect.top + rect.height / 2;
  await view.user.pointer([
    { target: node, coords: { clientX: startX, clientY: startY }, keys: '[TouchA>]' },
    { target: node, pointerName: 'TouchA', coords: { clientX: startX + Math.sign(x), clientY: startY + Math.sign(y) } },
    { target: node, pointerName: 'TouchA', coords: { clientX: startX + x, clientY: startY + y } },
    { keys: '[/TouchA]' },
  ]);
  await waitFor(() => expect(view.queryByTestId('a')).toBeNull());
});
browser(viewportSource, 'F6, Tab/Shift+Tab, limited/ending skip and previous-focus restoration', async () => {
  const { view, manager } = await fixture();
  const outside = document.createElement('button'); document.body.append(outside);
  try {
    outside.focus(); await view.user.keyboard('{F6}'); expect(view.getByTestId('viewport')).toHaveFocus();
    await view.user.tab(); expect(view.getByTestId('a')).toHaveFocus();
    await view.user.tab({ shift: true }); expect(outside).toHaveFocus();
    outside.focus(); await view.user.keyboard('{F6}'); await view.user.tab(); manager.close('a'); flush();
    await waitFor(() => expect(outside).toHaveFocus());
  } finally { outside.remove(); }
});
browser('packages/react/src/toast/positioner/ToastPositioner.test.tsx', 'anchor geometry, overrides and Arrow state/CSS variables', async () => {
  const manager = Toast.createToastManager(); let anchor!: HTMLButtonElement;
  function List() { const local = Toast.useToastManager(); return <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) =>
    <Toast.Positioner toast={toast()} side="bottom" sideOffset={8} data-testid="positioner"><Toast.Root toast={toast()}><Toast.Arrow data-testid="arrow" style={{ width: '10px', height: '10px' }} /><Toast.Title /></Toast.Root></Toast.Positioner>
  }</For>; }
  const view = await render(() => <Toast.Provider toastManager={manager} timeout={0}><button ref={anchor} style={{ position: 'fixed', left: '200px', top: '200px' }}>Anchor</button><List /></Toast.Provider>);
  manager.add({ id: 'a', title: 'Anchored', positionerProps: { anchor, side: 'top' } }); flush();
  const positioner = view.getByTestId('positioner');
  await waitFor(() => expect(positioner).toHaveAttribute('data-side', 'bottom'));
  await waitFor(() => expect(positioner.getBoundingClientRect().top).toBeCloseTo(anchor.getBoundingClientRect().bottom + 8, 0));
  expect(view.getByTestId('arrow')).toHaveAttribute('data-side', 'bottom');
  expect(positioner.style.getPropertyValue('--anchor-width')).not.toBe(''); expect(view.getByTestId('arrow')).toHaveAttribute('aria-hidden', 'true');
});
for (const priority of ['low', 'high'] as const) browser('packages/react/src/toast/useToastManager.test.tsx', `toasts in dialogs [priority=${priority}]`, async () => {
  const { Dialog } = await import('../dialog/index');
  const manager = Toast.createToastManager();
  function List() { const local = Toast.useToastManager(); return <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) =>
    <Toast.Root toast={toast()} data-testid="toast"><Toast.Title /><Toast.Description /><Toast.Close>Close toast</Toast.Close></Toast.Root>
  }</For>; }
  const view = await render(() => <Toast.Provider timeout={0} toastManager={manager}>
    <Toast.Viewport><List /></Toast.Viewport>
    <Dialog.Root open><Dialog.Portal><Dialog.Popup><button onClick={() => manager.add({ title: 'Toast in dialog', description: 'Details', priority })}>Add toast</button></Dialog.Popup></Dialog.Portal></Dialog.Root>
  </Toast.Provider>);
  await view.user.click(view.getByText('Add toast'));
  expect(view.getByTestId('toast')).toHaveTextContent('Toast in dialog');
  if (priority === 'high') { expect(view.getByTestId('toast')).toHaveAttribute('aria-hidden', 'true'); expect(isInaccessible(view.getByRole('alert'))).toBe(false); }
  else expect(isInaccessible(view.getByTestId('toast'))).toBe(false);
});
