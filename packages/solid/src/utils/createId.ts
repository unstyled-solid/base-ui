import { createUniqueId, type Accessor } from 'solid-js';

/** Allocate once in setup; read the override live without consuming further IDs. */
export function createId(idOverride?: string | Accessor<string | undefined>, prefix?: string): Accessor<string> {
  const uniqueId = createUniqueId();
  const generated = prefix ? `${prefix}-${uniqueId}` : uniqueId;
  return () => (typeof idOverride === 'function' ? idOverride() : idOverride) ?? generated;
}
export { createId as useId };
