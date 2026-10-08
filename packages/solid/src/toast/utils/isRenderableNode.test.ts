import { describe, expect, it } from 'vitest';
import { hasRenderableChildren, isRenderableNode } from './isRenderableNode';
// Exact pure source intent; JSX/DOM replaces React element inspection.
describe('Toast isRenderableNode', () => {
  it('treats renderable primitives as content', () => {
    for (const value of [0, 0n, Number.NaN, 'text']) expect(isRenderableNode(value)).toBe(true);
  });
  it('treats non-rendering values as empty', () => {
    for (const value of [null, undefined, true, false, '']) expect(isRenderableNode(value)).toBe(false);
  });
  it('recurses into arrays', () => {
    for (const value of [[], [null, undefined, false], [[null]]]) expect(isRenderableNode(value)).toBe(false);
    for (const value of [[null, 0], [[0]]]) expect(isRenderableNode(value)).toBe(true);
  });
  it('requires a host whose native children are renderable', () => {
    const host = document.createElement('div');
    expect(hasRenderableChildren(host)).toBe(false);
    host.append(document.createComment('hydration marker')); expect(hasRenderableChildren(host)).toBe(false);
    host.append(document.createTextNode('0')); expect(hasRenderableChildren(host)).toBe(true);
    host.textContent = 'text'; expect(hasRenderableChildren(host)).toBe(true);
    host.replaceChildren(document.createElement('span')); expect(hasRenderableChildren(host)).toBe(true);
    expect(hasRenderableChildren(null)).toBe(false);
  });
});
