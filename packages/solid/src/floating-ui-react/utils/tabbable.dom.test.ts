import { afterEach, expect, it } from 'vitest';
import { browserCase } from '../../../test/sourceCase';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { disableFocusInside, enableFocusInside, focusable, getNextTabbable, getPreviousTabbable, getTabbableNearElement, isOutsideEvent, isTabbable, tabbable } from './tabbable';
afterEach(() => { document.body.replaceChildren(); });
function setup(html: string) { document.body.innerHTML = html; return document.body; }
function ids(elements: Element[]) { return elements.map((element) => element.id); }

it.each([
  ['basic and hidden inputs', '<button id="b"></button><input id="i"><input type="hidden">', ['b', 'i']],
  ['embedded controls', '<iframe id="frame"></iframe>', ['frame']],
  ['disabled controls', '<button id="b"></button><button disabled></button>', ['b']],
  ['closed details', '<details><summary id="s">Summary</summary><button></button></details>', ['s']],
  ['first summary and summaryless details', '<details><summary id="closed">closed</summary><button></button></details><details open><summary id="open">open</summary><summary>ignored</summary><button id="b"></button></details><details id="empty">summaryless</details>', ['closed', 'open', 'b', 'empty']],
  ['aria disabled', '<div tabindex="0" aria-disabled="true" id="aria"></div>', ['aria']],
  ['visibility hidden', '<button style="visibility:hidden"></button>', []],
  ['display contents ancestor', '<div style="display:contents"><button id="b"></button></div>', ['b']],
  ['hidden contents ancestor', '<div style="display:contents;visibility:hidden"><button></button></div>', []],
  ['visibility override', '<div style="visibility:hidden"><button id="b" style="visibility:visible"></button></div>', ['b']],
  ['display none ancestor', '<div style="display:none"><button></button></div>', []],
  ['checked radio', '<input type="radio" name="group"><input type="radio" name="group" checked id="checked"><button id="b"></button>', ['checked', 'b']],
  ['first unchecked radio', '<input type="radio" name="group" id="first"><input type="radio" name="group">', ['first']],
  ['separate forms', '<form><input type="radio" name="group" id="one"></form><form><input type="radio" name="group" id="two"></form>', ['one', 'two']],
  ['disabled fieldset and first legend', '<fieldset disabled><legend><button id="legend"></button></legend><button></button></fieldset>', ['legend']],
] as const)('source tabbable: %s', (name, html, expected) => {
  const body = setup(html);
  expect(ids(tabbable(body))).toEqual(expected);
  if (name === 'aria disabled') expect(isTabbable(body.querySelector('#aria'))).toBe(true);
  if (name === 'visibility hidden' || name === 'hidden contents ancestor' || name === 'display none ancestor') {
    expect(isTabbable(body.querySelector('button'))).toBe(false);
  }
  if (name === 'visibility override') expect(isTabbable(body.querySelector('#b'))).toBe(true);
});

it.each(['shadow', 'slot', 'fallback'] as const)('source composed order and non-tabbable anchor: %s', (kind) => {
  const before = document.createElement('button');
  const after = document.createElement('button');
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const anchor = document.createElement('button');
  anchor.tabIndex = -1;
  const unslotted = document.createElement('button');
  if (kind === 'slot') { root.append(document.createElement('slot')); host.append(anchor); }
  else if (kind === 'fallback') { const slot = document.createElement('slot'); slot.append(anchor); root.append(slot); }
  else { root.append(anchor); host.append(unslotted); }
  document.body.append(before, host, after);
  expect(getTabbableNearElement(anchor, -1)).toBe(before);
  expect(getTabbableNearElement(anchor, 1)).toBe(after);
  expect(tabbable(document.body)).toEqual([before, after]);
  expect(anchor.tabIndex).toBe(-1);
  expect(focusable(document.body)).toContain(anchor);
  anchor.tabIndex = 0;
  expect(tabbable(document.body)).toEqual([before, anchor, after]);
  expect(tabbable(document.body)).not.toContain(unslotted);
});
it('source slotted controls inherit inert shadow ancestors', () => {
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' }).innerHTML = '<div inert><slot></slot></div>';
  host.append(document.createElement('button'));
  document.body.append(host);
  expect(tabbable(document.body)).toEqual([]);
});
it.each([false, true])('source display:contents candidates with checkVisibility available=%s', (available) => {
  const button = document.createElement('button');
  button.style.display = 'contents';
  Object.defineProperty(button, 'checkVisibility', { value: available ? () => false : undefined });
  document.body.append(button);
  expect(isTabbable(button)).toBe(false);
  expect(tabbable(document.body)).not.toContain(button);
});
it('source display:contents ancestor checkVisibility is not used to hide descendants', () => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'contents';
  Object.defineProperty(wrapper, 'checkVisibility', { value: () => false });
  const button = document.createElement('button');
  wrapper.append(button); document.body.append(wrapper);
  expect(isTabbable(button)).toBe(true);
  expect(tabbable(document.body)).toContain(button);
});
it.each([visuallyHidden, visuallyHiddenInput])('source visually hidden style stays tabbable', (style) => {
  const input = document.createElement('input'); input.type = 'checkbox';
  for (const [name, value] of Object.entries(style)) input.style.setProperty(name, String(value));
  document.body.append(input);
  expect(isTabbable(input)).toBe(true);
  expect(tabbable(document.body)).toContain(input);
  expect(input.style.width).toBe('1px');
});
it.each([[false, 1], [false, -1], [true, 1], [true, -1]] as const)(
  'source disabled radio anchor checked=%s direction=%s never suppresses peer', (checked, direction) => {
    const anchor = document.createElement('input');
    const peer = document.createElement('input');
    const other = document.createElement('button');
    anchor.type = peer.type = 'radio'; anchor.name = peer.name = 'group';
    anchor.disabled = true; anchor.checked = checked;
    document.body.append(...(direction === 1 ? [anchor, peer, other] : [other, peer, anchor]));
    expect(tabbable(document.body)).toEqual(direction === 1 ? [peer, other] : [other, peer]);
    expect(getTabbableNearElement(anchor, direction)).toBe(peer);
    expect(getTabbableNearElement(anchor, direction === 1 ? -1 : 1)).toBe(other);
  },
);
it('source disabled/detached anchors, exclusion and focus neighbors', () => {
  setup('<button id="before"></button><button disabled id="anchor"></button><button id="after"></button>');
  const before = document.querySelector<HTMLButtonElement>('#before')!;
  const anchor = document.querySelector<HTMLButtonElement>('#anchor')!;
  const after = document.querySelector<HTMLButtonElement>('#after')!;
  expect(getTabbableNearElement(anchor, -1)).toBe(before);
  expect(getTabbableNearElement(anchor, 1)).toBe(after);
  expect(getTabbableNearElement(anchor, 1, after)).toBe(before);
  expect(getTabbableNearElement(document.createElement('button'), 1)).toBeNull();
  expect(getTabbableNearElement(document.createElement('button'), -1)).toBeNull();
  expect(getTabbableNearElement(null, -1)).toBeNull();
  before.focus(); expect(getNextTabbable(before)).toBe(after);
  after.focus(); expect(getPreviousTabbable(after)).toBe(before);
  expect(getNextTabbable(after)).toBe(after);
  expect(isOutsideEvent(new FocusEvent('focusout', { relatedTarget: after }), document.body)).toBe(false);
  expect(isOutsideEvent(new FocusEvent('focusout'), document.body)).toBe(true);
});
it('overlapping focus locks restore exact attributes, including moved and SVG nodes', () => {
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  const button = document.createElement('button');
  button.setAttribute('tabindex', ''); button.setAttribute('data-tabindex', 'external');
  // Empty tabindex is not consistently parsed across DOM implementations; a normal control
  // remains the source candidate and receives its native default tabIndex.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('tabindex', '0');
  inner.append(button, svg); outer.append(inner); document.body.append(outer);
  disableFocusInside(outer); disableFocusInside(inner);
  expect(svg.getAttribute('tabindex')).toBe('-1');
  enableFocusInside(outer);
  expect(svg.getAttribute('tabindex')).toBe('-1');
  document.body.append(svg);
  enableFocusInside(inner);
  expect(svg.getAttribute('tabindex')).toBe('0');
  expect(svg.hasAttribute('data-tabindex')).toBe(false);
  expect(button.getAttribute('tabindex')).toBe('');
  expect(button.getAttribute('data-tabindex')).toBe('external');
});

const source = 'packages/react/src/floating-ui-react/utils/tabbable.test.ts';
for (const [name, display, contentVisibility, expected] of [
  ['block content-visibility:hidden ancestor', 'block', 'hidden', false],
  ['contents content-visibility:hidden ancestor', 'contents', 'hidden', true],
  ['inline content-visibility:hidden ancestor', 'inline', 'hidden', true],
] as const) {
  browserCase({ source, case: name, environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
    const wrapper = document.createElement('div'); const button = document.createElement('button');
    wrapper.style.display = display; wrapper.style.setProperty('content-visibility', contentVisibility);
    wrapper.append(button); document.body.append(wrapper);
    expect(isTabbable(button)).toBe(expected);
    expect(tabbable(document.body).includes(button)).toBe(expected);
  });
}
browserCase({ source, case: 'visible descendants of display:contents in Chromium', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const wrapper = document.createElement('div'); const button = document.createElement('button');
  wrapper.style.display = 'contents'; wrapper.tabIndex = 0; wrapper.append(button); document.body.append(wrapper);
  expect(isTabbable(wrapper)).toBe(false); expect(isTabbable(button)).toBe(true);
  expect(tabbable(document.body)).toContain(button); expect(tabbable(document.body)).not.toContain(wrapper);
});
browserCase({ source, case: 'content-visibility:hidden candidate', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const button = document.createElement('button'); button.style.setProperty('content-visibility', 'hidden'); document.body.append(button);
  expect(isTabbable(button)).toBe(true); expect(tabbable(document.body)).toContain(button);
});
browserCase({ source, case: 'zero-size element', environment: 'browser', issue: 'bsolid-dom-browser-replay' }, () => {
  const element = document.createElement('div'); element.tabIndex = 0;
  Object.assign(element.style, { width: '0', height: '0', padding: '0', border: '0' }); document.body.append(element);
  expect(isTabbable(element)).toBe(true); expect(tabbable(document.body)).toContain(element);
});
