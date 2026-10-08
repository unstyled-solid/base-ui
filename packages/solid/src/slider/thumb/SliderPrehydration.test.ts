import { expect, it, vi } from 'vitest';
import { script } from './prehydrationScript';
it.each(['horizontal', 'vertical'])('Slider prehydration sizes %s thumbs and range indicator using real DOM attributes', (orientation) => {
  const control = document.createElement('div');
  control.setAttribute('data-base-ui-slider-control', ''); control.setAttribute('data-orientation', orientation);
  const indicator = document.createElement('div'); indicator.setAttribute('data-base-ui-slider-indicator', ''); indicator.style.visibility = 'hidden';
  control.append(indicator);
  const thumbs = [30, 70].map((value) => {
    const thumb = document.createElement('div'); thumb.style.visibility = 'hidden';
    const input = document.createElement('input'); input.type = 'range'; input.setAttribute('value', String(value));
    input.setAttribute('min', '0'); input.setAttribute('max', '100'); thumb.append(input); control.append(thumb);
    vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 10, 10));
    return thumb;
  });
  const element = document.createElement('script'); thumbs[1].append(element);
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
  const current = vi.spyOn(document, 'currentScript', 'get').mockReturnValue(element);
  try {
    // Execute the same serialized server body; no component/import stubs.
    Function(script)();
    expect(thumbs[0].style.getPropertyValue('--position')).toBe('32%');
    expect(thumbs[1].style.getPropertyValue('--position')).toBe('68%');
    expect(indicator.style.getPropertyValue('--relative-size')).toBe('36%');
    expect(indicator.style.visibility).toBe('');
  } finally { current.mockRestore(); }
});
it('Slider prehydration safely ignores a detached script', () => { expect(() => Function(script)()).not.toThrow(); });
