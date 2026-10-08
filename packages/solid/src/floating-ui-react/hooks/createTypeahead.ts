import { createEffect, untrack, type Accessor } from 'solid-js';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { InteractionProps } from './createDismiss';
import { createTimeout } from '../../utils/createTimeout';
import { isElementVisible, isListIndexDisabled, type DisabledIndices } from '../utils/composite';
import { contains } from '../utils/element';
export interface UseTypeaheadProps {
  listRef: { current: (string | null)[] }; activeIndex: number | null;
  elementsRef?: { current: (HTMLElement | null)[] } | undefined; disabledIndices?: DisabledIndices | undefined;
  onMatch?: ((index: number, event: KeyboardEvent) => void) | undefined; onTyping?: ((typing: boolean) => void) | undefined;
  enabled?: boolean | undefined; resetMs?: number | undefined; selectedIndex?: number | null | undefined;
}
export function createTypeahead(input: FloatingRootContext | Accessor<FloatingRootContext>, options: UseTypeaheadProps): InteractionProps {
  const root = () => typeof input === 'function' ? input() : input, timeout = createTimeout();
  let text = '', previous: number | null = untrack(() => options.selectedIndex ?? options.activeIndex ?? -1), matched: number | null = null;
  const available = (index: number) => { const element = options.elementsRef?.current[index]; return !(element && (!isElementVisible(element) || element.matches(':disabled'))) && (options.disabledIndices == null || !isListIndexDisabled([], index, options.disabledIndices)); };
  const match = (value: string, start = 0) => {
    const list = options.listRef.current; if (!list.length) return -1;
    const normalized = (start % list.length + list.length) % list.length;
    for (let offset = 0; offset < list.length; offset++) { const index = (normalized + offset) % list.length; if (list[index]?.toLowerCase().startsWith(value.toLowerCase()) && available(index)) return index; }
    return -1;
  };
  const reset = () => { timeout.clear(); text = ''; previous = matched; options.onTyping?.(false); };
  createEffect(() => ({ open: root().state.open, selected: options.selectedIndex ?? null, enabled: options.enabled ?? true }), (next) => {
    if (!next.enabled || next.open || next.selected === null) { timeout.clear(); matched = null; if (text) untrack(reset); }
  });
  const shared: NonNullable<InteractionProps['reference']> = {
    onKeyDown(event) {
      if (options.enabled === false || event.isComposing) return;
      const stop = () => { event.preventDefault(); event.stopPropagation(); };
      const list = options.listRef.current;
      if (text.length && event.key === ' ') { stop(); options.onTyping?.(true); }
      if (text && text[0] !== ' ' && match(text) === -1 && event.key !== ' ') options.onTyping?.(false);
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
      if (root().state.open && event.key !== ' ') { stop(); options.onTyping?.(true); }
      const newSession = text === '';
      if (newSession) previous = options.selectedIndex ?? options.activeIndex ?? -1;
      const rapid = list.every((label, index) => label && available(index) ? label[0]?.toLowerCase() !== label[1]?.toLowerCase() : true);
      if (rapid && text === event.key) { text = ''; previous = matched; }
      text += event.key;
      timeout.start(options.resetMs ?? 750, () => { text = ''; previous = matched; options.onTyping?.(false); });
      const start = newSession ? options.selectedIndex ?? options.activeIndex ?? -1 : previous;
      const index = match(text, (start ?? 0) + 1);
      if (index !== -1) { options.onMatch?.(index, event); matched = index; }
      else if (event.key !== ' ') { text = ''; options.onTyping?.(false); }
    },
    onBlur(event) { const next = event.relatedTarget as Element | null; if (!contains(root().state.domReferenceElement, next) && !contains(root().state.floatingElement, next)) reset(); },
  };
  return { get reference() { return options.enabled === false ? undefined : shared; }, get floating() { return options.enabled === false ? undefined : shared; } };
}
export { createTypeahead as useTypeahead };
