import type { StateAttributesMapping } from './contracts/render';
export type { StateAttributesMapping } from './contracts/render';
export function getStateAttributesProps<State extends Record<string, unknown>>(state: State, mapping?: StateAttributesMapping<State>) {
  const result: Record<string, string> = {};
  for (const key in state) {
    // Omitted render-only state must not invalidate unrelated DOM bindings.
    if (mapping && Object.hasOwn(mapping, key) && mapping[key] === null) continue;
    const value = state[key];
    if (mapping && Object.hasOwn(mapping, key)) {
      const custom = mapping[key]!(value);
      if (custom != null) Object.assign(result, custom);
    } else if (value === true) result[`data-${key.toLowerCase()}`] = '';
    else if (value) result[`data-${key.toLowerCase()}`] = String(value);
  }
  return result;
}
