import { afterEach, expect, it } from 'vitest';
import type { TriggerLookup } from '../../internals/contracts/floating';
import { getFloatingFocusElement, isRootElement, isTargetInsideEnabledTrigger, isTypeableCombobox, isTypeableElement, matchesFocusVisible } from './element';
import { FOCUSABLE_ATTRIBUTE, TRIGGER_DISABLED_ATTRIBUTE } from './constants';
import { createAttribute } from './createAttribute';
import { isElementDisabled } from '../../utils/isElementDisabled';
afterEach(() => { document.body.replaceChildren(); });
it('structural trigger lookup recognizes shadow descendants and exact disabled attribute', () => {
  const trigger = document.createElement('div');
  const nested = document.createElement('span'); trigger.attachShadow({ mode: 'open' }).append(nested);
  const elements = new Map([['trigger', trigger]]);
  const lookup: TriggerLookup = {
    size: elements.size, getById: (id) => elements.get(id), hasElement: (el) => el === trigger,
    hasMatchingElement: (predicate) => predicate(trigger), entries: () => elements.entries(), elements: () => elements.values(),
  };
  expect(isTargetInsideEnabledTrigger(nested, lookup)).toBe(true);
  expect(isTargetInsideEnabledTrigger(trigger, lookup)).toBe(true);
  trigger.setAttribute(TRIGGER_DISABLED_ATTRIBUTE, '');
  expect(TRIGGER_DISABLED_ATTRIBUTE).toBe('data-trigger-disabled');
  expect(isTargetInsideEnabledTrigger(nested, lookup)).toBe(false);
  expect(isTargetInsideEnabledTrigger(trigger, lookup)).toBe(false);
  expect(isTargetInsideEnabledTrigger(null, lookup)).toBe(false);
  expect(isTargetInsideEnabledTrigger(document.createTextNode('text'), lookup)).toBe(false);
});
it('focus wrapper, typeability, disabled and native element contracts', () => {
  const wrapper = document.createElement('div'); const input = document.createElement('input'); wrapper.append(input);
  expect(getFloatingFocusElement(null)).toBeNull(); expect(getFloatingFocusElement(wrapper)).toBe(wrapper);
  input.setAttribute(FOCUSABLE_ATTRIBUTE, ''); expect(getFloatingFocusElement(wrapper)).toBe(input);
  wrapper.setAttribute(FOCUSABLE_ATTRIBUTE, ''); expect(getFloatingFocusElement(wrapper)).toBe(wrapper);
  expect(isTypeableElement(input)).toBe(true); input.setAttribute('role', 'combobox'); expect(isTypeableCombobox(input)).toBe(true);
  input.type = 'hidden'; expect(isTypeableElement(input)).toBe(false);
  input.type = 'text'; input.disabled = true; expect(isTypeableElement(input)).toBe(false); expect(isElementDisabled(input)).toBe(true);
  expect(isElementDisabled(null)).toBe(true); expect(isElementDisabled(wrapper)).toBe(false);
  wrapper.setAttribute('aria-disabled', 'true'); expect(isElementDisabled(wrapper)).toBe(true);
  expect(isRootElement(document.body)).toBe(true); expect(isRootElement(wrapper)).toBe(false);
  expect(matchesFocusVisible(null)).toBe(true); expect(createAttribute('test')).toBe('data-base-ui-test');
});
