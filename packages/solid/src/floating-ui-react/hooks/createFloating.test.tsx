import { expect, it, vi } from 'vitest';
import { createRenderer, flushMicrotasks } from '../../../test';
import { createBaseUIFloating } from './createFloating';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { computePosition, type ComputePositionReturn } from '@floating-ui/dom';
vi.mock('@floating-ui/dom', async (original) => ({ ...await original<typeof import('@floating-ui/dom')>(), computePosition: vi.fn() }));

it('createBaseUIFloating rejects stale positioning results after option replacement and disposal', async () => {
  const pending: ((value: ComputePositionReturn) => void)[] = [];
  vi.mocked(computePosition).mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
  const reference = document.createElement('button'), floating = document.createElement('div');
  document.body.append(reference, floating);
  const view = await createRenderer().renderProps((props: { placement: 'top' | 'bottom' }) => {
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined, domReferenceElement: reference, referenceElement: reference, positionReference: null, floatingElement: floating, floatingId: 'popup' } });
    const position = createBaseUIFloating({ rootContext: root, get placement() { return props.placement; } });
    return <output>{position.x}:{position.placement}</output>;
  }, { placement: 'bottom' });
  await view.setProps({ placement: 'top' });
  expect(pending).toHaveLength(2);
  pending[1]!({ x: 20, y: 10, placement: 'top', strategy: 'absolute', middlewareData: {} });
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('20:top');
  pending[0]!({ x: 1, y: 2, placement: 'bottom', strategy: 'absolute', middlewareData: {} });
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('20:top');
  await view.setProps({ placement: 'bottom' });
  view.unmount();
  pending[2]!({ x: 30, y: 40, placement: 'bottom', strategy: 'absolute', middlewareData: {} });
  await flushMicrotasks();
  reference.remove(); floating.remove();
});

it('geometry publication follows live root metadata and releases only its captured owner', async () => {
  const state = { open: false, transitionStatus: undefined, domReferenceElement: null, referenceElement: null,
    positionReference: null, floatingElement: null, floatingId: undefined };
  let first!: ReturnType<typeof createFloatingRoot>, second!: ReturnType<typeof createFloatingRoot>;
  const view = await createRenderer().renderProps((props: { second: boolean }) => {
    first = createFloatingRoot({ state }); second = createFloatingRoot({ state });
    const facade = new Proxy(first, { get(target, key) { return key === 'data' ? (props.second ? second : first).data : Reflect.get(target, key, target); } });
    createBaseUIFloating({ rootContext: facade, open: false });
    return <span>Metadata owner</span>;
  }, { second: false });
  const geometry = first.data.floatingContext;
  expect(geometry).toBeDefined(); expect(second.data.floatingContext).toBeUndefined();
  await view.setProps({ second: true });
  expect(first.data.floatingContext).toBeUndefined(); expect(second.data.floatingContext).toBe(geometry);
  view.unmount();
  expect(first.data.floatingContext).toBeUndefined(); expect(second.data.floatingContext).toBeUndefined();
});

it('closed geometry computes once without observation or readiness and rejects superseded closed passes', async () => {
  const pending: ((value: ComputePositionReturn) => void)[] = [];
  vi.mocked(computePosition).mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
  const cleanup = vi.fn();
  const observe = vi.fn((_reference, _floating, update: () => void) => { update(); return cleanup; });
  const reference = document.createElement('button'), floating = document.createElement('div');
  const view = await createRenderer().renderProps<{ open: boolean; placement: 'top' | 'bottom' }>((props) => {
    const root = createFloatingRoot({ state: { get open() { return props.open; }, transitionStatus: undefined,
      domReferenceElement: reference, referenceElement: reference, positionReference: null, floatingElement: floating, floatingId: 'popup' } });
    const position = createBaseUIFloating({ rootContext: root, whileElementsMounted: observe, get placement() { return props.placement; } });
    return <output>{String(position.isPositioned)}:{position.x}</output>;
  }, { open: false, placement: 'bottom' });
  const resolve = (index: number, x: number) => pending[index]!({ x, y: 0, placement: 'bottom', strategy: 'absolute', middlewareData: {} });
  expect(pending).toHaveLength(1);
  expect(observe).not.toHaveBeenCalled();
  resolve(0, 10);
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('false:10');
  await view.setProps({ open: true });
  expect(observe).toHaveBeenCalledOnce();
  resolve(1, 20);
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('true:20');
  await view.setProps({ open: false });
  expect(cleanup).toHaveBeenCalledOnce();
  expect(observe).toHaveBeenCalledOnce();
  // Closing alone must retain measured exit geometry, not measure a hidden box.
  expect(pending).toHaveLength(2);
  expect(view.getByRole('status')).toHaveTextContent('false:20');
  // A real geometry option change still computes while hidden. Its late result
  // must not overwrite the next open generation.
  await view.setProps({ placement: 'top' });
  expect(pending).toHaveLength(3);
  await view.setProps({ open: true });
  resolve(3, 40);
  await flushMicrotasks();
  resolve(2, 30);
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('true:40');
  view.unmount();
  expect(cleanup).toHaveBeenCalledTimes(2);
});
