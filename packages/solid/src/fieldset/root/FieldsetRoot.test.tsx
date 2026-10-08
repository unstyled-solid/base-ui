import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer, describeConformance } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import type { HTMLProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { Fieldset } from '../index';
import type { FieldsetRootProps, FieldsetRootState } from './FieldsetRoot';
import { useFieldsetRootContext } from './FieldsetRootContext';
import { Field } from '../../field';
import { RadioGroup } from '../../radio-group';
import { CheckboxGroup } from '../../checkbox-group';
import { Checkbox } from '../../checkbox';
import { Slider } from '../../slider';

// Pinned FieldsetRoot.test.tsx: Field/Control is represented by this context consumer.
// Real Field, RadioGroup, CheckboxGroup and Slider replay belongs to bsolid-integration.
function Control() {
  const context = useFieldsetRootContext();
  return <input data-testid="control" disabled={context.disabled} data-disabled={context.disabled ? '' : undefined} />;
}

describe('Fieldset.Root', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<FieldsetRootState, FieldsetRootProps & ConformantComponentProps<FieldsetRootState>>((props) => <Fieldset.Root {...props} />, {
    initialProps: {},
    refInstanceof: HTMLFieldSetElement,
    state: {
      change: { disabled: true },
      assert: (state, changed) => expect(untrack(() => state.disabled)).toBe(changed),
      class: (state) => state.disabled ? 'disabled' : 'enabled',
      before: 'enabled', after: 'disabled',
    },
  });

  it('sets native disabled and disables native descendants', async () => {
    const view = await render(() => <Fieldset.Root disabled><input /></Fieldset.Root>);
    expect(view.getByRole('group')).toHaveAttribute('disabled');
    expect(view.getByRole('textbox')).toBeDisabled();
  });

  it('replays nested disabled precedence with real Field.Root and Field.Control', async () => {
    const view = await renderProps((props: { outer: boolean; inner: boolean }) => (
      <Fieldset.Root disabled={props.outer}><Fieldset.Root disabled={props.inner}>
        <Field.Root data-testid="field"><Field.Control data-testid="control" /></Field.Root>
      </Fieldset.Root></Fieldset.Root>
    ), { outer: false, inner: true });
    const field = view.getByTestId('field');
    const control = view.getByTestId('control');
    expect(control).toBeDisabled();
    expect(field).toHaveAttribute('data-disabled');
    await view.setProps({ outer: true });
    await view.setProps({ inner: false });
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('disabled');
    expect(field).toHaveAttribute('data-disabled');
    await view.setProps({ outer: false });
    expect(control).not.toBeDisabled();
    expect(field).not.toHaveAttribute('data-disabled');
  });

  it('passes disabled to real render-composed RadioGroup, CheckboxGroup and Slider roots', async () => {
    const view = await render(() => <>
      <Fieldset.Root disabled render={(host) => <RadioGroup {...host} data-testid="radio-group" />} />
      <Fieldset.Root disabled render={(host) => <CheckboxGroup {...host} />}>
        <Checkbox.Root name="apple" data-testid="checkbox" />
      </Fieldset.Root>
      <Fieldset.Root disabled render={(host) => <Slider.Root {...host} defaultValue={50} />}>
        <Slider.Control data-testid="slider-control"><Slider.Track><Slider.Thumb /></Slider.Track></Slider.Control>
      </Fieldset.Root>
    </>);
    expect(view.getByTestId('radio-group')).toHaveAttribute('aria-disabled', 'true');
    expect(view.getByTestId('checkbox')).toHaveAttribute('data-disabled');
    expect(view.getByTestId('slider-control')).toHaveAttribute('data-disabled');
  });

  it('defaults omitted and explicitly undefined disabled to false in the DOM and live state', async () => {
    const view = await renderProps((props: { disabled?: boolean }) => (
      <Fieldset.Root {...props} class={(state) => state.disabled ? 'disabled' : 'enabled'}>
        <Fieldset.Legend class={(state) => state.disabled ? 'disabled' : 'enabled'}>Legend</Fieldset.Legend>
        <Control />
      </Fieldset.Root>
    ), {});
    const group = view.getByRole('group');
    const legend = view.getByText('Legend');
    for (const disabled of [true, undefined, false]) {
      await view.setProps({ disabled });
      expect(view.getByRole('group')).toBe(group);
      expect(view.getByText('Legend')).toBe(legend);
      expect(group.hasAttribute('disabled')).toBe(disabled === true);
      expect(group.hasAttribute('data-disabled')).toBe(disabled === true);
      expect(legend.hasAttribute('data-disabled')).toBe(disabled === true);
      expect(group).toHaveClass(disabled ? 'disabled' : 'enabled');
      expect(legend).toHaveClass(disabled ? 'disabled' : 'enabled');
      expect(view.getByTestId('control').hasAttribute('disabled')).toBe(disabled === true);
    }
  });

  it('keeps an omitted or false local disabled subordinate to all ancestors', async () => {
    const view = await renderProps((props: { disabled: boolean }) => (
      <Fieldset.Root disabled={props.disabled}>
        <Fieldset.Root data-testid="middle">
          <Fieldset.Root disabled={false} data-testid="inner"><Control /></Fieldset.Root>
        </Fieldset.Root>
      </Fieldset.Root>
    ), { disabled: true });
    for (const disabled of [true, false, true]) {
      await view.setProps({ disabled });
      expect(view.getByTestId('middle').hasAttribute('disabled')).toBe(disabled);
      expect(view.getByTestId('inner').hasAttribute('disabled')).toBe(disabled);
      expect(view.getByTestId('control').hasAttribute('disabled')).toBe(disabled);
    }
  });

  it('replaces a root ref on the same host and detaches the current ref on disposal', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: { ref: (node: HTMLFieldSetElement) => void }) => (
      <Fieldset.Root {...props}><Fieldset.Legend>Legend</Fieldset.Legend></Fieldset.Root>
    ), { ref: first });
    const group = view.getByRole('group');
    expect(first.mock.calls).toEqual([[group]]);
    await view.setProps({ ref: second });
    expect(view.getByRole('group')).toBe(group);
    expect(first.mock.calls).toEqual([[group], [null]]);
    expect(second.mock.calls).toEqual([[group]]);
    view.unmount();
    expect(second.mock.calls).toEqual([[group], [null]]);
  });

  it('invokes native ref callbacks untracked when they read current props during disposal', async () => {
    const calls: [HTMLFieldSetElement | null, string][] = [];
    const view = await renderProps((props: { label: string }) => (
      <Fieldset.Root ref={(node) => { calls.push([node, props.label]); }} />
    ), { label: 'initial' });
    const group = view.getByRole('group');
    expect(calls).toEqual([[group, 'initial']]);
    await view.setProps({ label: 'current' });
    view.unmount();
    expect(calls).toEqual([[group, 'initial'], [null, 'current']]);
  });

  it('updates ancestor/local disabled precedence in both directions without replacing hosts', async () => {
    const view = await renderProps((props: { outer: boolean; inner: boolean }) => (
      <Fieldset.Root disabled={props.outer} data-testid="outer">
        <Fieldset.Root disabled={props.inner} data-testid="inner"><Control /></Fieldset.Root>
      </Fieldset.Root>
    ), { outer: false, inner: true });
    const inner = view.getByTestId('inner');
    const control = view.getByTestId('control');
    for (const [outer, local, effective] of [[true, true, true], [true, false, true], [false, false, false], [false, true, true]] as const) {
      await view.setProps({ outer, inner: local });
      expect(view.getByTestId('inner')).toBe(inner);
      expect(view.getByTestId('control')).toBe(control);
      expect(inner.hasAttribute('disabled')).toBe(effective);
      expect(control.hasAttribute('disabled')).toBe(effective);
      expect(control.hasAttribute('data-disabled')).toBe(effective);
    }
  });

  it('passes current disabled to a render-composed root', async () => {
    function RootFixture(props: HTMLProps & { disabled?: boolean }) {
      return createRenderElement('div', {}, {
        props: [props, { role: 'radiogroup', get 'aria-disabled'() { return props.disabled ? 'true' : 'false'; } }],
      });
    }
    const view = await renderProps((props: { disabled: boolean }) => (
      <Fieldset.Root disabled={props.disabled} render={(host) => <RootFixture {...host} />} />
    ), { disabled: true });
    const root = view.getByRole('radiogroup');
    expect(root).toHaveAttribute('aria-disabled', 'true');
    await view.setProps({ disabled: false });
    expect(view.getByRole('radiogroup')).toBe(root);
    expect(root).toHaveAttribute('aria-disabled', 'false');
  });

  it('replays render composition with real Fieldset parts and the current shared renderer', async () => {
    const view = await renderProps((props: { disabled: boolean }) => (
      <Fieldset.Root disabled={props.disabled} render={(host) => <Fieldset.Root {...host} data-testid="composed" />}>
        <Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
        <Control />
      </Fieldset.Root>
    ), { disabled: true });
    const root = view.getByTestId('composed');
    const legend = view.getByTestId('legend');
    const control = view.getByTestId('control');
    for (const disabled of [true, false, true]) {
      await view.setProps({ disabled });
      expect(view.getByTestId('composed')).toBe(root);
      expect(view.getByTestId('legend')).toBe(legend);
      expect(view.getByTestId('control')).toBe(control);
      expect(root.hasAttribute('disabled')).toBe(disabled);
      expect(legend.hasAttribute('data-disabled')).toBe(disabled);
      expect(control.hasAttribute('disabled')).toBe(disabled);
    }
  });

  it('returns null for optional context outside a root', async () => {
    let absent: unknown;
    function Probe() { absent = useFieldsetRootContext(true); return null; }
    await render(() => <Probe />);
    expect(absent).toBeNull();
  });
});
