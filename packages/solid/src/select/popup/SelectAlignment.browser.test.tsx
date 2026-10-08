import { createSignal } from 'solid-js';
import { expect } from 'vitest';
import { browserCase, createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { DirectionProvider } from '../../direction-provider/DirectionProvider';
import { Select } from '../index';

const { render, renderProps } = createRenderer();
const source = 'packages/react/src/select/popup/SelectPopup.test.tsx';
const issue = 'bsolid-select-browser-qualification';

async function expectAligned(direction: 'ltr' | 'rtl') {
  await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'none'));
  await waitFor(() => {
    const value = screen.getByTestId('value').getBoundingClientRect();
    const text = screen.getByTestId('text').getBoundingClientRect();
    expect(Math.abs(direction === 'ltr' ? value.left - text.left : value.right - text.right)).toBeLessThan(1);
  });
  await waitFor(() => {
    const value = screen.getByTestId('value').getBoundingClientRect();
    const text = screen.getByTestId('text').getBoundingClientRect();
    expect(Math.abs(value.top + value.height / 2 - text.top - text.height / 2)).toBeLessThan(1);
  });
}

for (const customAnchor of [false, true]) {
  browserCase({ source, case: `docs RTL grid first open, custom anchor ${customAnchor}`, environment: 'browser', issue }, async () => {
    const view = await render(() => {
      const [anchor, setAnchor] = createSignal<HTMLDivElement | null>(null);
      return <DirectionProvider direction="rtl"><div dir="rtl" ref={setAnchor} style={{ width: '240px', 'margin-left': '100px', 'padding-top': '96px' }}>
        <style>{`.select-rtl-popup { box-sizing:border-box; min-width:var(--anchor-width); }
          .select-rtl-popup[data-side='none'] { min-width:calc(var(--anchor-width) + 1rem); }
          .select-rtl-item { padding:8px 16px 8px 10px; display:grid; gap:8px; align-items:center; grid-template-columns:12px 1fr; }
          [data-side='none'] .select-rtl-item { padding-inline-start:48px; }
          .select-rtl-indicator { grid-column:1; } .select-rtl-text { grid-column:2; }`}</style>
        <Select.Root defaultValue="selected"><Select.Trigger style={{ 'box-sizing': 'border-box', display: 'flex', 'justify-content': 'flex-end', height: '40px', width: '160px', 'padding-inline-start': '28px', 'padding-inline-end': '12px', 'font-size': '16px', 'line-height': '24px' }}>
          <Select.Value data-testid="value">الخيار المحدد</Select.Value>
        </Select.Trigger><Select.Portal><Select.Positioner anchor={customAnchor ? anchor : undefined} data-testid="positioner" dir="rtl" sideOffset={8}>
          <Select.Popup class="select-rtl-popup" dir="rtl"><Select.List style={{ 'padding-block': '4px', 'max-height': 'var(--available-height)' }}>
            {['first', 'selected', 'third'].map(value => <Select.Item value={value} class="select-rtl-item">
              <Select.ItemIndicator class="select-rtl-indicator">✓</Select.ItemIndicator>
              <Select.ItemText class="select-rtl-text" data-testid={value === 'selected' ? 'text' : undefined}>{value === 'selected' ? 'الخيار المحدد' : 'الخيار الآخر'}</Select.ItemText>
            </Select.Item>)}
          </Select.List></Select.Popup>
        </Select.Positioner></Select.Portal></Select.Root>
      </div></DirectionProvider>;
    });
    await view.user.click(screen.getByRole('combobox'));
    await expectAligned('rtl');
    if (customAnchor) expect(screen.getByTestId('positioner').style.getPropertyValue('--anchor-width')).toBe('240px');
  });
}

for (const direction of ['ltr', 'rtl'] as const) {
  browserCase({ source, case: `no ItemText uses trigger inline edge ${direction}`, environment: 'browser', issue }, async () => {
    await render(() => <DirectionProvider direction={direction}><div dir={direction} style={{ width: '280px', 'margin-left': '100px', 'padding-top': '96px' }}>
      <Select.Root open><Select.Trigger data-testid="trigger" style={{ width: '160px' }}><Select.Value placeholder="Pick" /></Select.Trigger>
        <Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup style={{ width: '180px', 'max-height': 'none' }}><Select.Item value="a">Apple</Select.Item><Select.Item value="b">Banana</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
      </Select.Root>
    </div></DirectionProvider>);
    await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'none'));
    await waitFor(() => {
      const trigger = screen.getByTestId('trigger').getBoundingClientRect();
      const positioner = screen.getByTestId('positioner').getBoundingClientRect();
      expect(Math.abs(direction === 'rtl' ? trigger.right - positioner.right : trigger.left - positioner.left)).toBeLessThan(1);
    });
  });
}

browserCase({ source, case: 'grouped first/selected text stays aligned after reopen', environment: 'browser', issue }, async () => {
  const view = await render(() => <div style={{ 'margin-left': '100px', 'padding-top': '96px', 'min-height': '600px' }}>
    <Select.Root><Select.Trigger style={{ 'box-sizing': 'border-box', width: '176px', height: '40px', display: 'flex', 'align-items': 'center', 'padding-inline-start': '14px' }}><Select.Value data-testid="value" placeholder="Select produce" /></Select.Trigger>
      <Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup style={{ width: '220px', 'max-height': 'none' }}><Select.List style={{ 'padding-block': '4px', 'overflow-y': 'auto' }}>
        <Select.Group><Select.GroupLabel style={{ padding: '8px 16px 4px 30px', 'font-size': '11px', 'line-height': '16px' }}>Fruits</Select.GroupLabel>
          <Select.Item value="apple" style={{ padding: '8px 16px 8px 10px', 'font-size': '14px', 'line-height': '16px' }}><Select.ItemText data-testid="first">Apple</Select.ItemText></Select.Item>
          <Select.Item value="banana" style={{ padding: '8px 16px 8px 10px', 'font-size': '14px', 'line-height': '16px' }}><Select.ItemText data-testid="selected">Banana</Select.ItemText></Select.Item>
        </Select.Group>
      </Select.List></Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>
  </div>);
  async function aligned(id: string) {
    await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'none'));
    await waitFor(() => {
      const value = screen.getByTestId('value').getBoundingClientRect();
      const text = screen.getByTestId(id).getBoundingClientRect();
      expect(Math.abs(value.top + value.height / 2 - text.top - text.height / 2)).toBeLessThan(1);
    });
  }
  const trigger = screen.getByRole('combobox');
  await view.user.click(trigger);
  await aligned('first');
  await view.user.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  await view.user.click(trigger);
  await aligned('first');
  await view.user.click(screen.getByTestId('selected'));
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  await view.user.click(trigger);
  await aligned('selected');
});

browserCase({ source, case: 'aligned list grows once and respects max-height saturation', environment: 'browser', issue }, async () => {
  await render(() => <div style={{ 'padding-top': '300px' }}><Select.Root open defaultValue={0}><Select.Trigger style={{ height: '36px' }}><Select.Value /></Select.Trigger>
    <Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup style={{ width: '180px', 'max-height': 'none' }}><Select.List data-testid="list">
      {Array.from({ length: 40 }, (_, value) => <Select.Item value={value} style={{ height: '32px' }}><Select.ItemText>{value}</Select.ItemText></Select.Item>)}
    </Select.List></Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root></div>);
  await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'none'));
  const positioner = screen.getByTestId('positioner');
  const list = screen.getByTestId('list');
  await waitFor(() => expect(positioner.style.bottom).toBe('0px'));
  const before = positioner.getBoundingClientRect().height;
  list.scrollTop = 80;
  fireEvent.scroll(list);
  await waitFor(() => expect(positioner.getBoundingClientRect().height).toBeGreaterThan(before));
  expect(list.scrollTop).toBe(0);
  list.scrollTop = list.scrollHeight;
  fireEvent.scroll(list);
  const available = list.ownerDocument.documentElement.clientHeight - parseFloat(getComputedStyle(positioner).marginTop) - parseFloat(getComputedStyle(positioner).marginBottom);
  await waitFor(() => expect(positioner.getBoundingClientRect().height).toBeLessThanOrEqual(available));
});

browserCase({ source, case: 'Popup and List retain distinct source scroller semantics', environment: 'browser', issue }, async () => {
  const view = await renderProps((props: { withList: boolean }) => <Select.Root open multiple readOnly><Select.Trigger>Open</Select.Trigger>
    <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup data-testid="popup">
      {props.withList ? <Select.List data-testid="list"><Select.Item>Item</Select.Item></Select.List> : <Select.Item>Item</Select.Item>}
    </Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root>, { withList: false });
  const popup = screen.getByTestId('popup');
  expect(screen.getByRole('listbox')).toBe(popup);
  expect(popup).toHaveAttribute('aria-multiselectable', 'true');
  expect(popup).toHaveAttribute('aria-readonly', 'true');
  await view.setProps({ withList: true });
  expect(screen.getByTestId('popup')).toBe(popup);
  expect(popup).toHaveAttribute('role', 'presentation');
  expect(popup).not.toHaveAttribute('aria-multiselectable');
  expect(popup).not.toHaveAttribute('aria-readonly');
  const list = screen.getByRole('listbox');
  expect(list).toHaveAttribute('aria-multiselectable', 'true');
  expect(list).toHaveAttribute('aria-readonly', 'true');
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-controls', list.id);
});

browserCase({ source: 'packages/react/src/select/positioner/SelectPositioner.test.tsx', case: 'normal anchor live offset callbacks and fixed method', environment: 'browser', issue }, async () => {
  const view = await renderProps((props: Select.Positioner.Props) => <div style={{ 'padding-left': '120px', 'padding-top': '200px' }}>
    <Select.Root open><Select.Trigger data-testid="trigger" style={{ width: '160px', height: '36px' }}>Open</Select.Trigger>
      <Select.Portal><Select.Positioner {...props} alignItemWithTrigger={false} data-testid="positioner"><Select.Popup style={{ width: '80px', height: '64px' }}>Popup</Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>
  </div>, { side: 'bottom', sideOffset: 7, alignOffset: 0 });
  await waitFor(() => {
    const trigger = screen.getByTestId('trigger').getBoundingClientRect();
    const positioner = screen.getByTestId('positioner').getBoundingClientRect();
    expect(Math.abs(positioner.top - trigger.bottom - 7)).toBeLessThan(1);
  });
  const node = screen.getByTestId('positioner');
  await view.setProps({ positionMethod: 'fixed', sideOffset: data => data.positioner.width + data.anchor.width, alignOffset: data => data.positioner.width });
  await waitFor(() => {
    const trigger = screen.getByTestId('trigger').getBoundingClientRect();
    const positioner = screen.getByTestId('positioner').getBoundingClientRect();
    expect(Math.abs(positioner.top - trigger.bottom - positioner.width - trigger.width)).toBeLessThan(1);
  });
  expect(screen.getByTestId('positioner')).toBe(node);
  expect(getComputedStyle(node).position).toBe('fixed');
  const trigger = screen.getByTestId('trigger').getBoundingClientRect();
  const positioner = node.getBoundingClientRect();
  expect(Math.abs(positioner.left - (trigger.left + trigger.width / 2 - positioner.width / 2) - positioner.width)).toBeLessThan(1);
});

browserCase({ source, case: 'top-pinned list grows and releases scrolling at its limit', environment: 'browser', issue }, async () => {
  await render(() => <div style={{ 'padding-top': '200px' }}><Select.Root open defaultValue={45}><Select.Trigger style={{ height: '36px' }}><Select.Value data-testid="value" /></Select.Trigger>
    <Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup style={{ width: '180px', 'max-height': 'none' }}><Select.List data-testid="list">
      {Array.from({ length: 64 }, (_, value) => <Select.Item value={value} style={{ height: '32px' }}><Select.ItemText data-testid={value === 45 ? 'text' : undefined}>{value}</Select.ItemText></Select.Item>)}
    </Select.List></Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root></div>);
  await expectAligned('ltr');
  const positioner = screen.getByTestId('positioner');
  const list = screen.getByTestId('list');
  await waitFor(() => expect(positioner.style.top).toBe('0px'));
  const before = positioner.getBoundingClientRect().height;
  list.scrollTop -= 80;
  fireEvent.scroll(list);
  await waitFor(() => expect(positioner.getBoundingClientRect().height).toBeGreaterThan(before));
  const available = list.ownerDocument.documentElement.clientHeight - parseFloat(getComputedStyle(positioner).marginTop) - parseFloat(getComputedStyle(positioner).marginBottom);
  list.scrollTop = 0;
  fireEvent.scroll(list);
  await waitFor(() => expect(positioner.getBoundingClientRect().height).toBe(available));
  const saturated = positioner.style.height;
  list.scrollTop = 50;
  fireEvent.scroll(list);
  expect(positioner.style.height).toBe(saturated);
  expect(list.scrollTop).toBe(50);
});

browserCase({ source, case: 'measurement restores transform scale and translate styles', environment: 'browser', issue }, async () => {
  await render(() => <div style={{ 'padding-top': '150px' }}><Select.Root open defaultValue="a"><Select.Trigger><Select.Value /></Select.Trigger>
    <Select.Portal><Select.Positioner data-testid="positioner"><Select.Popup data-testid="popup" style={{ width: '180px', 'max-height': 'none', transform: 'translateX(10px)', scale: '0.8', translate: '1px 2px' }}>
      <Select.Item value="a"><Select.ItemText>Apple</Select.ItemText></Select.Item><Select.Item value="b"><Select.ItemText>Banana</Select.ItemText></Select.Item>
    </Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root></div>);
  await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'none'));
  await waitFor(() => expect(screen.getByTestId('positioner').style.height).not.toBe(''));
  const popup = screen.getByTestId('popup');
  expect(popup.style.getPropertyValue('transform')).toBe('translateX(10px)');
  expect(popup.style.getPropertyValue('scale')).toBe('0.8');
  expect(popup.style.getPropertyValue('translate')).toBe('1px 2px');
});
import { useUnscaledBrowserFrame } from '../../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
