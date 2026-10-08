// Adapted from pinned Base UI DrawerProvider (MIT).
import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { DrawerProviderContext, createVisualStateStore } from './DrawerProviderContext';

export function DrawerProvider(props: DrawerProviderProps) {
  const openDrawers = new Set<object>();
  const [active, setActive] = createSignal(false);
  const [registered, setRegistered] = createSignal<readonly { drawer: object; open: () => boolean }[]>([]);
  const value: DrawerProviderContext = {
    get active() { return active() || registered().some(entry => entry.open()); },
    registerDrawer(drawer, open) {
      const entry = { drawer, open };
      setRegistered(previous => [...previous, entry]);
      return () => { setRegistered(previous => previous.filter(item => item !== entry)); };
    },
    setDrawerOpen(drawer, open) {
      if (openDrawers.has(drawer) === open) return;
      if (open) openDrawers.add(drawer); else openDrawers.delete(drawer);
      setActive(openDrawers.size > 0);
    },
    removeDrawer(drawer) { value.setDrawerOpen(drawer, false); },
    visualStateStore: createVisualStateStore(),
  };
  return <DrawerProviderContext value={value}>{props.children}</DrawerProviderContext>;
}
export interface DrawerProviderProps { children?: JSX.Element }
export interface DrawerProviderState {}
export namespace DrawerProvider { export type Props = DrawerProviderProps; export type State = DrawerProviderState; }
