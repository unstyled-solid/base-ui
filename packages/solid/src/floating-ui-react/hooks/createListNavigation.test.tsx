import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, advanceTimers, waitFor } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createListNavigation, type UseListNavigationReturn } from './createListNavigation';
it('createListNavigation drops closed imperative requests and carries same-turn navigation proposals', async () => {
  vi.useFakeTimers();
  let api!: UseListNavigationReturn;
  const changes: (number | null)[] = [], opens = vi.fn();
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    const [floating, setFloating] = createSignal<HTMLElement | null>(null), [index, setIndex] = createSignal<number | null>(null);
    const listRef = { current: [] as (HTMLElement | null)[] };
    const root = createFloatingRoot({ state: { get open() { return props.open; }, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null, get floatingElement() { return floating(); }, floatingId: undefined }, onOpenChange: opens });
    api = createListNavigation(root, { listRef, get activeIndex() { return index(); }, virtual: true, focusItemOnOpen: false,
      onNavigate(next) { changes.push(next); setIndex(next); } });
    return <div ref={setFloating}><button ref={(node) => { listRef.current[0] = node; }}>First</button><button disabled ref={(node) => { listRef.current[1] = node; }}>Skip</button><button ref={(node) => { listRef.current[2] = node; }}>Last</button></div>;
  }, { open: false });
  api.highlightItem('last');
  expect(changes).toEqual([]);
  expect(opens).not.toHaveBeenCalled();
  await view.setProps({ open: true });
  api.highlightItem('next'); api.highlightItem('next');
  expect(changes).toEqual([0, 2]);
  api.highlightItem('none');
  expect(changes).toEqual([0, 2, null]);
  view.unmount();
  await advanceTimers(0);
});

// useListNavigation.test.tsx / SelectRoot.test.tsx: selected registration can
// arrive after opening; subsequent navigation is independent of selection.
it('synchronizes a late selection once and preserves committed keyboard focus', async () => {
  const changes: (number | null)[] = [];
  const view = await createRenderer().renderProps<{ selected: number | null; open: boolean }>((props) => {
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const [index, setIndex] = createSignal<number | null>(null);
    const listRef = { current: [] as (HTMLElement | null)[] };
    const root = createFloatingRoot({ state: { get open() { return props.open; }, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null,
      get floatingElement() { return floating(); }, floatingId: undefined } });
    const navigation = createListNavigation(root, { listRef, get activeIndex() { return index(); },
      get selectedIndex() { return props.selected; },
      onNavigate(next) { changes.push(next); setIndex(next); } });
    return <div ref={setFloating} {...navigation.floating}>
      <button ref={node => { listRef.current[0] = node; }} {...navigation.item}>First</button>
      <button ref={node => { listRef.current[1] = node; }} {...navigation.item}>Second</button>
      <button ref={node => { listRef.current[2] = node; }} {...navigation.item}>Third</button>
    </div>;
  }, { selected: null, open: true });
  await view.setProps({ selected: 0 });
  await waitFor(() => expect(view.getByText('First')).toHaveFocus());
  await view.user.keyboard('{ArrowDown}{ArrowDown}');
  expect(view.getByText('Third')).toHaveFocus();
  expect(changes).toEqual([0, 1, 2]);
  await view.setProps({ selected: 1 });
  await waitFor(() => expect(view.getByText('Second')).toHaveFocus());
  await view.setProps({ open: false });
  expect(changes).toEqual([0, 1, 2, 1, null]);
});
