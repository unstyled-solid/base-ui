import { beforeEach, afterEach, expect } from 'vitest';

/** Native layout fixtures need a 1:1 CSS-pixel tester, rather than Vitest's
 * scaled mobile preview. Scope the real parent CSS change to the calling file. */
export function useUnscaledBrowserFrame() {
  let host: HTMLElement | null = null;
  let transform = '';
  beforeEach(() => {
    const frame = window.frameElement as HTMLIFrameElement | null;
    host = frame?.parentElement ?? null;
    if (!host || !frame) return;
    transform = host.style.transform;
    host.style.transform = 'none';
    expect(frame.getBoundingClientRect().width).toBe(frame.offsetWidth);
  });
  afterEach(() => { if (host) host.style.transform = transform; host = null; });
}
