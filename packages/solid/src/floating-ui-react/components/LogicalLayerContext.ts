import { createContext, useContext, type Accessor } from 'solid-js';
import type { LogicalLayer } from '../../internals/contracts/floating';

/** Logical event ancestry is independent of native portal mount/focus context.
 * An accessor permits sibling portal registration after content setup. */
export const LogicalLayerContext = createContext<Accessor<LogicalLayer | null>>(() => null);
export function createLogicalLayerAccessor(): Accessor<LogicalLayer | null> {
  return useContext(LogicalLayerContext);
}
