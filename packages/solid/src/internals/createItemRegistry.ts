import type { ItemRegistry } from './contracts/items';
import { createSignal, onCleanup } from 'solid-js';
/** Immediate imperative registrations and scheduler-published immutable views. */
export function createItemRegistry<Key, Item>(): ItemRegistry<Key, Item> {
  const live = new Map<Key, Item>();
  const tokens = new Map<Key, symbol>();
  // Registration/disposal are owned resource mutations, including For cleanup.
  const [snapshot, publish] = createSignal<ReadonlyMap<Key, Item>>(new Map(), { ownedWrite: true });
  let disposed = false;
  onCleanup(() => { disposed = true; live.clear(); tokens.clear(); });
  return {
    get items() { return snapshot(); },
    liveItems: live,
    registerItem(key, item) {
      if (disposed) return () => {};
      const token = Symbol();
      tokens.set(key, token);
      live.set(key, item);
      publish(new Map(live));
      return () => {
        if (disposed || tokens.get(key) !== token) return;
        tokens.delete(key);
        live.delete(key);
        publish(new Map(live));
      };
    },
  };
}
