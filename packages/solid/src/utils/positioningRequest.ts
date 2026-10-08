/** Private per-computation guard carried through Floating UI middleware state. */
export const POSITIONING_REQUEST = Symbol('Base UI positioning request');
export function isPositioningRequestCurrent(state: object): boolean {
  const current = Reflect.get(state, POSITIONING_REQUEST);
  return typeof current !== 'function' || current();
}
