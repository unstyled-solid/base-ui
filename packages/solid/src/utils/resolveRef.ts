import type { Accessor } from 'solid-js';
import type { MutableCell } from '../internals/contracts/core';

/** Read on each invocation. Accessors and internal cells preserve raw node identity. */
export function resolveRef<T extends Element | null | undefined>(ref: T | Accessor<T> | MutableCell<T>): T {
  if (typeof ref === 'function') return ref();
  if (ref == null) return ref;
  return 'current' in ref ? ref.current : ref;
}
