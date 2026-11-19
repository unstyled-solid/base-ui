import { children as resolveChildren, createEffect } from 'solid-js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createDialogStore, type DialogRootMode, type DialogStore } from '../store/DialogStore';
import type { DialogRootProps, DialogRootActions } from './DialogRoot';
import { DialogRootContext, useDialogRootContext } from './DialogRootContext';
import { DialogInteractions } from './useDialogRoot';

export type { DialogRootMode } from '../store/DialogStore';
export function createRenderDialogRoot<Payload>(mode: DialogRootMode, props: DialogRootProps<Payload>) {
  const parent = useDialogRootContext(true);
  const store = createDialogStore(mode, props, parent !== null, parent);
  createEffect(() => parent, (value) => value?.registerNested(store as DialogStore<unknown>));
  createEffect(() => props.handle, (handle) => handle?.attachStore(store));
  const actions: DialogRootActions = {
    unmount: () => store.forceUnmount(),
    close: () => store.setOpen(false, createChangeEventDetails('imperative-action')),
  };
  createEffect(() => props.actionsRef, (ref) => {
    if (!ref) return;
    if (typeof ref === 'function') ref(actions); else ref.current = actions;
    return () => {
      if (typeof ref === 'function') ref(null); else if (ref.current === actions) ref.current = null;
    };
  });
  const payloadContext = { get payload() { return store.state.payload; } };
  // The payload object is live; changing payload must not rebuild the popup subtree.
  const Content = () => {
    const content = resolveChildren(() => {
      const children = props.children;
      // Resolve native accessors without subscribing JSX construction to their
      // descendant status; consumer callbacks still receive the live payload.
      const resolved = typeof children === 'function' && 'toArray' in children && typeof children.toArray === 'function';
      return typeof children === 'function' && !resolved ? <>{children(payloadContext)}</> : <>{children}</>;
    });
    return <>{content()}</>;
  };
  return <DialogRootContext value={store as DialogStore<unknown>}>
    <DialogInteractions store={store as DialogStore<unknown>} />
    <Content />
  </DialogRootContext>;
}
export { createRenderDialogRoot as useRenderDialogRoot };
