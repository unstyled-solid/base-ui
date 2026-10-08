import { children, createEffect, createMemo, createSignal, merge, omit, onCleanup, onSettled, untrack } from 'solid-js';
import { dynamic, isServer, type JSX } from '@solidjs/web';
import { mergePropsN, mergeClassNames, mergeStyles, isNativeEvent } from '../merge-props';
import { createMergedRefsN, type InputRef } from '../utils/createMergedRefs';
import { resolveClass } from '../utils/resolveClass';
import { resolveStyle } from '../utils/resolveStyle';
import { getStateAttributesProps, type StateAttributesMapping } from './getStateAttributesProps';
import type { ComponentRenderFn, StyleValue } from './contracts/render';

type Props = Record<string, any>;
type Tag = keyof JSX.IntrinsicElements;
const EMPTY_PROPS: Props = {};
const EMPTY_STYLE: JSX.CSSProperties = {};
export interface UseRenderElementComponentProps<State> {
  class?: JSX.ClassValue | ((state: State) => JSX.ClassValue);
  style?: StyleValue | ((state: State) => StyleValue);
  render?: ComponentRenderFn<Props, State>;
}
export interface UseRenderElementParameters<State, E extends Element = HTMLElement, T = Tag, Enabled extends boolean | undefined = boolean | undefined> {
  enabled?: Enabled;
  ref?: InputRef<E> | readonly InputRef<E>[];
  state?: State;
  props?: Props | readonly (Props | undefined | ((previous: Props) => Props))[];
  stateAttributesMapping?: StateAttributesMapping<State>;
  propGetter?: (props: Props) => Props;
}
export interface UseRenderElementState {}

/** Setup-owned stable host. Only the actual render target/enabled value controls identity. */
export function createRenderElement<State extends object = {}, E extends Element = HTMLElement, T extends Tag | undefined = Tag, Enabled extends boolean | undefined = boolean | undefined>(
  element: T | (() => T), componentProps: UseRenderElementComponentProps<State>,
  params: UseRenderElementParameters<State, E, T, Enabled> = {},
): JSX.Element {
  const state = new Proxy({} as State, {
    get: (_, key) => { const source = params.state ?? {}; return Reflect.get(source, key, source); },
    ownKeys: () => Reflect.ownKeys(params.state ?? {}),
    has: (_, key) => key in (params.state ?? {}),
    getOwnPropertyDescriptor: (_, key) => key in (params.state ?? {}) ? { enumerable: true, configurable: true } : undefined,
  });
  const tag = () => typeof element === 'function' ? element() : element;
  const valueProperty = () => !isServer && componentProps.render === undefined && (tag() === 'input' || tag() === 'textarea');
  const controlledDefault = () => valueProperty() && tag() === 'input' && resolved().value != null;
  // Resolve children independently of state attributes. A state change must
  // not re-evaluate a caller's JSX-producing children getter via a broad memo.
  const readChildrenProps = () => {
    if (params.enabled === false) return EMPTY_PROPS;
    const inputs = params.props;
    let accumulated: Props = {}, source: Props | undefined;
    for (const input of Array.isArray(inputs) ? inputs : [inputs]) {
      if (!input) continue;
      if (typeof input === 'function') {
        accumulated = input(accumulated);
        source = 'children' in accumulated ? accumulated : undefined;
      } else {
        accumulated = mergePropsN<any>([accumulated, input]);
        if ('children' in input) source = input;
      }
    }
    // Preserve the original child-bearing source across new interaction bags.
    return source ?? EMPTY_PROPS;
  };
  const childrenProps = isServer ? readChildrenProps : createMemo(readChildrenProps, { transparent: true });
  const readStateAttributes = () => getStateAttributesProps(state as Record<string, unknown>, params.stateAttributesMapping as StateAttributesMapping<Record<string, unknown>>);
  const stateAttributes = isServer ? readStateAttributes : createMemo(readStateAttributes, {
    transparent: true,
    equals: (previous, next) => Object.keys(previous).length === Object.keys(next).length
      && Object.keys(previous).every((key) => Object.hasOwn(next, key) && previous[key] === next[key]),
  });
  // A merged prop read evaluates attributes only when it actually falls through
  // to them. Functional inputs/propGetter retain that same preceding live view.
  const attributeProps: Props = new Proxy({}, {
    ownKeys: () => Object.keys(stateAttributes()),
    has: (_, key) => key in stateAttributes(),
    getOwnPropertyDescriptor: (_, key) => key in stateAttributes()
      ? { configurable: true, enumerable: true, get: () => stateAttributes()[key as string] } : undefined,
    get: (_, key) => typeof key === 'string' ? stateAttributes()[key] : undefined,
  });
  const readResolved = () => {
    if (params.enabled === false) return EMPTY_PROPS;
    const defaults = componentProps.render === undefined ? tag() === 'button' ? { type: 'button' } : tag() === 'img' ? { alt: '' } : {} : {};
    const inputs = params.props;
    const merged = mergePropsN<any>([defaults, attributeProps, ...(Array.isArray(inputs) ? inputs : [inputs])]);
    return params.propGetter ? params.propGetter(merged) : merged;
  };
  // Cache merge construction (including functional inputs), not attribute/value
  // evaluation. Source getters retain their per-property subscriptions.
  const resolved = isServer ? readResolved : createMemo(readResolved, { transparent: true });
  const [node, setNode] = createSignal<E | null>(null, { ownedWrite: true });
  const report = (element: E | null) => { setNode(() => element); };
  const ref = createMergedRefsN<E>(() => {
    const external = params.ref;
    let propRef;
    if (params.enabled !== false) {
      const inputs = params.props;
      const sources = Array.isArray(inputs) ? inputs : [inputs];
      // String-valued state attributes and tag defaults cannot supply native
      // refs. Ordinary bags need only their ordered ref projection. Functions
      // can derive refs from any preceding prop, so retain that full live view.
      propRef = params.propGetter || sources.some((source) => typeof source === 'function')
        ? resolved().ref : mergePropsN<any>(sources).ref;
    }
    return [report, propRef, ...(Array.isArray(external) ? external : [external])];
  });
  let projectedValue: { element: E; value: string } | undefined;
  if (!isServer) {
    const projection = createMemo(() => {
      const element = node();
      // Only text controls need controlled-value projection. A button/div must
      // not subscribe to a value merely because it shares a render-state bag.
      const textControl = element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA');
      return { element, value: textControl ? resolved().value : undefined, render: componentProps.render };
    }, {
      transparent: true, equals: (before, next) => before.element === next.element && Object.is(before.value, next.value) && before.render === next.render,
    });
    createEffect(projection, (next) => {
      if (next.element && next.render === undefined && ['INPUT', 'TEXTAREA'].includes(next.element.tagName) && next.value != null) {
        const input = next.element as unknown as HTMLInputElement | HTMLTextAreaElement;
        // Native spread compares the previous prop, not the current DOM value.
        // An accepted native edit already has this value: assigning it again can
        // move the caret. React likewise skips that redundant controlled write.
        if (input.value !== String(next.value)) input.value = String(next.value);
      }
      projectedValue = next.element && ['INPUT', 'TEXTAREA'].includes(next.element.tagName)
        ? { element: next.element, value: (next.element as unknown as HTMLInputElement).value } : undefined;
    }, { transparent: true });
  }
  const restoreInput = (element: E | null) => {
    if (!element || !['INPUT', 'TEXTAREA'].includes(element.tagName)) return;
    const declared = untrack(() => resolved().value);
    if (declared === undefined || declared === null) return;
    const value = untrack(() => componentProps.render !== undefined && projectedValue?.element === element ? projectedValue.value : declared);
    if (value !== undefined && value !== null && (element as unknown as HTMLInputElement).value !== String(value)) (element as unknown as HTMLInputElement).value = String(value);
  };
  if (!isServer) createEffect(node, (element) => {
    if (!element) return;
    // A render callback can conditionally remove its native host while keeping
    // this component owner alive. RC13 refs do not send null on that removal.
    const root = element.getRootNode();
    if (root === element) return;
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    const observer = new Observer(() => {
      // A native Portal may move a still-connected host out of its initial
      // fragment/root. Reparenting is not removal and must not clear live refs.
      if (ref.current === element && !element.isConnected && !root.contains(element)) ref(null);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, { transparent: true });
  if (!isServer) createEffect(node, (element) => {
    if (!element || !['INPUT', 'TEXTAREA'].includes(element.tagName)) return;
    // RC13 delegation skips disabled nodes, while native editing handlers must
    // still receive synthetic input/autofill and restore controlled DOM state.
    const input = (event: Event) => {
      if ((element as unknown as HTMLInputElement).disabled) untrack(() => live.onInput?.(event));
      // Enabled inputs restore from the delegated handler below. Browsers drain
      // microtasks between native listeners: restoring here would erase an edit
      // before the document's delegated handler can read it.
    };
    element.addEventListener('input', input);
    return () => element.removeEventListener('input', input);
  }, { transparent: true });
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const live: Props = new Proxy({}, {
    ownKeys: () => [...new Set([...Object.keys(resolved()).filter((key) => !(valueProperty() && key === 'value')), ...(controlledDefault() ? ['defaultValue'] : []), ...(resolved().value != null ? ['onInput'] : []), 'class', 'style', 'ref'])],
    has: (_, key) => typeof key === 'string' && (key === 'class' || key === 'style' || key === 'ref' || (key === 'defaultValue' && controlledDefault()) || (key === 'onInput' && resolved().value != null) || (key === 'children' ? key in childrenProps() : key in resolved())),
    // Native spread inspects the children descriptor during host creation.
    // A live getter both retains lazy children and avoids subscribing identity
    // to the current resolved-prop record while inspecting that descriptor.
    getOwnPropertyDescriptor: (_, key) => typeof key === 'string' && untrack(() => key in live) ? { configurable: true, enumerable: true, get: () => live[key] } : undefined,
    get(_, key) {
      // This facade is not its input's Solid store/merge view. Forwarding its
      // private symbol brands lets native spread unwrap past our merged props.
      if (typeof key !== 'string') return undefined;
      if (key === 'ref') return ref;
      if (key === 'children') return childrenProps().children;
      if (key === 'class') return mergeClassNames(resolved().class, resolveClass(componentProps.class, state));
      // Clear previously applied properties through CSSStyleDeclaration, as
      // React does. Solid's nullish branch removes the whole style attribute;
      // an empty object leaves style="" after removal, without adding it on mount.
      if (key === 'style') return mergeStyles(resolved().style, resolveStyle(componentProps.style, state)) ?? EMPTY_STYLE;
      // React controlled inputs also update their native reset default (and
      // therefore the natural value attribute). Uncontrolled defaults retain
      // their own binding; textarea defaults are content rather than attributes.
      if (key === 'defaultValue' && controlledDefault()) return resolved().value;
      const value = resolved()[key as string];
      if (key.startsWith('aria-') && typeof value === 'boolean') return String(value);
      if (/^on[A-Z]/.test(key) && (typeof value === 'function' || (key === 'onInput' && resolved().value != null))) {
        if (!handlers.has(key)) handlers.set(key, (...args) => {
          const dispatch = () => {
            const result = resolved()[key]?.(...args);
            if (key === 'onInput') {
              const element = ref.current;
              queueMicrotask(() => { if (ref.current === element) restoreInput(element); });
            }
            return result;
          };
          // Browsers can synchronously emit blur while a DOM effect disables
          // or removes a focused node. This is an imperative native event:
          // read its current callback without inheriting the enclosing effect.
          return isNativeEvent(args[0]) ? untrack(dispatch) : dispatch();
        });
        return handlers.get(key);
      }
      return value;
    },
  });
  const outputProps = merge(() => live);
  const targets = new WeakMap<Function, () => JSX.Element>();
  const hosts = new Map<Tag, (props: Props) => JSX.Element>();
  const ownedHost = (render: (props: Props) => JSX.Element) => () => {
    let element: E | null = null;
    let alive = true;
    let committed = false;
    const hostRef = (next: E | null) => {
      element = next;
      // Initial refs must precede settled consumers and sibling input mounts.
      // A later custom host replacement can occur inside a DOM insertion effect.
      if (!committed) ref(next);
      else queueMicrotask(() => { if (alive && element === next) ref(next); });
    };
    // Native onSettled reserves the same ownership slot during SSR, although
    // its DOM callback only runs on the client. Keep the registration shared
    // so the nested dynamic host claims the server's hydration namespace.
    onSettled(() => { committed = true; if (alive && element && ref.current !== element) ref(element); });
    onCleanup(() => { alive = false; if (element && ref.current === element) ref(null); });
    return render(merge(outputProps, { ref: hostRef }));
  };
  const Host = dynamic(() => {
    if (params.enabled === false) return undefined;
    const render = componentProps.render;
    if (render !== undefined) {
      if (typeof render !== 'function') throw new Error('Base UI: render must be a Solid render callback. Pass (props, state) => JSX to compose the host.');
      let target = targets.get(render);
      if (!target) { target = ownedHost((props) => render(props, state)); targets.set(render, target); }
      return target;
    }
    const name = tag() ?? 'div';
    let host = hosts.get(name);
    if (!host) {
      // Dynamic invokes component targets untracked. Its string-target branch
      // calls spread inside the identity memo, tracking attribute enumeration.
      // A static host component confines those reads to the owned DOM spread.
      const NativeHost = dynamic(() => name, { static: true });
      host = ownedHost((props) => {
        const content = children(() => props.children);
        const attributes = merge(props, { get children() { return content(); } });
        // Keep this view outside JSX: a call-expression spread is compiled to
        // a lazy merge source, whose server evaluation consumes hydration slots
        // before the native host that the client claims first.
        const hostAttributes = omit(attributes, 'ref');
        const target = () => {
          // Native dynamic returns the actual element. Deliver its ref in this
          // setup scope, outside spread's prop-reading effect: a consumer may
          // derive those very props from its registered element.
          const host = <NativeHost {...hostAttributes} />;
          if (!isServer) props.ref(host as E);
          return host;
        };
        // Status is read in this logical-owner computation rather than only
        // inside native dynamic's spread insertion effect.
        const Ready = dynamic(() => { content(); return target; });
        return <Ready />;
      });
      hosts.set(name, host);
    }
    return host;
  });
  // Represent a host as a persistent native JSX range. The invisible ending
  // boundary keeps its retained node adjacent to a stable sibling when other
  // fragment slots insert/remove nodes, without moving or refocusing the host.
  const end = isServer ? undefined : document.createTextNode('');
  return <><Host {...outputProps} />{end}</>;
}
export { createRenderElement as useRenderElement };
