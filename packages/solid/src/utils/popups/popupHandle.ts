import { createSignal } from 'solid-js';
import { isServer } from '@solidjs/web';
import { AnimationFrame } from '../createAnimationFrame';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { PopupHandleStoreWithTriggers, PopupHandleStoreWithOpen } from '../../internals/contracts/popup';
export class BasePopupHandle<HandleStore extends PopupHandleStoreWithTriggers, Store extends HandleStore & PopupHandleStoreWithOpen> {
  private readonly attached: { store: Store; token: symbol }[] = [];
  private current: Store | null = null;
  private readonly version = createSignal(0);
  private readonly warning = new AnimationFrame();
  constructor(protected readonly fallbackStore: HandleStore, private readonly componentName: string, private readonly throwOnMissingTrigger = true) {}
  protected get attachedStore(): Store | null { return this.current; }
  get store(): HandleStore { this.version[0](); return this.current ?? this.fallbackStore; }
  get serverStore(): HandleStore { return this.fallbackStore; }
  attachStore(store: Store): () => void {
    if (isServer) return () => {};
    const entry = { store, token: Symbol() };
    this.attached.push(entry); this.activate(store);
    if (process.env.NODE_ENV !== 'production' && this.attached.length > 1) this.warning.request(() => {
      if (this.attached.length > 1) console.warn('Base UI: A handle is attached to more than one mounted root at the same time. The most recently mounted root takes over. A handle should be used by a single root that stays mounted for its lifetime.');
    });
    return () => {
      const index = this.attached.indexOf(entry);
      if (index < 0) return;
      this.attached.splice(index, 1); this.activate(this.attached.at(-1)?.store ?? null);
      if (this.attached.length <= 1) this.warning.cancel();
    };
  }
  private activate(store: Store | null) { if (this.current !== store) { this.current = store; this.version[1]((value) => value + 1); } }
  protected openByTrigger(id: string | null | undefined): void {
    if (!this.current) { if (process.env.NODE_ENV !== 'production') console.warn(`Base UI: ${this.componentName}Handle.open() was called while no root using this handle is mounted. The call was ignored; mount a root with this handle before opening it imperatively.`); return; }
    let trigger: Element | undefined;
    if (id) {
      for (const entry of [...this.attached].reverse()) { trigger = entry.store.context.triggerElements.getById(id); if (trigger) break; }
      trigger ??= this.fallbackStore.context.triggerElements.getById(id);
      if (!trigger) {
        if (this.throwOnMissingTrigger) throw new Error(`Base UI: ${this.componentName}Handle.open() was called with the trigger id "${id}", but no matching trigger is registered with this handle. An anchored popup cannot open without a trigger to anchor to. Pass the id of a mounted ${this.componentName}.Trigger that has this handle set on its "handle" prop.`);
        if (process.env.NODE_ENV !== 'production') console.warn(`Base UI: ${this.componentName}Handle.open: No trigger found with id "${id}". The popup will open, but the trigger will not be associated with it.`);
      }
    }
    this.current.setOpen(true, createChangeEventDetails('imperative-action', undefined, trigger));
  }
  protected closePopup(): void {
    if (!this.current) { if (process.env.NODE_ENV !== 'production') console.warn(`Base UI: ${this.componentName}Handle.close() was called while no root using this handle is mounted. The call was ignored.`); return; }
    this.current.setOpen(false, createChangeEventDetails('imperative-action'));
  }
}
export type { PopupHandleAttachment, PopupHandleStoreProvider, PopupHandleStoreWithOpen, PopupHandleStoreWithTriggers } from '../../internals/contracts/popup';
