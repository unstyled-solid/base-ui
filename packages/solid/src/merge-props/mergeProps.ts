// Adapted from Base UI, MIT. Canonical source: upstream/base-ui/packages/react/src/merge-props.
import type { ComponentProps, JSX } from '@solidjs/web';
import { $PROXY } from 'solid-js';
import type { BaseUIEvent, WithBaseUIEvent } from '../internals/types';

type ElementType = keyof JSX.IntrinsicElements | ((props: any) => JSX.Element);
type PropsOf<T extends ElementType> = WithBaseUIEvent<ComponentProps<T>>;
export type InputProps<T extends ElementType> = PropsOf<T> | ((previous: PropsOf<T>) => PropsOf<T>) | undefined;
type RecordProps = Record<string, any>;

/** Native Event brand check works for iframe events and never brands value callbacks. */
export function isNativeEvent(value: unknown): value is Event {
  if (value == null || typeof value !== 'object' || typeof Event === 'undefined') return false;
  try {
    Object.getOwnPropertyDescriptor(Event.prototype, 'type')!.get!.call(value);
    return true;
  } catch { return false; }
}

const preventionAttempts = new WeakSet<Event>();
const enhancedEvents = new WeakSet<Event>();
/** Source handlers can honor preventDefault intent on noncancelable native
 * focus events without changing the browser's defaultPrevented property. */
export function isDefaultPrevented(event: Event): boolean { return event.defaultPrevented || preventionAttempts.has(event); }
export function makeEventPreventable<T extends Event>(event: T): BaseUIEvent<T> {
  const result = event as BaseUIEvent<T>;
  if (!enhancedEvents.has(event)) {
    enhancedEvents.add(event);
    const preventDefault = event.preventDefault;
    const descriptor = Object.getOwnPropertyDescriptor(event, 'preventDefault');
    // user-event and RC13 can supply a readonly own method. Cancelable keyboard
    // events already expose native defaultPrevented, so leave that method intact.
    if (!descriptor || descriptor.writable || descriptor.set) {
      event.preventDefault = function () { preventionAttempts.add(event); preventDefault.call(this); };
    } else if (descriptor.configurable) {
      Object.defineProperty(event, 'preventDefault', { configurable: true, enumerable: descriptor.enumerable, writable: descriptor.writable ?? false,
        value: function (this: Event) { preventionAttempts.add(event); preventDefault.call(this); } });
    }
  }
  result.preventBaseUIHandler = () => { (result as T & { baseUIHandlerPrevented: boolean }).baseUIHandlerPrevented = true; };
  return result;
}

function eventKey(key: string) {
  const third = key.charCodeAt(2);
  return key.startsWith('on') && third >= 65 && third <= 90;
}

export function mergeClassNames(ours: JSX.ClassValue | undefined, theirs: JSX.ClassValue | undefined): JSX.ClassValue | undefined {
  if (!theirs) return ours;
  if (!ours) return theirs;
  return typeof ours === 'string' && typeof theirs === 'string' ? `${theirs} ${ours}` : [theirs, ours];
}

/** CSS strings are native Solid input; preserve their cascade when mixed with objects. */
export function mergeStyles(ours: JSX.HTMLAttributes<HTMLElement>['style'], theirs: JSX.HTMLAttributes<HTMLElement>['style']) {
  if (typeof theirs === 'symbol') return theirs;
  if (typeof ours === 'symbol') return theirs ?? ours;
  if (theirs === false) return false;
  if (ours === false) return theirs ?? false;
  if (theirs == null) return ours;
  if (ours == null) return theirs;
  if (typeof ours !== 'string' && typeof theirs !== 'string') return { ...ours, ...theirs };
  const css = (value: JSX.CSSProperties | string) => typeof value === 'string' ? value : Object.entries(value)
    .filter(([, entry]) => entry != null).map(([key, entry]) => `${key}:${entry}`).join(';');
  return `${css(ours)};${css(theirs)}`;
}

function isBoundHandler(handler: unknown): handler is { 0: (data: unknown, ...args: unknown[]) => unknown; 1: unknown } {
  return handler !== null && typeof handler === 'object' && typeof Reflect.get(handler, '0') === 'function' && '1' in handler;
}
function call(handler: unknown, args: unknown[]) {
  // Solid's bound handler convention is [handler, data].
  if (isBoundHandler(handler)) return handler[0](handler[1], ...args);
  if (typeof handler === 'function') return handler(...args);
  return undefined;
}
function handlerValue(value: unknown) { return value === undefined || typeof value === 'function' || isBoundHandler(value); }

/** Consecutive object bags share one view; functional stages remain boundaries.
 * Getter receivers stay on their source objects. Enumerating N bags must not
 * recursively enumerate every preceding merged proxy for each descriptor.
 */
function mergeSources(previous: RecordProps, sources: readonly RecordProps[]): RecordProps {
  const handlers = new Map<string, Map<number, (...args: unknown[]) => unknown>>();
  const has = (key: string) => {
    // Preserve read precedence as well as value precedence. Probing an earlier
    // reactive bag first subscribes even when a later bag owns the property.
    for (let index = sources.length - 1; index >= 0; index--) if (key in sources[index]) return true;
    return key in previous;
  };
  function read(key: string, end = sources.length - 1): unknown {
    for (let index = end; index >= 0; index--) {
      const source = sources[index];
      if (!(key in source)) continue;
      const next = source[key];
      if (key === 'class') return mergeClassNames(read(key, index - 1) as JSX.ClassValue | undefined, next);
      if (key === 'style') return mergeStyles(read(key, index - 1) as JSX.HTMLAttributes<HTMLElement>['style'], next);
      if (eventKey(key) && handlerValue(next)) {
        if (next === undefined) continue;
        let stages = handlers.get(key);
        if (!stages) { stages = new Map(); handlers.set(key, stages); }
        if (!stages.has(index)) stages.set(index, (...args) => {
          const current = source[key];
          if (current === undefined) return call(read(key, index - 1), args);
          if (isNativeEvent(args[0])) makeEventPreventable(args[0]);
          const result = call(current, args);
          if (!isNativeEvent(args[0]) || !(args[0] as BaseUIEvent<Event>).baseUIHandlerPrevented) call(read(key, index - 1), args);
          return result;
        });
        return stages.get(index);
      }
      return next; // Explicit undefined masks ordinary defaults; refs are NOT merged.
    }
    return previous[key];
  }
  const result: RecordProps = new Proxy({}, {
    ownKeys: () => [...new Set([Object.keys(previous), ...sources.map((source) => Object.keys(source))].flat())],
    has: (_, key) => key === $PROXY || (typeof key === 'string' && has(key)),
    getOwnPropertyDescriptor: (_, key) => typeof key === 'string' && has(key) ? { configurable: true, enumerable: true, get: () => result[key] } : undefined,
    get(_, key) {
      // Identify this foreign reactive view so RC13 merge/omit do not cache
      // its changing keys as a plain object. Never expose a source's private
      // record/target: native spread must still read through our merge rules.
      if (key === $PROXY) return result;
      if (typeof key !== 'string') return undefined;
      return read(key);
    },
  });
  return result;
}

export function mergeProps<T extends ElementType = 'div'>(...inputs: InputProps<T>[]): ComponentProps<T> {
  return mergePropsN(inputs);
}
export function mergePropsN<T extends ElementType = 'div'>(inputs: readonly InputProps<T>[]): ComponentProps<T> {
  let result: RecordProps = {};
  let sources: RecordProps[] = [];
  for (const input of inputs) {
    if (!input) continue;
    // Getters own their chaining/prevention; do not wrap their returned handlers.
    if (typeof input === 'function') {
      if (sources.length) result = mergeSources(result, sources);
      sources = [];
      result = input(result as PropsOf<T>);
    } else sources.push(input);
  }
  // Dispatch wrappers accept native events and brand them before consumer invocation.
  return (sources.length ? mergeSources(result, sources) : result) as ComponentProps<T>;
}
