import type { JSX } from '@solidjs/web';
import { useToastProviderContext } from './provider/ToastProviderContext';
import type { ToastPositionerProps } from './positioner/ToastPositioner';

/** A live, owner-local view; read `toasts` in a tracked computation. */
export function useToastManager<Data extends object = any>(): UseToastManagerReturnValue<Data> {
  const store = useToastProviderContext();
  return {
    get toasts() { return store.snapshot().toasts; },
    add: store.addToast, update: store.updateToast, close: store.closeToast, promise: store.promiseToast,
  };
}
export interface ToastObject<Data extends object = any> {
  id: string;
  /** Native element accessor; no React ref object. */
  ref?: (() => HTMLElement | null) | undefined;
  title?: JSX.Element;
  description?: JSX.Element;
  type?: string | undefined;
  timeout?: number | undefined;
  priority?: 'low' | 'high' | undefined;
  transitionStatus?: 'starting' | 'ending' | undefined;
  updateKey?: number | undefined;
  limited?: boolean | undefined;
  height?: number | undefined;
  onClose?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  actionProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement> | undefined;
  positionerProps?: ToastManagerPositionerProps | undefined;
  data?: Data | undefined;
}
export interface ToastManagerPositionerProps extends Omit<ToastPositionerProps, 'anchor' | 'toast'> {
  anchor?: Element | null | undefined;
}
export interface UseToastManagerReturnValue<Data extends object = any> {
  readonly toasts: ToastObject<Data>[];
  add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
  close: (id?: string) => void;
  update: <T extends Data = Data>(id: string, options: ToastManagerUpdateOptions<T> | ((previous: ToastObject<T>) => ToastManagerUpdateOptions<T>)) => void;
  promise: <Value, T extends Data = Data>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, T>) => Promise<Value>;
}
export interface ToastManagerAddOptions<Data extends object = any> extends Omit<ToastObject<Data>, 'id' | 'height' | 'ref' | 'limited' | 'updateKey'> { id?: string | undefined }
export interface ToastManagerUpdateOptions<Data extends object = any> extends Partial<Omit<ToastObject<Data>, 'id' | 'ref' | 'height' | 'transitionStatus' | 'limited' | 'updateKey'>> {}
export interface ToastManagerPromiseOptions<Value, Data extends object = any> {
  loading: string | ToastManagerUpdateOptions<Data>;
  success: string | ToastManagerUpdateOptions<Data> | ((value: Value) => string | ToastManagerUpdateOptions<Data>);
  error: string | ToastManagerUpdateOptions<Data> | ((error: any) => string | ToastManagerUpdateOptions<Data>);
}
