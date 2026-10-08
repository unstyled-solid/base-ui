import { describe, expect, it } from 'vitest';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, waitFor } from '../../../test';
import { Tabs } from '../test/TabsFixture';
import { TabsIndicator } from './TabsIndicator';
import { script } from './prehydrationScript';

const source = 'packages/react/src/tabs/indicator/TabsIndicator.test.tsx';
const indicatorStyle: JSX.CSSProperties = {
  position: 'absolute', top: '0', left: '0', width: 'var(--active-tab-width)', height: 'var(--active-tab-height)',
  transform: 'translate(var(--active-tab-left), var(--active-tab-top))',
};
describe('Tabs.Indicator', () => {
  const { render, renderProps } = createRenderer();
  it('unmounts for null selection and exposes null measurement for unmatched selection', async () => {
    const view = await renderProps((p: { value: string | null }) => <Tabs.Root value={p.value}><Tabs.List>
      <Tabs.Tab value="one">One</Tabs.Tab>
      <TabsIndicator data-testid="indicator" render={(props, state) => <span {...props as JSX.HTMLAttributes<HTMLSpanElement>}
        data-position-null={String(state.activeTabPosition === null)} data-size-null={String(state.activeTabSize === null)} />} />
    </Tabs.List></Tabs.Root>, { value: 'missing' as string | null });
    expect(view.getByTestId('indicator')).toHaveAttribute('hidden');
    expect(view.getByTestId('indicator')).toHaveAttribute('data-position-null', 'true');
    expect(view.getByTestId('indicator')).toHaveAttribute('data-size-null', 'true');
    await view.setProps({ value: null }); expect(view.queryByTestId('indicator')).toBeNull();
  });
  for (const [name, wrapper] of [
    ['2D rotation', { transform: 'rotate(40deg)' }],
    ['flip', { transform: 'scaleX(-1)' }],
    ['rotate longhand', { rotate: '40deg' }],
    ['scale longhand', { scale: '-1 1' }],
    ['3D rotation', { transform: 'perspective(600px) rotateY(35deg)' }],
    ['scale', { transform: 'scale(1.5)' }],
  ] as [string, JSX.CSSProperties][]) {
    browserCase({ source, case: `overlays active tab under ${name}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <div style={wrapper}><Tabs.Root value={2}><Tabs.List style={{ display: 'flex', position: 'relative' }}>
        {[0, 1, 2].map((value) => <Tabs.Tab value={value} style={{ width: '80px', height: '32px', 'flex-shrink': 0 }}>{value}</Tabs.Tab>)}
        <TabsIndicator data-testid="indicator" style={indicatorStyle} />
      </Tabs.List></Tabs.Root></div>);
      const indicator = view.getByTestId('indicator');
      const tab = view.getByRole('tab', { selected: true });
      for (const edge of ['left', 'right', 'top', 'bottom'] as const) {
        await waitFor(() => expect(Math.abs(indicator.getBoundingClientRect()[edge] - tab.getBoundingClientRect()[edge])).toBeLessThanOrEqual(1));
      }
      expect(indicator).not.toHaveAttribute('hidden');
    });
  }
  for (const style of [{ transform: 'translateX(12px) translateY(4px)' }, { translate: '12px 4px' }, { translate: '50% 25%' }]) {
    browserCase({ source, case: `follows active-tab translation ${JSON.stringify(style)}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <Tabs.Root value={1}><Tabs.List style={{ display: 'flex', position: 'relative' }}>
        <Tabs.Tab value={0} style={{ width: '80px', height: '32px' }}>Zero</Tabs.Tab>
        <Tabs.Tab value={1} style={{ width: '80px', height: '32px', ...style }}>One</Tabs.Tab>
        <TabsIndicator data-testid="indicator" style={indicatorStyle} />
      </Tabs.List></Tabs.Root>);
      for (const edge of ['left', 'top', 'right', 'bottom'] as const) {
        await waitFor(() => expect(Math.abs(view.getByTestId('indicator').getBoundingClientRect()[edge] - view.getByRole('tab', { selected: true }).getBoundingClientRect()[edge])).toBeLessThanOrEqual(1));
      }
    });
  }
  browserCase({ source, case: 'all indicators update when a different tab resizes after host replacement', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps((p: { anchor: boolean }) => <Tabs.Root value={1}><Tabs.List style={{ display: 'flex', position: 'relative', width: '300px' }}>
      <Tabs.Tab value={0} nativeButton={!p.anchor} render={p.anchor ? (props) => <a {...props as JSX.HTMLAttributes<HTMLAnchorElement>} href="#zero" /> : undefined}
        style={{ width: '80px', height: '32px', 'flex-shrink': 0 }}>Zero</Tabs.Tab>
      <Tabs.Tab value={1} style={{ width: '80px', height: '32px', 'flex-shrink': 0 }}>One</Tabs.Tab>
      <TabsIndicator data-testid="first-indicator" style={indicatorStyle} /><TabsIndicator data-testid="second-indicator" style={indicatorStyle} />
    </Tabs.List></Tabs.Root>, { anchor: false });
    await view.setProps({ anchor: true });
    const first = view.getByRole('tab', { name: 'Zero' });
    expect(first.tagName).toBe('A');
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    first.style.width = '140px';
    for (const name of ['first-indicator', 'second-indicator']) {
      await waitFor(() => expect(parseFloat(view.getByTestId(name).style.getPropertyValue('--active-tab-left'))).toBeCloseTo(140, 1));
    }
  });
  browserCase({ source, case: 'scroll and borders under scale', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <div style={{ transform: 'scale(1.5)' }}><Tabs.Root value={2}><Tabs.List
      style={{ display: 'flex', position: 'relative', width: '200px', border: '6px solid', padding: '4px', overflow: 'auto' }}>
      {[0, 1, 2, 3].map((value) => <Tabs.Tab value={value} style={{ width: '120px', height: '40px', 'flex-shrink': 0 }}>{value}</Tabs.Tab>)}
      <TabsIndicator data-testid="indicator" style={indicatorStyle} />
    </Tabs.List></Tabs.Root></div>);
    const list = view.getByRole('tablist'); list.scrollLeft = 80;
    const tab = view.getByRole('tab', { selected: true });
    for (const edge of ['left', 'top'] as const) await waitFor(() => expect(Math.abs(view.getByTestId('indicator').getBoundingClientRect()[edge] - tab.getBoundingClientRect()[edge])).toBeLessThanOrEqual(1));
  });
  browserCase({ source, case: 'prehydration hidden reveal, stale selection, and hydration ownership', environment: 'browser', issue: 'bsolid-hydration' }, async () => {
    for (const mode of ['reveal', 'stale', 'hydrated'] as const) {
      const host = document.createElement('div');
      host.style.display = 'none';
      host.innerHTML = '<div role="tablist" style="width:300px;position:relative"><button data-active style="width:100px;height:40px;padding:0;border:0">One</button><span hidden></span></div>';
      document.body.appendChild(host);
      try {
        const indicator = host.querySelector('span')!;
        const tab = host.querySelector('button')!;
        const body = document.createElement('script'); body.textContent = script; indicator.after(body);
        if (mode === 'stale') tab.removeAttribute('data-active');
        if (mode === 'hydrated') { indicator.hidden = false; indicator.style.setProperty('--active-tab-width', '55px'); }
        const revealed = new Promise<void>((resolve) => {
          const observer = new ResizeObserver(() => {
            if (tab.offsetWidth > 0 && tab.offsetHeight > 0) { observer.disconnect(); resolve(); }
          });
          observer.observe(tab);
        });
        host.style.display = '';
        await revealed;
        // The observer resolves during native delivery. Leave that delivery
        // frame before disposing this fixture or revealing the next one.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (mode === 'reveal') await waitFor(() => expect(indicator).not.toHaveAttribute('hidden'));
        else {
          if (mode === 'stale') expect(indicator).toHaveAttribute('hidden');
          else expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('55px');
        }
      } finally { host.remove(); }
    }
  });
  browserCase({ source, case: 'uses layout coordinates under scale(0)', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <div style={{ transform: 'scale(0)' }}><Tabs.Root value={1}><Tabs.List
      style={{ display: 'flex', position: 'relative', width: '300px' }}>
      <Tabs.Tab value={0} style={{ width: '100px', height: '32px', 'flex-shrink': 0 }}>Zero</Tabs.Tab>
      <Tabs.Tab value={1} style={{ width: '100px', height: '32px', 'flex-shrink': 0 }}>One</Tabs.Tab>
      <TabsIndicator data-testid="indicator" style={indicatorStyle} />
    </Tabs.List></Tabs.Root></div>);
    const tab = view.getByRole('tab', { selected: true });
    const indicator = view.getByTestId('indicator');
    await waitFor(() => expect(parseFloat(indicator.style.getPropertyValue('--active-tab-left'))).toBe(tab.offsetLeft));
    expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('100px');
    expect(indicator).not.toHaveAttribute('hidden');
  });
  browserCase({ source, case: 'subtracts intermediary scroll and refreshes after a tab resize', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Tabs.Root value={2}><Tabs.List style={{ display: 'flex', position: 'relative' }}>
      <div data-testid="scroller" style={{ display: 'flex', width: '200px', 'overflow-x': 'auto' }}>
        {[0, 1, 2].map((value) => <Tabs.Tab value={value} style={{ width: '80px', height: '32px', 'flex-shrink': 0 }}>{value}</Tabs.Tab>)}
      </div><TabsIndicator data-testid="indicator" style={indicatorStyle} />
    </Tabs.List></Tabs.Root>);
    view.getByTestId('scroller').scrollLeft = 40;
    const tab = view.getByRole('tab', { selected: true }); tab.style.width = '84px';
    for (const edge of ['left', 'top', 'right', 'bottom'] as const) {
      await waitFor(() => expect(Math.abs(view.getByTestId('indicator').getBoundingClientRect()[edge] - tab.getBoundingClientRect()[edge])).toBeLessThanOrEqual(1));
    }
  });
  browserCase({ source, case: 'offset parent outside rotated list', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <div style={{ position: 'relative', transform: 'rotate(40deg)' }}><Tabs.Root value={2}>
      <Tabs.List style={{ display: 'flex', 'margin-left': '40px' }}>
        {[0, 1, 2].map((value) => <Tabs.Tab value={value} style={{ width: '80px', height: '32px', 'flex-shrink': 0 }}>{value}</Tabs.Tab>)}
        <TabsIndicator data-testid="indicator" />
      </Tabs.List></Tabs.Root></div>);
    await waitFor(() => expect(parseFloat(view.getByTestId('indicator').style.getPropertyValue('--active-tab-left'))).toBeCloseTo(160, 2));
    expect(parseFloat(view.getByTestId('indicator').style.getPropertyValue('--active-tab-top'))).toBeCloseTo(0, 2);
  });
});
