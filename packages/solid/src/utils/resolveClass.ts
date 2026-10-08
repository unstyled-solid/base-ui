import type { JSX } from '@solidjs/web';
export function resolveClass<State>(value: JSX.ClassValue | ((state: State) => JSX.ClassValue), state: State): JSX.ClassValue {
  return typeof value === 'function' ? value(state) : value;
}
export { resolveClass as resolveClassName };
