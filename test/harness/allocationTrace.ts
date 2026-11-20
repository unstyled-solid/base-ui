import { getOwner } from 'solid-js';

/** Read-only adapter for the pinned Solid 2.0.3 server/client owner counters.
 * Captures effective owner allocation positions without reserving IDs or
 * changing private counters. Keep this instrumentation in test fixtures only.
 */
export interface AllocationPoint { label: string; owner: string | null; next: number }
export interface RuntimeAllocation { owner: string; next: number; stack?: string }
declare global {
  var __baseUIAllocationTrace: ((point: RuntimeAllocation) => void) | undefined;
}
export function captureAllocations() {
  const points: RuntimeAllocation[] = [];
  const previous = globalThis.__baseUIAllocationTrace;
  const error = Error as ErrorConstructor & { stackTraceLimit?: number };
  const previousLimit = error.stackTraceLimit;
  error.stackTraceLimit = 60;
  globalThis.__baseUIAllocationTrace = point => points.push(point);
  return { points, stop() { globalThis.__baseUIAllocationTrace = previous; error.stackTraceLimit = previousLimit; } };
}
export function runtimeAllocationDivergence(server: readonly RuntimeAllocation[], client: readonly RuntimeAllocation[]) {
  for (let index = 0; index < Math.max(server.length, client.length); index += 1) {
    const left = server[index], right = client[index];
    if (!left || !right || left.owner !== right.owner || left.next !== right.next) {
      const context = (points: readonly RuntimeAllocation[]) => points.slice(Math.max(0, index - 8), index).map(point => ({ ...point, stack: point.stack?.split('\n').slice(1, 9).join('\n') }));
      return `First allocation divergence at ${index}\nSERVER ${JSON.stringify(left)}\nCLIENT ${JSON.stringify(right)}\nPrevious server ${JSON.stringify(context(server))}\nPrevious client ${JSON.stringify(context(client))}`;
    }
  }
  return null;
}
export function allocationPoint(label: string): AllocationPoint {
  let owner = getOwner() as unknown as {
    id?: string; _childCount: number; _transparent?: boolean; _config?: number; _parent?: any;
  } | null;
  while (owner?._parent && (owner._transparent || ((owner._config ?? 0) & 4))) owner = owner._parent;
  if (!owner || typeof owner._childCount !== 'number') throw new Error(`Allocation tracing requires a pinned Solid owner: ${label}`);
  return { label, owner: owner.id ?? null, next: owner._childCount };
}

export function firstAllocationDivergence(server: readonly AllocationPoint[], client: readonly AllocationPoint[]): string | null {
  for (let index = 0; index < Math.max(server.length, client.length); index += 1) {
    const left = server[index]; const right = client[index];
    if (!left || !right || left.label !== right.label || left.owner !== right.owner || left.next !== right.next) {
      return `Allocation divergence at ${index}\nserver: ${JSON.stringify(left)}\nclient: ${JSON.stringify(right)}\nprevious: ${JSON.stringify(server[index - 1] ?? null)}`;
    }
  }
  return null;
}

export function tracePropReads(read: () => void, repetitions = 3): AllocationPoint[] {
  const points = [allocationPoint('before-prop-reads')];
  for (let index = 0; index < repetitions; index += 1) {
    read();
    points.push(allocationPoint(`after-prop-read-${index + 1}`));
  }
  const first = points[0];
  for (const point of points.slice(1)) {
    if (point.owner !== first.owner || point.next !== first.next) {
      throw new Error(`Impure prop read allocated an owner slot: ${JSON.stringify(points)}`);
    }
  }
  return points;
}
