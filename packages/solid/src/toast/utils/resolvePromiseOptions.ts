import type { ToastManagerUpdateOptions } from '../useToastManager';
export function resolvePromiseOptions<Value, Data extends object>(
  option: string | ToastManagerUpdateOptions<Data> | ((value: Value) => string | ToastManagerUpdateOptions<Data>),
  value?: Value,
): ToastManagerUpdateOptions<Data> {
  const resolved = typeof option === 'function' ? option(value as Value) : option;
  return typeof resolved === 'string' ? { description: resolved } : resolved;
}
