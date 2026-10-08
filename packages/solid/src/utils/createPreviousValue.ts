import { createMemo, type Accessor } from 'solid-js';
export function createPreviousValue<T>(value: Accessor<T>): Accessor<T | null> {
  const history = createMemo<{ current: T; previous: T | null }>((previous) => {
    const current = value();
    return previous && Object.is(previous.current, current) ? previous : { current, previous: previous ? previous.current : null };
  });
  return () => history().previous;
}
export { createPreviousValue as usePreviousValue };
