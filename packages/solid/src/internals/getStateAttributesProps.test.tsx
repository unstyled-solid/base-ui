import { expect, it } from 'vitest';
import { createEffect, createSignal } from 'solid-js';
import { createRenderer } from '../../test';
import { getStateAttributesProps } from './getStateAttributesProps';
import { transitionStatusMapping } from './stateAttributesMapping';
import { fieldValidityMapping } from './field-constants/constants';

it('converts the state fields to data attributes', () => {
  expect(getStateAttributesProps({ checked: true, orientation: 'vertical', count: 42 }))
    .toEqual({ 'data-checked': '', 'data-orientation': 'vertical', 'data-count': '42' });
});

it('changes the fields names to lowercase', () => {
  expect(getStateAttributesProps({ readOnly: true })).toEqual({ 'data-readonly': '' });
});

it('changes true values to a data-attribute without a value', () => {
  expect(getStateAttributesProps({ required: true, disabled: false })).toEqual({ 'data-required': '' });
});

it('does not include false values', () => {
  expect(getStateAttributesProps({ required: true, disabled: false })).not.toHaveProperty('data-disabled');
});

it('supports custom mapping', () => {
  expect(getStateAttributesProps({ checked: true, orientation: 'vertical', count: 42 }, {
    checked: (value) => ({ 'data-state': value ? 'checked' : 'unchecked' }),
  })).toEqual({ 'data-state': 'checked', 'data-orientation': 'vertical', 'data-count': '42' });
});

it('supports nulls returned from custom mapping', () => {
  expect(getStateAttributesProps({ checked: false, orientation: 'vertical' }, {
    checked: (value) => value === true ? { 'data-state': 'checked' } : null,
  })).toEqual({ 'data-orientation': 'vertical' });
});

it('emits the transition data attributes', () => {
  expect(transitionStatusMapping.transitionStatus('starting')).toEqual({ 'data-starting-style': '' });
  expect(transitionStatusMapping.transitionStatus('ending')).toEqual({ 'data-ending-style': '' });
});

it('emits nothing outside a transition', () => {
  expect(transitionStatusMapping.transitionStatus('idle')).toBe(null);
  expect(transitionStatusMapping.transitionStatus(undefined)).toBe(null);
});

it('emits the validity data attributes', () => {
  expect(fieldValidityMapping.valid(true)).toEqual({ 'data-valid': '' });
  expect(fieldValidityMapping.valid(false)).toEqual({ 'data-invalid': '' });
});

it('emits nothing while validity is unknown', () => {
  expect(fieldValidityMapping.valid(null)).toBe(null);
});

it('does not read or subscribe to render-only state excluded by a null mapping', async () => {
  let update!: () => void;
  let reads = 0, runs = 0;
  const view = await createRenderer().render(() => {
    const [value, setValue] = createSignal(0);
    update = () => { setValue(previous => previous + 1); };
    const state = { get value() { reads++; return value(); }, disabled: true };
    createEffect(() => { runs++; return getStateAttributesProps(state, { value: null }); }, () => {});
    return <button onClick={update}>Update</button>;
  });
  const initialRuns = runs;
  await view.user.click(view.getByRole('button'));
  expect(reads).toBe(0);
  expect(runs).toBe(initialRuns);
  expect(getStateAttributesProps({ value: 1, disabled: true }, { value: null })).toEqual({ 'data-disabled': '' });
});

it('retains functional mappings, conditional omission and inherited mapping-key behavior', () => {
  const mapping = Object.assign(Object.create({ inherited: null }), {
    ignored: null,
    open: (open: boolean) => open ? { 'data-open': '' } : { 'data-closed': '' },
  });
  expect(getStateAttributesProps({ ignored: 'text', inherited: 'kept', open: false }, mapping))
    .toEqual({ 'data-inherited': 'kept', 'data-closed': '' });
});
