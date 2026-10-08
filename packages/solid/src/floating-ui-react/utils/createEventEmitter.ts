import type { FloatingEvents } from '../../internals/contracts/floating';
export function createEventEmitter<Events extends object>(): FloatingEvents<Events> & { clear(): void } {
  const handlers = new Map<keyof Events & string, Set<(data: unknown) => void>>();
  return {
    emit(event, data) { for (const handler of [...(handlers.get(event) ?? [])]) handler(data); },
    on(event, handler) {
      let listeners = handlers.get(event);
      if (!listeners) handlers.set(event, listeners = new Set());
      listeners.add(handler as (data: unknown) => void);
    },
    off(event, handler) { const listeners = handlers.get(event); listeners?.delete(handler as (data: unknown) => void); if (!listeners?.size) handlers.delete(event); },
    clear() { handlers.clear(); },
  };
}
