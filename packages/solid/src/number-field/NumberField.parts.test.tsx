import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance, fireEvent, screen } from '../../test';
import { flush } from 'solid-js';
import { NumberField } from './index';
import { NumberFieldRootDataAttributes, NumberFieldGroupDataAttributes, NumberFieldInputDataAttributes,
  NumberFieldIncrementDataAttributes, NumberFieldDecrementDataAttributes,
  NumberFieldScrubAreaDataAttributes, NumberFieldScrubAreaCursorDataAttributes } from './index';
import { NumberFieldScrubAreaContext } from './scrub-area/NumberFieldScrubAreaContext';
import { platform } from '../utils/platform';

// The pinned invocations select the four default conformance suites.
// testComponentPropWith on the steppers is not testRenderPropWith: their
// upstream custom host therefore remains div, with nativeButton=false.
describe('NumberField.Root source conformance', () => {
  describeConformance((props: NumberField.Root.Props) => <NumberField.Root {...props} />,
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' });
});
describe('NumberField.Group source conformance', () => {
  describeConformance((props: NumberField.Group.Props) => <NumberField.Root><NumberField.Group {...props} /></NumberField.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' });
});
describe('NumberField.Input source conformance', () => {
  describeConformance((props: NumberField.Input.Props) => <NumberField.Root><NumberField.Input {...props} /></NumberField.Root>,
    { initialProps: {}, refInstanceof: HTMLInputElement, click: 'dispatch' });
});
describe('NumberField.Increment source conformance', () => {
  describeConformance((props: NumberField.Increment.Props) => <NumberField.Root><NumberField.Increment {...props} /></NumberField.Root>,
    { initialProps: {}, refInstanceof: HTMLButtonElement, button: true, click: 'dispatch' });
});
describe('NumberField.Decrement source conformance', () => {
  describeConformance((props: NumberField.Decrement.Props) => <NumberField.Root><NumberField.Decrement {...props} /></NumberField.Root>,
    { initialProps: {}, refInstanceof: HTMLButtonElement, button: true, click: 'dispatch' });
});
describe('NumberField.ScrubArea source conformance', () => {
  describeConformance((props: NumberField.ScrubArea.Props) => <NumberField.Root><NumberField.ScrubArea {...props} /></NumberField.Root>,
    { initialProps: {}, refInstanceof: HTMLSpanElement, click: 'dispatch' });
});

describe('NumberField seven-part composition/source data exports', () => {
  const { render, renderProps } = createRenderer();
  it('exports identical source attributes for all seven parts', () => {
    const expected = { scrubbing: 'data-scrubbing', disabled: 'data-disabled', readonly: 'data-readonly',
      required: 'data-required', valid: 'data-valid', invalid: 'data-invalid', touched: 'data-touched',
      dirty: 'data-dirty', filled: 'data-filled', focused: 'data-focused' };
    for (const attributes of [NumberFieldRootDataAttributes, NumberFieldGroupDataAttributes, NumberFieldInputDataAttributes,
      NumberFieldIncrementDataAttributes, NumberFieldDecrementDataAttributes, NumberFieldScrubAreaDataAttributes,
      NumberFieldScrubAreaCursorDataAttributes]) {
      expect(Object.keys(attributes).sort()).toEqual(Object.keys(expected).sort());
      // Module namespace objects carry Symbol.toStringTag; compare every public export.
      expect({ ...attributes }).toEqual(expected);
    }
  });
  it('forwards native refs/props and updates part classes without replacing hosts', async () => {
    const nodes: Element[] = [];
    const ref = (node: Element | null) => { if (node) nodes.push(node); };
    const styleClass = (state: NumberField.Root.State) => state.disabled ? 'disabled' : 'enabled';
    const view = await renderProps((props: { disabled: boolean }) => <NumberField.Root disabled={props.disabled} ref={ref} data-testid="root" class={styleClass}>
      <NumberField.Group ref={ref} data-testid="group" class={styleClass}>
        <NumberField.Input ref={ref} data-testid="input" class={styleClass} />
        <NumberField.Increment ref={ref} data-testid="increment" class={styleClass} />
        <NumberField.Decrement ref={ref} data-testid="decrement" class={styleClass} />
        <NumberField.ScrubArea ref={ref} data-testid="area" class={styleClass} />
      </NumberField.Group>
    </NumberField.Root>, { disabled: false });
    const original = ['root', 'group', 'input', 'increment', 'decrement', 'area'].map((id) => screen.getByTestId(id));
    for (const node of original) { expect(nodes).toContain(node); expect(node).toHaveClass('enabled'); }
    await view.setProps({ disabled: true });
    original.forEach((node) => { expect(node.isConnected).toBe(true); expect(node).toHaveClass('disabled'); });
  });
  it('supports live callback rendering with native input prop types', async () => {
    await render(() => <NumberField.Root defaultValue={5}>
      <NumberField.Input render={(props) => <input {...props} data-testid="custom" />} />
    </NumberField.Root>);
    const node = screen.getByTestId('custom');
    fireEvent.keyDown(node, { key: 'ArrowUp' }); flush();
    expect(screen.getByTestId('custom')).toBe(node); expect(node).toHaveValue('6');
  });
  it.skipIf(platform.engine.webkit)('forwards cursor ref and composition props through the owned portal', async () => {
    let cursor: HTMLSpanElement | undefined;
    await render(() => <NumberField.Root>
      <NumberFieldScrubAreaContext value={{ isScrubbing: true, isTouchInput: false,
        isPointerLockDenied: false, element: null, registerCursor() {} }}>
        <NumberField.ScrubAreaCursor ref={(node) => { cursor = node; }} data-testid="cursor" class="source-cursor" />
      </NumberFieldScrubAreaContext>
    </NumberField.Root>);
    const node = screen.getByTestId('cursor');
    expect(cursor).toBe(node); expect(node).toHaveClass('source-cursor');
    expect(node).toHaveAttribute('role', 'presentation');
    expect(node.parentElement).not.toBeNull();
  });
});
