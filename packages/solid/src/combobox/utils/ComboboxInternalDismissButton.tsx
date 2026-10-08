import type { InputRef } from '../../utils/createMergedRefs';
import { visuallyHiddenInput } from '../../utils/visuallyHidden';
import { createButton } from '../../internals/use-button';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
export function ComboboxInternalDismissButton(props: { ref?: InputRef<HTMLSpanElement> }) {
  const model = useComboboxRootContext();
  const button = createButton({ native: false });
  return createRenderElement<{}, HTMLSpanElement>('span', {}, { ref: [props.ref, button.buttonRef], props: [{
    'aria-label': 'Dismiss', tabIndex: undefined, style: visuallyHiddenInput,
    onClick(event: MouseEvent & { currentTarget: HTMLSpanElement }) { model.context.setOpen(false, createChangeEventDetails('close-press', event, event.currentTarget)); },
  }, button.getButtonProps] });
}
