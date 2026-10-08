import { createToastManager } from './createToastManager';
import { useToastManager } from './useToastManager';
import { expectType } from '../../test';
import { Toast } from './index';
import type { JSX } from '@solidjs/web';
// Both pinned *.spec.tsx manager contracts; bodies are compile-only, context remains setup-owned.
export function toastTypeContracts() {
  type Payload = { id: string; count: number };
  const managers = [createToastManager<Payload>(), useToastManager<Payload>()];
  for (const manager of managers) {
    const id = manager.add({ data: { id: 'typed', count: 1 } }); expectType<string, typeof id>(id);
    // @ts-expect-error missing count
    manager.add({ data: { id: 'wrong' } });
    // @ts-expect-error unknown property
    manager.add({ data: { id: 'wrong', message: 'wrong' } });
    // @ts-expect-error updates replace the complete payload
    manager.update(id, { data: { count: 2 } });
    manager.update(id, (previous) => { expectType<Payload | undefined, typeof previous.data>(previous.data); return { data: { id, count: 2 } }; });
    // @ts-expect-error functional updates replace the complete payload
    manager.update(id, () => ({ data: { id } }));
    const promise = manager.promise(Promise.resolve(2), { loading: 'Loading', success: (count) => ({ data: { id, count } }), error: 'Error' });
    expectType<Promise<number>, typeof promise>(promise);
  }
  const local = useToastManager<Payload>(); expectType<Payload | undefined, typeof local.toasts[0]['data']>(local.toasts[0].data);
  const legacy = createToastManager(); legacy.add<Payload>({ data: { id: 'legacy', count: 1 } });
  legacy.update<Payload>('legacy', (previous) => ({ data: { id: 'legacy', count: (previous.data?.count ?? 0) + 1 } }));
  legacy.promise<number, Payload>(Promise.resolve(1), { loading: 'loading', success: (count) => ({ data: { id: 'legacy', count } }), error: 'error' });
  const callable = createToastManager<() => string>();
  callable.add({ data: () => 'initial' }); callable.update('callable', { data: () => 'replacement' });
  callable.update('callable', (previous) => ({ data: previous.data }));
  callable.promise(Promise.resolve(1), { loading: { data: () => 'loading' }, success: { data: () => 'done' }, error: 'failed' });
  const localCallable = useToastManager<() => string>();
  localCallable.update('callable', (previous) => { expectType<(() => string) | undefined, typeof previous.data>(previous.data); return { data: previous.data }; });
  // The three-stage public surface keeps native Solid refs/render callbacks,
  // source option restrictions and state-dependent class/style typing.
  const toast: Toast.Root.ToastObject<Payload> = { id: 'typed', ref: () => null, data: { id: 'typed', count: 1 } };
  const parts: JSX.Element = <Toast.Provider limit={2} timeout={0}>
    <Toast.Portal container={() => null}><Toast.Viewport><Toast.Positioner toast={toast} side="inline-start" sideOffset={({ anchor }) => anchor.height}>
      <Toast.Root toast={toast} swipeDirection={['left', 'up']} class={(state) => ({ expanded: state.expanded })} ref={[(node) => { expectType<HTMLDivElement, typeof node>(node); }]}>
        <Toast.Content /><Toast.Title /><Toast.Description /><Toast.Arrow />
        <Toast.Action nativeButton={false} render={(props) => <div {...props as JSX.HTMLAttributes<HTMLDivElement>} />} />
        <Toast.Close onClick={(event) => { event.preventBaseUIHandler(); event.currentTarget.focus(); }} />
      </Toast.Root>
    </Toast.Positioner></Toast.Viewport></Toast.Portal>
  </Toast.Provider>;
  // @ts-expect-error manager updates cannot modify layout metadata
  legacy.update('typed', { height: 50 });
  // @ts-expect-error updateKey is manager-owned
  legacy.add({ updateKey: 2 });
  // @ts-expect-error refs are accessors rather than React current objects
  const invalidRef: Toast.Root.ToastObject = { id: 'bad', ref: { current: null } };
  // @ts-expect-error invalid directional policy
  const invalidDirection = <Toast.Root toast={toast} swipeDirection="diagonal" />;
  return { parts, invalidRef, invalidDirection };
}
