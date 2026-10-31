import { expect, it, vi } from 'vitest';
import { createRenderer, flushMicrotasks } from '../../test';
import { createRenderedId, resolveRenderedId } from './resolveRenderedId';
import { createRenderElement } from './createRenderElement';
import { createSignal, runWithOwner, Show, untrack } from 'solid-js';

it('releases an ordinary signal owner-safely after fallback changes and disconnects its observer', async () => {
  let readOverride!: () => string | undefined;
  const published = vi.fn();
  const Host = (props: { fallback: string }) => {
    const [override, setOverride] = createSignal<string | undefined>(undefined);
    readOverride = override;
    const [, ref] = createRenderedId({}, () => props.fallback, (value) => {
      published(value);
      setOverride(value);
    });
    return <div ref={ref} id="rendered" data-testid="observed" />;
  };
  const view = await createRenderer().renderProps((props: { fallback: string; visible: boolean }) => (
    <Show when={props.visible}><Host fallback={props.fallback} /></Show>
  ), { fallback: 'initial', visible: true });
  const node = view.getByTestId('observed');
  expect(untrack(readOverride)).toBe('rendered');
  await view.setProps({ fallback: 'rendered' });
  expect(untrack(readOverride)).toBeUndefined();
  await view.setProps({ fallback: 'changed' });
  expect(untrack(readOverride)).toBe('rendered');
  await view.setProps({ visible: false });
  expect(untrack(readOverride)).toBeUndefined();
  const count = published.mock.calls.length;
  node.id = 'detached';
  await flushMicrotasks();
  expect(published).toHaveBeenCalledTimes(count);
});

it('falls back to the generated id when nothing else is given', () => {
  expect(resolveRenderedId({}, 'fallback')).toBe('fallback');
});

it('prefers an explicit id prop', () => {
  expect(resolveRenderedId({ id: 'explicit' }, 'fallback')).toBe('explicit');
});

it('treats an explicitly empty id prop as no id', () => {
  expect(resolveRenderedId({ id: '' }, 'fallback')).toBe('');
});

it('cannot see an id applied by a render function', () => {
  const render = (props: { id?: string }) => <div {...props} id="rendered" />;
  expect(resolveRenderedId({ render }, 'fallback')).toBe('fallback');
});

it('does not publish a generated fallback as an override and clears a removed explicit id', async () => {
  const onIdChange = vi.fn();
  const view = await createRenderer().renderProps<{ id: string | undefined }>((props) => {
    const [id, ref] = createRenderedId(props, 'fallback', onIdChange);
    return <div ref={ref} id={id()} />;
  }, { id: undefined });
  expect(onIdChange).toHaveBeenLastCalledWith(undefined);
  await view.setProps({ id: 'component-id' });
  expect(onIdChange).toHaveBeenLastCalledWith('component-id');
  await view.setProps({ id: undefined });
  expect(onIdChange).toHaveBeenLastCalledWith(undefined);
});

it('createRenderedId follows actual callback DOM IDs, fallback restoration and host disposal', async () => {
  const published = vi.fn();
  const view = await createRenderer().renderProps((props: { override: string | undefined; enabled: boolean }) => {
    const [id, ref] = createRenderedId({}, 'fallback', published);
    return createRenderElement<{}, HTMLElement>('div', { render: (attributes) => <div {...attributes} id={props.override} /> }, {
      props: { get id() { return id(); }, 'data-testid': 'host' }, ref, get enabled() { return props.enabled; },
    });
  }, { override: 'rendered', enabled: true });
  const node = view.getByTestId('host');
  expect(published).toHaveBeenLastCalledWith('rendered');
  await view.setProps({ override: 'changed' });
  expect(view.getByTestId('host')).toBe(node); expect(published).toHaveBeenLastCalledWith('changed');
  await view.setProps({ override: undefined });
  expect(published).toHaveBeenLastCalledWith('');
  await view.setProps({ override: 'fallback' });
  expect(published).toHaveBeenLastCalledWith(undefined);
  await view.setProps({ override: 'explicit' });
  expect(published).toHaveBeenLastCalledWith('explicit');
  published.mockClear();
  await view.setProps({ enabled: false });
  expect(published).toHaveBeenLastCalledWith(undefined);
  node.id = 'detached'; await Promise.resolve();
  expect(published).toHaveBeenLastCalledWith(undefined);
  expect(resolveRenderedId({ id: undefined }, 'fallback')).toBe('fallback');
  expect(resolveRenderedId({ id: '' }, 'fallback')).toBe('');
});

it('rendered-ID registration handles an inert template document before native adoption', async () => {
  const published = vi.fn();
  const template = document.createElement('template'); template.innerHTML = '<div id="inert-source">Inert</div>';
  const element = template.content.firstElementChild as HTMLDivElement;
  expect(element.ownerDocument.defaultView).toBeNull();
  const view = await createRenderer().render(() => {
    const [, ref] = createRenderedId({}, 'fallback', published);
    runWithOwner(null, () => ref(element));
    return <>{element}</>;
  });
  expect(published).toHaveBeenLastCalledWith('inert-source');
  element.id = 'adopted-id'; await Promise.resolve();
  expect(published).toHaveBeenLastCalledWith('adopted-id');
  view.unmount(); expect(published).toHaveBeenLastCalledWith(undefined);
});
