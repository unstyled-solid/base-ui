import { describe, it, expect } from 'vitest';
import { getFilter } from '../../../internals/filter';
import { createCollatorItemFilter, createSingleSelectionCollatorFilter, getComboboxPopupId } from './index';
import { useComboboxFilter } from './useFilter';
import { clickHighlightedItem, getIndexAfterChipRemoval } from '../../utils/parts';
import { handleInputPress } from '../../utils/handleInputPress';
import type { ComboboxStore } from '../../store';
import { vi } from 'vitest';
describe('Combobox filter utility source cases', () => {
  it('matches accents, case, punctuation and explicit locale', () => {
    const filter = createCollatorItemFilter(getFilter({ locale: 'en' }));
    expect(filter('Café', 'cafe')).toBe(true); expect(filter(null, '')).toBe(false);
    const turkish = createCollatorItemFilter(getFilter({ locale: 'tr' }));
    expect(turkish('İstanbul', 'istan')).toBe(true); expect(turkish('Isparta', 'ispa')).toBe(false);
  });
  it('shows all items only for a full single-selection query match', () => {
    const match = createSingleSelectionCollatorFilter(getFilter(), undefined, 'Banana');
    expect(match('Apple', 'BANANA')).toBe(true); expect(match('Apple', 'ban')).toBe(false); expect(match('Apple', '')).toBe(true);
  });
  it('uses selected-domain converter independently of source labels', () => {
    const label = Object.assign((item: { name: string }) => item.name, { selected: (value: number) => value === 2 ? 'Bob' : String(value) });
    const filter = createSingleSelectionCollatorFilter(getFilter(), label, 2);
    expect(filter({ name: 'Alice' }, 'Bob')).toBe(true); expect(filter({ name: 'Alice' }, 'bo')).toBe(false);
  });
  it('reads live multiple/value/options rather than capturing a selection', () => {
    const options = { multiple: false, value: 'Banana' }; const filter = useComboboxFilter(options);
    expect(filter.contains('Apple', 'Banana')).toBe(true); options.multiple = true;
    expect(filter.contains('Apple', 'Banana')).toBe(false); options.multiple = false; options.value = 'Cherry';
    expect(filter.contains('Apple', 'Banana')).toBe(false); expect(filter.contains('Apple', 'Cherry')).toBe(true);
  });
  it('uses one popup id convention and preserves missing ids', () => {
    expect(getComboboxPopupId('food')).toBe('food-popup'); expect(getComboboxPopupId(null)).toBeUndefined(); expect(getComboboxPopupId(undefined)).toBeUndefined();
  });
  it('rejects both nullish items and filters primitives and projected objects', () => {
    const core = getFilter({ locale: 'en' });
    const primitive = createCollatorItemFilter(core);
    const projected = createCollatorItemFilter(core, (item: { name: string }) => item.name);
    expect(primitive(null, 'app')).toBe(false);
    expect(primitive(undefined, 'app')).toBe(false);
    expect(primitive('Apple', 'app')).toBe(true);
    expect(projected({ name: 'Banana' }, 'nan')).toBe(true);
  });
  it('single-selection filtering rejects both nullish items before accepting an empty query', () => {
    const filter = createSingleSelectionCollatorFilter(getFilter({ locale: 'en' }));
    expect(filter(null, 'app')).toBe(false);
    expect(filter(undefined, 'app')).toBe(false);
    expect(filter('Apple', '')).toBe(true);
  });
  it('single-selection filtering otherwise matches the current item', () => {
    const filter = createSingleSelectionCollatorFilter(getFilter({ locale: 'en' }), undefined, 'Apple');
    expect(filter('Banana', 'app')).toBe(false);
    expect(filter('Banana', 'nan')).toBe(true);
  });
  it('uses default filter options when called without arguments', () => {
    expect(useComboboxFilter().contains('Apple', 'app')).toBe(true);
  });
  it('matches the start and end of labels with all source boundary cases', () => {
    const filter = useComboboxFilter({ locale: 'en' });
    expect(filter.startsWith('Éclair', 'ec')).toBe(true);
    expect(filter.startsWith('Éclair', 'clair')).toBe(false);
    expect(filter.startsWith('Éclair', '')).toBe(true);
    expect(filter.startsWith('Tea', 'teapot')).toBe(false);
    expect(filter.endsWith('Crème brûlée', 'BRULEE')).toBe(true);
    expect(filter.endsWith('Crème brûlée', 'crème')).toBe(false);
    expect(filter.endsWith('Crème brûlée', '')).toBe(true);
    expect(filter.endsWith('Tea', 'iced tea')).toBe(false);
    expect(filter.startsWith({ label: 'Banana' }, 'ban', (item) => item.label)).toBe(true);
  });
  it('filters selected and unselected items in single and multiple modes', () => {
    const options = { locale: 'en', multiple: false, value: 'Apple' };
    const filter = useComboboxFilter(options);
    expect(filter.contains('Banana', 'apple')).toBe(true);
    expect(filter.contains('Banana', 'nan')).toBe(true);
    options.multiple = true;
    expect(filter.contains('Banana', 'apple')).toBe(false);
    expect(filter.contains('Banana', 'nan')).toBe(true);
  });
});

describe('Combobox source part utility regressions', () => {
  it('returns no index after removing the only chip', () => {
    expect(getIndexAfterChipRemoval(0, 1)).toBe(undefined);
  });
  it('does nothing when the highlighted item is not rendered', () => {
    const model = { context: { listRef: { current: [] }, selectionEventRef: { current: null } } } as unknown as ComboboxStore;
    clickHighlightedItem(model, 1, new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(model.context.selectionEventRef.current).toBe(null);
  });
  it('clicks the rendered highlighted item with the originating event', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    let eventAtClick: Event | null = null;
    const click = vi.fn(() => { eventAtClick = model.context.selectionEventRef.current; });
    const model = { context: { listRef: { current: [{ click }] }, selectionEventRef: { current: null } } } as unknown as ComboboxStore;
    clickHighlightedItem(model, 0, event);
    expect(click).toHaveBeenCalledOnce();
    expect(eventAtClick).toBe(event);
    expect(model.context.selectionEventRef.current).toBe(null);
  });
  it('handles an input-area press whose target is not an Element', () => {
    const focus = vi.fn();
    const currentTarget = document.createElement('div');
    const event = new MouseEvent('mousedown', { cancelable: true });
    Object.defineProperties(event, {
      target: { value: document.createTextNode('padding') },
      currentTarget: { value: currentTarget },
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    const model = { state: { openOnInputClick: false, inputElement: { focus } } } as unknown as ComboboxStore;
    handleInputPress(event, model, false);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });
});
