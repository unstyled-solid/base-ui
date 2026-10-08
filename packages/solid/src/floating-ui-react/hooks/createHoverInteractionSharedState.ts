import { createEffect, untrack, type Accessor } from 'solid-js';
import { Timeout } from '../../utils/createTimeout';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { HandleCloseOptions } from './hoverShared';
export { isInteractiveElement } from '../utils/element';
export class HoverInteraction {
  pointerType: string | undefined; interactedInside = false; handler: ((event: MouseEvent) => void) | undefined;
  blockMouseMove = true; restTimeoutPending = false;
  openChangeTimeout = new Timeout(); restTimeout = new Timeout(); handleCloseOptions: HandleCloseOptions | undefined;
  performedPointerEventsMutation = false;
  pointerEventsScopeElement: HTMLElement | SVGSVGElement | null = null;
  pointerEventsReferenceElement: HTMLElement | SVGSVGElement | null = null;
  pointerEventsFloatingElement: HTMLElement | null = null;
  dispose = () => { this.openChangeTimeout.clear(); this.restTimeout.clear(); clearSafePolygonPointerEventsMutation(this); };
}
const shared = new WeakMap<FloatingRootContext, { instance: HoverInteraction; count: number }>();
const facades = new WeakMap<object, () => HoverInteraction>();
export function createHoverInteractionSharedState(input: FloatingRootContext | Accessor<FloatingRootContext>): HoverInteraction {
  const root = () => typeof input === 'function' ? input() : input;
  const ensure = (context: FloatingRootContext) => {
    let record = shared.get(context);
    if (!record) { record = { instance: new HoverInteraction(), count: 0 }; shared.set(context, record); }
    return record;
  };
  createEffect(root, (context) => {
    const record = ensure(context); record.count++;
    return () => { if (--record.count === 0) { record.instance.dispose(); shared.delete(context); } };
  });
  // A stable facade follows handle/root migration; no timers leak from its old
  // root and all halves share the current instance rather than a setup snapshot.
  const facade = new Proxy(new HoverInteraction(), {
    get(_, key) { const instance = ensure(root()).instance; return Reflect.get(instance, key, instance); },
    set(_, key, value) { const instance = ensure(untrack(root)).instance; return Reflect.set(instance, key, value, instance); },
  });
  facades.set(facade, () => ensure(untrack(root)).instance);
  return facade;
}
type MutationState = Pick<HoverInteraction, 'performedPointerEventsMutation' | 'pointerEventsScopeElement' | 'pointerEventsReferenceElement' | 'pointerEventsFloatingElement'>;
const owners = new WeakMap<Element, { state: MutationState; originals: [HTMLElement | SVGSVGElement, string, string][] }>();
export function clearSafePolygonPointerEventsMutation(state: MutationState): void {
  state = facades.get(state)?.() ?? state;
  const scope = state.pointerEventsScopeElement, owner = scope && owners.get(scope);
  if (owner?.state === state) {
    for (const [element, before, written] of owner.originals) if (element.style.pointerEvents === written) element.style.pointerEvents = before;
    owners.delete(scope!);
  }
  state.performedPointerEventsMutation = false; state.pointerEventsScopeElement = null; state.pointerEventsReferenceElement = null; state.pointerEventsFloatingElement = null;
}
export function applySafePolygonPointerEventsMutation(state: MutationState, options: { scopeElement: HTMLElement | SVGSVGElement; referenceElement: HTMLElement | SVGSVGElement; floatingElement: HTMLElement }): void {
  state = facades.get(state)?.() ?? state;
  const { scopeElement: scope, referenceElement: reference, floatingElement: floating } = options;
  const previous = owners.get(scope); if (previous && previous.state !== state) clearSafePolygonPointerEventsMutation(previous.state);
  clearSafePolygonPointerEventsMutation(state);
  const originals: [HTMLElement | SVGSVGElement, string, string][] = [];
  for (const [element, written] of [[scope, 'none'], [reference, 'auto'], [floating, 'auto']] as const) {
    originals.push([element, element.style.pointerEvents, written]); element.style.pointerEvents = written;
  }
  owners.set(scope, { state, originals });
  state.performedPointerEventsMutation = true; state.pointerEventsScopeElement = scope; state.pointerEventsReferenceElement = reference; state.pointerEventsFloatingElement = floating;
}
