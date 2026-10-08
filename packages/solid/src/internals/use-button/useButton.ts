import type { JSX } from '@solidjs/web';
import type { HTMLProps } from '../types';
import { createEffect, createMemo, createSignal, merge, omit } from 'solid-js';
import { mergeProps, makeEventPreventable } from '../../merge-props';
import { createFocusableWhenDisabled } from '../../utils/createFocusableWhenDisabled';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import { useCompositeRootContext } from '../composite/root/CompositeRootContext';
export interface UseButtonParameters { disabled?: boolean | undefined; focusableWhenDisabled?: boolean | undefined; tabIndex?: number | undefined; native?: boolean | undefined; composite?: boolean | undefined }
export interface UseButtonReturnValue {
  getButtonProps(externalProps?: HTMLProps): JSX.HTMLAttributes<HTMLElement>;
  buttonRef(element: HTMLElement | null): void;
}
export interface UseButtonState {}
/** Live parameter object. Composite is the sole owner of activation semantics. */
export function createButton(params: UseButtonParameters = {}): UseButtonReturnValue {
  const context = useCompositeRootContext(true);
  const composite = createMemo(() => params.composite ?? context !== null, { name: 'Button.composite' });
  const native = createMemo(() => params.native ?? true, { name: 'Button.native' });
  const disabled = createMemo(() => params.disabled ?? false, { name: 'Button.disabled' });
  // Renderer-owned ref removal can run while its host's reactive owner disposes.
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const { props: focusProps } = createFocusableWhenDisabled({
    get disabled() { return disabled(); },
    get focusableWhenDisabled() { return params.focusableWhenDisabled; },
    get composite() { return composite(); },
    get tabIndex() { return params.tabIndex; },
    get isNativeButton() { return native(); },
  });
  createEffect(() => ({ node: element(), native: native(), composite: composite(), disabled: disabled(), nativeDisabled: focusProps.disabled }), (next) => {
    if (!next.node) return;
    const button = next.node.tagName === 'BUTTON';
    if (process.env.NODE_ENV !== 'production' && next.native !== button) {
      console.error(`Base UI: A component that acts as a button expected ${next.native ? 'a native <button>' : 'a non-<button>'} because nativeButton is ${next.native}. Use a matching render element or change nativeButton to preserve button semantics.`);
    }
    if (button && next.composite && next.disabled && next.nativeDisabled === undefined) (next.node as HTMLButtonElement).disabled = false;
  });
  function invoke(handler: unknown, event: Event) {
    if (Array.isArray(handler)) return handler[0](handler[1], event);
    if (handler !== null && typeof handler === 'object' && typeof Reflect.get(handler, '0') === 'function' && '1' in handler) return Reflect.get(handler, '0')(Reflect.get(handler, '1'), event);
    if (typeof handler === 'function') return handler(event);
  }
  return {
    buttonRef(node) { setElement(node); },
    getButtonProps(external = {}) {
      const other = omit(external, (key) => ['onClick', 'onMouseDown', 'onKeyUp', 'onKeyDown', 'onPointerDown'].includes(String(key)));
      return mergeProps<any>({
        onClick(event: MouseEvent) { if (disabled()) { event.preventDefault(); return; } invoke(external.onClick, event); },
        onMouseDown(event: MouseEvent) { if (!disabled()) invoke(external.onMouseDown, event); },
        onPointerDown(event: PointerEvent) { if (disabled()) { event.preventDefault(); return; } invoke(external.onPointerDown, event); },
        onKeyDown(event: KeyboardEvent) {
          if (disabled()) return;
          const base = makeEventPreventable(event);
          invoke(external.onKeyDown, base);
          if (base.baseUIHandlerPrevented) return;
          const target = event.currentTarget as HTMLElement;
          const current = event.target === target;
          const button = target.tagName === 'BUTTON';
          const link = !native() && target.tagName === 'A' && !!(target as HTMLAnchorElement).href;
          const space = event.key === ' ';
          const enter = event.key === 'Enter';
          const role = target.getAttribute('role');
          if (current && composite() && space) {
            if (event.defaultPrevented && (role?.startsWith('menuitem') || role === 'option' || role === 'gridcell')) return;
            event.preventDefault();
            if (!native() || button) { base.preventBaseUIHandler(); dispatchClickWithModifiers(target, event); }
            return;
          }
          if (!current || (native() ? !button : link) || native() || (!space && !enter)) {
            if (current && link && space) event.preventDefault();
            return;
          }
          if (event.defaultPrevented) return;
          event.preventDefault();
          if (enter) { base.preventBaseUIHandler(); dispatchClickWithModifiers(target, event); }
        },
        onKeyUp(event: KeyboardEvent) {
          if (disabled()) return;
          const base = makeEventPreventable(event);
          invoke(external.onKeyUp, base);
          const current = event.target === event.currentTarget;
          if (current && native() && composite() && (event.currentTarget as Element).tagName === 'BUTTON' && event.key === ' ') { event.preventDefault(); return; }
          if (base.baseUIHandlerPrevented) return;
          if (current && !native() && !composite() && !event.defaultPrevented && event.key === ' ') {
            base.preventBaseUIHandler(); dispatchClickWithModifiers(event.currentTarget as Element, event);
          }
        },
      }, merge(() => native() ? { type: 'button' } : { role: 'button' }), focusProps, other);
    },
  };
}
export { createButton as useButton };
