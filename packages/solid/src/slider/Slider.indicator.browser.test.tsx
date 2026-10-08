import { expect, vi } from 'vitest';
import { createRenderer, browserCase } from '../../test';
import { Slider } from './index';
import { DirectionContext } from '../internals/direction-context/DirectionContext';
const { render } = createRenderer();
for (const axis of ['horizontal-ltr', 'horizontal-rtl', 'vertical-ltr'] as const) {
  for (const alignment of ['center', 'edge'] as const) for (const shape of ['single', 'range'] as const) {
    browserCase({ source: 'packages/react/src/slider/indicator/SliderIndicator.test.tsx', case: `${axis}/${alignment}/${shape} keyboard/indicator parity`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const direction = axis === 'horizontal-rtl' ? 'rtl' : 'ltr'; const vertical = axis === 'vertical-ltr';
      const range = shape === 'range'; const edge = alignment === 'edge';
      const view = await render(() => <div dir={direction}><DirectionContext value={() => direction}>
        <Slider.Root defaultValue={range ? [30, 70] : 30} orientation={vertical ? 'vertical' : 'horizontal'} thumbAlignment={alignment}>
          <Slider.Control style={{ position: 'relative', width: '100px', height: '100px' }}>
            <Slider.Track style={{ width: '100%', height: '100%' }}>
              <Slider.Indicator data-testid="indicator" /><Slider.Thumb index={0} style={{ width: '10px', height: '10px' }} />
              {range && <Slider.Thumb index={1} style={{ width: '10px', height: '10px' }} />}
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </DirectionContext></div>);
      const indicator = view.getByTestId('indicator');
      await vi.waitFor(() => expect(indicator.style.visibility).toBe(''));
      const start = edge ? '32%' : '30%'; const size = edge ? '36%' : '40%';
      expect(indicator.style[vertical ? 'bottom' : 'insetInlineStart']).toBe(range ? edge ? 'var(--start-position)' : start : '0px');
      expect(indicator.style[vertical ? 'height' : 'width']).toBe(edge ? range ? 'var(--relative-size)' : 'var(--start-position)' : range ? size : start);
      expect(indicator.style.getPropertyValue('--start-position')).toBe(edge ? start : '');
      expect(indicator.style.getPropertyValue('--relative-size')).toBe(edge && range ? size : '');
      const input = view.getAllByRole('slider')[0]; input.focus();
      await view.user.keyboard(`[${vertical ? 'ArrowUp' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'}][PageUp][PageDown][End]`);
      expect(input).toHaveAttribute('aria-valuenow', range ? '70' : '100');
      await view.user.keyboard('[Home]'); expect(input).toHaveAttribute('aria-valuenow', '0');
    });
  }
}
