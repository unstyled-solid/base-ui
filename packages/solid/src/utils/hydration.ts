import { createSignal, isHydrating, onSettled, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';

export function createIsHydrated(): Accessor<boolean> {
  const [hydrated, setHydrated] = createSignal(!isServer && !isHydrating());
  onSettled(() => { setHydrated(true); });
  return hydrated;
}
/** Base UI includes the server pass in this state, unlike Solid's isHydrating. */
export function createIsHydrating(): Accessor<boolean> {
  const hydrated = createIsHydrated();
  return () => !hydrated();
}
export { createIsHydrated as useIsHydrated, createIsHydrating as useIsHydrating };
