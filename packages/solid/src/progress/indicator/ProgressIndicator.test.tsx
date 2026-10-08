// Source: pinned ProgressIndicator.test.tsx.
import { describe, expect, it } from 'vitest';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import { Progress } from '../index';
import type { ProgressIndicatorProps } from './ProgressIndicator';

describe('Progress.Indicator', () => {
  const { render, renderProps } = createRenderer();
  describeConformance((props) => <Progress.Root value={40}><Progress.Indicator {...props as ProgressIndicatorProps} /></Progress.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it('sets and clears internal styles reactively on a custom host', async () => {
    const view = await renderProps<{ value: number | null }>((props) =>
      <Progress.Root value={props.value}><Progress.Indicator data-testid="indicator" render={(p) => <span {...p as JSX.HTMLAttributes<HTMLSpanElement>} />} /></Progress.Root>,
    { value: 33 });
    const indicator = view.getByTestId('indicator');
    expect(indicator.tagName).toBe('SPAN');
    expect(indicator.style.width).toBe('33%');
    // CSSOM canonicalizes zero lengths differently across jsdom and browsers.
    const expectedStyle = document.createElement('div').style;
    expectedStyle.setProperty('inset-inline-start', '0');
    expect(indicator.style.insetInlineStart).toBe(expectedStyle.insetInlineStart);
    expect(indicator.style.height).toBe('inherit');
    await view.setProps({ value: 0 });
    expect(indicator.style.width).toBe('0%');
    await view.setProps({ value: null });
    expect(indicator.style.width).toBe('');
    expect(indicator.style.height).toBe('');
    expect(indicator.style.insetInlineStart).toBe('');
  });
  for (const value of [33, 0, null]) {
    browserCase({ source: 'packages/react/src/progress/indicator/ProgressIndicator.test.tsx',
      case: `internal styles (${value})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <Progress.Root value={value}>
        <Progress.Track style={{ width: '300px' }}>
          <Progress.Indicator data-testid="indicator" render={(props) => value === 33 ? <span {...props as JSX.HTMLAttributes<HTMLSpanElement>} /> : <div {...props as JSX.HTMLAttributes<HTMLDivElement>} />} />
        </Progress.Track>
      </Progress.Root>);
      const indicator = view.getByTestId('indicator');
      const style = getComputedStyle(indicator);
      if (value === 33) {
        expect(style.insetInlineStart).toBe('0px');
        expect(style.width).toBe('33%');
      } else if (value === 0) {
        expect(style.insetInlineStart).toBe('0px');
        expect(style.width).toBe('0px');
      } else {
        expect(indicator.style.width).toBe('');
        expect(indicator.style.insetInlineStart).toBe('');
      }
    });
  }
});
