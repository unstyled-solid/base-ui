import { createControlled } from '../../utils/createControlled';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MenuRoot } from '../root/MenuRoot';
import { createMenuItem } from '../item/createMenuItem';
import { elementProps } from '../utils/props';
import { itemMapping } from '../utils/stateAttributesMapping';
import { MenuCheckboxItemContext } from './MenuCheckboxItemContext';
import { onCleanup } from 'solid-js';
export interface MenuCheckboxItemState { disabled: boolean; highlighted: boolean; checked: boolean }
export interface MenuCheckboxItemProps extends BaseUIComponentProps<'div', MenuCheckboxItemState> {
  checked?: boolean; defaultChecked?: boolean; disabled?: boolean; nativeButton?: boolean; closeOnClick?: boolean; label?: string;
  onCheckedChange?(checked: boolean, details: MenuRoot.ChangeEventDetails): void;
}
export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const checked = createControlled<boolean, MenuRoot.ChangeEventDetails>({ value: () => props.checked,
    get defaultValue() { return props.defaultChecked ?? false; }, onChange: () => props.onCheckedChange, name: 'MenuCheckboxItem', state: 'checked' });
  const item = createMenuItem(props, { closeOnClick: false });
  let pendingToggle: boolean | undefined;
  let toggleVersion = 0;
  onCleanup(() => { toggleVersion += 1; pendingToggle = undefined; });
  function toggle(event: MouseEvent) {
    const next = !(checked.controlled ? checked.value() : pendingToggle ?? checked.value());
    const details = createChangeEventDetails<'item-press', { preventUnmountOnClose(): void }>('item-press', event, undefined, { preventUnmountOnClose() {} });
    const result = checked.request(next, details);
    if (result.accepted && !checked.controlled) {
      pendingToggle = next;
      const version = ++toggleVersion;
      queueMicrotask(() => { if (version === toggleVersion) pendingToggle = undefined; });
    }
  }
  const state: MenuCheckboxItemState = {
    get checked() { return checked.value(); }, get disabled() { return item.disabled(); }, get highlighted() { return item.highlighted(); },
  };
  const nativeProps = elementProps(props, ['checked', 'defaultChecked', 'onCheckedChange', 'disabled', 'nativeButton', 'closeOnClick', 'label']);
  return <MenuCheckboxItemContext value={state}>{createRenderElement('div', props, {
    state, stateAttributesMapping: itemMapping, get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref]; },
    get props() { return [item.store.state.itemProps, { role: 'menuitemcheckbox', get 'aria-checked'() { return checked.value(); },
      onClick: toggle,
    }, nativeProps]; },
    propGetter: item.getItemProps,
  })}</MenuCheckboxItemContext>;
}
export type MenuCheckboxItemChangeEventReason = MenuRoot.ChangeEventReason;
export type MenuCheckboxItemChangeEventDetails = MenuRoot.ChangeEventDetails;
export namespace MenuCheckboxItem {
  export type Props = MenuCheckboxItemProps; export type State = MenuCheckboxItemState;
  export type ChangeEventReason = MenuCheckboxItemChangeEventReason; export type ChangeEventDetails = MenuCheckboxItemChangeEventDetails;
}
