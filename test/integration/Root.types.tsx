import type { BaseUIEvent, BaseUIChangeEventDetails, BaseUIGenericEventDetails, ComponentRenderFn, HTMLProps } from '../../packages/solid/src/types';
import type { HTMLProps as RootHTMLProps, ComponentRenderFn as RootRenderFn } from '../../packages/solid/src/index';
import { Combobox, Dialog, createRender, useRender } from '../../packages/solid/src/index';
import type { ExtendedRefs, UseFloatingOptions, UseFloatingReturn, Delay, Placement } from '../../packages/solid/src/floating-ui-react/types';

// Compile-time consumer capabilities: native bound handlers, complete Solid class
// values/refs, render JSX, reason discrimination, and generic namespace aliases.
const props: HTMLProps<HTMLButtonElement> = {
  class: ['one', { two: true }], ref: (node) => { node?.focus(); },
  onClick: [(label: string, event: BaseUIEvent<MouseEvent & { currentTarget: HTMLButtonElement }>) => {
    label.toUpperCase(); event.currentTarget.disabled = true; event.preventBaseUIHandler();
  }, 'label'],
};
const rootProps: RootHTMLProps<HTMLButtonElement> = props;
const render: ComponentRenderFn<HTMLProps<HTMLButtonElement>, { pressed: boolean }> = (elementProps, state) =>
  <button {...elementProps} aria-pressed={state.pressed ? 'true' : 'false'} />;
const rootRender: RootRenderFn<HTMLProps<HTMLButtonElement>, { pressed: boolean }> = render;
const nativeRender: typeof createRender = useRender;
type Item = { id: number; label: string };
const combobox: Combobox.Root.Props<Item> = { items: [{ id: 1, label: 'one' }], itemToStringLabel: (item) => item.label };
const dialog: Dialog.Root.Props = { onOpenChange: (_open, details) => details.cancel() };
function discriminate(details: BaseUIChangeEventDetails<'escape-key' | 'trigger-focus'>) {
  if (details.reason === 'escape-key') details.event.key.toUpperCase();
  else details.event.relatedTarget;
  details.cancel(); details.allowPropagation();
}
const generic: BaseUIGenericEventDetails<'none'> = { reason: 'none', event: new Event('change') };
const delay: Delay = { open: 100, close: 200 };
const placement: Placement = 'bottom-start';
function floating(options: UseFloatingOptions, value: UseFloatingReturn, refs: ExtendedRefs, details: BaseUIChangeEventDetails<'none'>) {
  options.rootContext.setOpen(false, details);
  refs.setReference(null); refs.setFloating(null); refs.setPositionReference(null);
  value.update(); value.floatingStyles;
}
// @ts-expect-error Native events, not React synthetic-event objects.
const invalidEvent: BaseUIEvent<{ nativeEvent: Event }> = {};
// @ts-expect-error Source React className is intentionally Solid-native class.
const invalidProps: HTMLProps<HTMLButtonElement> = { className: 'legacy' };
void [rootProps, rootRender, nativeRender, combobox, dialog, discriminate, generic, delay, placement, floating, invalidEvent, invalidProps];
