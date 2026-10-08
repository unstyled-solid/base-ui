import { createMemo, createSignal, onCleanup, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
import type { TabsTab } from '../tab/TabsTab';

export interface PanelRegistration {
  value: TabsTab.Value;
  id: string | undefined;
  hidden: boolean;
  keepMounted: boolean;
}

export function samePanelRegistration(previous: PanelRegistration, next: PanelRegistration) {
  return Object.is(previous.value, next.value) && previous.id === next.id &&
    previous.hidden === next.hidden && previous.keepMounted === next.keepMounted;
}

/** Adapt TabsPanel's layout-effect dependencies and TabsRoot's ID-guarded map. */
export function createMountedPanels() {
  // This source describes component ownership only. Live registration policy is
  // read by the derivation below, never copied into a signal by a panel effect.
  const [owners, setOwners] = createSignal<Accessor<PanelRegistration>[]>([], { ownedWrite: true });
  interface Snapshot {
    registrations: Map<Accessor<PanelRegistration>, PanelRegistration>;
    ids: Map<TabsTab.Value, string>;
  }
  const mounted = createMemo<Snapshot>((previous) => {
    const registrations = new Map(owners().map((owner) => [owner, owner()] as const));
    const ids = new Map(previous?.ids);
    // React cleans up changed/removed effects before running new registrations.
    // Cleanup compares IDs, not owners, and never resurrects a shadowed panel.
    for (const [owner, before] of previous?.registrations ?? []) {
      const next = registrations.get(owner);
      if ((!next || !samePanelRegistration(before, next)) && before.id != null &&
        (!before.hidden || before.keepMounted) && ids.get(before.value) === before.id) {
        ids.delete(before.value);
      }
    }
    for (const [owner, next] of registrations) {
      const before = previous?.registrations.get(owner);
      if ((!before || !samePanelRegistration(before, next)) && next.id != null &&
        (!next.hidden || next.keepMounted)) {
        ids.set(next.value, next.id);
      }
    }
    return { registrations, ids };
  }, { name: 'Tabs.mountedPanelIds' });

  return {
    getId: (value: TabsTab.Value) => mounted().ids.get(value),
    register(policy: Accessor<PanelRegistration>) {
      // React's registration is a layout effect: SSR renders panels, but has no
      // committed registrations or aria-controls until the client owns them.
      if (isServer) return;
      // Each component gets its own registration identity, even when two callers
      // happen to supply the same policy accessor or ID.
      const owner = () => policy();
      setOwners((previous) => [...previous, owner]);
      onCleanup(() => setOwners((previous) => previous.filter((entry) => entry !== owner)));
    },
  };
}
