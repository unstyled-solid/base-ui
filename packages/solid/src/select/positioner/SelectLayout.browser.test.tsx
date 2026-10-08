import { createSignal } from 'solid-js';
import { expect } from 'vitest';
import { browserCase, createRenderer, firePointer, fireEvent, screen, waitFor } from '../../../test';
import { Select } from '../index';
import { DirectionProvider } from '../../direction-provider/DirectionProvider';

const { render } = createRenderer();
const source = 'packages/react/src/select/root/SelectRoot.test.tsx';
const issue = 'bsolid-c-select-layout';

for (const direction of ['ltr', 'rtl'] as const) {
  for (const zoom of ['1', '0.9']) {
    browserCase({ source: 'packages/react/src/select/popup/SelectPopup.test.tsx', case: `selected text alignment with popup padding (${direction}, zoom ${zoom})`, environment: 'browser', issue }, async () => {
      const doc = document.documentElement;
      const originalZoom = doc.style.zoom;
      doc.style.zoom = zoom;
      try {
        await render(() => <DirectionProvider direction={direction}><div dir={direction} style={{ 'margin-left': '100px', 'padding-top': '96px', 'min-height': '600px', width: '280px' }}>
          <Select.Root open defaultValue="selected"><Select.Trigger style={{ width: '160px', height: '40px', display: 'flex', 'align-items': 'center', 'padding-inline-start': '12px' }}>
            <Select.Value data-testid="aligned-value">With longer label</Select.Value>
          </Select.Trigger><Select.Portal><Select.Positioner data-testid="aligned-positioner"><Select.Popup dir={direction} style={{ width: '220px', 'max-height': 'none', 'box-sizing': 'border-box', border: '4px solid transparent', 'padding-inline-start': '20px', 'padding-inline-end': '12px' }}>
            <Select.Item value="selected"><Select.ItemText data-testid="aligned-text" style={{ 'padding-inline-start': '24px', 'padding-inline-end': '8px' }}>With longer label</Select.ItemText></Select.Item>
            <Select.Item value="other"><Select.ItemText>Other option</Select.ItemText></Select.Item>
          </Select.Popup></Select.Positioner></Select.Portal></Select.Root>
        </div></DirectionProvider>);
        await waitFor(() => expect(screen.getByTestId('aligned-positioner')).toHaveAttribute('data-side', 'none'));
        await waitFor(() => {
          const value = screen.getByTestId('aligned-value').getBoundingClientRect();
          const text = screen.getByTestId('aligned-text').getBoundingClientRect();
          expect(Math.abs(direction === 'ltr' ? value.left - text.left : value.right - text.right)).toBeLessThan(1);
        });
      } finally { doc.style.zoom = originalZoom; }
    });
  }
}

for (const wide of [false, true]) {
  browserCase({ source, case: `touch scroll lock is viewport-width-dependent (${wide ? 'wide' : 'narrow'})`, environment: 'browser', issue }, async () => {
    await render(() => <Select.Root modal><Select.Trigger>Open</Select.Trigger><Select.Portal><Select.Positioner data-testid="touch-positioner" style={{ width: wide ? 'calc(100vw - 10px)' : '240px' }}>
      <Select.Popup><Select.Item>Item</Select.Item></Select.Popup>
    </Select.Positioner></Select.Portal></Select.Root>);
    const trigger = screen.getByRole('combobox');
    firePointer.down(trigger, { pointerType: 'touch', timeStamp: 10 });
    fireEvent.mouseDown(trigger);
    await waitFor(() => expect(screen.getByTestId('touch-positioner').style.opacity).not.toBe('0'));
    await waitFor(() => {
      const doc = trigger.ownerDocument;
      expect(doc.documentElement.style.overflow === 'hidden' || doc.documentElement.hasAttribute('data-base-ui-scroll-locked') || doc.body.style.overflow === 'hidden').toBe(wide);
    });
  });
}

browserCase({ source, case: 'selected-item text aligns with the trigger value in real layout', environment: 'browser', issue }, async () => {
  const view = await render(() => <div style={{ 'padding-top': '150px', 'padding-left': '80px' }}>
    <Select.Root defaultValue="item-8"><Select.Trigger style={{ width: '160px', height: '36px' }}><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner><Select.Popup style={{ width: '200px', 'max-height': 'none' }}>
        <Select.ScrollUpArrow /><Select.List>{Array.from({ length: 24 }, (_, i) => <Select.Item value={`item-${i}`} style={{ height: '32px', padding: '0 20px' }}><Select.ItemText>{`item-${i}`}</Select.ItemText></Select.Item>)}</Select.List><Select.ScrollDownArrow />
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>
  </div>);
  const trigger = screen.getByRole('combobox');
  await view.user.click(trigger);
  const option = await screen.findByRole('option', { name: 'item-8' });
  await waitFor(() => expect(Math.abs(option.querySelector('div')!.getBoundingClientRect().left - trigger.querySelector('span')!.getBoundingClientRect().left)).toBeLessThanOrEqual(1));
  const text = option.querySelector('div')!.getBoundingClientRect();
  const value = trigger.querySelector('span')!.getBoundingClientRect();
  expect(Math.abs(text.top + text.height / 2 - value.top - value.height / 2)).toBeLessThanOrEqual(1);
});

browserCase({ source, case: 'touch reopen recomputes placement before visibility and retains anchored exit', environment: 'browser', issue }, async () => {
  const originalAnimationsDisabled = globalThis.BASE_UI_ANIMATIONS_DISABLED;
  globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  try {
    await render(() => <div style={{ 'padding-top': '100px' }}><style>{`[data-ending-style].select-touch-popup { animation: select-touch-exit 100ms; } @keyframes select-touch-exit { to { opacity: 0; } }`}</style>
      <Select.Root><Select.Trigger>Open</Select.Trigger><Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup class="select-touch-popup" style={{ width: '120px' }}><Select.Item value="a">Apple</Select.Item></Select.Popup></Select.Positioner></Select.Portal></Select.Root>
    </div>);
    const trigger = screen.getByRole('combobox');
    function press(time: number) {
      firePointer.down(trigger, { pointerType: 'touch', timeStamp: time }); fireEvent.mouseDown(trigger);
    }
    press(10);
    await screen.findByRole('listbox');
    await waitFor(() => expect(getComputedStyle(screen.getByTestId('positioner')).position).toBe('absolute'));
    press(30);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('data-ending-style'));
    expect(getComputedStyle(screen.getByTestId('positioner')).position).toBe('absolute');
    press(50);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.getByTestId('positioner')).not.toHaveAttribute('data-side', 'none');
  } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = originalAnimationsDisabled; }
});

browserCase({ source, case: 'hover arrows reach real scroll boundaries with trailing content', environment: 'browser', issue }, async () => {
  const view = await render(() => <Select.Root defaultOpen><Select.Trigger>Open</Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
    <Select.ScrollUpArrow keepMounted /><Select.List style={{ height: '180.5px', 'overflow-y': 'auto' }}>
      {Array.from({ length: 12 }, (_, i) => <Select.Item value={i} style={{ height: '31.25px' }}>{`item ${i}`}</Select.Item>)}
      <div style={{ height: '170.25px' }}>Trailing content</div>
    </Select.List><Select.ScrollDownArrow keepMounted />
  </Select.Popup></Select.Positioner></Select.Portal></Select.Root>);
  const list = screen.getByRole('listbox');
  await view.user.hover(screen.getByText('▼'));
  fireEvent.mouseMove(screen.getByText('▼'), { movementY: 1 });
  await waitFor(() => expect(Math.abs(list.scrollTop - (list.scrollHeight - list.clientHeight))).toBeLessThanOrEqual(1), { timeout: 3000 });
  await view.user.unhover(screen.getByText('▼'));
  await view.user.hover(screen.getByText('▲'));
  fireEvent.mouseMove(screen.getByText('▲'), { movementY: -1 });
  await waitFor(() => expect(list.scrollTop).toBe(0), { timeout: 3000 });
});

browserCase({ source, case: 'non-modal Select Escape does not dismiss an enclosing Popover', environment: 'browser', issue }, async () => {
  const { Popover } = await import('../../popover');
  const view = await render(() => <Popover.Root defaultOpen><Popover.Trigger>Popover</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="popover">
    <Select.Root modal={false}><Select.Trigger>Select</Select.Trigger><Select.Portal><Select.Positioner><Select.Popup><Select.Item value="a">Apple</Select.Item></Select.Popup></Select.Positioner></Select.Portal></Select.Root>
  </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>);
  await view.user.click(screen.getByRole('combobox'));
  await screen.findByRole('listbox'); await view.user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  expect(screen.getByTestId('popover')).toBeInTheDocument();
});

browserCase({ source, case: 'aligned option replacement and simultaneous controlled reopen resets scroll', environment: 'browser', issue }, async () => {
  const view = await render(() => {
    const [group, setGroup] = createSignal('a');
    const [value, setValue] = createSignal<string | null>(null);
    const [open, setOpen] = createSignal(false);
    return <div style={{ 'padding-top': '120px' }}><button onClick={() => { setGroup('b'); setValue(null); setOpen(true); }}>Replace and open</button>
      <Select.Root value={value()} onValueChange={setValue} open={open()} onOpenChange={setOpen}>
        <Select.Trigger><Select.Value placeholder="Pick" /></Select.Trigger><Select.Portal><Select.Positioner><Select.Popup style={{ 'max-height': 'none', 'min-height': '100px' }}>
          {Array.from({ length: 40 }, (_, i) => <Select.Item value={`${group()}-${i}`} style={{ height: '30px' }}><Select.ItemText>{`${group()}-${i}`}</Select.ItemText></Select.Item>)}
        </Select.Popup></Select.Positioner></Select.Portal>
      </Select.Root></div>;
  });
  await view.user.click(screen.getByRole('combobox')); await view.user.click(await screen.findByRole('option', { name: 'a-35' }));
  await view.user.click(screen.getByText('Replace and open'));
  await waitFor(() => expect(screen.getByRole('listbox').scrollTop).toBe(0));
  expect(screen.getByRole('option', { name: 'b-0' }).getBoundingClientRect().top).toBeGreaterThanOrEqual(screen.getByRole('listbox').getBoundingClientRect().top);
});
