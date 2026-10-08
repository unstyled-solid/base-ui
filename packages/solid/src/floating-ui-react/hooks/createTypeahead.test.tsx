import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, fireEvent, advanceTimers } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createTypeahead } from './createTypeahead';
it('createTypeahead cycles repeated letters, skips disabled labels and ignores composition', async () => {
  vi.useFakeTimers();
  const matches: number[] = [];
  const view = await createRenderer().renderProps((props: { enabled: boolean }) => {
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined } });
    const typeahead = createTypeahead(root, { listRef: { current: ['Blue', 'Black', 'Brown'] }, activeIndex: 0, disabledIndices: [1],
      get enabled() { return props.enabled; }, onMatch: (index) => matches.push(index) });
    return <button {...typeahead.reference}>Type</button>;
  }, { enabled: true });
  const node = view.getByRole('button');
  fireEvent.keyDown(node, { key: 'b' });
  fireEvent.keyDown(node, { key: 'b' });
  expect(matches).toEqual([2, 0]);
  fireEvent.keyDown(node, { key: 'b', isComposing: true });
  expect(matches).toEqual([2, 0]);
  await view.setProps({ enabled: false });
  await advanceTimers(750);
  expect(matches).toEqual([2, 0]);
});

it('keeps multiword typing across active-index changes and resets it on close', async () => {
  const matches: number[] = [], typing: boolean[] = [];
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    const [active, setActive] = createSignal<number | null>(null);
    const root = createFloatingRoot({ state: { get open() { return props.open; }, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined } });
    const typeahead = createTypeahead(root, { listRef: { current: ['Item One', 'Item Two', 'Item Three'] },
      disabledIndices: [1], get activeIndex() { return active(); },
      onMatch(index) { matches.push(index); setActive(index); }, onTyping(value) { typing.push(value); } });
    return <button {...typeahead.floating}>Type</button>;
  }, { open: true });
  view.getByRole('button').focus();
  await view.user.keyboard('item t');
  expect(matches.at(-1)).toBe(2);
  expect(matches).not.toContain(1);
  expect(typing.at(-1)).toBe(true);
  await view.setProps({ open: false });
  expect(typing.at(-1)).toBe(false);
  await view.setProps({ open: true });
  await view.user.keyboard('i');
  expect(matches.at(-1)).toBe(0);
});
