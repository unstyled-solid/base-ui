import { isElement } from '@floating-ui/utils/dom';
import { getTarget, isInteractiveElement } from '../../floating-ui-react/utils/element';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { ComboboxStore } from '../store';
export function handleInputPress(event: MouseEvent & { baseUIHandlerPrevented?: boolean }, model: ComboboxStore, disabled: boolean, ignore?: (target: Element | null) => boolean) {
  if (event.baseUIHandlerPrevented) return;
  const target = getTarget(event);
  const element = isElement(target) ? target : null;
  if (element !== event.currentTarget && (ignore?.(element) || isInteractiveElement(element))) return;
  event.preventDefault();
  if (disabled) return;
  model.state.inputElement?.focus();
  if (model.state.openOnInputClick) model.context.setOpen(true, createChangeEventDetails('input-press', event));
}
