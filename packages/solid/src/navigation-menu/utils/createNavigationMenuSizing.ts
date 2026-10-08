// NavigationMenu-specific shared viewport sizing, adapted from Base UI (MIT),
// NavigationMenuTrigger at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, onCleanup, untrack } from 'solid-js';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { getCssDimensions } from '../../utils/getCssDimensions';
import type { NavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { setSharedFixedSize } from './setSharedFixedSize';
import * as p from '../popup/NavigationMenuPopupCssVars';
import * as s from '../positioner/NavigationMenuPositionerCssVars';

export function createNavigationMenuSizing(root: NavigationMenuRootContext) {
  const mutationFrame = createAnimationFrame();
  const sizeFrame = createAnimationFrame();
  const resizeFrame = createAnimationFrame();
  const runAnimationsFinished = createAnimationsFinished(() => root.popupElement);
  let resetController: AbortController | null = null;
  let previous = { width: 0, height: 0 };
  let generation = 0;
  let activation: { value: unknown; size: { width: number; height: number } } | null = null;
  const cancel = () => {
    generation += 1;
    mutationFrame.cancel(); sizeFrame.cancel(); resizeFrame.cancel();
    resetController?.abort(); resetController = null;
  };
  function auto(popup: HTMLElement) {
    popup.style.setProperty(p.popupWidth, 'auto');
    popup.style.setProperty(p.popupHeight, 'auto');
  }
  function clear(popup: HTMLElement, positioner: HTMLElement) {
    popup.style.removeProperty(p.popupWidth); popup.style.removeProperty(p.popupHeight);
    positioner.style.removeProperty(s.positionerWidth); positioner.style.removeProperty(s.positionerHeight);
  }
  function sync(popup: HTMLElement, positioner: HTMLElement) {
    cancel();
    clear(popup, positioner);
    const size = getCssDimensions(popup);
    if (!size.width || !size.height) return;
    previous = size;
    auto(popup);
    positioner.style.setProperty(s.positionerWidth, `${size.width}px`);
    positioner.style.setProperty(s.positionerHeight, `${size.height}px`);
  }
  function resize(popup: HTMLElement, positioner: HTMLElement, baseline: { width: number; height: number }, interrupted = false) {
    cancel();
    const ticket = generation;
    const owner = untrack(() => root.value);
    const active = () => untrack(() => ticket === generation && root.open && root.value === owner);
    function measure() {
      if (!active()) return;
      clear(popup, positioner);
      const measured = getCssDimensions(popup);
      const width = measured.width || (interrupted ? baseline.width : previous.width) || baseline.width;
      const height = measured.height || (interrupted ? baseline.height : previous.height) || baseline.height;
      const startWidth = baseline.width || width;
      const startHeight = baseline.height || height;
      popup.style.setProperty(p.popupWidth, `${startWidth}px`);
      popup.style.setProperty(p.popupHeight, `${startHeight}px`);
      positioner.style.setProperty(s.positionerWidth, `${interrupted ? startWidth : width}px`);
      positioner.style.setProperty(s.positionerHeight, `${interrupted ? startHeight : height}px`);
      sizeFrame.request(() => {
        if (!active()) return;
        setSharedFixedSize(popup, positioner, width, height);
        previous = { width, height };
        const controller = new AbortController();
        resetController = controller;
        runAnimationsFinished(() => {
          if (!active() || resetController !== controller) return;
          resetController = null;
          auto(popup);
        }, controller.signal);
      });
    }
    if (interrupted) {
      if (!baseline.width || !baseline.height) return;
      setSharedFixedSize(popup, positioner, baseline.width, baseline.height);
      mutationFrame.request(() => mutationFrame.request(measure));
    } else measure();
  }
  createEffect(() => ({ popup: root.popupElement, positioner: root.positionerElement, content: root.currentContent, value: root.value, open: root.open }), (state) => {
    cancel();
    if (!state.open || !state.popup || !state.positioner || !state.content) return;
    const { popup, positioner } = state;
    const baseline = activation && activation.value === state.value ? activation.size : getCssDimensions(popup);
    activation = null;
    resize(popup, positioner, baseline);
    return cancel;
  });
  createEffect(() => root.popupElement, (popup) => {
    if (!popup) return;
    const win = popup.ownerDocument.defaultView;
    const resizeObserver = win?.ResizeObserver ? new win.ResizeObserver(() => {
      previous = { width: popup.offsetWidth, height: popup.offsetHeight };
    }) : null;
    resizeObserver?.observe(popup);
    return () => resizeObserver?.disconnect();
  });
  createEffect(() => ({ popup: root.popupElement, positioner: root.positionerElement, content: root.currentContent, value: root.value, open: root.open }), (state) => {
    if (!state.open || !state.popup || !state.positioner || !state.content) return;
    const { popup, positioner } = state;
    const win = popup.ownerDocument.defaultView;
    const mutationObserver = win?.MutationObserver && state.content ? new win.MutationObserver(() => {
      if (!root.open || root.value !== state.value) return;
      if (root.transitionStatus === 'starting' || popup.hasAttribute('data-starting-style')) { sync(popup, positioner); return; }
      const width = popup.style.getPropertyValue(p.popupWidth);
      const height = popup.style.getPropertyValue(p.popupHeight);
      const interrupted = width !== '' && width !== 'auto' && height !== '' && height !== 'auto';
      resize(popup, positioner, interrupted ? { width: popup.offsetWidth || previous.width, height: popup.offsetHeight || previous.height } : previous, interrupted);
    }) : null;
    if (state.content) mutationObserver?.observe(state.content, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
    return () => mutationObserver?.disconnect();
  });
  createEffect(() => ({ popup: root.popupElement, positioner: root.positionerElement, value: root.value, open: root.open }), (state) => {
    if (!state.open || !state.popup || !state.positioner) return;
    const { popup, positioner } = state;
    const win = positioner.ownerDocument.defaultView;
    const handleResize = () => { resizeFrame.cancel(); resizeFrame.request(() => { if (root.open && root.value === state.value) sync(popup, positioner); }); };
    win?.addEventListener('resize', handleResize);
    return () => {
      resizeFrame.cancel(); win?.removeEventListener('resize', handleResize);
    };
  });
  createEffect(() => root.mounted, (mounted) => { if (!mounted) previous = { width: 0, height: 0 }; });
  onCleanup(cancel);
  return {
    prepareActivation(value: unknown) {
      const popup = root.popupElement;
      if (popup) activation = { value, size: getCssDimensions(popup) };
    },
  };
}
