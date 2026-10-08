// Adapted from Base UI AutocompleteRoot (MIT), SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createMemo, createSignal, untrack } from 'solid-js';
import { getFilter } from '../../internals/filter';
import { stringifyAsLabel } from '../../internals/resolveValueLabel';
import type { AutocompleteRootProps } from './AutocompleteRoot';

/** Only the typed/temporary display adapter. Combobox owns all collection and interaction state. */
export function createAutocompleteInput<Item>(props: AutocompleteRootProps<Item>) {
  const initialValue = untrack(() => props.defaultValue ?? '');
  const [internalValue, setInternalValue] = createSignal(initialValue);
  const mode = () => props.mode ?? 'list';
  const enableInline = createMemo(() => (mode() === 'both' || mode() === 'inline') && !props.readOnly);
  const externalValue = createMemo(() => props.value);
  const typedValue = () => (props.value !== undefined ? props.value ?? '' : internalValue());

  // An external value/inline-permission change retires a completion by identity.
  // Unlike a value equality check, a -> b -> a cannot revive an obsolete overlay.
  // No effect resets or copies derived state, including during held host updates.
  const completionScope = createMemo(() => ({ value: externalValue(), enabled: enableInline() }));
  const [completion, setCompletion] = createSignal<{
    scope: ReturnType<typeof completionScope>;
    label: string;
  } | null>(null);
  const collator = createMemo(() => getFilter({ locale: props.locale }));

  // Visible input, hidden/form controls and context readers share this display
  // boundary instead of inheriting completion bookkeeping dependencies.
  const inputValue = createMemo(() => {
    const scope = completionScope();
    const current = completion();
    return scope.enabled && current?.scope === scope && current.label !== ''
      ? current.label
      : typedValue();
  });

  const onInputValueChange: NonNullable<AutocompleteRootProps<Item>['onValueChange']> =
    (nextValue, details) => untrack(() => {
      // Cancellation must precede local writes; controlled requests are not acknowledgements.
      props.onValueChange?.(nextValue, details);
      if (details.isCanceled) return;
      setCompletion(null);
      if (props.value === undefined) setInternalValue(details.event.type === 'reset' ? initialValue : nextValue);
    });

  const onItemHighlighted: NonNullable<AutocompleteRootProps<Item>['onItemHighlighted']> =
    (item, details) => untrack(() => props.onItemHighlighted?.(item, details));
  const onInlineCompletion: NonNullable<AutocompleteRootProps<Item>['onItemHighlighted']> =
    (item, details) => untrack(() => {
      // Hover neither writes nor removes a keyboard completion.
      if (details.reason === 'pointer') return;
      setCompletion(enableInline() && item != null
        ? { scope: completionScope(), label: stringifyAsLabel(item, props.itemToStringValue) }
        : null);
    });

  return {
    inputValue,
    filterQuery: () => mode() === 'both' ? String(typedValue()).trim() : undefined,
    filter: () => mode() === 'inline' || mode() === 'none' || props.filter === null
      ? null
      : props.filter ?? collator().contains,
    mode,
    completionScope,
    onInputValueChange,
    onItemHighlighted,
    onInlineCompletion,
  };
}
