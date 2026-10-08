import { expect, it } from 'vitest';
import { createRenderer } from '../../../../test';
import { CompositeList } from './CompositeList';
import { createCompositeListItem } from './createCompositeListItem';

it('cleans up refs on unmount', async () => {
  const elements = { current: [] as (HTMLElement | null)[] };
  const labels = { current: [] as (string | null)[] };
  function Item() {
    const item = createCompositeListItem();
    return <div ref={item.ref} />;
  }
  const view = await createRenderer().render(() =>
    <CompositeList elementsRef={elements} labelsRef={labels}><Item /><Item /><Item /></CompositeList>);
  expect(elements.current).toHaveLength(3);
  expect(labels.current).toHaveLength(3);
  view.unmount();
  expect(elements.current).toHaveLength(0);
  expect(labels.current).toHaveLength(0);
});

it('does not register negative explicit indexes', async () => {
  const elements = { current: [] as (HTMLElement | null)[] };
  function Item() {
    const item = createCompositeListItem({ index: -1 });
    return <div ref={item.ref}>item</div>;
  }
  await createRenderer().render(() => <CompositeList elementsRef={elements}><Item /></CompositeList>);
  expect(elements.current).toHaveLength(0);
  expect(Object.hasOwn(elements.current, '-1')).toBe(false);
});

it('resolves each label source', async () => {
  const elements = { current: [] as (HTMLElement | null)[] };
  const labels = { current: [] as (string | null)[] };
  function Item(props: { label?: string | null; text: string; useTextRef?: boolean }) {
    const textRef = { current: null as HTMLElement | null };
    const item = createCompositeListItem({ get label() { return props.label; },
      textRef: props.useTextRef ? textRef : undefined });
    return <div ref={item.ref}><span ref={(node) => { textRef.current = node; }}>{props.text}</span>{props.useTextRef ? '-ignored' : ''}</div>;
  }
  await createRenderer().render(() => <CompositeList elementsRef={elements} labelsRef={labels}>
    <Item label="explicit label" text="ignored" />
    <Item label={null} text="not a label" />
    <Item useTextRef text="from text ref" />
    <Item text="from element" />
  </CompositeList>);
  expect(labels.current).toEqual(['explicit label', null, 'from text ref', 'from element']);
});

it('CompositeList publishes an initial empty map and updates a lone live text label', async () => {
  const elements = { current: [] as (HTMLElement | null)[] }, labels = { current: [] as (string | null)[] };
  const sizes: number[] = [];
  function Item(props: { label: string }) {
    const item = createCompositeListItem();
    return <button ref={item.ref}>{props.label}</button>;
  }
  const view = await createRenderer().renderProps((props: { visible: boolean; label: string }) =>
    <CompositeList elementsRef={elements} labelsRef={labels} onMapChange={(map) => sizes.push(map.size)}>{props.visible && <Item label={props.label} />}</CompositeList>,
  { visible: false, label: 'before' });
  expect(sizes).toEqual([0]);
  await view.setProps({ visible: true }); expect(labels.current).toEqual(['before']);
  const element = view.getByRole('button');
  await view.setProps({ label: 'after' }); await Promise.resolve();
  expect(labels.current).toEqual(['after']); expect(view.getByRole('button')).toBe(element);
  await view.setProps({ visible: false }); expect(elements.current).toEqual([]); expect(sizes.at(-1)).toBe(0);
});

it('CompositeListItem is inert outside a list rather than requiring a shared mutable context', async () => {
  await createRenderer().render(() => {
    const item = createCompositeListItem();
    return <output ref={item.ref}>{item.index === null ? 'unregistered' : item.index}</output>;
  }).then((view) => expect(view.getByRole('status')).toHaveTextContent('unregistered'));
});
