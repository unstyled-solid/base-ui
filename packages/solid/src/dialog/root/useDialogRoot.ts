// Dialog policy adapted from Base UI (MIT); shared foundations own all listener/gesture engines.
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { contains, getTarget } from '../../floating-ui-react/utils/element';
import { createScrollLock } from '../../utils/createScrollLock';
import type { DialogStore } from '../store/DialogStore';

/** Dialog-specific dismissal policy; gesture observation and event ownership stay shared. */
export function isDialogOutsidePress(store: DialogStore, event: MouseEvent | TouchEvent): boolean {
  const state = store.state;
  if (!store.context.outsidePressEnabledRef.current || state.disablePointerDismissal || state.nestedOpenDialogCount > 0) return false;
  if ('button' in event && event.button !== 0) return false;
  if ('touches' in event) {
    if (event.type === 'touchend') {
      if (event.changedTouches.length !== 1 || event.touches.length !== 0) return false;
    } else if (event.touches.length !== 1) return false;
  }
  if (!state.modal) return true;
  const target = getTarget(event) as Element | null;
  const internal = store.context.internalBackdropRef();
  const backdrop = store.context.backdropRef();
  return internal || backdrop
    ? target === internal || target === backdrop || (contains(target, state.popupElement) && !target?.hasAttribute('data-base-ui-portal'))
    : true;
}
export function DialogInteractions(props: { store: DialogStore }) {
  const store = props.store;
  const dismiss = createDismiss(store.state.floatingRootContext, {
    get enabled() { return store.state.open || store.state.mounted; },
    get escapeKey() { return store.state.nestedOpenDialogCount === 0; },
    outsidePress: (event) => isDialogOutsidePress(store, event),
    outsidePressEvent() {
      if (store.context.internalBackdropRef() || store.context.backdropRef()) return 'intentional';
      return { mouse: store.state.modal === 'trap-focus' ? 'sloppy' : 'intentional', touch: 'sloppy' };
    },
  });
  createScrollLock(() => store.state.open && store.state.modal === true, () => store.state.popupElement);
  store.setInteractionProps({
    get reference() { return dismiss.reference; },
    get trigger() { return dismiss.trigger; },
    get floating() { return dismiss.floating; },
  });
  return null;
}
