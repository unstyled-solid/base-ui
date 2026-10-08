import type { StyleValue } from '../internals/contracts/render';
export function resolveStyle<State>(value: StyleValue | ((state: State) => StyleValue), state: State): StyleValue {
  return typeof value === 'function' ? value(state) : value;
}
