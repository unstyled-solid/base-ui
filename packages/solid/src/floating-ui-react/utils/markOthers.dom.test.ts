import { afterEach, expect, it } from 'vitest';
import { markOthers } from './markOthers';
afterEach(() => { document.body.replaceChildren(); });
function fixture() {
  const keep = document.createElement('div'); const outside = document.createElement('div');
  document.body.append(keep, outside); return { keep, outside };
}
it.each([false, true])('source overlapping locks; out-of-order cleanup=%s', (reverse) => {
  const { keep, outside } = fixture();
  const first = markOthers([keep], { ariaHidden: true });
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  const next = document.createElement('div'); document.body.append(next);
  const second = markOthers([next], { ariaHidden: true });
  expect(keep.getAttribute('aria-hidden')).toBe('true');
  expect(next.getAttribute('aria-hidden')).toBeNull();
  const disposers = reverse ? [first, second] : [second, first];
  disposers[0]();
  expect(next.getAttribute('aria-hidden')).toBeNull();
  expect(keep.getAttribute('aria-hidden')).toBe(reverse ? 'true' : null);
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  disposers[1]();
  expect(outside.getAttribute('aria-hidden')).toBeNull();
  expect(keep.getAttribute('aria-hidden')).toBeNull();
  expect(next.getAttribute('aria-hidden')).toBeNull();
});
it('source multiple calls removes the next target before releasing its lock', () => {
  const { keep, outside } = fixture();
  const first = markOthers([keep], { ariaHidden: true });
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  const next = document.createElement('div'); document.body.append(next);
  const second = markOthers([next], { ariaHidden: true });
  expect(keep.getAttribute('aria-hidden')).toBe('true');
  expect(next.getAttribute('aria-hidden')).toBeNull();
  next.remove(); second();
  expect(keep.getAttribute('aria-hidden')).toBeNull();
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  first(); expect(outside.getAttribute('aria-hidden')).toBeNull();
  document.body.append(next);
});
it('source differing controlAttribute leaves a marker-only lock after aria cleanup', () => {
  const { keep, outside } = fixture();
  const first = markOthers([keep], { ariaHidden: true });
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  const next = document.createElement('div'); document.body.append(next);
  const second = markOthers([next]);
  expect(keep.getAttribute('aria-hidden')).not.toBe('true');
  expect(keep.getAttribute('data-base-ui-inert')).toBe('');
  first(); expect(outside.getAttribute('aria-hidden')).toBeNull();
  second(); expect(keep.getAttribute('data-base-ui-inert')).toBeNull();
});
it('source keeps aria and marker until the last aria lock releases alongside marker-only locks', () => {
  const outside = document.createElement('div');
  const a = document.createElement('div'), b = document.createElement('div'), c = document.createElement('div');
  document.body.append(outside, a, b, c);
  const releaseA = markOthers([a], { ariaHidden: true });
  const releaseB = markOthers([b], { ariaHidden: true });
  const releaseC = markOthers([c]);
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  expect(outside.getAttribute('data-base-ui-inert')).toBe('');
  releaseC();
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  expect(outside.getAttribute('data-base-ui-inert')).toBe('');
  releaseB();
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  expect(outside.getAttribute('data-base-ui-inert')).toBe('');
  releaseA();
  expect(outside.hasAttribute('aria-hidden')).toBe(false);
  expect(outside.hasAttribute('data-base-ui-inert')).toBe(false);
});
it('source mark-only overlap releases marker before control without disturbing bookkeeping', () => {
  const { keep, outside } = fixture();
  const marker = markOthers([keep], { mark: true });
  const control = markOthers([keep], { ariaHidden: true, mark: false });
  expect(outside).toHaveAttribute('data-base-ui-inert');
  expect(outside).toHaveAttribute('aria-hidden', 'true');
  marker();
  expect(outside).not.toHaveAttribute('data-base-ui-inert');
  expect(outside).toHaveAttribute('aria-hidden', 'true');
  control();
  expect(outside).not.toHaveAttribute('data-base-ui-inert');
  expect(outside).not.toHaveAttribute('aria-hidden');
});
it.each([null, 'false', 'true', '', 'external'])('restores exact aria-hidden and marker originals: %s', (original) => {
  const { keep, outside } = fixture();
  if (original !== null) { outside.setAttribute('aria-hidden', original); outside.setAttribute('data-base-ui-inert', original); }
  const first = markOthers([keep], { ariaHidden: true });
  const second = markOthers([keep], { ariaHidden: true });
  first(); first();
  expect(outside.getAttribute('data-base-ui-inert')).toBe('');
  second();
  expect(outside.getAttribute('aria-hidden')).toBe(original);
  expect(outside.getAttribute('data-base-ui-inert')).toBe(original);
});
it('source independent control/marker counters across three consumers', () => {
  const { keep, outside } = fixture();
  const first = markOthers([keep], { ariaHidden: true });
  const second = markOthers([keep], { ariaHidden: true, mark: false });
  const third = markOthers([keep]);
  third(); first();
  expect(outside.hasAttribute('data-base-ui-inert')).toBe(false);
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  second(); expect(outside.hasAttribute('aria-hidden')).toBe(false);
});
it('source marker-only overlap never disturbs control cleanup', () => {
  const { keep, outside } = fixture();
  const marker = markOthers([keep]);
  const control = markOthers([keep], { ariaHidden: true, mark: false });
  control(); expect(outside.hasAttribute('aria-hidden')).toBe(false);
  expect(outside.hasAttribute('data-base-ui-inert')).toBe(true);
  marker(); expect(outside.hasAttribute('data-base-ui-inert')).toBe(false);
});
it.each([false, true])('source rereads external ownership after release; unrelated held lock=%s', (held) => {
  const { keep, outside } = fixture();
  const releaseHeld = held ? markOthers([keep, outside], { ariaHidden: true }) : () => {};
  for (const original of [null, 'true', null]) {
    if (original === null) outside.removeAttribute('aria-hidden'); else outside.setAttribute('aria-hidden', original);
    const release = markOthers([keep], { ariaHidden: true }); release();
    expect(outside.getAttribute('aria-hidden')).toBe(original);
  }
  releaseHeld();
});
it('source live regions, their ancestors and scripts remain exposed, but live siblings hide', () => {
  const { keep } = fixture();
  const wrapper = document.createElement('div'); const live = document.createElement('div');
  const sibling = document.createElement('div'); const script = document.createElement('script');
  live.setAttribute('aria-live', 'polite'); wrapper.append(live, sibling); document.body.append(wrapper, script);
  const cleanup = markOthers([keep], { ariaHidden: true });
  expect(wrapper.hasAttribute('aria-hidden')).toBe(false); expect(live.hasAttribute('aria-hidden')).toBe(false);
  expect(script.hasAttribute('aria-hidden')).toBe(false); expect(sibling.getAttribute('aria-hidden')).toBe('true');
  expect(wrapper.hasAttribute('data-base-ui-inert')).toBe(true);
  cleanup(); expect(sibling.hasAttribute('aria-hidden')).toBe(false);
});
it('source shadow anchor traversal, nested hosts, detached targets and iframe ownership', () => {
  const frame = document.createElement('iframe'); document.body.append(frame);
  const doc = frame.contentDocument!; const host = doc.createElement('div'); const outside = doc.createElement('div');
  const inner = doc.createElement('span'); const anchor = doc.createElement('a'); const target = doc.createElement('button');
  host.attachShadow({ mode: 'open' }).append(inner); inner.attachShadow({ mode: 'open' }).append(anchor); anchor.append(target);
  doc.body.append(host, outside);
  const cleanup = markOthers([target, doc.createElement('div')], { ariaHidden: true });
  expect(host.hasAttribute('aria-hidden')).toBe(false); expect(outside.getAttribute('aria-hidden')).toBe('true');
  expect(frame.hasAttribute('aria-hidden')).toBe(false);
  outside.remove(); cleanup(); expect(outside.hasAttribute('aria-hidden')).toBe(false);
});
