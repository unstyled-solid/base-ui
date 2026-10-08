import { afterEach, expect, it, vi } from 'vitest';
import { browserCase } from '../../test/sourceCase';
import { getCssDimensions } from './getCssDimensions';
import { getElementTransform } from './getElementTransform';
import { getPseudoElementBounds, isMouseWithinBounds } from './getPseudoElementBounds';
import { getElementAtPoint } from './getElementAtPoint';
import { findScrollableTouchTarget, hasScrollableAncestor, isScrollableX, isScrollableY } from './scrollable';
import { platform } from './platform';
afterEach(() => { document.body.replaceChildren(); });
it('does not read pseudo-element styles in jsdom (source coordinates)', () => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => DOMRect.fromRect({ x: 100, y: 50, width: 20, height: 10 });
  const computedStyle = vi.spyOn(window, 'getComputedStyle');
  const jsdom = vi.spyOn(platform.env, 'jsdom', 'get').mockReturnValue(true);
  try {
    expect(getPseudoElementBounds(element)).toMatchObject({ left: 100, right: 120, top: 50, bottom: 60 });
    expect(computedStyle).not.toHaveBeenCalled();
  } finally { computedStyle.mockRestore(); jsdom.mockRestore(); }
});

it('allows up to 5px of mouse drift around element bounds (source coordinates)', () => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => DOMRect.fromRect({ x: 100, y: 50, width: 20, height: 10 });
  const jsdom = vi.spyOn(platform.env, 'jsdom', 'get').mockReturnValue(true);
  try {
    for (const [clientX, clientY, expected] of [
      [95, 55, true], [94, 55, false], [125, 55, true], [126, 55, false],
      [110, 45, true], [110, 44, false], [110, 65, true], [110, 66, false],
    ] as const) {
      expect(isMouseWithinBounds(new MouseEvent('mouseup', { clientX, clientY }), element)).toBe(expected);
    }
  } finally { jsdom.mockRestore(); }
});

browserCase({ source: 'packages/react/src/utils/getPseudoElementBounds.test.ts', case: 'includes pseudo-element bounds in browsers (source coordinates)', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const style = document.createElement('style');
  style.textContent = '.pseudo-element-bounds-test { position:absolute;left:100px;top:50px;width:20px;height:10px; } .pseudo-element-bounds-test::before { content:"";display:block;width:40px;height:30px; }';
  const element = document.createElement('div');
  element.className = 'pseudo-element-bounds-test';
  document.head.append(style); document.body.append(element);
  try {
    expect(getPseudoElementBounds(element)).toEqual({ left: 90, right: 130, top: 40, bottom: 70 });
  } finally { element.remove(); style.remove(); }
});
it('uses owner-realm computed dimensions; preserves fractional CSS when offsets agree', () => {
  const frame = document.createElement('iframe'); document.body.append(frame);
  const node = frame.contentDocument!.createElement('div'); frame.contentDocument!.body.append(node);
  node.style.width = '10.25px'; node.style.height = '20.25px';
  Object.defineProperties(node, { offsetWidth: { value: 10, configurable: true }, offsetHeight: { value: 20 } });
  expect(getCssDimensions(node)).toEqual({ width: 10.25, height: 20.25 });
  Object.defineProperty(node, 'offsetWidth', { value: 30 });
  expect(getCssDimensions(node)).toEqual({ width: 30, height: 20 });
});
it('handles empty SVG styles and transform matrix variants without global constructors', () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  expect(getCssDimensions(svg)).toEqual({ width: 0, height: 0 });
  const element = document.createElement('div');
  for (const [transform, expected] of [
    ['none', { x: 0, y: 0, scale: 1 }],
    ['matrix(0, 2, -2, 0, 10, 20)', { x: 10, y: 20, scale: 2 }],
    ['matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 15, 25, 0, 1)', { x: 15, y: 25, scale: 2 }],
  ] as const) {
    element.style.transform = transform;
    expect(getElementTransform(element, element.style)).toEqual(expected);
  }
});
it('jsdom pseudo-element fallback and inclusive five-pixel pointer tolerance', () => {
  const element = document.createElement('div');
  const rect = { x: 10, y: 20, top: 20, left: 10, right: 40, bottom: 60, width: 30, height: 40, toJSON() {} };
  element.getBoundingClientRect = () => rect;
  const computedStyle = vi.spyOn(window, 'getComputedStyle');
  const jsdom = vi.spyOn(platform.env, 'jsdom', 'get').mockReturnValue(true);
  try {
    expect(getPseudoElementBounds(element)).toBe(rect);
    expect(computedStyle).not.toHaveBeenCalled();
  } finally { computedStyle.mockRestore(); jsdom.mockRestore(); }
  expect(isMouseWithinBounds(new MouseEvent('mouseup', { clientX: 5, clientY: 15 }), element)).toBe(true);
  expect(isMouseWithinBounds(new MouseEvent('mouseup', { clientX: 4, clientY: 15 }), element)).toBe(false);
  for (const [clientX, clientY, expected] of [[45, 40, true], [46, 40, false], [20, 15, true], [20, 14, false], [20, 65, true], [20, 66, false]] as const) {
    expect(isMouseWithinBounds(new MouseEvent('mouseup', { clientX, clientY }), element)).toBe(expected);
  }
});
it('hit tests the supplied shadow root with its native receiver and handles missing APIs', () => {
  const root = document.createElement('div').attachShadow({ mode: 'open' });
  const target = document.createElement('button'); root.append(target);
  const elementFromPoint = vi.fn(function (this: ShadowRoot, x: number, y: number) {
    expect(this).toBe(root); expect([x, y]).toEqual([10, 20]); return target;
  });
  Object.defineProperty(root, 'elementFromPoint', { value: elementFromPoint });
  expect(getElementAtPoint(root, 10, 20)).toBe(target);
  expect(getElementAtPoint(null, 10, 20)).toBeNull();
  expect(getElementAtPoint(document.createElement('div'), 10, 20)).toBeNull();
});
it('scroll ancestry crosses slots and hosts, excludes root, and honors overflow intent', () => {
  const root = document.createElement('div'); const host = document.createElement('div');
  const target = document.createElement('button');
  host.attachShadow({ mode: 'open' }).append(document.createElement('slot'));
  host.append(target); root.append(host); document.body.append(root);
  host.style.overflowY = 'auto'; host.style.overflowX = 'scroll';
  Object.defineProperties(host, { clientHeight: { value: 10 }, scrollHeight: { value: 20 }, clientWidth: { value: 10 }, scrollWidth: { value: 10 } });
  expect(isScrollableY(host)).toBe(true); expect(isScrollableX(host)).toBe(false); expect(isScrollableX(host, true)).toBe(true);
  expect(hasScrollableAncestor(target, root, 'vertical')).toBe(true);
  expect(hasScrollableAncestor(target, host, 'vertical')).toBe(false);
  expect(findScrollableTouchTarget(target, root)).toBe(host);
  expect(findScrollableTouchTarget(null, host)).toBe(host);
});
browserCase({ source: 'packages/react/src/utils/getCssDimensions.test.ts', case: 'reads CSS size of SVG', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '80'); svg.setAttribute('height', '24'); document.body.append(svg);
  expect(getCssDimensions(svg)).toEqual({ width: 80, height: 24 });
});
browserCase({ source: 'packages/react/src/utils/getPseudoElementBounds.test.ts', case: 'includes pseudo-element bounds in browsers, plus transforms and scroll layout', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const style = document.createElement('style');
  style.textContent = '#measure::before { content:""; width:80px; height:60px; position:absolute; }';
  const element = document.createElement('div'); element.id = 'measure';
  element.style.cssText = 'position:relative;width:40px;height:20px;transform:translate(10px,20px)';
  document.body.append(style, element);
  const rect = element.getBoundingClientRect();
  expect(getPseudoElementBounds(element)).toEqual({ left: rect.left - 20, right: rect.right + 20, top: rect.top - 20, bottom: rect.bottom + 20 });
  expect(getElementTransform(element)).toEqual({ x: 10, y: 20, scale: 1 });
  const scroll = document.createElement('div'); scroll.style.cssText = 'height:20px;overflow-y:auto';
  const host = document.createElement('div'); host.style.height = '100px';
  const button = document.createElement('button'); host.attachShadow({ mode: 'open' }).append(button); scroll.append(host); document.body.append(scroll);
  expect(isScrollableY(scroll)).toBe(true); expect(findScrollableTouchTarget(button, document.body)).toBe(scroll);
});
