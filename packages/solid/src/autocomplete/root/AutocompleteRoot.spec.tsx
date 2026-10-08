import { Autocomplete } from '../index';
import { Combobox } from '../../combobox';
import type { AutocompleteRootProps } from './AutocompleteRoot';
import { expectType } from '../../../test';

const objects = [{ value: 'a', label: 'apple' }, { value: 'b', label: 'banana' }];
const readonlyObjects = [{ value: 'a', label: 'apple' }, { value: 'b', label: 'banana' }] as const;
const groups = [{ value: 'fruits', items: readonlyObjects }] as const;

<Autocomplete.Root items={objects} itemToStringValue={(item) => item.value} />;
<Autocomplete.Root items={groups} itemToStringValue={(item) => item.label} />;
<Autocomplete.Root items={groups} itemToStringValue={(item) => {
  // @ts-expect-error grouped inference must yield a leaf, never the group
  return item.items;
}} />;
<Autocomplete.Root items={readonlyObjects} defaultValue="a" onValueChange={(value) => value.startsWith('a')} />;
<Autocomplete.Root items={objects} value="a" onValueChange={(value) => value.startsWith('a')} />;
// @ts-expect-error the value is input text, not a selected object
<Autocomplete.Root items={objects} value={objects[0]} />;
<Autocomplete.Root defaultValue="test" onValueChange={(value, details) => {
  // @ts-expect-error strings do not have array methods
  value.pop();
  // @ts-expect-error only multiple Combobox input clears expose this extension
  details.isItemPress;
}} />;
<Autocomplete.Root onOpenChange={(_open, details) => {
  details.preventUnmountOnClose();
  details.cancel();
  // @ts-expect-error Autocomplete open details do not expose multiple-selection extensions
  details.isItemPress;
}} />;
// @ts-expect-error normalized collection objects are not arrays
<Autocomplete.Root items={{ data: objects, value: (item: typeof objects[number]) => item.value }} />;
const collection = Combobox.createItems(objects, {
  getValue: (item) => item.value,
  getLabel: (item) => item.label,
});
// @ts-expect-error the real Combobox collection is not an Autocomplete item array
<Autocomplete.Root items={collection} />;
// @ts-expect-error selection APIs are intentionally absent
<Autocomplete.Root multiple />;
// @ts-expect-error internal query cannot be overridden
<Autocomplete.Root filterQuery="override" />;
// @ts-expect-error item selected state is absent in none mode
<Autocomplete.Item class={(state) => state.selected ? 'selected' : ''} />;
// @ts-expect-error placeholder state is absent
<Autocomplete.Trigger class={(state) => state.placeholder ? 'empty' : ''} />;
// @ts-expect-error no collection factory is exported by Autocomplete
Autocomplete.createItems;
// @ts-expect-error no Label part is exported
Autocomplete.Label;
// @ts-expect-error no Chips part is exported
Autocomplete.Chips;
// @ts-expect-error no Handle factory is exported
Autocomplete.createHandle;

<Autocomplete.Root onItemHighlighted={(_item, details) => {
  if (details.reason === 'pointer') {
    expectType<MouseEvent | PointerEvent, typeof details.event>(details.event);
    // @ts-expect-error mouse hover is not necessarily a pointer event
    details.event.getCoalescedEvents();
  } else if (details.reason === 'keyboard') {
    expectType<KeyboardEvent, typeof details.event>(details.event);
  } else {
    expectType<Event, typeof details.event>(details.event);
  }
}} />;

const nativeRef: AutocompleteRootProps<string>['actionsRef'] = (actions) => {
  actions?.highlightItem('next');
  actions?.close();
};
<Autocomplete.Root actionsRef={nativeRef} />;
<Autocomplete.Root value={0} defaultValue={12} />;
<Autocomplete.Root value={['one', 'two'] as const} defaultValue={['initial'] as const} />;
// @ts-expect-error completion scope is a private adapter/engine notification lane
<Autocomplete.Root inlineCompletionScope={{}} />;
// @ts-expect-error private completion must not become a public callback
<Autocomplete.Root onInlineCompletion={() => {}} />;
