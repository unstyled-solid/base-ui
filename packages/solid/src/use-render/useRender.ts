import type { ComponentProps, ValidComponent, JSX } from '@solidjs/web';
import { createRenderElement, type UseRenderElementComponentProps, type UseRenderElementParameters } from '../internals/createRenderElement';
import type { ComponentRenderFn, HTMLProps } from '../internals/types';
export interface UseRenderParameters<State, E extends Element, Enabled extends boolean | undefined = undefined> extends UseRenderElementParameters<State, E, keyof JSX.IntrinsicElements, Enabled>, UseRenderElementComponentProps<State> {
  defaultTagName?: keyof JSX.IntrinsicElements;
}
export type UseRenderRenderProp<State = Record<string, unknown>> = ComponentRenderFn<HTMLProps, State>;
export type UseRenderElementProps<E extends ValidComponent> = ComponentProps<E>;
export type UseRenderComponentProps<E extends ValidComponent, State = {}, Props = HTMLProps> = ComponentProps<E> & { render?: ComponentRenderFn<Props, State> };
export type UseRenderReturnValue<Enabled extends boolean | undefined> = JSX.Element;
export interface UseRenderState {}
export function createRender<State extends object = {}, E extends Element = HTMLElement, Enabled extends boolean | undefined = undefined>(params: UseRenderParameters<State, E, Enabled>): JSX.Element {
  return createRenderElement(() => params.defaultTagName ?? 'div', params, params);
}
export namespace createRender {
  export type State = UseRenderState;
  export type RenderProp<S = Record<string, unknown>> = UseRenderRenderProp<S>;
  export type ElementProps<E extends ValidComponent> = UseRenderElementProps<E>;
  export type ComponentProps<E extends ValidComponent, S = {}, P = HTMLProps> = UseRenderComponentProps<E, S, P>;
  export type Parameters<S, E extends Element, Enabled extends boolean | undefined = undefined> = UseRenderParameters<S, E, Enabled>;
  export type ReturnValue<Enabled extends boolean | undefined = undefined> = UseRenderReturnValue<Enabled>;
}
export { createRender as useRender };
