import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { Fieldset } from '../index';
import type { FieldsetLegendProps, FieldsetLegendState } from './FieldsetLegend';

describe('Fieldset.Legend', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<FieldsetLegendState, FieldsetLegendProps & ConformantComponentProps<FieldsetLegendState>>((props) => (
    <Fieldset.Root><Fieldset.Legend {...props} /></Fieldset.Root>
  ), { initialProps: {}, refInstanceof: HTMLDivElement });

  it('automatically associates a generated div label', async () => {
    const view = await render(() => <Fieldset.Root><Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend></Fieldset.Root>);
    const legend = view.getByTestId('legend');
    expect(legend.tagName).toBe('DIV');
    expect(legend.id).not.toBe('');
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', legend.id);
    expect(view.getByRole('group')).toHaveAccessibleName('Legend');
  });

  it('restores its original generated ID after a custom override without replacing either host', async () => {
    const view = await renderProps((props: { id?: string }) => (
      <Fieldset.Root><Fieldset.Legend id={props.id}>Legend</Fieldset.Legend></Fieldset.Root>
    ), {});
    const group = view.getByRole('group');
    const legend = view.getByText('Legend');
    const generated = legend.id;
    await view.setProps({ id: 'custom' });
    expect(group).toHaveAttribute('aria-labelledby', 'custom');
    await view.setProps({ id: undefined });
    expect(view.getByRole('group')).toBe(group);
    expect(view.getByText('Legend')).toBe(legend);
    expect(legend.id).toBe(generated);
    expect(group).toHaveAttribute('aria-labelledby', generated);
  });

  it('keeps consumer ARIA precedence while registration changes and clears', async () => {
    const view = await renderProps((props: { label?: string; show: boolean; id: string }) => (
      <Fieldset.Root aria-labelledby={props.label}>
        {props.show && <Fieldset.Legend id={props.id}>Legend</Fieldset.Legend>}
      </Fieldset.Root>
    ), { label: 'external', show: true, id: 'legend-a' });
    const group = view.getByRole('group');
    await view.setProps({ id: 'legend-b' });
    expect(group).toHaveAttribute('aria-labelledby', 'external');
    await view.setProps({ label: undefined });
    expect(group).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ label: 'external', show: false });
    expect(group).toHaveAttribute('aria-labelledby', 'external');
  });

  it('scopes nested and sibling legend registrations to their own roots', async () => {
    const view = await renderProps((props: { inner: boolean; id: string }) => (
      <>
        <Fieldset.Root data-testid="outer">
          <Fieldset.Legend id="outer-label">Outer</Fieldset.Legend>
          <Fieldset.Root data-testid="inner">
            {props.inner && <Fieldset.Legend id={props.id}>Inner</Fieldset.Legend>}
          </Fieldset.Root>
        </Fieldset.Root>
        <Fieldset.Root data-testid="sibling"><Fieldset.Legend id="sibling-label">Sibling</Fieldset.Legend></Fieldset.Root>
      </>
    ), { inner: true, id: 'inner-label' });
    expect(view.getByTestId('inner')).toHaveAttribute('aria-labelledby', 'inner-label');
    await view.setProps({ id: 'inner-next' });
    expect(view.getByTestId('inner')).toHaveAttribute('aria-labelledby', 'inner-next');
    await view.setProps({ inner: false });
    expect(view.getByTestId('inner')).not.toHaveAttribute('aria-labelledby');
    expect(view.getByTestId('outer')).toHaveAttribute('aria-labelledby', 'outer-label');
    expect(view.getByTestId('sibling')).toHaveAttribute('aria-labelledby', 'sibling-label');
  });

  it('updates legend refs independently of ID and disabled state, with owned detach', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: { ref: (node: HTMLDivElement) => void; id: string; disabled: boolean }) => (
      <Fieldset.Root disabled={props.disabled}>
        <Fieldset.Legend {...props}>Legend</Fieldset.Legend>
      </Fieldset.Root>
    ), { ref: first, id: 'before', disabled: false });
    const legend = view.getByText('Legend');
    await view.setProps({ ref: second, id: 'after', disabled: true });
    expect(view.getByText('Legend')).toBe(legend);
    expect(first.mock.calls).toEqual([[legend], [null]]);
    expect(second.mock.calls).toEqual([[legend]]);
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'after');
    view.unmount();
    expect(second.mock.calls).toEqual([[legend], [null]]);
  });

  it('updates a custom ID, returns to generated ID, and cleans up on removal', async () => {
    const view = await renderProps((props: { id?: string; show: boolean; disabled: boolean }) => (
      <Fieldset.Root disabled={props.disabled}>
        {props.show && <Fieldset.Legend id={props.id} data-testid="legend" class={(state) => state.disabled ? 'disabled' : 'enabled'}>Legend</Fieldset.Legend>}
      </Fieldset.Root>
    ), { id: 'legend-a', show: true, disabled: false });
    const group = view.getByRole('group');
    const legend = view.getByTestId('legend');
    expect(group).toHaveAttribute('aria-labelledby', 'legend-a');
    await view.setProps({ id: 'legend-b', disabled: true });
    expect(view.getByTestId('legend')).toBe(legend);
    expect(group).toHaveAttribute('aria-labelledby', 'legend-b');
    expect(legend).toHaveAttribute('data-disabled');
    expect(legend).toHaveClass('disabled');
    await view.setProps({ id: undefined, disabled: false });
    expect(legend.id).not.toBe('');
    expect(legend.id).not.toBe('legend-b');
    expect(group).toHaveAttribute('aria-labelledby', legend.id);
    expect(legend).not.toHaveAttribute('data-disabled');
    await view.setProps({ show: false });
    expect(group).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ show: true, id: 'replacement' });
    expect(group).toHaveAttribute('aria-labelledby', 'replacement');
  });

  it('does not clear a newer legend registration when the older one unmounts', async () => {
    const view = await renderProps((props: { first: boolean; second: boolean }) => (
      <Fieldset.Root>
        {props.first && <Fieldset.Legend id="first" />}
        {props.second && <Fieldset.Legend id="second" />}
      </Fieldset.Root>
    ), { first: true, second: false });
    await view.setProps({ second: true });
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'second');
    await view.setProps({ first: false });
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'second');
    await view.setProps({ second: false });
    expect(view.getByRole('group')).not.toHaveAttribute('aria-labelledby');
  });

  it('reports an actionable error outside Root', async () => {
    await expect(render(() => <Fieldset.Legend />)).rejects.toThrow(
      'Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.',
    );
  });
});
