import { afterEach, expect, it } from 'vitest';
import { isElementVisible, isHiddenByStyles } from './visibility';
afterEach(() => { document.body.replaceChildren(); });
it('source composite visibility styles and fallback cases', () => {
  for (const [css, hidden, visible] of [
    ['visibility:hidden', true, false], ['visibility:collapse', true, false], ['', false, true],
    ['display:none', false, false], ['display:contents', false, false], ['content-visibility:hidden', false, true],
  ] as const) {
    const node = document.createElement('button'); node.style.cssText = css;
    Object.defineProperty(node, 'checkVisibility', { value: undefined }); document.body.append(node);
    expect(isHiddenByStyles(getComputedStyle(node))).toBe(hidden);
    expect(isElementVisible(node)).toBe(visible);
  }
  expect(isElementVisible(null)).toBe(false);
  expect(isElementVisible(document.createElement('button'))).toBe(false);
});
