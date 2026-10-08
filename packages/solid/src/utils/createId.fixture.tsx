import { createBaseUiId } from '../internals/createBaseUiId';
import { createId } from './createId';
import { createIsHydrated, createIsHydrating } from './hydration';

export function LifecycleIdFixture(props: { id?: string; observed?: (id: string, hydrated: boolean, hydrating: boolean) => void }) {
  const id = createBaseUiId(() => props.id);
  const labelA = createId(); const labelB = createId();
  const hydrated = createIsHydrated(); const hydrating = createIsHydrating();
  // Intentional one-time observation of the initial server/hydration pass.
  untrack(() => props.observed?.(id(), hydrated(), hydrating()));
  return <section data-hydrated={String(hydrated())} data-hydrating={String(hydrating())}>
    <label id={labelA()} for={id()}>A</label><span id={`${labelB()}-suffix`}>B</span>
    <input id={id()} aria-labelledby={`${labelA()} ${labelB()}-suffix`} />
  </section>;
}
import { untrack } from 'solid-js';
