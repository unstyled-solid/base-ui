import { createEffect, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { ToastManager } from '../createToastManager';
import { ToastStore } from '../store';
import { ToastContext } from './ToastProviderContext';

export function ToastProvider(props: ToastProviderProps) {
  const store = new ToastStore({
    timeout: untrack(() => props.timeout ?? 5000), limit: untrack(() => props.limit ?? 3),
    toasts: [], viewport: null, hovering: false, focused: false, isWindowFocused: true, prevFocusElement: null,
  });
  onCleanup(store.dispose);
  createEffect(() => [props.timeout ?? 5000, props.limit ?? 3] as const,
    ([timeout, limit]) => { store.syncProviderProps(timeout, limit); });
  createEffect(() => props.toastManager, (manager) => manager?.[' subscribe'](({ action, options }) => {
    if (action === 'promise') store.promiseToast(options.promise, options);
    else if (action === 'update') store.updateToast(options.id, options.updates);
    else if (action === 'close') store.closeToast(options.id);
    else store.addToast(options);
  }));
  return <ToastContext value={store}>{props.children}</ToastContext>;
}
export interface ToastProviderProps { children?: JSX.Element; timeout?: number | undefined; limit?: number | undefined; toastManager?: ToastManager | undefined }
export interface ToastProviderState {}
export namespace ToastProvider { export type Props = ToastProviderProps; export type State = ToastProviderState }
