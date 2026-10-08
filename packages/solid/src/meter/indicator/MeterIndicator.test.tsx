import { describe, expect, it } from 'vitest';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import { Meter } from '../index';

describe('Meter.Indicator', () => {
  const { render } = createRenderer();
  describeConformance((props) => <Meter.Root value={30}><Meter.Indicator {...props} /></Meter.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it('preserves positioning defaults and permits user style overrides', async () => {
    const view = await render(() => <Meter.Root value={33}><Meter.Indicator data-testid="indicator" style={{ height: '10px' }} /></Meter.Root>);
    const indicator = view.getByTestId('indicator');
    expect(indicator.tagName).toBe('DIV');
    // CSSOM canonicalizes zero lengths differently across jsdom and browsers.
    const expectedStyle = document.createElement('div').style;
    expectedStyle.setProperty('inset-inline-start', '0');
    expect(indicator.style.insetInlineStart).toBe(expectedStyle.insetInlineStart);
    expect(indicator.style.width).toBe('33%');
    expect(indicator.style.height).toBe('10px');
  });
  it('lets a live user width override the fill and restores it when the override is removed', async () => {
    const { renderProps } = createRenderer();
    const view = await renderProps((props: { value: number; override: boolean }) =>
      <Meter.Root value={props.value}>
        <Meter.Indicator data-testid="indicator" style={props.override ? { width: '12px' } : undefined} />
      </Meter.Root>, { value: 30, override: true });
    const indicator = view.getByTestId('indicator');
    expect(indicator.style.width).toBe('12px');
    expect(indicator.style.height).toBe('inherit');
    await view.setProps({ value: 60 });
    expect(indicator.style.width).toBe('12px');
    await view.setProps({ override: false });
    expect(view.getByTestId('indicator')).toBe(indicator);
    expect(indicator.style.width).toBe('60%');
  });
  for (const value of [33, 0]) {
    browserCase({ source: 'packages/react/src/meter/indicator/MeterIndicator.test.tsx',
      case: `internal styles value=${value}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <Meter.Root value={value} style={{ width: '100px' }}>
        <Meter.Track><Meter.Indicator data-testid="indicator" /></Meter.Track>
      </Meter.Root>);
      const style = getComputedStyle(view.getByTestId('indicator'));
      if (value === 33) expect(style.left).toBe('0px');
      else expect(style.insetInlineStart).toBe('0px');
      expect(style.width).toBe(`${value}px`);
    });
  }
});
