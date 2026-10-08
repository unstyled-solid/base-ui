// Compile-only source cases: ComboboxRoot.spec.tsx (group-shape / inference).
import { createComboboxItems } from './createItems';
import type { ComboboxItemCollection } from './itemCollection';
import { ComboboxRoot } from '../root/ComboboxRoot';
export function collectionTypeCases() {
  const users = [{ id: 1, name: 'Alice' }];
  const flat: ComboboxItemCollection<{ id: number; name: string }, number> = createComboboxItems(users, { getValue: (u) => u.id, getLabel: (u) => u.name });
  const grouped: typeof flat = createComboboxItems([{ items: users }] as const, { getValue: (u) => u.id, getLabel: (u) => u.name });
  // @ts-expect-error Value projection is constrained to non-null primitives.
  createComboboxItems(users, { getValue: (u) => u, getLabel: (u) => u.name });
  // @ts-expect-error Symbols are not derived values.
  createComboboxItems(users, { getValue: () => Symbol(), getLabel: (u) => u.name });
  // @ts-expect-error Null is reserved for absence.
  createComboboxItems(users, { getValue: () => null, getLabel: (u) => u.name });
  // @ts-expect-error Both accessors are required.
  createComboboxItems(users, { getValue: (u) => u.id });
  interface Tree { id: number; items?: readonly Tree[] }
  // @ts-expect-error Optional array-valued items is group-shaped.
  createComboboxItems([] as Tree[], { getValue: (u: Tree) => u.id, getLabel: (u: Tree) => String(u.id) });
  // @ts-expect-error Explicit unknown items field can contain arrays.
  createComboboxItems([] as { id: number; items: unknown }[], { getValue: (u) => u.id, getLabel: (u) => String(u.id) });
  // @ts-expect-error Object items field can contain arrays.
  createComboboxItems([] as { id: number; items: object }[], { getValue: (u) => u.id, getLabel: (u) => String(u.id) });
  // @ts-expect-error ArrayLike can contain arrays.
  createComboboxItems<{ id: number; items: ArrayLike<string> }, number>([], { getValue: (u) => u.id, getLabel: (u) => String(u.id) });
  interface Indexed { id: number; name: string; [key: string]: unknown }
  createComboboxItems([] as Indexed[], { getValue: (u) => u.id, getLabel: (u) => u.name });
  interface ExplicitIndexed extends Indexed { items: unknown }
  // @ts-expect-error Explicit fields remain guarded even with an index signature.
  createComboboxItems([] as ExplicitIndexed[], { getValue: (u) => u.id, getLabel: (u) => u.name });
  createComboboxItems([] as any[], { getValue: (u) => u.id as number, getLabel: (u) => u.name as string });
  createComboboxItems([] as unknown[], { getValue: () => 1, getLabel: () => 'unknown' });
  createComboboxItems([{ id: 1, items: 3 }], { getValue: (u) => u.id, getLabel: (u) => String(u.items) });
  const pending: typeof flat = createComboboxItems(undefined as typeof users | undefined, { getValue: (u) => u.id, getLabel: (u) => u.name });
  // @ts-expect-error Opaque collections have no public members.
  flat.data;
  // @ts-expect-error Collection source items are invariant.
  const narrowed: ComboboxItemCollection<{ id: number; name: string; extra: true }, number> = flat;
  const readonlyValues = [1, 2] as const;
  return <>
    <ComboboxRoot items={flat} inputValue={0} defaultInputValue={12} />
    <ComboboxRoot items={flat} inputValue={['one', 'two'] as const} />
    {/* @ts-expect-error Input text values do not accept selected item objects. */}
    <ComboboxRoot items={flat} inputValue={users[0]} />
    {/* @ts-expect-error Completion scope is a private Autocomplete/engine seam. */}
    <ComboboxRoot items={flat} inlineCompletionScope={{}} />
    <ComboboxRoot items={flat} onValueChange={(value) => value?.toFixed()} filter={(u) => u.name !== ''} />
    <ComboboxRoot items={grouped} multiple value={readonlyValues} onValueChange={(value) => value.pop()} />
    <ComboboxRoot items={pending} />
    {/* @ts-expect-error External collection results remain source-domain items. */}
    <ComboboxRoot items={flat} filteredItems={[1]} />
    {/* @ts-expect-error Multiple values must be arrays. */}
    <ComboboxRoot items={flat} multiple defaultValue={1} />
  </>;
}
