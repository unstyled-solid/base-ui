import { createFloatingRoot, type FloatingRootOptions } from '../components/createFloatingRoot';
export function createSyncedFloatingRootContext(options: FloatingRootOptions) {
  return createFloatingRoot({ get state() { return options.state; }, get triggerElements() { return options.triggerElements; },
    get nested() { return options.nested; }, syncOnly: true, onOpenChange: (next, details) => options.onOpenChange?.(next, details) });
}
export { createSyncedFloatingRootContext as useSyncedFloatingRootContext };
