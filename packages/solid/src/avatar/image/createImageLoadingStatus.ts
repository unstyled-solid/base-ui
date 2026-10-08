import { createEffect, createMemo, createSignal, type Accessor } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { ImageLoadingStatus } from '../root/AvatarRoot';

export interface ImageLoadingOptions {
  referrerPolicy?: ComponentProps<'img'>['referrerpolicy'];
  crossOrigin?: ComponentProps<'img'>['crossorigin'];
  sizes?: ComponentProps<'img'>['sizes'];
  srcSet?: ComponentProps<'img'>['srcset'];
}

/** A source-scoped probe; cache hits resolve in the same turn as request setup. */
export function createImageLoadingStatus(src: Accessor<string | undefined>, options: ImageLoadingOptions, enabled: Accessor<boolean>, onStatusChange?: (status: ImageLoadingStatus) => void) {
  const state = createSignal<ImageLoadingStatus>('idle');
  let requestedStatus: ImageLoadingStatus = 'idle';
  const setStatus = (next: ImageLoadingStatus) => {
    if (next === requestedStatus) return;
    requestedStatus = next;
    state[1](next);
    // Notify before the staged source/Root projection commits. Every writer
    // (probe, rendered events, cache inspection) uses this same source boundary.
    onStatusChange?.(next);
  };
  const request = createMemo(() => ({
    enabled: enabled(), src: src(), srcSet: options.srcSet, sizes: options.sizes,
    crossOrigin: options.crossOrigin, referrerPolicy: options.referrerPolicy,
  }), {
    equals: (a, b) => a.enabled === b.enabled && a.src === b.src && a.srcSet === b.srcSet &&
      a.sizes === b.sizes && a.crossOrigin === b.crossOrigin && a.referrerPolicy === b.referrerPolicy,
  });
  createEffect(request, (request) => {
    if (!request.enabled) return;
    if (!request.src && !request.srcSet) { setStatus('error'); return; }

    let active = true;
    const image = new window.Image();
    const update = (status: ImageLoadingStatus) => { if (active) setStatus(status); };
    image.onload = () => update('loaded');
    image.onerror = () => update('error');
    if (request.referrerPolicy) image.referrerPolicy = request.referrerPolicy;
    image.crossOrigin = typeof request.crossOrigin === 'string' ? request.crossOrigin : null;
    if (request.sizes) image.sizes = request.sizes;
    if (request.srcSet) image.srcset = request.srcSet;
    if (request.src) image.src = request.src;
    // A cached request has one initial outcome, not a transient loading event.
    update(image.complete ? image.naturalWidth > 0 ? 'loaded' : 'error' : 'loading');

    return () => { active = false; image.onload = null; image.onerror = null; };
  });
  return [state[0], setStatus] as const;
}
