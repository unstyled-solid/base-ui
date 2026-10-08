import { describe, expect, it } from 'vitest';
import { getFilter } from './filter';
import { defaultItemEquality, findSelectionIndex } from './itemEquality';
import { resolveMultipleLabels, resolveSelectedLabel, stringifyAsValue } from './resolveValueLabel';
import { serializeValue } from './serializeValue';
import { formatNumber } from '../utils/formatNumber';
import { stringifyLocale } from '../utils/stringifyLocale';

describe('filter utilities in the separate Node server process', () => {
  it('imports and executes every leaf without a browser or Solid owner', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
    expect(getFilter({ locale: 'fr' }).contains('Résumé', 'resume')).toBe(true);
    expect(findSelectionIndex([NaN, -0], [-0], defaultItemEquality, true)).toBe(1);
    expect(resolveSelectedLabel(null, { null: 'None' })).toBe('None');
    expect(resolveMultipleLabels([null, 'a'], { a: 'A' })).toEqual(['', ', ', 'A']);
    expect(stringifyAsValue({ value: 42, label: 'Answer' })).toBe('42');
    expect(serializeValue(42n)).toBe('42');
    expect(formatNumber(1234.5)).toBe(new Intl.NumberFormat().format(1234.5));
    expect(stringifyLocale(new Intl.Locale('fr-FR'))).toBe('fr-FR');
  });
});
