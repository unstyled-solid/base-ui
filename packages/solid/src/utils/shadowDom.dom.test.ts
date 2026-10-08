import { afterEach, describe, expect, it } from 'vitest';
import { activeElement, closest, contains, getTarget } from './shadowDom';
import { ownerDocument, ownerWindow } from './owner';
import { isHTMLElement } from './isHTMLElement';
import { isEventTargetWithin, isInteractiveElement } from '../floating-ui-react/utils/element';

afterEach(() => { document.body.replaceChildren(); });
describe('DOM composed tree (pinned shadowDom.test.ts plus realm fixtures)', () => {
  it('crosses nested roots from text nodes, resolves deepest focus, and contains hosts', () => {
    const button = document.createElement('button');
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    const input = document.createElement('input');
    const text = document.createTextNode('target');
    document.body.append(button);
    button.append(outer);
    outer.attachShadow({ mode: 'open' }).append(inner);
    inner.attachShadow({ mode: 'open' }).append(input, text);
    expect(closest(text, 'button')).toBe(button);
    expect(contains(button, input)).toBe(true);
    expect(contains(input, button)).toBe(false);
    expect(contains(null, input)).toBe(false);
    input.focus();
    expect(activeElement(document)).toBe(input);
    expect(isInteractiveElement(input)).toBe(true);
  });
  it('follows assigned slots for closest and contains', () => {
    const host = document.createElement('span');
    const target = document.createElement('span');
    const ancestor = document.createElement('div');
    ancestor.id = 'ancestor';
    ancestor.append(document.createElement('slot'));
    host.attachShadow({ mode: 'open' }).append(ancestor);
    host.append(target);
    document.body.append(host);
    expect(closest(target, '#ancestor')).toBe(ancestor);
    expect(contains(ancestor, target)).toBe(true);
    expect(contains(host, target)).toBe(true);
  });
  it('does not jump from detached nodes and preserves native selector errors', () => {
    const detached = document.createElement('div');
    expect(closest(detached, 'html')).toBeNull();
    expect(closest(null, 'button')).toBeNull();
    expect(() => closest(detached, '[')).toThrow();
  });
  it('uses composed targets during dispatch and native retargeting afterward', () => {
    const button = document.createElement('button');
    const host = document.createElement('span');
    const target = document.createElement('span');
    document.body.append(button);
    button.append(host);
    host.attachShadow({ mode: 'open' }).append(target);
    let observed: EventTarget | null = null;
    button.addEventListener('click', (event) => {
      observed = getTarget(event);
      expect(closest(observed as Node, 'button')).toBe(button);
      expect(isEventTargetWithin(event, target)).toBe(true);
    }, { once: true });
    const event = new Event('click', { bubbles: true, composed: true });
    target.dispatchEvent(event);
    expect(observed).toBe(target);
    expect(event.composedPath()).toEqual([]);
    expect(getTarget(event)).toBe(host);
    const ordinary = new Event('click');
    button.dispatchEvent(ordinary);
    expect(getTarget(ordinary)).toBe(button);
    const legacy = new Event('click');
    Object.setPrototypeOf(legacy, null);
    Object.defineProperty(legacy, 'target', { value: button });
    expect(getTarget(legacy)).toBe(button);
    expect(isEventTargetWithin(legacy, document.body)).toBe(true);
  });
  it('uses iframe-owned constructors, documents and windows', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const doc = frame.contentDocument!;
    const node = doc.createElement('button');
    doc.body.append(node);
    expect(node instanceof HTMLElement).toBe(false);
    expect(isHTMLElement(node)).toBe(true);
    expect(isHTMLElement(doc.createElementNS('http://www.w3.org/2000/svg', 'svg'))).toBe(false);
    expect(ownerDocument(node)).toBe(doc);
    expect(ownerDocument(doc)).toBe(doc);
    expect(ownerWindow(node)).toBe(frame.contentWindow);
    expect(closest(node, 'body')).toBe(doc.body);
  });
});
