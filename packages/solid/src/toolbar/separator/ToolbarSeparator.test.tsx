import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { Toolbar } from '../index';
import type { ToolbarSeparatorProps, ToolbarSeparatorState } from './ToolbarSeparator';
import { ToolbarSeparator } from './ToolbarSeparator';

describe('Toolbar.Separator', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<ToolbarSeparatorState, ToolbarConformanceProps<ToolbarSeparatorProps, ToolbarSeparatorState>>((props) => <Toolbar.Root><Toolbar.Separator {...props} /></Toolbar.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it.each(['horizontal', 'vertical'] as const)('defaults perpendicular to %s and stays live', async (orientation) => {
    const view = await renderProps((props: { orientation: 'horizontal' | 'vertical' }) => <Toolbar.Root orientation={props.orientation}><Toolbar.Separator /></Toolbar.Root>, { orientation });
    const separator = view.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', orientation === 'horizontal' ? 'vertical' : 'horizontal');
    await view.setProps({ orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal' });
    expect(view.getByRole('separator')).toBe(separator);
    expect(separator).toHaveAttribute('aria-orientation', orientation);
  });
  it('accepts an explicit orientation override', async () => {
    const view = await render(() => <Toolbar.Root><Toolbar.Separator orientation="horizontal" /></Toolbar.Root>);
    expect(view.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });
  it('requires a toolbar host with the source error', async () => {
    await render(() => {
      expect(() => ToolbarSeparator({})).toThrow('Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.');
      return null;
    });
  });
});
