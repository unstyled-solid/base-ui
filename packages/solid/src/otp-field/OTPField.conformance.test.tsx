import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, screen } from '../../test';
import { OTPField } from './index';
import { input, slots } from './OTPField.test-utils';

// The same source-generated API assertions run through the current Solid harness.
describe('OTPField.Root source conformance', () => {
  describeConformance<OTPField.Root.State, OTPField.Root.Props, HTMLDivElement>(
    (props) => <OTPField.Root {...props} />,
    { initialProps: { length: 1 }, refInstanceof: HTMLDivElement },
  );
});
describe('OTPField.Input source conformance', () => {
  describeConformance<OTPField.Input.State, OTPField.Input.Props, HTMLInputElement>(
    (props) => <OTPField.Root length={1}><OTPField.Input {...props} /></OTPField.Root>,
    { initialProps: {}, refInstanceof: HTMLInputElement, testRenderPropWith: 'input' },
  );
});

// The source's generated Root/Input conformance cases use cloneElement and refs.
// These exercise the corresponding native live-render and setup-owned ref API.
describe('OTPField native component conformance', () => {
  const { renderProps } = createRenderer();
  for (const customized of [false, true]) {
    it(`forwards Root/Input props, live styles, native refs and host identity (render=${customized})`, async () => {
      const rootRef = vi.fn(); const slotRef = vi.fn();
      const view = await renderProps((props: { lang: string; color: string; label: string }) =>
        <OTPField.Root length={1} lang={props.lang} data-test-value={props.label}
          ref={rootRef} style={{ color: props.color }}
          render={customized ? (host) => <div {...host} data-custom="root" /> : undefined}>
          <OTPField.Input lang={props.lang} data-test-value={props.label} ref={slotRef}
            style={{ color: props.color }} render={customized ? (host) => <input {...host} data-custom="input" /> : undefined} />
        </OTPField.Root>, { lang: 'fr', color: 'green', label: 'before' });
      const root = screen.getByRole('group'); const slot = slots()[0];
      expect(rootRef).toHaveBeenCalledWith(root);
      expect(slotRef).toHaveBeenCalledWith(slot);
      expect(root).toBeInstanceOf(HTMLDivElement);
      expect(slot).toBeInstanceOf(HTMLInputElement);
      expect(root).toHaveAttribute('lang', 'fr');
      expect(slot).toHaveAttribute('lang', 'fr');
      expect(root.style.color).toBe('green');
      expect(slot.style.color).toBe('green');
      await view.setProps({ lang: 'de', color: 'red', label: 'after' });
      expect(screen.getByRole('group')).toBe(root);
      expect(slots()[0]).toBe(slot);
      for (const host of [root, slot]) {
        expect(host).toHaveAttribute('lang', 'de');
        expect(host).toHaveAttribute('data-test-value', 'after');
        expect(host.style.color).toBe('red');
      }
      view.unmount();
      expect(root.isConnected).toBe(false);
      expect(slot.isConnected).toBe(false);
    });
  }
  it('keeps getter receivers and resolves complete ClassValue/state-style callbacks', async () => {
    await renderProps(() => <OTPField.Root length={1}
      class={(state) => ['root', { complete: state.complete }]}
      style={(state) => ({ color: state.complete ? 'green' : 'red' })}>
      <OTPField.Input class={(state) => ['slot', { filled: state.filled }]}
        style={(state) => ({ color: state.filled ? 'green' : 'red' })} />
    </OTPField.Root>, {});
    expect(screen.getByRole('group')).toHaveClass('root');
    expect(screen.getByRole('group').style.color).toBe('red');
    expect(slots()[0]).toHaveClass('slot');
    await input(slots()[0], '1');
    expect(screen.getByRole('group')).toHaveClass('complete');
    expect(slots()[0]).toHaveClass('filled');
    expect(slots()[0].style.color).toBe('green');
    expect(screen.getByRole('group').style.color).toBe('green');
  });
  it('preserves callback-composed ref arrays and allows render style overrides', async () => {
    const source = vi.fn(); const composed = vi.fn();
    await renderProps(() => <OTPField.Root length={1}>
      <OTPField.Input ref={source} style={{ color: 'red' }} render={(host) =>
        <input {...host} ref={[host.ref, composed]} style={{ color: 'green' }} />
      } />
    </OTPField.Root>, {});
    expect(source).toHaveBeenCalledWith(slots()[0]);
    expect(composed).toHaveBeenCalledWith(slots()[0]);
    expect(slots()[0].style.color).toBe('green');
  });
});
