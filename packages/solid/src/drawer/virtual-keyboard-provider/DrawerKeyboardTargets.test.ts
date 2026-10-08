import { describe, expect, it } from 'vitest';
import { isKeyboardInputElement, resolveKeyboardInputTarget, overrideGeometryDuringFocus } from './keyboardTargets';

describe('Drawer keyboard targets', () => {
  it.each(['email', 'number', 'password', 'search', 'tel', 'text', 'url'])('accepts enabled %s fields', type => {
    const input = document.createElement('input'); input.type = type;
    expect(isKeyboardInputElement(input)).toBe(true);
    input.disabled = true;
    expect(isKeyboardInputElement(input)).toBe(false);
  });
  it.each(['date', 'time', 'color', 'range', 'checkbox', 'radio', 'file', 'button'])('preserves native %s picker/control taps', type => {
    const input = document.createElement('input'); input.type = type;
    expect(isKeyboardInputElement(input)).toBe(false);
  });
  it('preserves disabled textarea and fieldset controls', () => {
    const fieldset = document.createElement('fieldset'); fieldset.disabled = true;
    const textarea = document.createElement('textarea'); fieldset.append(textarea);
    expect(isKeyboardInputElement(textarea)).toBe(false);
  });
  it.each(['explicit', 'implicit'])('resolves %s labels', kind => {
    const root = document.createElement('div');
    root.innerHTML = kind === 'explicit' ? '<label for="drawer-field"><span>Field</span></label><input id="drawer-field">' : '<label><span>Field</span><input></label>';
    document.body.append(root);
    try { expect(resolveKeyboardInputTarget(root.querySelector('span'))).toBe(root.querySelector('input')); } finally { root.remove(); }
  });
  it('restores exact inline focus geometry', () => {
    const input = document.createElement('input');
    input.style.opacity = '0.7'; input.style.transform = 'translateX(2px)'; input.style.transition = 'opacity 1s';
    const restore = overrideGeometryDuringFocus(input, -2000);
    expect(input.style.transform).toBe('translateY(-2000px)');
    restore();
    expect(input.style.opacity).toBe('0.7'); expect(input.style.transform).toBe('translateX(2px)'); expect(input.style.transition).toBe('opacity 1s');
  });
});
