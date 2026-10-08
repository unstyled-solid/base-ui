import type { PopupState, PopupChangeEventDetails, PopupTriggerDataStore, PopupStoreContext, PopupTriggerMetadata } from '../../internals/contracts/popup';
import { createEffect, createMemo, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import type { ChangeEventDetails } from '../../internals/contracts/events';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { HTMLProps } from '../../internals/types';
import { createFloatingRoot } from '../../floating-ui-react/components/createFloatingRoot';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createControlled } from '../createControlled';
import { createUnmountAfterClose } from '../../internals/createUnmountAfterClose';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { PopupTriggerMap } from './popupTriggerMap';
import type { ChangeRequestResult } from '../../internals/contracts/state';
export interface PopupOptions<Payload> {
  open?: Accessor<boolean | undefined>; defaultOpen?: boolean | undefined;
  triggerId?: Accessor<string | null | undefined>; defaultTriggerId?: string | null | undefined;
  onOpenChange?: Accessor<((open: boolean, details: PopupChangeEventDetails) => void) | undefined>;
  onOpenChangeComplete?: Accessor<((open: boolean) => void) | undefined>;
  payload?: Payload;
  disabled?: Accessor<boolean>; nested?: boolean | undefined; parent?: FloatingRootContext | { readonly state: { readonly floatingRootContext: FloatingRootContext } } | null | undefined;
  /** Family-specific pure visibility projection, e.g. Tooltip's !disabled open. */
  presenceOpen?: ((open: boolean) => boolean) | undefined;
  treatPopupAsFloatingElement?: boolean; animateInitialOpen?: boolean;
  closeOnActiveTriggerUnmount?: boolean;
  floatingId?: Accessor<string | undefined> | undefined;
  onAcceptedChange?: (open: boolean, details: PopupChangeEventDetails) => void;
  onBeforeOpenCommit?: ((open: boolean, details: PopupChangeEventDetails) => boolean) | undefined;
  onCloseComplete?: () => void;
}
export interface PopupModel<Payload> extends PopupTriggerDataStore<Payload> {
  readonly state: PopupState<Payload>;
  readonly context: PopupStoreContext<PopupChangeEventDetails>;
  setOpen(open: boolean, details: ChangeEventDetails): void;
  setPopupElement(element: HTMLElement | null): void;
  setPositionerElement(element: HTMLElement | null): void;
  setMounted(mounted: boolean): void;
  forceUnmount(): void;
  setPayload(payload: Payload | undefined): void;
  setFloatingId(id: string | undefined): void;
  setInteractionProps(props: PopupInteractionBags): void;
  getTriggerData(id: string | null): ({ element: Element; payload: Payload | undefined } & PopupTriggerMetadata<Payload>) | undefined;
  setAdaptiveOrigin?(middleware: import('@floating-ui/dom').Middleware | undefined): void;
  requestOpen?(open: boolean, details: ChangeEventDetails): ChangeRequestResult<boolean>;
  getCurrentTrigger?(): Element | null;
}
export interface PopupRequestModel<Payload> extends PopupModel<Payload> { requestOpen(open: boolean, details: ChangeEventDetails): ChangeRequestResult<boolean>; getCurrentTrigger(): Element | null }
export interface PopupInteractionBags {
  reference?: Omit<HTMLProps, 'ref'> | undefined; trigger?: Omit<HTMLProps, 'ref'> | undefined; floating?: Omit<HTMLProps, 'ref'> | undefined;
  activeTriggerProps?: Omit<HTMLProps, 'ref'> | undefined; inactiveTriggerProps?: Omit<HTMLProps, 'ref'> | undefined; popupProps?: Omit<HTMLProps, 'ref'> | undefined;
}
export function createPopup<Payload = unknown>(options: PopupOptions<Payload>): PopupRequestModel<Payload> {
  const generatedId = createBaseUiId();
  const [idOverride, setIdOverride] = createSignal<{ value: string | undefined } | null>(null);
  const floatingId = () => idOverride() ? idOverride()!.value : options.floatingId ? options.floatingId() : generatedId();
  // Rendered-ID registration uses undefined to release an override; an actual
  // rendered empty ID is represented by '' and still suppresses the fallback.
  const setFloatingId = (value: string | undefined) => { setIdOverride(value === undefined ? null : { value }); };
  const [popup, setPopup] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [positioner, setPositioner] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [adaptive, setAdaptive] = createSignal<import('@floating-ui/dom').Middleware | undefined>(undefined);
  const [interactions, setInteractions] = createSignal<PopupInteractionBags>({});
  const triggers = new PopupTriggerMap();
  const data = new Map<string, { element: Element; payload: Payload | undefined; token: symbol; metadata?: PopupTriggerMetadata<Payload> | undefined }>();
  const [revision, setRevision] = createSignal(0);
  const initialTrigger = untrack(() => options.defaultTriggerId ?? null);
  let transaction = { id: initialTrigger, element: null as Element | null, payload: untrack(() => options.payload),
    opening: undefined as { without: boolean } | undefined, prevent: false };
  const [metadata, setMetadata] = createSignal(transaction);
  let resolvedActiveId: string | null = null;
  const triggerPayload = (id: string) => { const entry = data.get(id); return entry?.metadata && 'payload' in entry.metadata ? entry.metadata.payload : entry?.payload; };
  let disposed = false;
  const selection = createControlled<boolean, ChangeEventDetails>({ value: () => options.open?.(), defaultValue: untrack(() => options.defaultOpen ?? false), name: 'Popup' });
  // A close resets the association policy, not editable state. Derive that reset
  // in the same pass as open, retaining only accepted opening-request history.
  const openingPolicy = createMemo((previous: { request: typeof transaction.opening; without: boolean } | undefined) => {
    const request = metadata().opening;
    const without = !selection.value() ? false : request !== previous?.request ? request?.without ?? false : previous?.without ?? false;
    return previous && previous.request === request && previous.without === without ? previous : { request, without };
  }, { name: 'Popup.openingPolicy' });
  const presenceOpen = () => options.presenceOpen?.(selection.value()) ?? selection.value();
  const activeId = () => options.triggerId?.() ?? metadata().id;
  const reference = () => { revision(); const id = activeId(); return id ? data.get(id)?.element ?? metadata().element : metadata().element; };
  const presence = createUnmountAfterClose({ open: presenceOpen, ref: popup, preventUnmountOnClose: () => metadata().prevent,
    setPreventUnmountOnClose(value) { if (transaction.prevent !== value) { transaction = { ...transaction, prevent: value }; setMetadata(transaction); } },
    animateInitialOpen: options.animateInitialOpen,
    onUnmount() {
      transaction = { ...transaction, id: null, element: null, prevent: false }; setMetadata(transaction);
      options.onCloseComplete?.(); options.onOpenChangeComplete?.()?.(false);
    },
  });
  const floating = createFloatingRoot({
    state: { get open() { return selection.value(); }, get transitionStatus() { return presence.transitionStatus; },
      get domReferenceElement() { return presence.mounted ? reference() : null; }, get referenceElement() { return presence.mounted ? reference() : null; }, positionReference: null,
      get floatingElement() { return options.treatPopupAsFloatingElement ? popup() : positioner(); }, get floatingId() { return floatingId(); } },
    triggerElements: triggers, syncOnly: true, get nested() { return options.nested ?? options.parent != null; }, onOpenChange: (next, details) => model.setOpen(next, details),
  });
  const state: PopupState<Payload> = {
    get open() { return selection.value(); }, get openProp() { return options.open?.(); },
    get mounted() { return presence.mounted; }, get transitionStatus() { return presence.transitionStatus; },
    floatingRootContext: floating, get floatingId() { return floatingId(); }, get adaptiveOrigin() { return adaptive(); },
    get triggerCount() { revision(); return selection.value() ? triggers.size : 0; },
    get preventUnmountingOnClose() { return presence.preventUnmountingOnClose; },
    get payload() { revision(); const id = activeId(); return presence.mounted && id && data.has(id) ? triggerPayload(id) : metadata().payload; },
    get activeTriggerId() { return activeId(); }, get activeTriggerElement() { return presence.mounted ? reference() : null; },
    get openedWithoutTrigger() { return openingPolicy().without; }, get triggerIdProp() { return options.triggerId?.(); },
    get popupElement() { return popup(); }, get positionerElement() { return positioner(); },
    get activeTriggerProps() { return interactions().activeTriggerProps ?? interactions().reference ?? {}; }, get inactiveTriggerProps() { return interactions().inactiveTriggerProps ?? interactions().trigger ?? {}; }, get popupProps() { return interactions().popupProps ?? interactions().floating ?? {}; },
  };
  const model: PopupRequestModel<Payload> = {
    state,
    context: { triggerElements: triggers, popupRef: popup,
      beforeTriggerFocusGuardRef: { current: null }, beforeContentFocusGuardRef: { current: null }, triggerFocusTargetRef: { current: null },
      get onOpenChange() { return options.onOpenChange?.(); }, get onOpenChangeComplete() { return options.onOpenChangeComplete?.(); } },
    setOpen(nextOpen, details) { model.requestOpen(nextOpen, details); },
    requestOpen(nextOpen, details) {
      if (disposed || (nextOpen && untrack(() => options.disabled?.()))) return { accepted: false, nextValue: nextOpen };
      return untrack(() => {
        let prevent = false;
        const extended = details as PopupChangeEventDetails;
        extended.preventUnmountOnClose = () => { prevent = true; };
        options.onOpenChange?.()?.(nextOpen, extended);
        if (details.isCanceled) return { accepted: false as const, nextValue: nextOpen };
        options.onAcceptedChange?.(nextOpen, extended);
        if (details.isCanceled) return { accepted: false as const, nextValue: nextOpen };
        floating.dispatchOpenChange(nextOpen, extended);
        // Menu's touch compatibility-click gate runs after notification and
        // floating dispatch, but before any open/ownership/presence mutation.
        if (options.onBeforeOpenCommit?.(nextOpen, extended) === false) return { accepted: true as const, nextValue: nextOpen, controlled: selection.controlled };
        const trigger = details.trigger;
        const previousId = options.triggerId?.() ?? transaction.id;
        const closingPayload = previousId && data.has(previousId) ? triggerPayload(previousId) : transaction.payload;
        let id = transaction.id, element = transaction.element;
        if (trigger?.id || nextOpen) {
          id = trigger ? [...triggers.entries()].find(([, value]) => value === trigger)?.[0] ?? trigger.id ?? null : null;
          element = trigger ?? null;
        }
        transaction = { ...transaction, id, element, opening: nextOpen ? { without: !trigger } : transaction.opening,
          prevent: nextOpen ? false : prevent || transaction.prevent,
          payload: nextOpen && id && data.has(id) ? triggerPayload(id) : nextOpen ? transaction.payload : closingPayload };
        setMetadata(transaction);
        return selection.request(nextOpen, extended);
      });
    },
    registerTrigger(id, element, payload, triggerMetadata) {
      const token = Symbol(); data.set(id, { element, payload, token, metadata: triggerMetadata }); triggers.add(id, element); setRevision((value) => value + 1);
      untrack(() => {
        const active = activeId();
        // A trigger mounting into an already-open default/controlled popup
        // claims it immediately, before another same-turn registration. This
        // source forwarding rule is distinct from later lone-trigger inference.
        const without = transaction.opening !== metadata().opening ? transaction.opening?.without : openingPolicy().without;
        if (selection.value() && (active === id || (active === null && transaction.id === null && !without))) {
          transaction = { ...transaction, id: active === null ? id : transaction.id, element, payload: triggerPayload(id) };
          setMetadata(transaction);
        }
      });
      return () => {
        if (data.get(id)?.token !== token) return;
        data.delete(id); if (triggers.getById(id) === element) triggers.delete(id); setRevision((value) => value + 1);
      };
    },
    setPopupElement: setPopup, setPositionerElement: setPositioner,
    setMounted: presence.setMounted, forceUnmount: presence.forceUnmount,
    setPayload(payload) { transaction = { ...transaction, payload }; setMetadata(transaction); },
    setFloatingId, setAdaptiveOrigin: setAdaptive,
    getCurrentTrigger() { return untrack(() => {
      const selected = options.triggerId?.() ?? transaction.id;
      return selected !== null ? data.get(selected)?.element ?? transaction.element : transaction.element;
    }); },
    setInteractionProps(props) {
      // Hosts publish a live getter-backed interaction bag during their setup.
      // Deliver the attachment outside that owned compute scope, retaining the
      // original object rather than copying derived handler props into signals.
      queueMicrotask(() => { if (!disposed) setInteractions(() => props); });
    },
    getTriggerData(id) { revision(); const entry = id !== null ? data.get(id) : undefined; return entry && { ...entry.metadata, element: entry.element, payload: id !== null ? triggerPayload(id) : undefined }; },
  };
  createEffect(() => ({ open: selection.value(), mounted: presence.mounted, id: activeId(), externalId: options.triggerId?.(), element: reference(), without: openingPolicy().without, count: (revision(), triggers.size), close: options.closeOnActiveTriggerUnmount,
    hasPayload: (revision(), activeId() !== null && data.has(activeId()!)), payload: activeId() !== null ? triggerPayload(activeId()!) : undefined }), (next) => {
    // Keep the last live trigger payload when its registration disappears,
    // including default/controlled opens and canceled unmount-close requests.
    if (next.mounted && next.hasPayload && transaction.payload !== next.payload) { transaction = { ...transaction, payload: next.payload }; setMetadata(transaction); }
    if (!next.open) { resolvedActiveId = null; return; }
    let id = next.id, element = next.element;
    let writeId = next.externalId == null;
    if (!id && !next.without && next.count === 1) { const entry = triggers.entries().next().value!; id = entry[0]; element = entry[1]; writeId = true; }
    if (id && triggers.getById(id)) resolvedActiveId = id;
    else if (id) {
      const reassociated = [...triggers.entries()].find(([, value]) => value === element);
      if (reassociated) { [id, element] = reassociated; resolvedActiveId = id; writeId = true; }
      else if (next.close && resolvedActiveId === id) {
        const lostId = id;
        queueMicrotask(() => {
          if (disposed || !untrack(selection.value) || untrack(activeId) !== lostId || triggers.getById(lostId)) return;
          const details = createChangeEventDetails('none');
          model.setOpen(false, details);
          if (!details.isCanceled) { transaction = { ...transaction, id: null, element: null }; setMetadata(transaction); }
        });
      } else resolvedActiveId = null;
    } else {
      resolvedActiveId = null;
    }
    const internalId = writeId ? id : transaction.id;
    if (internalId !== transaction.id || element !== transaction.element) { transaction = { ...transaction, id: internalId, element }; setMetadata(transaction); }
  });
  createOpenChangeComplete({ open: presenceOpen, enabled: presenceOpen, ref: popup, onComplete() { options.onOpenChangeComplete?.()?.(true); } });
  onCleanup(() => { disposed = true; data.clear(); for (const [id] of triggers.entries()) triggers.delete(id); });
  return model;
}
