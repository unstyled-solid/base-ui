import { createEffect, createSignal, type Accessor } from 'solid-js';
import type { PopupTriggerDataStore, PopupTriggerMetadata } from '../../internals/contracts/popup';
export interface TriggerDataForwardingOptions<P> extends PopupTriggerMetadata<P> {
  store: Accessor<PopupTriggerDataStore<P>>;
  id: Accessor<string | undefined>;
  element?: Accessor<Element | null> | undefined;
}
export interface TriggerDataForwardingResult {
  element: Accessor<Element | null>;
  registerTrigger(node: Element | null): void;
  readonly isMountedByThisTrigger: boolean;
}
export function createTriggerDataForwarding<P>(options: TriggerDataForwardingOptions<P>): TriggerDataForwardingResult;
export function createTriggerDataForwarding<P>(id: Accessor<string | undefined>, element: Accessor<Element | null>, store: Accessor<PopupTriggerDataStore<P>>, metadata: PopupTriggerMetadata<P>): TriggerDataForwardingResult;
export function createTriggerDataForwarding<P>(input: TriggerDataForwardingOptions<P> | Accessor<string | undefined>, sourceElement?: Accessor<Element | null>, sourceStore?: Accessor<PopupTriggerDataStore<P>>, sourceMetadata?: PopupTriggerMetadata<P>): TriggerDataForwardingResult {
  const [reported, report] = createSignal<Element | null>(null, { ownedWrite: true });
  const options: TriggerDataForwardingOptions<P> = typeof input === 'function' ? {
    id: input, element: sourceElement, store: sourceStore!,
    get payload() { return sourceMetadata?.payload; }, get disabled() { return sourceMetadata?.disabled; },
    get openOnHover() { return sourceMetadata?.openOnHover; }, get closeDelay() { return sourceMetadata?.closeDelay; },
  } : input;
  const element = () => options.element?.() ?? reported();
  createEffect(() => ({ id: options.id(), element: element(), store: options.store() }), (next) => {
    if (!next.id || !next.element) return;
    return next.store.registerTrigger(next.id, next.element, undefined, options);
  });
  return { element, registerTrigger(node) { report(node); },
    get isMountedByThisTrigger() { return options.store().state.mounted && options.store().state.activeTriggerId === options.id(); } };
}
