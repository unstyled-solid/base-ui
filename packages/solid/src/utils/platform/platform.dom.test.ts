import { afterEach, expect, it, vi } from 'vitest';
import { platform } from './index';
afterEach(() => { vi.unstubAllGlobals(); });
it.each([
  ['MacIntel', 'Safari', 0, 'mac'], ['MacIntel', 'Safari', 5, 'ios'],
  ['iPhone', 'Safari', 0, 'ios'], ['Win32', 'Chrome/100', 0, 'windows'],
  ['Linux', 'Firefox', 0, 'linux'], ['Linux', 'Android', 0, 'android'],
] as const)('source platform classification: %s %s', (os, userAgent, maxTouchPoints, expected) => {
  vi.stubGlobal('navigator', { platform: os, userAgent, maxTouchPoints });
  expect(platform.os[expected]).toBe(true);
  expect(platform.os.mac && platform.os.ios).toBe(false);
  expect(platform.screenReader.voiceOver).toBe(platform.os.apple);
});
it('uses development UA data and exclusive engine detection; SSR flags are false', () => {
  vi.stubGlobal('navigator', { userAgentData: { brands: [{ brand: 'Chromium', version: '100' }], platform: 'Windows' } });
  vi.stubGlobal('CSS', { supports: () => false });
  expect(platform.engine.blink).toBe(true); expect(platform.os.windows).toBe(true);
  vi.stubGlobal('CSS', { supports: () => true });
  expect(platform.engine.webkit).toBe(true); expect(platform.engine.blink).toBe(false); expect(platform.engine.gecko).toBe(false);
  vi.stubGlobal('navigator', undefined); vi.stubGlobal('CSS', undefined);
  expect(Object.values(platform.os).every((value) => !value)).toBe(true);
  expect(Object.values(platform.engine).every((value) => !value)).toBe(true);
  expect(platform.env.jsdom).toBe(false);
  expect(platform.mediaQuery.iOS).toBe('@supports (-webkit-touch-callout: none)');
});
