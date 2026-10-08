import { describe, expect, it } from 'vitest';
import { Errored } from 'solid-js';
import { createRenderer, describeConformance } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { SwitchRootContext } from '../root/SwitchRootContext';
import { SwitchThumb, type SwitchThumbProps } from './SwitchThumb';
import type { SwitchRootState } from '../root/SwitchRoot';

const { render, renderProps } = createRenderer();
const testContext: SwitchRootState = {
  checked: false, disabled: false, readOnly: false, required: false,
  dirty: false, touched: false, filled: false, focused: false, valid: null,
};
describe('Switch.Thumb', () => {
  describeConformance<SwitchRootState, SwitchThumbProps & ConformantComponentProps<SwitchRootState>>((props) =>
    <SwitchRootContext value={testContext}><SwitchThumb {...props} /></SwitchRootContext>, {
    initialProps: {}, refInstanceof: window.HTMLSpanElement,
  });

  it('reports the missing root context through a native error boundary', async () => {
    const view = await render(() => <Errored fallback={(error) => <p>{String(error())}</p>}>
      <SwitchThumb />
    </Errored>);
    // Required contexts use RC13's native missing-provider error, rather than
    // replacing it with the React context wrapper's custom exception.
    expect(view.container).toHaveTextContent('Context must either be created with a default value or a value must be provided before accessing it.');
  });
  it('renders a persistent span and forwards live context, refs, props, classes and styles', async () => {
    let node: HTMLSpanElement | undefined;
    const view = await renderProps<SwitchRootState & { thumb: SwitchThumbProps & { 'data-testid'?: string } }>((props) =>
      <SwitchRootContext value={props}><SwitchThumb {...props.thumb} ref={(element) => { node = element; }} /></SwitchRootContext>, {
      checked: false, disabled: false, readOnly: false, required: false,
      dirty: false, touched: false, filled: false, focused: false, valid: null,
      thumb: { 'data-testid': 'thumb', title: 'before', class: ['static', { extra: true }], style: { color: 'red' } },
    });
    const thumb = view.getByTestId('thumb');
    expect(node).toBe(thumb);
    expect(thumb.tagName).toBe('SPAN');
    expect(thumb).toHaveAttribute('data-unchecked');
    expect(thumb).toHaveClass('static', 'extra');
    await view.setProps({ checked: true, disabled: true, readOnly: true, required: true, dirty: true, touched: true, filled: true, focused: true, valid: false });
    expect(view.getByTestId('thumb')).toBe(thumb);
    for (const attr of ['checked', 'disabled', 'readonly', 'required', 'dirty', 'touched', 'filled', 'focused', 'invalid']) expect(thumb).toHaveAttribute(`data-${attr}`);
    expect(thumb).not.toHaveAttribute('data-unchecked');
    await view.setProps({ checked: false, valid: true });
    expect(view.getByTestId('thumb')).toBe(thumb);
    expect(thumb).toHaveAttribute('data-valid');
    expect(thumb).not.toHaveAttribute('data-invalid');
  });
});
