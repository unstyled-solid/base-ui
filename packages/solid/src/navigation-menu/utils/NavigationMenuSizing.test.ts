import { describe, it, expect } from 'vitest';
import { setSharedFixedSize, preserveClosingSize } from './setSharedFixedSize';
describe('NavigationMenu controlled close sizing', () => {
  it('preserves fixed positioner dimensions without measuring a collapsed popup', () => {
    const popup = document.createElement('nav'); const positioner = document.createElement('div');
    setSharedFixedSize(popup, positioner, 675, 220);
    popup.style.setProperty('--popup-width', '0px'); popup.style.setProperty('--popup-height', '0px');
    preserveClosingSize(popup, positioner);
    expect(popup.style.getPropertyValue('--popup-width')).toBe('675px');
    expect(popup.style.getPropertyValue('--popup-height')).toBe('220px');
  });
  it('does not replace a closing baseline with missing dimensions', () => {
    const popup = document.createElement('nav'); const positioner = document.createElement('div');
    popup.style.setProperty('--popup-width', '100px');
    positioner.style.setProperty('--positioner-width', '0px');
    preserveClosingSize(popup, positioner);
    expect(popup.style.getPropertyValue('--popup-width')).toBe('100px');
  });
});
