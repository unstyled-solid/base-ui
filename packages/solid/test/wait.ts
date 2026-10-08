import { flush } from 'solid-js';
import { vi, expect } from 'vitest';
import { waitFor } from '@testing-library/dom';

export const wait = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });
export const waitSingleFrame = () => new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });
/** One native microtask boundary, not all async IO and not a fake-timer advance. */
export async function flushMicrotasks() { await Promise.resolve(); }
export async function advanceTimers(ms: number) {
  if (!vi.isFakeTimers()) throw new Error('advanceTimers requires vi.useFakeTimers()');
  await vi.advanceTimersByTimeAsync(ms);
  flush();
}
export async function advanceFrame() {
  if (!vi.isFakeTimers()) throw new Error('advanceFrame requires vi.useFakeTimers()');
  vi.advanceTimersToNextFrame();
  flush();
  await Promise.resolve();
}
/** Observe real Web Animations promises. Never fabricate layout/animation completion in jsdom. */
export async function waitForAnimations(element: Element) {
  if (!element.getAnimations) throw new Error('Web Animations unavailable: retain this case for browser qualification');
  await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
}
export async function waitForPositioned(positioner: HTMLElement) {
  await waitFor(() => expect(positioner.style.opacity).not.toBe('0'));
  await waitFor(() => expect(positioner).toBeVisible());
}
