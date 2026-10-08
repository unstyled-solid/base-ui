// Canonical: FieldRoot, FieldLabel, FieldDescription, FieldItem and React17 ID suites,
// upstream 19511bb171f3b360b006c94cf6d07e53cb446505. Solid ownership replaces StrictMode replay.
import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, screen, sourceCase } from '../../test';
import { Field } from './index';
import { Fieldset } from '../fieldset';
import type { FieldRootProps } from './root/FieldRoot';

const { render, renderProps } = createRenderer();
const input = () => screen.getByRole<HTMLInputElement>('textbox');
async function edit(value: string) { fireEvent.input(input(), { target: { value } }); await flushMicrotasks(); }

describe('Field shell and relationships', () => {
  it('renders all parts with neutral validity and native associations', async () => {
    await render(() => <Field.Root data-testid="root"><Field.Label>Name</Field.Label><Field.Control /><Field.Description>Help</Field.Description><Field.Error>Invalid</Field.Error><Field.Validity>{(s) => <output>{String(s.validity.valid)}</output>}</Field.Validity></Field.Root>);
    expect(screen.getByTestId('root').tagName).toBe('DIV');
    expect(screen.getByText('Name').tagName).toBe('LABEL');
    expect(screen.getByText('Help').tagName).toBe('P');
    expect(input()).toHaveAccessibleName('Name');
    expect(input()).toHaveAccessibleDescription('Help');
    expect(screen.getByRole('status')).toHaveTextContent('null');
    expect(screen.queryByText('Invalid')).toBeNull();
  });

  for (const state of ['dirty', 'touched', 'disabled', 'invalid'] as const) {
    it(`projects live ${state} to every visible part without replacing hosts`, async () => {
      const view = await renderProps((p: FieldRootProps) => <Field.Root {...p} data-testid="root"><Field.Label data-testid="label" /><Field.Control data-testid="control" /><Field.Description data-testid="description" /><Field.Item data-testid="item" /><Field.Error match data-testid="error" /></Field.Root>, { [state]: false });
      const nodes = ['root', 'label', 'control', 'description', 'item', 'error'].map((id) => view.getByTestId(id));
      await view.setProps({ [state]: true });
      for (const node of nodes) expect(node).toHaveAttribute(`data-${state}`);
      expect(view.getByTestId('control')).toBe(nodes[2]);
      await view.setProps({ [state]: false });
      for (const node of nodes) expect(node).not.toHaveAttribute(`data-${state}`);
    });
  }

  it('keeps explicit invalidity on disabled parts without aria-invalid', async () => {
    await render(() => <Field.Root disabled invalid><Field.Control /><Field.Label>Label</Field.Label><Field.Description>Help</Field.Description></Field.Root>);
    expect(input()).toBeDisabled();
    for (const node of [input(), screen.getByText('Label'), screen.getByText('Help')]) expect(node).toHaveAttribute('data-invalid');
    expect(input()).not.toHaveAttribute('aria-invalid');
  });

  it('inherits nested Fieldset disabled state', async () => {
    await render(() => <Fieldset.Root disabled><Fieldset.Root disabled={false}><Field.Root disabled={false}><Field.Control disabled={false} /></Field.Root></Fieldset.Root></Fieldset.Root>);
    expect(input()).toBeDisabled();
    expect(input()).toHaveAttribute('data-disabled');
  });

  it('keeps dirty/touched overrides authoritative over native edits', async () => {
    await render(() => <Field.Root dirty={false} touched={false} data-testid="root"><Field.Control /></Field.Root>);
    await edit('changed');
    fireEvent.blur(input());
    await flushMicrotasks();
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-touched');
    expect(screen.getByTestId('root')).toHaveAttribute('data-filled');
  });

  it('shares touched, dirty, filled and focus state with labels and descriptions', async () => {
    await render(() => <Field.Root data-testid="root"><Field.Control /><Field.Label>Label</Field.Label><Field.Description>Help</Field.Description></Field.Root>);
    fireEvent.focus(input());
    await edit('value');
    const nodes = [screen.getByTestId('root'), input(), screen.getByText('Label'), screen.getByText('Help')];
    for (const node of nodes) for (const attribute of ['focused', 'dirty', 'filled']) expect(node).toHaveAttribute(`data-${attribute}`);
    await edit('');
    fireEvent.blur(input());
    await flushMicrotasks();
    for (const node of nodes) {
      expect(node).toHaveAttribute('data-touched');
      for (const attribute of ['focused', 'dirty', 'filled']) expect(node).not.toHaveAttribute(`data-${attribute}`);
    }
  });

  it('gives each Item a distinct label and description scope', async () => {
    await render(() => <Field.Root><Field.Item><Field.Label>First</Field.Label><Field.Control /><Field.Description>First help</Field.Description></Field.Item><Field.Item disabled><Field.Label>Second</Field.Label><Field.Control /><Field.Description>Second help</Field.Description></Field.Item></Field.Root>);
    const [first, second] = screen.getAllByRole('textbox');
    expect(first).toHaveAccessibleName('First');
    expect(first).toHaveAccessibleDescription('First help');
    expect(second).toHaveAccessibleName('Second');
    expect(second).toHaveAccessibleDescription('Second help');
    expect(screen.getByText('Second')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Second help')).toHaveAttribute('data-disabled');
  });

  sourceCase({ source: 'packages/react/src/field/root/FieldRoot.react17.test.tsx', case: 'explicit control id removed', environment: 'jsdom', adaptation: 'native stable ID and live props, no React fallback API' }, async () => {
    const view = await renderProps((p: { id?: string }) => <Field.Root><Field.Label>Label</Field.Label><Field.Control id={p.id} /></Field.Root>, { id: 'custom' });
    const node = input();
    expect(screen.getByText('Label')).toHaveAttribute('for', 'custom');
    await view.setProps({ id: undefined });
    expect(input()).toBe(node);
    expect(node.id).not.toBe('');
    expect(node.id).not.toBe('custom');
    expect(screen.getByText('Label')).toHaveAttribute('for', node.id);
  });

  for (const removed of ['first', 'second'] as const) {
    it(`preserves surviving control registration when ${removed} is removed`, async () => {
      const view = await renderProps((p: { first: boolean; second: boolean }) => <Field.Root>{p.first && <Field.Control id="first" />}{p.second && <Field.Control id="second" />}<Field.Label>Label</Field.Label></Field.Root>, { first: true, second: true });
      expect(screen.getByText('Label')).toHaveAttribute('for', 'first');
      await view.setProps({ [removed]: false });
      expect(screen.getByText('Label')).toHaveAttribute('for', removed === 'first' ? 'second' : 'first');
    });
  }

  it('drops outgoing explicit IDs during replacement and retains the field baseline', async () => {
    const view = await renderProps((p: { swap: boolean }) => <Field.Root data-testid="root"><Field.Label>Label</Field.Label>{p.swap ? <Field.Control defaultValue="x" /> : <Field.Control id="old" defaultValue="a" />}</Field.Root>, { swap: false });
    await view.setProps({ swap: true });
    expect(input().id).not.toBe('old');
    expect(screen.getByText('Label')).toHaveAttribute('for', input().id);
    await edit('y');
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await edit('a');
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });

  it('non-native labels focus rather than click the control', async () => {
    const click = vi.fn();
    const view = await render(() => <Field.Root><Field.Control onClick={click} /><Field.Label<HTMLDivElement> nativeLabel={false} render={(p) => <div {...p} />}>Label</Field.Label></Field.Root>);
    expect(screen.getByText('Label')).not.toHaveAttribute('for');
    await view.user.click(screen.getByText('Label'));
    expect(input()).toHaveFocus();
    expect(click).not.toHaveBeenCalled();
  });

  it('keeps an explicit association when a control is hidden and restores it after remount', async () => {
    const view = await renderProps((p: { hidden: boolean; mounted: boolean }) => <Field.Root><Field.Label>Label</Field.Label>{p.mounted && <div hidden={p.hidden}><Field.Control id="explicit" /></div>}</Field.Root>, { hidden: false, mounted: true });
    await view.setProps({ hidden: true });
    expect(screen.getByText('Label')).toHaveAttribute('for', 'explicit');
    expect(view.container.querySelector('input')).toHaveAttribute('id', 'explicit');
    await view.setProps({ mounted: false });
    await view.setProps({ mounted: true, hidden: false });
    expect(screen.getByText('Label')).toHaveAttribute('for', 'explicit');
    expect(input()).toHaveAccessibleName('Label');
  });

  it('merges external description IDs and cleans dynamic registrations', async () => {
    const view = await renderProps((p: { id: string; shown: boolean }) => <Field.Root><Field.Control aria-describedby="external" />{p.shown && <Field.Description id={p.id}>Help</Field.Description>}<Field.Description id="survivor">Other</Field.Description></Field.Root>, { id: 'help', shown: true });
    expect(input()).toHaveAttribute('aria-describedby', 'external help survivor');
    await view.setProps({ id: 'changed' });
    expect(input().getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining(['external', 'changed', 'survivor']));
    expect(input().getAttribute('aria-describedby')).not.toContain('help');
    await view.setProps({ id: '' });
    expect(input()).toHaveAttribute('aria-describedby', 'external survivor');
    await view.setProps({ shown: false });
    expect(input()).toHaveAttribute('aria-describedby', 'external survivor');
  });

  it('removes aria-labelledby when the label is disposed', async () => {
    const view = await renderProps((p: { show: boolean }) => <Field.Root>{p.show && <Field.Label>Label</Field.Label>}<Field.Control /></Field.Root>, { show: true });
    expect(input()).toHaveAttribute('aria-labelledby', screen.getByText('Label').id);
    await view.setProps({ show: false });
    expect(input()).not.toHaveAttribute('aria-labelledby');
  });

  it('reads current actions refs and validators and detaches actions on disposal', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const validate = vi.fn(() => 'first');
    const nextValidate = vi.fn(() => 'second');
    const view = await renderProps((p: FieldRootProps) => <Field.Root {...p}><Field.Control /><Field.Error /></Field.Root>, { actionsRef: first, validate });
    first.mock.lastCall?.[0].validate();
    await flushMicrotasks();
    expect(screen.getByText('first')).toBeVisible();
    await view.setProps({ actionsRef: second, validate: nextValidate });
    expect(first).toHaveBeenLastCalledWith(null);
    second.mock.lastCall?.[0].validate();
    await flushMicrotasks();
    expect(screen.getByText('second')).toBeVisible();
    view.unmount();
    expect(second).toHaveBeenLastCalledWith(null);
  });

  it('validates a logical field without a mounted control', async () => {
    let actions: Field.Root.Actions | null = null;
    await render(() => <Field.Root actionsRef={(value) => { actions = value; }} validate={() => 'Logical error'}><Field.Error /></Field.Root>);
    actions!.validate();
    await flushMicrotasks();
    expect(screen.getByText('Logical error')).toBeVisible();
  });

  it('keeps render and class callbacks live without recreating the input', async () => {
    let observed: Field.Control.State | undefined;
    await render(() => <Field.Root><Field.Control class={(s) => ({ filled: s.filled })} render={(p, state) => { observed = state; return <input {...p} />; }} /></Field.Root>);
    const node = input();
    await edit('live');
    expect(input()).toBe(node);
    expect(node).toHaveClass('filled');
    expect(untrack(() => observed?.filled)).toBe(true);
  });
});
