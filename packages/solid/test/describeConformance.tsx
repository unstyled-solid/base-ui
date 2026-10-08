// Behavioral assertions adapted from Base UI's MIT conformance suites (see tracking/harness.json).
import { describe, it, expect, vi } from 'vitest';
import { untrack } from 'solid-js';
import { dynamic } from '@solidjs/web';
import type { JSX } from '@solidjs/web';
import type { RenderedProps } from '../src/internals/contracts/render';
import { createRenderer } from './createRenderer';

export type ConformanceHostProps<E extends HTMLElement = HTMLElement> = RenderedProps<JSX.HTMLAttributes<E>>;
export interface ConformantComponentProps<State = unknown, E extends HTMLElement = HTMLElement> extends Omit<JSX.HTMLAttributes<E>, 'class' | 'style' | 'ref'> {
  // Conformance injects attachment callbacks, not an arbitrary assigned node.
  // Actual component P retains its complete, element-specific native ref API.
  ref?: ConformanceHostProps<E>['ref'] | ConformanceHostProps<E>['ref'][];
  class?: JSX.ClassValue | ((state: State) => JSX.ClassValue);
  style?: JSX.HTMLAttributes<HTMLElement>['style'] | ((state: State) => JSX.HTMLAttributes<HTMLElement>['style']);
  render?: (props: ConformanceHostProps<E>, state: State) => JSX.Element;
  'data-testid'?: string;
  'data-foobar'?: string;
  nativeButton?: boolean;
}
export interface ConformanceOptions<P, State, E extends HTMLElement = HTMLElement> {
  initialProps: P;
  refInstanceof: new (...args: never[]) => E;
  /** Native dispatch for presentational/inert surfaces; interactive parts use user.click. */
  click?: 'user' | 'dispatch';
  testRenderPropWith?: Extract<keyof JSX.IntrinsicElements, keyof HTMLElementTagNameMap>;
  button?: boolean;
  wrappingAllowed?: boolean;
  state?: { change: Partial<P>; assert: (state: State, changed: boolean) => void; class: (state: State) => string; before: string; after: string };
}

/** JSX factory + live props replace cloneElement/rerender. No re-mount-based compatibility API. */
export function describeConformance<State, P extends Pick<ConformantComponentProps<State, E>, 'class' | 'style' | 'render'>, E extends HTMLElement = HTMLElement>(
  component: (props: P) => JSX.Element,
  options: ConformanceOptions<P, State, E>,
) {
  const { renderProps } = createRenderer();
  const mount = (extra: ConformantComponentProps<State, E> = {}) => renderProps<P>(component, {
    ...options.initialProps, 'data-testid': 'root',
    ...(extra.render && options.button ? { nativeButton: tag === 'button' } : {}),
    ...extra,
  });
  // The custom host is deliberately polymorphic (e.g. a button rendered as an
  // anchor). Keep the public E-specific input contract; the DOM tag is runtime-selected.
  const tag: string = options.testRenderPropWith ?? 'div';
  // Factory is constructed in the callback's owned setup, not module scope.
  const custom = (props: ConformanceHostProps<E>) => {
    const Element = dynamic(() => tag);
    return <Element {...props} data-testid="custom-root" />;
  };
  describe('Base UI component API (Solid 2)', () => {
    for (const customized of [false, true]) {
      it(`forwards custom props and live style (${customized ? 'render callback' : 'default host'})`, async () => {
        const view = await mount({
          lang: 'fr', 'data-foobar': 'source-value', style: { color: 'green' },
          ...(customized ? { render: custom } : {}),
        });
        const root = view.getByTestId(customized ? 'custom-root' : 'root');
        expect(root).toHaveAttribute('lang', 'fr');
        expect(root).toHaveAttribute('data-foobar', 'source-value');
        expect(root.style.color).toBe('green');
        await view.setProps({ ...options.initialProps, lang: 'de', 'data-foobar': 'next-value', style: { color: 'red' } });
        expect(view.getByTestId(customized ? 'custom-root' : 'root')).toBe(root);
        expect(root).toHaveAttribute('lang', 'de');
        expect(root).toHaveAttribute('data-foobar', 'next-value');
        expect(root.style.color).toBe('red');
      });
    }
    it('forwards native ref and disconnects its node on disposal', async () => {
      const ref = vi.fn();
      const view = await mount({ ref });
      const root = view.getByTestId('root');
      expect(ref).toHaveBeenCalledTimes(1);
      expect(ref).toHaveBeenCalledWith(root);
      expect(root).toBeInstanceOf(options.refInstanceof);
      view.unmount();
      expect(root.isConnected).toBe(false);
    });
    it('custom component receives props and both native refs', async () => {
      let refA: HTMLElement | null | undefined;
      let refB: HTMLElement | undefined;
      const view = await mount({
        ref: (node) => { refA = node; },
        render: (props) => {
          const Element = dynamic(() => tag);
          // This case composes initial attachment refs; dynamic ref replacement is a lifecycle case.
          const refs = untrack(() => props.ref);
          const content = <Element {...props} ref={[refs, (node: HTMLElement) => { refB = node; }]} data-testid="wrapped" data-test-value="custom" />;
          return options.wrappingAllowed === false ? content : <div data-testid="wrapper">{content}</div>;
        },
      });
      if (options.wrappingAllowed !== false) expect(view.getByTestId('wrapper')).toBeInTheDocument();
      const node = view.getByTestId('wrapped');
      expect(node.tagName).toBe(tag.toUpperCase());
      expect(node).toHaveAttribute('data-test-value', 'custom');
      expect(refA).toBe(node);
      expect(refB).toBe(node);
    });
    it('render callback can override style', async () => {
      const view = await mount({ style: { color: 'red' }, render: (props) => {
        const Element = dynamic(() => tag);
        return <Element {...props} style={{ color: 'green' }} />;
      } });
      expect(view.getByTestId('root').style.color).toBe('green');
    });
    for (const classValue of ['component-class', (() => 'component-class')]) {
      it(`composes ${typeof classValue} class with a render callback class`, async () => {
        const view = await mount({ class: classValue, render: (props) => {
          const Element = dynamic(() => tag);
          return <Element {...props} class={[props.class, 'render-class']} />;
        } });
        const root = view.getByTestId('root');
        expect(root).toHaveClass('component-class', 'render-class');
        await view.setProps({ class: 'next-class' } as Partial<P>);
        expect(view.getByTestId('root')).toBe(root);
        expect(root).toHaveClass('next-class', 'render-class');
        expect(root).not.toHaveClass('component-class');
      });
    }
    it('applies class strings, arrays and object values on the same host', async () => {
      const view = await mount({ class: 'first' });
      const root = view.getByTestId('root');
      expect(root).toHaveClass('first');
      await view.setProps({ class: ['second', { active: true, absent: false }] } as Partial<P>);
      expect(view.getByTestId('root')).toBe(root);
      expect(root).toHaveClass('second', 'active');
      expect(root).not.toHaveClass('first', 'absent');
    });
    it('reads the current native event handler; custom callback preserves prevention/order', async () => {
      const calls: string[] = [];
      const view = await mount({
        onClick: (event) => { calls.push(`old:${event.defaultPrevented}`); },
        render: (props) => {
          const Element = dynamic(() => tag);
          return <Element {...props} onClick={(event: MouseEvent & { currentTarget: E; target: Element }) => {
            calls.push('external');
            event.preventDefault();
            const handler = props.onClick;
            if (typeof handler === 'function') handler(event);
            else if (handler) handler[0](handler[1], event);
          }} />;
        },
      });
      const root = view.getByTestId('root');
      const click = () => options.click === 'dispatch'
        ? root.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))
        : view.user.click(root);
      await click();
      expect(calls).toEqual(['external', 'old:true']);
      const nextHandler: ConformantComponentProps<State, E> = { onClick: (event) => { expect(event.currentTarget).toBe(root); calls.push(`new:${event.defaultPrevented}`); } };
      await view.setProps(nextHandler as Partial<P>);
      calls.length = 0;
      await click();
      expect(calls).toEqual(['external', 'new:true']);
    });
    if (options.state) {
      const scenario = options.state;
      it('render state and state-derived class remain live without recreating the host', async () => {
        let observed!: State;
        const view = await mount({ class: scenario.class, render: (props, state) => {
          observed = state;
          const Element = dynamic(() => tag);
          return <Element {...props} />;
        } });
        const root = view.getByTestId('root');
        scenario.assert(observed, false);
        expect(root).toHaveClass(scenario.before);
        await view.setProps(scenario.change);
        scenario.assert(observed, true);
        expect(root).toHaveClass(scenario.after);
        expect(view.getByTestId('root')).toBe(root);
      });
    }
  });
}
