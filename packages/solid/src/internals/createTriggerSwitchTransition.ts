import { createEffect, untrack } from 'solid-js';
import { createAnimationsFinished } from './createAnimationsFinished';
export interface UseTriggerSwitchTransitionParameters {
  store?: { readonly state: { readonly open: boolean; readonly instantType?: string | undefined } } | undefined;
  instantType?: string | undefined;
  domReference: Element | null; positionerElement: HTMLElement | null; open: boolean;
  setInstantType(value: 'trigger-change' | undefined): void;
  getInstantType?: (() => string | undefined) | undefined;
}
export function createTriggerSwitchTransition(params: UseTriggerSwitchTransitionParameters): void {
  const finish = createAnimationsFinished(() => params.positionerElement);
  let previous: Element | null = null, controller: AbortController | undefined, lastWritten: string | undefined;
  createEffect(() => ({ open: params.open, current: params.domReference, element: params.positionerElement,
    instant: params.instantType ?? params.getInstantType?.() ?? params.store?.state.instantType }), (next) => {
    if (!next.open) {
      controller?.abort(); controller = undefined;
      if ((next.instant ?? lastWritten) === 'trigger-change') { untrack(() => params.setInstantType(undefined)); lastWritten = undefined; }
    }
    const old = previous; if (next.current) previous = next.current;
    if (!next.open || !old || !next.current || next.current === old || !next.element) return;
    controller?.abort(); const current = new AbortController(); controller = current;
    untrack(() => params.setInstantType(undefined)); lastWritten = undefined;
    finish(() => { if (!current.signal.aborted && untrack(() => params.open)) { params.setInstantType('trigger-change'); lastWritten = 'trigger-change'; } }, current.signal);
    return () => current.abort();
  });
}
export { createTriggerSwitchTransition as useTriggerSwitchTransition };
