import { onCleanup } from 'solid-js';

/** Keyed timer semantics from Base UI (MIT). */
export class TimeoutManager {
  private ids = new Map<string, ReturnType<typeof setTimeout>>();
  start = (key: string, delay: number, fn: () => void) => {
    this.clear(key);
    const id = setTimeout(() => { this.ids.delete(key); fn(); }, delay);
    this.ids.set(key, id);
  };
  clear = (key: string) => {
    const id = this.ids.get(key);
    if (id != null) { clearTimeout(id); this.ids.delete(key); }
  };
  clearAll = () => { this.ids.forEach(clearTimeout); this.ids.clear(); };
}
export function createTimeoutManager() {
  const manager = new TimeoutManager();
  onCleanup(manager.clearAll);
  return manager;
}
