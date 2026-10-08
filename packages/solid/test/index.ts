export { screen, within, fireEvent, createEvent, waitFor, isInaccessible } from '@testing-library/dom';
export { createRenderer, cleanup } from './createRenderer';
export type { BaseUIRenderResult, RenderOptions } from './createRenderer';
export { describeConformance } from './describeConformance';
export { popupConformanceTests } from './popupConformanceTests';
export { enterWithMouse, moveMouse, firePointer } from './pointer';
export * from './wait';
export { expectDiagnostic } from '../../../test/harness/diagnostics';
export { sourceCase, browserCase } from './sourceCase';
export { createTestInteractions } from './createTestInteractions';
export { resetBrowserPointer } from './resetBrowserPointer';
export { fetchSSRFixture, hydrateSSRFixture, mountSSRFixtureHTML } from './ssrFixture';
export type { SSRFixtureRequest } from './ssrFixture';
export { prepareNativeDocument, isNativeDocumentLane } from './nativeDocument';
export const isJSDOM = typeof window !== 'undefined' && /jsdom/.test(window.navigator.userAgent);
export type IfEquals<T, U, Y = unknown, N = never> =
  (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? Y : N;
export function expectType<Expected, Actual>(_actual: IfEquals<Actual, Expected, Actual>): void {}
/** Native RC13 refs are callbacks/arrays, never React current objects. Returns are ignored. */
export function mergeRefs<T extends Element>(...refs: JSX.Ref<T>[]) {
  function apply(ref: JSX.Ref<T>, node: T) {
    if (typeof ref === 'function') ref(node);
    else if (Array.isArray(ref)) for (const entry of ref) apply(entry, node);
    // Assignment refs are compiled at the caller. A node value is not a callback.
  }
  return (node: T | null) => { if (node) for (const ref of refs) apply(ref, node); };
}
import type { JSX } from '@solidjs/web';
