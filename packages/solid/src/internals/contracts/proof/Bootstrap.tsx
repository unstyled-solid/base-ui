import { createEffect, createUniqueId, onSettled } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { ComponentRenderFn } from '../render';

export interface ProofState { readonly count: number }
export interface ProofProps {
  count: number;
  class?: JSX.ClassValue;
  onActivate?: (event: MouseEvent) => void;
  onRef?: (element: HTMLButtonElement) => void;
  onEffect?: (count: number) => void;
  onCleanup?: (count: number) => void;
  onSettled?: () => void;
  onDispose?: () => void;
  render?: ComponentRenderFn<JSX.ButtonHTMLAttributes<HTMLButtonElement>, ProofState>;
}

/** Toolchain proof only: this is not a Base UI Button or the render foundation. */
export function Bootstrap(props: ProofProps) {
  const id = createUniqueId();
  const state: ProofState = { get count() { return props.count; } };
  const host = {
    id,
    type: 'button',
    get class() { return props.class; },
    get children() { return `Count: ${state.count}`; },
    ref: (element) => props.onRef?.(element),
    onClick: (event) => props.onActivate?.(event),
  } satisfies JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  createEffect(() => props.count, (count) => {
    props.onEffect?.(count);
    return () => props.onCleanup?.(count);
  });
  onSettled(() => {
    props.onSettled?.();
    return () => props.onDispose?.();
  });
  return props.render ? props.render(host, state) : <button {...host} />;
}
