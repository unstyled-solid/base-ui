import type { MenuRoot } from './root/MenuRoot';
import type { MenuTrigger } from './trigger/MenuTrigger';
import type { MenuFilterProvider } from './filter-provider/MenuFilterProvider';
import type { MenuCheckboxItem } from './checkbox-item/MenuCheckboxItem';
import type { MenuLinkItem } from './link-item/MenuLinkItem';
import type { ComponentProps } from '@solidjs/web';
const actions: MenuRoot.Actions = { close() {}, unmount() {}, highlightItem(target) { const valid: MenuRoot.HighlightItemTarget = target; void valid; } };
const payloadTrigger: MenuTrigger.Props<number> = { payload: 1 };
const root: MenuRoot.Props<number> = { actionsRef: { current: actions }, children: data => String(data.payload),
  onOpenChange(open, details) { details.cancel(); details.allowPropagation(); details.preventUnmountOnClose(); void open; },
  onItemHighlighted(element, details) { const label: string | undefined = details.label; void [element, label]; },
};
const filter: MenuFilterProvider.Props = { autoHighlight: 'always', filter: null, onValueChange(value, details) { details.cancel(); void value; } };
const checkbox: MenuCheckboxItem.Props = { defaultChecked: true, onCheckedChange(value, details) { details.cancel(); void value; } };
const link: MenuLinkItem.Props = { href: '#native', render(props) { const href: ComponentProps<'a'>['href'] = props.href; return href; } };
const highlight: MenuRoot.Props = { onItemHighlighted(_item, details) {
  if (details.reason === 'keyboard') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'pointer') { const event: MouseEvent | PointerEvent = details.event; void event; }
  // @ts-expect-error Source highlight notifications do not publish positional indices.
  details.index;
} };
// @ts-expect-error Payloads retain their generic type.
const badPayload: MenuTrigger.Props<number> = { payload: 'text' };
// @ts-expect-error Root actions have an explicit target vocabulary.
actions.highlightItem('middle');
// @ts-expect-error Source supports false/true/always, not an arbitrary mode.
const badFilter: MenuFilterProvider.Props = { autoHighlight: 'first' };
void [root, filter, checkbox, link, highlight, payloadTrigger, badPayload, badFilter];
