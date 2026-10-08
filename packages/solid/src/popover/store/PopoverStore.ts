import { createSignal, untrack } from 'solid-js';
import { createPopup, type PopupModel } from '../../utils/popups/createPopup';
import type { PopoverRootProps, PopoverRootChangeEventDetails } from '../root/PopoverRoot';
import { createPopoverPolicy } from './PopoverPolicy';
import type { PopupChangeEventDetails } from '../../internals/contracts/popup';

/** Exactly one popup model per Root, independently of the attached handle. */
export function createPopoverStore<Payload>(props: PopoverRootProps<Payload>, parent?: { readonly popup: PopupModel<unknown> } | null, nested = false) {
  const [titleId, setTitleId] = createSignal<string>();
  const [descriptionId, setDescriptionId] = createSignal<string>();
  const [focusManagerModal, setFocusManagerModal] = createSignal<(() => boolean) | undefined>();
  const labelOwners: Partial<Record<'title' | 'description', object>> = {};
  const popup = createPopup<Payload>({
    parent: parent?.popup,
    nested,
    closeOnActiveTriggerUnmount: false,
    open: () => props.open,
    defaultOpen: untrack(() => props.defaultOpen),
    triggerId: () => props.triggerId,
    defaultTriggerId: untrack(() => props.defaultTriggerId),
    onOpenChange: () => (open, details) => policy.beforeChange(open, details),
    onBeforeOpenCommit: (open: boolean, details: PopupChangeEventDetails) => {
      // The current shared commit hook runs after accepted floating dispatch, as in PopoverStore.
      policy.acceptedChange(open, details);
      return true;
    },
    onOpenChangeComplete: () => (open) => {
      policy.complete(open);
      props.onOpenChangeComplete?.(open);
    },
  });
  const defaultFloatingId = untrack(() => popup.state.floatingId);
  const policy = createPopoverPolicy({
    open: () => popup.state.open,
    getCurrentTrigger: () => popup.getCurrentTrigger(),
    onOpenChange: (open, details) => props.onOpenChange?.(open, details as PopoverRootChangeEventDetails),
  });

  const family = {
    popup,
    policy,
    get activeTriggerData() { return popup.getTriggerData(popup.state.activeTriggerId); },
    get modal() { return props.modal ?? false; },
    get focusManagerModal() { return focusManagerModal()?.() ?? false; },
    registerFocusManagerModal(source: () => boolean) {
      setFocusManagerModal(() => source);
      return () => setFocusManagerModal((current) => current === source ? undefined : current);
    },
    defaultFloatingId: () => defaultFloatingId,
    get titleId() { return titleId(); },
    get descriptionId() { return descriptionId(); },
    registerLabel(kind: 'title' | 'description', id: string) {
      const token = {};
      const setter = kind === 'title' ? setTitleId : setDescriptionId;
      labelOwners[kind] = token;
      setter(id);
      return () => {
        if (labelOwners[kind] === token) { delete labelOwners[kind]; setter(undefined); }
      };
    },
  };
  // Delegate every shared model capability, keeping original getter/method receivers.
  // The family never copies reactive descriptors or reimplements a popup transaction.
  const methods = new Map<PropertyKey, Function>();
  return new Proxy(popup, {
    get(target, key) {
      if (key in family) return Reflect.get(family, key, family);
      const value = Reflect.get(target, key, target);
      if (typeof value !== 'function') return value;
      let bound = methods.get(key);
      if (!bound) { bound = value.bind(target); methods.set(key, bound!); }
      return bound;
    },
    set(target, key, value) {
      return key in family ? Reflect.set(family, key, value, family) : Reflect.set(target, key, value, target);
    },
  }) as PopupModel<Payload> & typeof family;
}

export type PopoverStore<Payload = unknown> = ReturnType<typeof createPopoverStore<Payload>>;
export type PopoverHandleStore<Payload = unknown> = PopupModel<Payload> & Partial<Pick<PopoverStore<Payload>, 'policy' | 'focusManagerModal'>>;
