// Adapted from Base UI (MIT); native event transaction flags stay independent.
interface ReasonToEventMap {
  none: Event;
  'trigger-press': MouseEvent | PointerEvent | TouchEvent | KeyboardEvent;
  'trigger-hover': MouseEvent;
  'trigger-focus': FocusEvent;
  'outside-press': MouseEvent | PointerEvent | TouchEvent;
  'item-press': MouseEvent | KeyboardEvent | PointerEvent;
  'close-press': MouseEvent | KeyboardEvent | PointerEvent;
  'link-press': MouseEvent | PointerEvent;
  'clear-press': PointerEvent | MouseEvent | KeyboardEvent;
  'chip-remove-press': PointerEvent | MouseEvent | KeyboardEvent;
  'track-press': PointerEvent | MouseEvent | TouchEvent;
  'increment-press': PointerEvent | MouseEvent | TouchEvent;
  'decrement-press': PointerEvent | MouseEvent | TouchEvent;
  'input-change': InputEvent | Event;
  'input-clear': InputEvent | FocusEvent | Event;
  'input-blur': FocusEvent;
  'input-paste': ClipboardEvent;
  'input-press': MouseEvent | PointerEvent | TouchEvent | KeyboardEvent;
  'focus-out': FocusEvent | KeyboardEvent;
  'escape-key': KeyboardEvent;
  'close-watcher': Event;
  'list-navigation': KeyboardEvent;
  keyboard: KeyboardEvent;
  pointer: PointerEvent;
  drag: PointerEvent | TouchEvent;
  swipe: PointerEvent | TouchEvent;
  wheel: WheelEvent;
  scrub: PointerEvent;
  'cancel-open': MouseEvent;
  'sibling-open': Event;
  disabled: Event;
  missing: Event;
  initial: Event;
  'imperative-action': Event;
  'window-resize': UIEvent;
}
export type ReasonToEvent<R extends string> = R extends keyof ReasonToEventMap ? ReasonToEventMap[R] : Event;
export type BaseUIChangeEventDetails<R extends string, C extends object = {}> = R extends string ? {
  reason: R; event: ReasonToEvent<R>; cancel(): void; allowPropagation(): void;
  isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined;
} & C : never;
export type BaseUIGenericEventDetails<R extends string, C extends object = {}> = R extends string ? { reason: R; event: ReasonToEvent<R> } & C : never;
export type BaseUIHighlightEventDetails<R extends string, C extends object = {}> = R extends 'pointer' ? { reason: R; event: MouseEvent | PointerEvent } & C : BaseUIGenericEventDetails<R, C>;
export function createChangeEventDetails<R extends string, C extends object = {}>(reason: R, event?: ReasonToEvent<R>, trigger?: Element, customProperties?: C): BaseUIChangeEventDetails<R, C> {
  let canceled = false;
  let propagation = false;
  return {
    reason, event: event ?? new Event('base-ui'), trigger,
    cancel() { canceled = true; }, allowPropagation() { propagation = true; },
    get isCanceled() { return canceled; }, get isPropagationAllowed() { return propagation; },
    ...customProperties,
  } as BaseUIChangeEventDetails<R, C>;
}
export function createGenericEventDetails<R extends keyof ReasonToEventMap, C extends object = {}>(reason: R, event?: ReasonToEvent<R>, customProperties?: C): BaseUIGenericEventDetails<R, C> {
  return { reason, event: event ?? new Event('base-ui'), ...customProperties } as BaseUIGenericEventDetails<R, C>;
}
