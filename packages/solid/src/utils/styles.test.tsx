import { expect, it } from 'vitest';
import { createRenderer } from '../../test';
import { CSPProvider } from '../csp-provider';
import { styleDisableScrollbar } from './styles';
import { popupStateMapping, triggerOpenStateMapping, pressableTriggerOpenStateMapping } from './popupStateMapping';

it('emits the open and closed data attributes', () => {
  expect(popupStateMapping.open(true)).toEqual({ 'data-open': '' });
  expect(popupStateMapping.open(false)).toEqual({ 'data-closed': '' });
});

it('emits the anchor-hidden data attribute only when the anchor is hidden', () => {
  expect(popupStateMapping.anchorHidden(true)).toEqual({ 'data-anchor-hidden': '' });
  expect(popupStateMapping.anchorHidden(false)).toBe(null);
});

it('emits the trigger data attributes only while open', () => {
  expect(triggerOpenStateMapping.open(true)).toEqual({ 'data-popup-open': '' });
  expect(triggerOpenStateMapping.open(false)).toBe(null);
});

it('emits the pressed data attribute on pressable triggers only while open', () => {
  expect(pressableTriggerOpenStateMapping.open(true)).toEqual({ 'data-popup-open': '', 'data-pressed': '' });
  expect(pressableTriggerOpenStateMapping.open(false)).toBe(null);
});

it('styles deduplicate document sheets by nonce and release independent leases', async () => {
  const selector = 'style[data-base-ui-style="base-ui-disable-scrollbar"]';
  const view = await createRenderer().renderProps((props: { second: boolean; nonce: string; disabled: boolean }) =>
    <CSPProvider nonce={props.nonce} disableStyleElements={props.disabled}>
      {styleDisableScrollbar.getElement()}{props.second && styleDisableScrollbar.getElement()}
    </CSPProvider>, { second: true, nonce: 'first', disabled: false });
  expect(document.querySelectorAll('[data-base-ui-style="base-ui-disable-scrollbar"]')).toHaveLength(1);
  expect(document.querySelector<HTMLStyleElement>(selector)!.nonce).toBe('first');
  await view.setProps({ second: false });
  expect(document.querySelectorAll('[data-base-ui-style="base-ui-disable-scrollbar"]')).toHaveLength(1);
  await view.setProps({ nonce: 'next' });
  expect(document.querySelector<HTMLStyleElement>(selector)!.nonce).toBe('next');
  await view.setProps({ disabled: true });
  expect(document.querySelector(selector)).toBeNull();
  await view.setProps({ disabled: false });
  expect(document.querySelectorAll(selector)).toHaveLength(1);
  view.unmount();
  expect(document.querySelector(selector)).toBeNull();
});
