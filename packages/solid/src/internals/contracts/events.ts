/** Independent of Event.defaultPrevented and ChangeEventDetails.isCanceled. */
export type BaseUIEvent<E extends Event> = E & {
  preventBaseUIHandler(): void;
  readonly baseUIHandlerPrevented?: boolean | undefined;
};
export type MaybeBaseUIEvent<E extends Event> = E &
  Partial<Pick<BaseUIEvent<E>, 'preventBaseUIHandler' | 'baseUIHandlerPrevented'>>;

type PreventableHandler<T> = T extends (event: infer E) => infer R
  ? E extends Event ? { handle(event: BaseUIEvent<E>): R }['handle'] : T
  : T extends { 0: (data: infer D, event: infer E) => infer R; 1: infer D2 }
    ? E extends Event ? { 0: { handle(data: D, event: BaseUIEvent<E>): R }['handle']; 1: D2 } : T
    : T;
/** Also retains RC.13 bound-handler tuples; non-event callbacks are unchanged. */
export type WithBaseUIEvent<T> = { [K in keyof T]: PreventableHandler<T[K]> };

/** Events owner supplies reason-to-event discrimination on top of this seam. */
export interface GenericEventDetails<Reason extends string = string, E extends Event = Event> {
  readonly reason: Reason;
  readonly event: E;
}
export interface ChangeEventDetails<Reason extends string = string, E extends Event = Event>
  extends GenericEventDetails<Reason, E> {
  cancel(): void;
  allowPropagation(): void;
  readonly isCanceled: boolean;
  readonly isPropagationAllowed: boolean;
  readonly trigger: Element | undefined;
}
export interface FloatingUIOpenChangeDetails {
  open: boolean;
  reason: string;
  nativeEvent: Event;
  nested: boolean;
  triggerElement?: Element | undefined;
}
