import { createContext, createEffect, createSignal, useContext } from 'solid-js';
export interface ClosePartContextValue { register(): () => void }
export const ClosePartContext = createContext<ClosePartContextValue | null>(null);
export function createClosePartCount() {
  const [count, setCount] = createSignal(0);
  const context: ClosePartContextValue = { register() { let active = true; setCount((count) => count + 1); return () => { if (active) { active = false; setCount((count) => Math.max(0, count - 1)); } }; } };
  return { context, get hasClosePart() { return count() > 0; } };
}
export function createClosePartRegistration(): void { const context = useContext(ClosePartContext); createEffect(() => context, (value) => value?.register()); }
export { createClosePartCount as useClosePartCount, createClosePartRegistration as useClosePartRegistration };
