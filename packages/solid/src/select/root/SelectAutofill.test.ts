import { describe, expect, it, vi } from 'vitest';
import { matchAutofillItem } from './autofill';

describe('Select autofill resolution from pinned source', () => {
  it('serialized primitive values beat earlier rendered labels', () => {
    const items = [{ value: 'CA', renderedLabel: 'US' }, { value: 'US', renderedLabel: 'United States' }];
    expect(matchAutofillItem(items, 'uS')).toBe(items[1]);
  });
  it('matches rendered labels after scalar and stringifier matching', () => {
    const items = [{ value: 'US', renderedLabel: null }, { value: 'CA', renderedLabel: 'Canada' }];
    expect(matchAutofillItem(items, 'cAnAdA')).toBe(items[1]);
    expect(matchAutofillItem(items, ' Canada ')).toBeUndefined();
  });
  it('returns exact object identities for both serialized and display-label autofill', () => {
    const us = { code: 'US', country: 'United States' };
    const ca = { code: 'CA', country: 'Canada' };
    const items = [{ value: us, renderedLabel: undefined }, { value: ca, renderedLabel: undefined }];
    const serialize = vi.fn((value: typeof us) => value.code);
    const label = vi.fn((value: typeof us) => value.country);
    expect(matchAutofillItem(items, 'ca', serialize, label)?.value).toBe(ca);
    expect(matchAutofillItem(items, 'CANADA', serialize, label)?.value).toBe(ca);
    expect(serialize.mock.calls.every(([value]) => value === us || value === ca)).toBe(true);
  });
  it('supports automatic value/label object serialization', () => {
    const value = { value: 'CA', label: 'Canada' };
    expect(matchAutofillItem([{ value, renderedLabel: 'Other' }], 'ca')?.value).toBe(value);
    expect(matchAutofillItem([{ value, renderedLabel: 'Other' }], 'canada')?.value).toBe(value);
  });
  it('no-match is a no-op, including empty lists and missing labels', () => {
    expect(matchAutofillItem([], 'CA')).toBeUndefined();
    expect(matchAutofillItem([{ value: 'US', renderedLabel: null }], 'Canada')).toBeUndefined();
  });
  it('does not pass null or undefined options to custom single-object serializers', () => {
    const serialize = vi.fn((value: { code: string }) => value.code);
    const label = vi.fn((value: { code: string }) => value.code);
    const item = { code: 'CA' };
    const items = [{ value: null, renderedLabel: 'None' }, { value: undefined, renderedLabel: undefined }, { value: item, renderedLabel: 'Canada' }];
    expect(matchAutofillItem(items, 'CA', serialize, label)?.value).toBe(item);
    expect(serialize.mock.calls.every(([value]) => value != null)).toBe(true);
    expect(label.mock.calls.every(([value]) => value != null)).toBe(true);
  });
});
