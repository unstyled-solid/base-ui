// Public API conformance for all six host parts. Native Solid props and current refs
// replace React cloneElement/ref objects; canonical Field*/describeConformance suites.
import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance } from '../../test';
import { Field } from './index';
import type { FieldRootState } from './root/FieldRoot';

interface HostProps {
  title?: string;
  class?: JSX.ClassValue | ((state: FieldRootState) => JSX.ClassValue);
  style?: JSX.CSSProperties;
  ref?: (node: HTMLElement | null) => void;
  onClick?: (event: MouseEvent) => void;
}
const { renderProps } = createRenderer();
// Expand the exact six upstream conformance invocations. Keep the additional
// Solid live-props/ref cases below: they do not replace custom-host coverage.
describe('Field source conformance', () => {
  describe('Root', () => describeConformance((p) => <Field.Root {...p} />, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Item', () => describeConformance((p) => <Field.Root><Field.Item {...p} /></Field.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Label', () => describeConformance((p) => <Field.Root><Field.Label {...p} /></Field.Root>, { initialProps: {}, refInstanceof: HTMLLabelElement, testRenderPropWith: 'label' }));
  describe('Description', () => describeConformance((p) => <Field.Root><Field.Description {...p} /></Field.Root>, { initialProps: {}, refInstanceof: HTMLParagraphElement }));
  describe('Error', () => describeConformance((p) => <Field.Root invalid><Field.Error {...p} match /></Field.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Control', () => describeConformance((p) => <Field.Root><Field.Control {...p} /></Field.Root>, { initialProps: {}, refInstanceof: HTMLInputElement }));
});
const hosts = {
  Root: (p: HostProps) => <Field.Root {...p} data-testid="part" />,
  Item: (p: HostProps) => <Field.Root><Field.Item {...p} data-testid="part" /></Field.Root>,
  Label: (p: HostProps) => <Field.Root><Field.Label {...p} data-testid="part" /></Field.Root>,
  Description: (p: HostProps) => <Field.Root><Field.Description {...p} data-testid="part" /></Field.Root>,
  Error: (p: HostProps) => <Field.Root><Field.Error {...p} match data-testid="part" /></Field.Root>,
  Control: (p: HostProps) => <Field.Root><Field.Control {...p} data-testid="part" /></Field.Root>,
};
for (const [name, factory] of Object.entries(hosts)) {
  describe(`Field.${name} API conformance`, () => {
    it('keeps native props, classes and styles live on the same host', async () => {
      const view = await renderProps<HostProps>(factory, { title: 'first', class: 'first', style: { color: 'green' } });
      const node = view.getByTestId('part');
      expect(node).toHaveAttribute('title', 'first');
      expect(node).toHaveClass('first');
      expect(node.style.color).toBe('green');
      await view.setProps({ title: 'second', class: ['second', { active: true, absent: false }], style: { color: 'red' } });
      expect(view.getByTestId('part')).toBe(node);
      expect(node).toHaveAttribute('title', 'second');
      expect(node).toHaveClass('second', 'active');
      expect(node).not.toHaveClass('first', 'absent');
      expect(node.style.color).toBe('red');
    });

    it('replaces and disposes current native refs', async () => {
      const first = vi.fn();
      const second = vi.fn();
      const view = await renderProps<HostProps>(factory, { ref: first });
      const node = view.getByTestId('part');
      expect(first).toHaveBeenCalledWith(node);
      await view.setProps({ ref: second });
      expect(first).toHaveBeenLastCalledWith(null);
      expect(second).toHaveBeenCalledWith(node);
      view.unmount();
      expect(second).toHaveBeenLastCalledWith(null);
      expect(node.isConnected).toBe(false);
    });

    it('calls the current native handler with the host currentTarget', async () => {
      const first = vi.fn();
      const second = vi.fn((event: MouseEvent) => expect(event.currentTarget).toBe(node));
      const view = await renderProps<HostProps>(factory, { onClick: first });
      const node = view.getByTestId('part');
      await view.user.click(node);
      expect(first).toHaveBeenCalledTimes(1);
      await view.setProps({ onClick: second });
      await view.user.click(node);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('supports the complete class-value union and live state callbacks', async () => {
      const observed: FieldRootState[] = [];
      const view = await renderProps<HostProps>(factory, { class: (state) => { observed.push(state); return ['callback', { disabled: state.disabled }]; } });
      expect(view.getByTestId('part')).toHaveClass('callback');
      expect(untrack(() => observed.at(-1)?.disabled)).toBe(false);
    });
  });
}
