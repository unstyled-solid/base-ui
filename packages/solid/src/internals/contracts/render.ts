import type { ComponentProps, JSX, ValidComponent } from '@solidjs/web';
import type { Live } from './core';
import type { WithBaseUIEvent } from './events';

export type HTMLProps<T extends Element = HTMLElement> = WithBaseUIEvent<JSX.HTMLAttributes<T>>;
export type ClassValue = JSX.ClassValue;
export type StyleValue = JSX.HTMLAttributes<HTMLElement>['style'];
/** Both arguments keep live getters. Never transplant descriptors off their receiver. */
/** Output refs are the renderer's merged callback, rather than assignment inputs. */
type NativeRenderHandler<T> = T extends (event: infer E) => infer R
  ? E extends Event ? { handle(event: Omit<E, 'preventBaseUIHandler' | 'baseUIHandlerPrevented'>): R }['handle'] : T
  : T extends { 0: (data: infer D, event: infer E) => infer R; 1: infer V }
    ? E extends Event ? { 0: { handle(data: D, event: Omit<E, 'preventBaseUIHandler' | 'baseUIHandlerPrevented'>): R }['handle']; 1: V } : T
    : T;
type NativeRenderProps<Props> = { [K in keyof Props]: NativeRenderHandler<Props[K]> };
export type RenderedProps<Props> = Omit<NativeRenderProps<Props>, 'ref'> & ('ref' extends keyof Props ? {
  ref?: { apply(element: HTMLElement | null): void }['apply'] | undefined;
} : {});
export type ComponentRenderFn<Props, State> = (props: Live<RenderedProps<Props>>, state: Live<State>) => JSX.Element;
export type BaseUIComponentProps<
  ElementType extends ValidComponent,
  State,
  RenderFunctionProps = HTMLProps,
> = Omit<WithBaseUIEvent<ComponentProps<ElementType>>,
  'class' | 'color' | 'defaultValue' | 'defaultChecked' | 'style'> & {
  class?: ClassValue | ((state: Live<State>) => ClassValue);
  style?: StyleValue | ((state: Live<State>) => StyleValue);
  /** Solid-native callback, not a cloneable pre-created JSX value. */
  render?: ComponentRenderFn<RenderFunctionProps, State> | undefined;
};
export type StateAttributesMapping<State> = {
  /** null excludes a state property without subscribing to its value. */
  [K in keyof State]?: ((value: State[K]) => Record<string, string | undefined> | null) | null;
};
