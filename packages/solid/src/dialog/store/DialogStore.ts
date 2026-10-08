import { createSignal, untrack, type Accessor } from 'solid-js';
import { createPopup, type PopupModel } from '../../utils/popups';
import type { PopupState, PopupTriggerDataStore } from '../../internals/contracts/popup';
import type { HTMLProps } from '../../internals/types';
import type { ChangeEventDetails } from '../../internals/contracts/events';
import { useFloatingParentNodeId } from '../../floating-ui-react/components/FloatingTree';
import type { DialogRootProps, DialogRootChangeEventDetails } from '../root/DialogRoot';

export type DialogRootMode = 'dialog' | 'alert-dialog' | 'drawer';
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard';
export interface State<Payload> extends PopupState<Payload> {
  readonly modal: boolean | 'trap-focus';
  readonly disablePointerDismissal: boolean;
  readonly role: 'dialog' | 'alertdialog';
  readonly nested: boolean;
  readonly nestedOpenDialogCount: number;
  readonly nestedOpenDrawerCount: number;
  readonly titleElementId: string | undefined;
  readonly descriptionElementId: string | undefined;
  readonly viewportElement: HTMLElement | null;
  readonly openMethod: InteractionType | null;
}
export interface DialogContext {
  readonly popupRef: Accessor<HTMLElement | null>;
  readonly backdropRef: Accessor<HTMLElement | null>;
  readonly internalBackdropRef: Accessor<HTMLElement | null>;
  readonly outsidePressEnabledRef: { current: boolean };
  readonly onOpenChangeComplete: ((open: boolean) => void) | undefined;
  onNestedDialogOpen(dialogCount: number, drawerCount: number): void;
}
export interface DialogStore<Payload = unknown> extends PopupModel<Payload> {
  setOpen(open: boolean, details: ChangeEventDetails): void;
  forceUnmount(): void;
  setPayload(payload: Payload): void;
  readonly defaultFloatingId: string | undefined;
  setFloatingId(id: string | undefined): void;
  readonly mode: DialogRootMode;
  readonly state: State<Payload>;
  readonly context: PopupModel<Payload>['context'] & DialogContext;
  setBackdropElement(element: HTMLElement | null): void;
  setInternalBackdropElement(element: HTMLElement | null): void;
  setViewportElement(element: HTMLElement | null): void;
  setOpenMethod(method: InteractionType): void;
  registerLabel(kind: 'title' | 'description', id: Accessor<string>): () => void;
  registerNested(child: DialogStore<unknown>): () => void;
  setInteractionProps(props: { reference?: HTMLProps; trigger?: HTMLProps; floating?: HTMLProps }): void;
}
export type DialogHandleStore<Payload> = PopupTriggerDataStore<Payload>;

/** Root-owned state. Shared popup owns transactions, trigger ownership and presence. */
export function createDialogStore<Payload>(mode: DialogRootMode, props: DialogRootProps<Payload>, nested: boolean, parent: DialogStore<unknown> | null = null): DialogStore<Payload> {
  // Floating ownership (e.g. Dialog inside Menu) is independent of the Dialog
  // ancestor used for backdrop policy and nested dialog/drawer counts.
  const floatingNested = useFloatingParentNodeId() != null;
  const popup = createPopup<Payload>({
    open: () => props.open,
    defaultOpen: untrack(() => props.defaultOpen),
    triggerId: () => props.triggerId,
    defaultTriggerId: untrack(() => props.defaultTriggerId),
    onOpenChange: () => (open, details) => {
      // Closing ownership must reach the public callback before it can veto the request.
      if (!open && details.trigger == null) {
        // React's store writes trigger ownership synchronously. In RC13 the
        // mounted state/selector can still describe the pre-open checkpoint;
        // consume the shared transaction lookup for a same-turn close.
        const trigger = popup.getCurrentTrigger();
        if (popup.state.activeTriggerId != null || trigger?.id) {
          (details as DialogRootChangeEventDetails).trigger = trigger ?? undefined;
        }
      }
      props.onOpenChange?.(open, details as DialogRootChangeEventDetails);
    },
    onOpenChangeComplete: () => props.onOpenChangeComplete,
    treatPopupAsFloatingElement: true,
    nested: floatingNested,
    parent: parent?.state.floatingRootContext,
  });
  const [backdrop, setBackdrop] = createSignal<HTMLElement | null>(null);
  const defaultFloatingId = untrack(() => popup.state.floatingId);
  const [internalBackdrop, setInternalBackdrop] = createSignal<HTMLElement | null>(null);
  const [viewport, setViewport] = createSignal<HTMLElement | null>(null);
  const [method, setMethod] = createSignal<InteractionType | null>(null);
  const [labels, setLabels] = createSignal<readonly { kind: 'title' | 'description'; id: Accessor<string> }[]>([]);
  const children = new Map<DialogStore<unknown>, object>();
  const [childrenRevision, setChildrenRevision] = createSignal(0);
  const [reported, setReported] = createSignal({ dialogs: 0, drawers: 0 });
  const local = {
    get modal() { return mode === 'alert-dialog' ? true : props.modal ?? true; },
    get disablePointerDismissal() { return mode === 'alert-dialog' || (props.disablePointerDismissal ?? false); },
    get role(): 'dialog' | 'alertdialog' { return mode === 'alert-dialog' ? 'alertdialog' : 'dialog'; },
    nested,
    get nestedOpenDialogCount() {
      childrenRevision();
      let count = reported().dialogs;
      for (const child of children.keys()) if (child.state.open) count += 1 + child.state.nestedOpenDialogCount;
      return count;
    },
    get nestedOpenDrawerCount() {
      childrenRevision();
      let count = reported().drawers;
      for (const child of children.keys()) if (child.state.open) count += Number(child.mode === 'drawer') + child.state.nestedOpenDrawerCount;
      return count;
    },
    get titleElementId() { return labels().filter((label) => label.kind === 'title').at(-1)?.id(); },
    get descriptionElementId() { return labels().filter((label) => label.kind === 'description').at(-1)?.id(); },
    get viewportElement() { return viewport(); },
    get openMethod() { return method(); },
  };
  // Forward through each original receiver; never copy getter descriptors off the shared model.
  const state = new Proxy(local, {
    get(target, key) { return key in target ? Reflect.get(target, key, target) : Reflect.get(popup.state, key, popup.state); },
    has(target, key) { return key in target || key in popup.state; },
    ownKeys(target) { return [...new Set([...Reflect.ownKeys(popup.state), ...Reflect.ownKeys(target)])]; },
    getOwnPropertyDescriptor(target, key) { return key in target || key in popup.state ? { configurable: true, enumerable: true } : undefined; },
  }) as State<Payload>;
  const localContext = {
    get triggerElements() { return popup.context.triggerElements; },
    popupRef: () => popup.state.popupElement,
    backdropRef: backdrop,
    internalBackdropRef: internalBackdrop,
    outsidePressEnabledRef: { current: true },
    get onOpenChange() { return popup.context.onOpenChange; },
    get onOpenChangeComplete() { return props.onOpenChangeComplete; },
    onNestedDialogOpen(dialogs: number, drawers: number) { setReported({ dialogs, drawers }); },
  };
  const context = new Proxy(localContext, {
    get(target, key) { return key in target ? Reflect.get(target, key, target) : Reflect.get(popup.context, key, popup.context); },
    has(target, key) { return key in target || key in popup.context; },
    ownKeys(target) { return [...new Set([...Reflect.ownKeys(popup.context), ...Reflect.ownKeys(target)])]; },
    getOwnPropertyDescriptor(target, key) { return key in target || key in popup.context ? { configurable: true, enumerable: true } : undefined; },
  }) as DialogStore<Payload>['context'];
  return {
    mode, state, context, defaultFloatingId,
    setFloatingId: (id) => popup.setFloatingId(id ?? defaultFloatingId),
    setOpen: (open, details) => popup.setOpen(open, details),
    requestOpen: (open, details) => popup.requestOpen(open, details),
    setPopupElement: (element) => popup.setPopupElement(element),
    setPositionerElement: (element) => popup.setPositionerElement(element),
    setMounted: (mounted) => popup.setMounted(mounted),
    forceUnmount: () => popup.forceUnmount(),
    setPayload: (payload: Payload) => popup.setPayload(payload),
    registerTrigger: (id, element, payload, metadata) => popup.registerTrigger(id, element, payload, metadata),
    getTriggerData: (id) => popup.getTriggerData(id),
    getCurrentTrigger: () => popup.getCurrentTrigger(),
    setBackdropElement: (element) => { setBackdrop(element); },
    setInternalBackdropElement: (element) => { setInternalBackdrop(element); },
    setViewportElement: (element) => { setViewport(element); },
    setOpenMethod: (value) => { setMethod(value); },
    setInteractionProps: (value) => popup.setInteractionProps(value),
    registerLabel(kind, id) {
      const label = { kind, id };
      setLabels((previous) => [...previous, label]);
      return () => { setLabels((previous) => previous.filter((entry) => entry !== label)); };
    },
    registerNested(child) {
      // Raw model identity and immediate read-through survive same-turn registration/disposal.
      // The revision only publishes changes; counts remain derived from live child state.
      const token = {};
      children.set(child, token);
      setChildrenRevision((value) => value + 1);
      return () => {
        if (children.get(child) !== token) return;
        children.delete(child);
        setChildrenRevision((value) => value + 1);
      };
    },
  };
}
