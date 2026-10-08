import { untrack, type Accessor } from 'solid-js';

/** Pass a getter of the current handler, e.g. () => props.onChange.
 * Read at invocation, never captured by a relay effect. For imperative/event use.
 */
export function createStableCallback<Args extends unknown[], Result>(
  callback: Accessor<((...args: Args) => Result) | undefined>,
): (...args: Args) => Result | undefined {
  return (...args) => untrack(() => callback()?.(...args));
}
export { createStableCallback as useStableCallback };
