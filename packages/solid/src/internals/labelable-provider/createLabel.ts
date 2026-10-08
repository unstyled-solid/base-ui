import type { JSX } from '@solidjs/web';
import type { Setter } from 'solid-js';
import { createRegisteredLabelId } from '../../utils/createRegisteredLabelId';
import { useLabelableContext } from './LabelableContext';
export interface UseLabelParameters {
  id?: string | undefined;
  fallbackControlId?: string | undefined;
  native?: boolean | undefined;
  setLabelId?: Setter<string | undefined> | undefined;
  focusControl?: ((event: MouseEvent, controlId: string | undefined) => void) | undefined;
}
export type UseLabelReturnValue = JSX.LabelHTMLAttributes<HTMLLabelElement>;
export function createLabel(params: UseLabelParameters = {}): UseLabelReturnValue {
  const context = useLabelableContext();
  const sync = ((next: string | undefined | ((current: string | undefined) => string | undefined)) => {
    context?.setLabelId(next);
    return params.setLabelId?.(next);
  }) as Setter<string | undefined>;
  const id = createRegisteredLabelId(() => params.id, sync);
  const controlId = () => context?.controlId ?? params.fallbackControlId;
  function interact(event: MouseEvent) {
    const target = event.composedPath()[0] as Element | undefined;
    if (target?.closest?.('button,input,select,textarea')) return;
    if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    if (params.native) return;
    const resolved = controlId();
    if (params.focusControl) { params.focusControl(event, resolved); return; }
    if (!resolved) return;
    const document = (event.currentTarget as Element).ownerDocument;
    const element = document.getElementById(resolved);
    if (element) focusElementWithVisible(element);
  }
  return {
    get id() { return id(); },
    get for() { return params.native ? controlId() : undefined; },
    get onMouseDown() { return params.native ? interact : undefined; },
    get onClick() { return params.native ? undefined : interact; },
    get onPointerDown() { return params.native ? undefined : (event: PointerEvent) => event.preventDefault(); },
  };
}
export function focusElementWithVisible(element: HTMLElement): void {
  element.focus({ focusVisible: true } as FocusOptions);
}
export { createLabel as useLabel };
