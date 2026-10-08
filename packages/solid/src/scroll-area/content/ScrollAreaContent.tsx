import { createEffect, createSignal, omit, untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { ownerWindow } from '../../utils/owner';
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext';
import type { ScrollAreaRootState } from '../root/ScrollAreaRoot';
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes';
import { useScrollAreaViewportContext } from '../viewport/ScrollAreaViewportContext';

export function ScrollAreaContent(componentProps: ScrollAreaContentProps) {
  const context = useScrollAreaRootContext();
  const viewport = useScrollAreaViewportContext();
  const [node, setNode] = createSignal<HTMLDivElement | null>(null);
  const props = omit(componentProps, 'class', 'style', 'render', 'ref');
  const computeOnInitialResize = untrack(() => context.hasMeasuredScrollbar);
  createEffect(node, (element) => {
    if (!element) return;
    const Observer = ownerWindow(element).ResizeObserver;
    let cancelled = false;
    let initialized = false;
    const observer = Observer ? new Observer(() => {
      if (cancelled) return;
      if (!initialized) {
        initialized = true;
        // Match the source's initial-content deduplication. Late content still
        // schedules its first delivery and is also measured before delivery.
        if (!computeOnInitialResize) return;
      }
      viewport.scheduleThumbPosition();
    }) : null;
    observer?.observe(element);
    // Late content must update overflow even before its first observer delivery.
    queueMicrotask(() => { if (!cancelled) viewport.computeThumbPosition(); });
    return () => { cancelled = true; observer?.disconnect(); };
  });
  return createRenderElement('div', componentProps, {
    get ref() { return [setNode, componentProps.ref]; }, state: context.viewportState,
    stateAttributesMapping: scrollAreaStateAttributesMapping,
    props: [{ role: 'presentation', style: { 'min-width': 'fit-content' } }, props],
  });
}
export interface ScrollAreaContentState extends ScrollAreaRootState {}
export interface ScrollAreaContentProps extends BaseUIComponentProps<'div', ScrollAreaContentState, ComponentProps<'div'>> {}
export namespace ScrollAreaContent { export type Props = ScrollAreaContentProps; export type State = ScrollAreaContentState; }
