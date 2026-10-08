import { describe, expect, it, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance } from '../../../test';
import { Tabs, type TabsRootState } from '../index';

// The source invokes all four default conformance suites for every part.
// Keep the family-specific live-state checks below as additional coverage.
describe('Tabs source conformance', () => {
  describe('Root', () => describeConformance((props) => <Tabs.Root {...props} value={0} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  }));
  describe('List', () => describeConformance((props) => <Tabs.Root><Tabs.List {...props} /></Tabs.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  }));
  describe('Tab', () => describeConformance((props) => <Tabs.Root><Tabs.List><Tabs.Tab {...props} value="1" /></Tabs.List></Tabs.Root>, {
    initialProps: {}, refInstanceof: HTMLButtonElement, button: true,
  }));
  describe('Panel', () => describeConformance((props) => <Tabs.Root><Tabs.Panel {...props} value="1" keepMounted /></Tabs.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch',
  }));
  describe('Indicator', () => describeConformance((props) => <Tabs.Root defaultValue={1}><Tabs.List>
    <Tabs.Tab value={1} /><Tabs.Indicator {...props} />
  </Tabs.List></Tabs.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement, testRenderPropWith: 'div', click: 'dispatch',
  }));
});

// Family-local replay of the five source describeConformance mounts. All parts
// share live orientation/direction state; only Tab owns button activation.
describe('Tabs live host composition', () => {
  const { renderProps } = createRenderer();
  for (const part of ['Root', 'List', 'Tab', 'Panel', 'Indicator'] as const) {
    it(`${part}: forwards live props, state classes, styles and refs without replacing the host`, async () => {
      const ref = vi.fn<(node: HTMLElement) => void>();
      const initial = vi.fn();
      const current = vi.fn();
      const view = await renderProps((p: { orientation: Tabs.Root.Orientation; label: string; callback: typeof initial; color: string }) => {
        const hostProps = {
          'data-testid': 'host', ref,
          get lang() { return p.label; },
          class: (state: TabsRootState) => ['base', { vertical: state.orientation === 'vertical' }],
          style: () => ({ color: p.color }),
          onClick: (event: MouseEvent) => p.callback(event),
        };
        if (part === 'Root') return <Tabs.Root {...hostProps} value={0} orientation={p.orientation} />;
        return <Tabs.Root value={0} orientation={p.orientation}>
          {part === 'Panel' ? <Tabs.Panel {...hostProps} value={0} /> : part === 'List' ? <Tabs.List {...hostProps} /> :
            <Tabs.List>{part === 'Tab' ? <Tabs.Tab {...hostProps} value={0}>Tab</Tabs.Tab> : <Tabs.Indicator {...hostProps} />}</Tabs.List>}
        </Tabs.Root>;
      }, { orientation: 'horizontal' as Tabs.Root.Orientation, label: 'fr', callback: initial, color: 'green' });
      const host = view.getByTestId('host');
      expect(ref).toHaveBeenCalledTimes(1);
      expect(ref).toHaveBeenCalledWith(host);
      expect(host).toHaveClass('base');
      expect(host.style.color).toBe('green');
      await view.setProps({ orientation: 'vertical', label: 'de', callback: current, color: 'red' });
      expect(view.getByTestId('host')).toBe(host);
      expect(host).toHaveClass('base', 'vertical');
      expect(host).toHaveAttribute('lang', 'de');
      expect(host.style.color).toBe('red');
      // Indicator remains hidden without a matching measured tab in jsdom.
      host.click();
      expect(initial).not.toHaveBeenCalled();
      expect(current).toHaveBeenCalledTimes(1);
      view.unmount();
      expect(host.isConnected).toBe(false);
    });
    it(`${part}: render callbacks receive live state and compose native refs`, async () => {
      const refA = vi.fn<(node: HTMLElement) => void>();
      const refB = vi.fn<(node: HTMLElement) => void>();
      const render: Tabs.Root.Props['render'] = (props, state) => <div {...props as JSX.HTMLAttributes<HTMLDivElement>}
        ref={[props.ref, refB]} data-render-orientation={state.orientation} />;
      const view = await renderProps((p: { orientation: Tabs.Root.Orientation }) => {
        const hostProps = { 'data-testid': 'host', ref: refA, render };
        if (part === 'Root') return <Tabs.Root {...hostProps} value={0} orientation={p.orientation} />;
        return <Tabs.Root value={0} orientation={p.orientation}>
          {part === 'Panel' ? <Tabs.Panel {...hostProps} value={0} /> : part === 'List' ? <Tabs.List {...hostProps} /> :
            <Tabs.List>{part === 'Tab' ? <Tabs.Tab {...hostProps} value={0} nativeButton={false} /> : <Tabs.Indicator {...hostProps} />}</Tabs.List>}
        </Tabs.Root>;
      }, { orientation: 'horizontal' as Tabs.Root.Orientation });
      const host = view.getByTestId('host');
      expect(refA).toHaveBeenCalledWith(host);
      expect(refB).toHaveBeenCalledWith(host);
      await view.setProps({ orientation: 'vertical' });
      expect(view.getByTestId('host')).toBe(host);
      expect(host).toHaveAttribute('data-render-orientation', 'vertical');
    });
  }
});
