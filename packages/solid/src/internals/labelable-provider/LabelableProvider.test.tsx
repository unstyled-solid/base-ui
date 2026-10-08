import { describe, expect, it } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer } from '../../../test';
import { LabelableProvider } from './LabelableProvider';
import { useLabelableContext, type LabelableContextValue } from './LabelableContext';
import { createLabelableId } from './createLabelableId';
import { createLabel } from './createLabel';
import { DirectionProvider } from '../../direction-provider';
import { useDirection } from '../direction-context';

describe('LabelableProvider', () => {
  const { render, renderProps } = createRenderer();
  it('keeps stable control selection, supports null and preserves final selection on removal', async () => {
    let context!: LabelableContextValue;
    function Probe() { context = useLabelableContext()!; return <output>{context.controlId ?? 'suppressed'}</output>; }
    const view = await render(() => <LabelableProvider><Probe /></LabelableProvider>);
    const a = Symbol(), b = Symbol();
    context.registerControlId(a, 'one');
    context.registerControlId(b, 'two');
    flush();
    expect(view.getByRole('status')).toHaveTextContent('one');
    context.registerControlId(a, undefined);
    flush();
    expect(view.getByRole('status')).toHaveTextContent('two');
    context.registerControlId(b, null);
    flush();
    expect(view.getByRole('status')).toHaveTextContent('suppressed');
    context.registerControlId(b, undefined);
    flush();
    expect(view.getByRole('status')).toHaveTextContent('suppressed');
  });
  it('associates live label and control IDs without replacing nodes', async () => {
    function Label() { return <label {...createLabel({ native: true })}>Name</label>; }
    function Control(props: { id: string | undefined }) {
      const id = createLabelableId({ get id() { return props.id; } });
      return <input id={id()} />;
    }
    const view = await renderProps((props: { id: string | undefined }) =>
      <LabelableProvider><Label /><Control id={props.id} /></LabelableProvider>, { id: 'first' });
    const node = view.getByRole('textbox');
    expect(node).toHaveAccessibleName('Name');
    expect(node).toHaveAttribute('id', 'first');
    await view.setProps({ id: 'second' });
    expect(view.getByRole('textbox')).toBe(node);
    expect(node).toHaveAttribute('id', 'second');
    expect(node).toHaveAccessibleName('Name');
  });
  it('updates nested direction without recreating consumers', async () => {
    let setups = 0;
    function Probe() { setups++; const direction = useDirection(); return <output>{direction()}</output>; }
    const view = await renderProps((props: { direction: 'ltr' | 'rtl' }) =>
      <DirectionProvider direction="rtl"><DirectionProvider direction={props.direction}><Probe /></DirectionProvider></DirectionProvider>, { direction: 'ltr' });
    const output = view.getByRole('status');
    await view.setProps({ direction: 'rtl' });
    expect(output).toHaveTextContent('rtl');
    expect(view.getByRole('status')).toBe(output);
    expect(setups).toBe(1);
  });
});
