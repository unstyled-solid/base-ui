import { createSignal, flush, merge } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { cleanup as libraryCleanup, render as libraryRender } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { getQueriesForElement } from '@testing-library/dom';
import { vi } from 'vitest';

export type RenderOptions = Parameters<typeof libraryRender>[1];
const mounts = new Set<() => void>();

export function cleanup() {
  const failures: unknown[] = [];
  for (const dispose of [...mounts]) {
    try { dispose(); } catch (error) { failures.push(error); }
  }
  try { libraryCleanup(); } catch (error) { failures.push(error); }
  if (failures.length) throw new AggregateError(failures, 'HARNESS_CLEANUP_FAILURE');
}

export function createRenderer(globalOptions?: RenderOptions) {
  async function render(factory: () => JSX.Element, options?: RenderOptions) {
    const mergedOptions = { ...globalOptions, ...options };
    const result = libraryRender(factory, mergedOptions);
    let disposed = false;
    const unmount = () => {
      if (disposed) return;
      disposed = true;
      mounts.delete(unmount);
      try { result.unmount(); } finally { if (!mergedOptions.container) result.container.remove(); }
    };
    mounts.add(unmount);
    const user = userEvent.setup({
      document: result.container.ownerDocument,
      ...(vi.isFakeTimers() ? { advanceTimers: (ms: number) => vi.advanceTimersByTimeAsync(ms) } : {}),
    });
    // beta.3 binds to container despite returning baseElement. Portals are part
    // of the rendered tree and canonical source queries include the body.
    return { ...result, ...getQueriesForElement(result.baseElement, mergedOptions.queries), unmount, user };
  }

  /** Shallow reactive host: nodes, functions, and getter receivers retain identity. */
  async function renderProps<P extends object>(factory: (props: P) => JSX.Element, initial: P, options?: RenderOptions) {
    let update!: (patch: Partial<P>) => void;
    let disposed = false;
    const result = await render(() => {
      const [record, setRecord] = createSignal({ value: initial });
      const props = () => record().value;
      // Merge's recursive conditional type cannot reduce an unresolved generic P.
      const live = merge(props) as P;
      update = (patch) => setRecord(({ value: previous }) => {
        // Native merge retains getter receivers and explicit undefined; no deep proxies.
        return { value: merge(previous, patch) as P };
      });
      return factory(live);
    }, options);
    return {
      ...result,
      async setProps(patch: Partial<P>) {
        if (disposed) throw new Error('Cannot update an unmounted reactive prop host');
        update(patch);
        flush(); // Explicit synchronous test observation, not an async-work substitute.
        await Promise.resolve();
      },
      unmount() { disposed = true; result.unmount(); },
    };
  }
  return { render, renderProps };
}

export type BaseUIRenderResult = Awaited<ReturnType<ReturnType<typeof createRenderer>['render']>>;
