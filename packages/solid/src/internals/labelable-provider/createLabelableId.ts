import { createEffect, onCleanup, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
import { createBaseUiId } from '../createBaseUiId';
import { useLabelableContext } from './LabelableContext';
export interface UseLabelableIdParameters {
  id?: string | null | Accessor<string | null | undefined> | undefined;
  enabled?: boolean | Accessor<boolean> | undefined;
}
export function createLabelableId(params: UseLabelableIdParameters = {}): Accessor<string> {
  const context = useLabelableContext();
  const fallback = createBaseUiId();
  const source = Symbol('control');
  const id = () => typeof params.id === 'function' ? params.id() : params.id;
  const enabled = () => (typeof params.enabled === 'function' ? params.enabled() : params.enabled) ?? true;
  let hadExplicitId = false;
  let registered = false;
  const unregister = () => {
    if (!registered || !context) return;
    registered = false;
    context.registerControlId(source, undefined);
  };
  if (context && !isServer) {
    createEffect(() => ({ id: id(), enabled: enabled(), fallback: fallback() }), (next) => {
      if (!next.enabled) { unregister(); return; }
      if (next.id !== undefined) {
        hadExplicitId = true;
        registered = true;
        context.registerControlId(source, next.id);
      } else if (hadExplicitId) { registered = true; context.registerControlId(source, next.fallback); }
      else context.resetControlId();
    }, { transparent: true });
    onCleanup(unregister);
  }
  return () => (enabled() ? context?.controlId : undefined) ?? id() ?? fallback();
}
export { createLabelableId as useLabelableId };
export type UseLabelableIdReturnValue = Accessor<string>;
export interface UseLabelableIdState {}
