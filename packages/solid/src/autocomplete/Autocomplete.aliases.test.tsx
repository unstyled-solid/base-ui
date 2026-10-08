import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../test';
import { Autocomplete, AutocompleteItemDataAttributes, AutocompleteTriggerDataAttributes,
  AutocompleteInputGroupDataAttributes, AutocompleteSeparatorDataAttributes } from './index';
import * as Combobox from '../combobox/index.parts';
import { useCoreFilter } from '../combobox/root/utils/useFilter';
import { useFilteredItems } from '../combobox/root/utils/useFilteredItems';
import { ListboxSeparator } from '../utils/listbox-separator/ListboxSeparator';

// Borrowed source/test ownership: each exact alias retains its Combobox leaf's
// conformance suite, data/CSS variables and platform tests. Root/Form/Highlight/
// Lifecycle tests replay the none-mode-specific compositions using these aliases.
// Input.android/Input.gecko/Status.iOS and positioning/focus/layout qualification:
// bsolid-browser + bsolid-accessibility + bsolid-hydration (not jsdom evidence).
describe('Autocomplete source-exact aliases', () => {
  const aliases = [
    'Input', 'Icon', 'Clear', 'List', 'Status', 'Portal', 'Backdrop', 'Positioner',
    'Popup', 'Arrow', 'Group', 'GroupLabel', 'Row', 'Collection', 'Empty',
    'Item', 'Trigger', 'InputGroup',
  ] as const;
  it.each(aliases)('%s is the original Combobox function, not a replacement engine', (name) => {
    expect(Autocomplete[name]).toBe(Combobox[name]);
  });
  it('exposes exactly the source parts and utility names', () => {
    expect(Object.keys(Autocomplete).sort()).toEqual([
      ...aliases, 'Root', 'Value', 'Separator', 'useFilter', 'useFilteredItems',
    ].sort());
    expect(Autocomplete.useFilter).toBe(useCoreFilter);
    expect(Autocomplete.useFilteredItems).toBe(useFilteredItems);
    expect(Autocomplete.Separator).toBe(ListboxSeparator);
  });
  it('omits selection and placeholder data constants', () => {
    expect(Object.keys(AutocompleteItemDataAttributes).sort()).toEqual(['disabled', 'highlighted']);
    expect(AutocompleteTriggerDataAttributes).not.toHaveProperty('placeholder');
    expect(AutocompleteInputGroupDataAttributes).not.toHaveProperty('placeholder');
  });
  it('exposes the orientation attribute actually rendered by Separator', async () => {
    const view = await createRenderer().render(() => <Autocomplete.Separator orientation="vertical" />);
    expect(view.getByRole('presentation')).toHaveAttribute(AutocompleteSeparatorDataAttributes.orientation, 'vertical');
  });
});
