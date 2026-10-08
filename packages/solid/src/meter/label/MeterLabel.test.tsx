import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { Meter } from '../index';

describe('Meter.Label', () => {
  const { render, renderProps } = createRenderer();
  it('requires a Meter.Root provider (Solid defaultless context)', async () => {
    await render(() => {
      expect(() => Meter.Label({})).toThrow(/context/i);
      expect(() => Meter.Value({})).toThrow(/context/i);
      expect(() => Meter.Indicator({})).toThrow(/context/i);
      return null;
    });
  });
  describeConformance((props) => <Meter.Root value={50}><Meter.Label {...props} /></Meter.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });
  it('updates, replaces, removes and regenerates the label association', async () => {
    const view = await renderProps((props: { id?: string; visible: boolean; replacement: boolean; value: number }) =>
      <Meter.Root value={props.value}>
        {props.visible && <Meter.Label id={props.id}>Battery</Meter.Label>}
        {props.replacement && <Meter.Label id="replacement">Replacement</Meter.Label>}
      </Meter.Root>, { id: 'label-a', visible: true, replacement: false, value: 50 });
    const meter = view.getByRole('meter');
    const label = view.getByText('Battery');
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveAttribute('role', 'presentation');
    expect(meter).toHaveAttribute('aria-labelledby', 'label-a');
    await view.setProps({ id: 'label-b' });
    expect(view.getByText('Battery')).toBe(label);
    expect(meter).toHaveAttribute('aria-labelledby', 'label-b');
    await view.setProps({ replacement: true });
    expect(meter).toHaveAttribute('aria-labelledby', 'replacement');
    await view.setProps({ value: 60 });
    expect(meter).toHaveAttribute('aria-labelledby', 'replacement');
    expect(view.getByText('Battery')).toBe(label);
    await view.setProps({ visible: false });
    expect(meter).toHaveAttribute('aria-labelledby', 'replacement');
    await view.setProps({ replacement: false });
    expect(meter).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ visible: true, id: undefined });
    expect(view.getByText('Battery').id).toBeTruthy();
    expect(meter).toHaveAttribute('aria-labelledby', view.getByText('Battery').id);
    await view.setProps({ visible: false });
    expect(meter).not.toHaveAttribute('aria-labelledby');
  });
  it('retains the generated ID when an explicit ID is added and later removed', async () => {
    const view = await renderProps((props: { id?: string }) =>
      <Meter.Root value={50}><Meter.Label id={props.id}>Battery</Meter.Label></Meter.Root>, {});
    const meter = view.getByRole('meter');
    const label = view.getByText('Battery');
    const generated = label.id;
    expect(generated).toBeTruthy();
    expect(meter).toHaveAttribute('aria-labelledby', generated);
    await view.setProps({ id: 'explicit-label' });
    expect(label.id).toBe('explicit-label');
    expect(meter).toHaveAttribute('aria-labelledby', 'explicit-label');
    await view.setProps({ id: undefined });
    expect(view.getByText('Battery')).toBe(label);
    expect(label.id).toBe(generated);
    expect(meter).toHaveAttribute('aria-labelledby', generated);
  });
  it('clears the changed explicit label association when its sole label is removed', async () => {
    const view = await renderProps((props: { id: string; visible: boolean }) => (
      <Meter.Root value={50}>{props.visible && <Meter.Label id={props.id}>Battery level</Meter.Label>}</Meter.Root>
    ), { id: 'label-a', visible: true });
    const meter = view.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby', 'label-a');
    await view.setProps({ id: 'label-b' });
    expect(meter).toHaveAttribute('aria-labelledby', 'label-b');
    await view.setProps({ visible: false });
    expect(meter).not.toHaveAttribute('aria-labelledby');
    expect(view.getByRole('meter')).toBe(meter);
  });
});
