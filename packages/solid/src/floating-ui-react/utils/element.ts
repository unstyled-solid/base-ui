import { isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { platform } from '../../utils/platform';
import { activeElement, closest, contains, getTarget } from '../../utils/shadowDom';
import type { TriggerLookup } from '../../internals/contracts/floating';
import { FOCUSABLE_ATTRIBUTE, TYPEABLE_SELECTOR, TRIGGER_DISABLED_ATTRIBUTE } from './constants';
export { activeElement, closest, contains, getTarget };

export function isTargetInsideEnabledTrigger(target: EventTarget | null, triggerElements: TriggerLookup) {
  if (!isElement(target)) return false;
  if (triggerElements.hasElement(target)) return !target.hasAttribute(TRIGGER_DISABLED_ATTRIBUTE);
  for (const [, trigger] of triggerElements.entries()) {
    if (contains(trigger, target)) return !trigger.hasAttribute(TRIGGER_DISABLED_ATTRIBUTE);
  }
  return false;
}
export function isEventTargetWithin(event: Event, node: Node | null | undefined) {
  if (node == null) return false;
  if ('composedPath' in event) return event.composedPath().includes(node);
  const eventAgain = event as Event;
  return eventAgain.target != null && node.contains(eventAgain.target as Node);
}
export function isRootElement(element: Element): boolean { return element.matches('html,body'); }
export function isTypeableElement(element: unknown): boolean { return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR); }
export function isInteractiveElement(element: Element | null) {
  return closest(element, `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`) != null;
}
export function isTypeableCombobox(element: Element | null) {
  return !!element && element.getAttribute('role') === 'combobox' && isTypeableElement(element);
}
export function matchesFocusVisible(element: Element | null) {
  if (!element || platform.env.jsdom) return true;
  try { return element.matches(':focus-visible'); } catch { return true; }
}
export function getFloatingFocusElement(floatingElement: HTMLElement | null | undefined): HTMLElement | null {
  if (!floatingElement) return null;
  return floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE) ? floatingElement :
    floatingElement.querySelector(`[${FOCUSABLE_ATTRIBUTE}]`) || floatingElement;
}
