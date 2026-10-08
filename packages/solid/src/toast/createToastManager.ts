// Event manager contract adapted from Base UI (MIT), pinned at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { generateId } from '../utils/generateId';
import type { ToastObject, ToastManagerAddOptions, ToastManagerUpdateOptions, ToastManagerPromiseOptions } from './useToastManager';

/** An external event source, deliberately independent of any rendering owner. */
export function createToastManager<Data extends object = any>(): ToastManager<Data> {
  const listeners = new Set<(event: ToastManagerEvent) => void>();
  const emit = (event: ToastManagerEvent) => listeners.forEach((listener) => listener(event));
  return {
    ' subscribe'(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    add(options) {
      const id = options.id || generateId('toast');
      emit({ action: 'add', options: { ...options, id, transitionStatus: 'starting' } });
      return id;
    },
    close(id) { emit({ action: 'close', options: { id } }); },
    update(id, updates) { emit({ action: 'update', options: { id, updates } }); },
    promise(promise, options) {
      let handled = promise;
      emit({ action: 'promise', options: { ...options, promise, setPromise(next: typeof promise) { handled = next; } } });
      return handled;
    },
  };
}
export interface ToastManager<Data extends object = any> {
  ' subscribe': (listener: (event: ToastManagerEvent) => void) => () => void;
  add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
  close: (id?: string) => void;
  update: <T extends Data = Data>(id: string, updates: ToastManagerUpdateOptions<T> | ((previous: ToastObject<T>) => ToastManagerUpdateOptions<T>)) => void;
  promise: <Value, T extends Data = Data>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, T>) => Promise<Value>;
}
export interface ToastManagerEvent { action: 'add' | 'close' | 'update' | 'promise'; options: any }
