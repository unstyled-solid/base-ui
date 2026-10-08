import { createEffect, onCleanup, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
import { useFieldRootContext } from '../field-root-context';
export function createRegisterFieldControl(controlRef: Accessor<HTMLElement | null>, id: Accessor<string | undefined>, value: Accessor<unknown>, getValue?: () => unknown, enabled: Accessor<boolean> = () => true, name: Accessor<string | undefined> = () => undefined): void {
  const field = useFieldRootContext();
  // React's layout registration does not execute during SSR. Keep the server
  // registry and its reactive name/baseline untouched as well.
  if (!field || isServer) return;
  const source = Symbol('field-control');
  createEffect(() => ({ enabled: enabled(), node: controlRef(), id: id(), value: value(), name: name() }), (next) => {
    field.registerFieldControl(source, next.enabled && (next.node || next.value !== undefined) ? { controlRef, id: next.id, value: next.value, name: next.name, getValue } : undefined);
  }, { transparent: true });
  onCleanup(() => field.registerFieldControl(source, undefined));
}
export { createRegisterFieldControl as useRegisterFieldControl };
