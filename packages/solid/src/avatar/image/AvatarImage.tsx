import { createEffect, createMemo, createSignal, onCleanup, onSettled, omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { isServer } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createStableCallback } from '../../utils/createStableCallback';
import { useAvatarRootContext } from '../root/AvatarRootContext';
import type { AvatarRootState, ImageLoadingStatus } from '../root/AvatarRoot';
import { avatarStateAttributesMapping } from '../root/stateAttributesMapping';
import { createImageLoadingStatus, type ImageLoadingOptions } from './createImageLoadingStatus';

const stateAttributesMapping = { ...avatarStateAttributesMapping, ...transitionStatusMapping };

/** The avatar image. Renders an `<img>` after preloading, or in place with keepMounted. */
export function AvatarImage(componentProps: AvatarImage.Props) {
  const context = useAvatarRootContext();
  // Retain Base UI's camel-case request props and accept Solid's native spellings.
  const requestOptions: ImageLoadingOptions = {
    get srcSet() { return componentProps.srcSet !== undefined ? componentProps.srcSet : componentProps.srcset; },
    get crossOrigin() { return componentProps.crossOrigin !== undefined ? componentProps.crossOrigin : componentProps.crossorigin; },
    get referrerPolicy() { return componentProps.referrerPolicy !== undefined ? componentProps.referrerPolicy : componentProps.referrerpolicy; },
    get sizes() { return componentProps.sizes; },
  };
  const notifyLoadingStatus = createStableCallback(() => componentProps.onLoadingStatusChange);
  const [status, setStatus] = createImageLoadingStatus(() => typeof componentProps.src === 'string' ? componentProps.src : undefined, requestOptions, () => !componentProps.keepMounted, (next) => {
    notifyLoadingStatus(next);
    registration.activate();
  });
  const registration = context.registerImage(status);
  // Image and fallback now read one source in the same commit. No initial
  // publication barrier or subsequent status relay is necessary.
  const visible = () => status() === 'loaded';
  const presence = createTransitionStatus(visible);
  const [image, setImage] = createSignal<HTMLImageElement | null>(null);
  let attachedImage: HTMLImageElement | null = null;
  let initialCommit = true;
  let settled = false;
  let disposed = false;
  // The cached-image exception belongs to the first keepMounted commit, not
  // the first wrapper that happens to forward a ref. Initial ref writes are
  // staged, so let them settle before consuming a genuinely ref-less mount.
  onSettled(() => {
    settled = true;
    if (componentProps.keepMounted && !attachedImage) initialCommit = false;
  });
  onCleanup(() => {
    disposed = true;
    if (!isServer) registration.dispose();
  });

  const renderedRequest = createMemo(() => ({
    keepMounted: componentProps.keepMounted, image: image(), src: componentProps.src,
    srcSet: requestOptions.srcSet, sizes: requestOptions.sizes,
    crossOrigin: requestOptions.crossOrigin, referrerPolicy: requestOptions.referrerPolicy,
    render: componentProps.render,
  }), {
    equals: (a, b) => a.keepMounted === b.keepMounted && a.image === b.image && a.src === b.src &&
      a.srcSet === b.srcSet && a.sizes === b.sizes && a.crossOrigin === b.crossOrigin &&
      a.referrerPolicy === b.referrerPolicy && a.render === b.render,
  });
  createEffect(renderedRequest, (request) => {
    if (!request.keepMounted) return;
    const node = request.image;
    const isInitialCommit = initialCommit;
    if (node || settled && !attachedImage) initialCommit = false;
    // A wrapper may deliberately drop the ref. Its events remain authoritative.
    if (!node) return;
    const inspect = (initial: boolean) => {
      if (!node.complete) { setStatus('loading'); return; }
      const next = node.naturalWidth > 0 ? 'loaded' : 'error';
      setStatus(next);
      if (next === 'loaded' && initial) presence.setMounted(true);
    };
    inspect(isInitialCommit);
    // A Solid render callback is stable; its own live source can change without
    // changing the callback identity or Avatar.Image props.
    const observer = new node.ownerDocument.defaultView!.MutationObserver(() => inspect(false));
    observer.observe(node, { attributes: true, attributeFilter: ['src', 'srcset', 'sizes', 'crossorigin', 'referrerpolicy'] });
    return () => observer.disconnect();
  });

  createOpenChangeComplete({
    get enabled() { return !visible(); },
    get open() { return visible(); },
    ref: image,
    onComplete() { if (!visible()) presence.setMounted(false); },
  });

  const state: AvatarImageState = {
    get imageLoadingStatus() { return status(); },
    get transitionStatus() {
      const transition = presence.transitionStatus;
      return componentProps.keepMounted && transition === 'ending' ? undefined : transition;
    },
  };
  const elementProps = omit(componentProps, 'class', 'style', 'render', 'onLoadingStatusChange', 'keepMounted', 'sizes', 'srcSet', 'srcset', 'src', 'crossOrigin', 'referrerPolicy');
  return createRenderElement<AvatarImageState, HTMLImageElement>('img', componentProps, {
    state,
    ref(node: HTMLImageElement | null) {
      // Ref delivery is synchronous, while its reactive projection is staged.
      // A pending initial ref must retain the first-commit cache exception.
      attachedImage = node;
      setImage(node);
    },
    get props() {
      const configuration: ComponentProps<'img'> = {};
      if ('crossOrigin' in componentProps || 'crossorigin' in componentProps) configuration.crossorigin = requestOptions.crossOrigin;
      if ('referrerPolicy' in componentProps || 'referrerpolicy' in componentProps) configuration.referrerpolicy = requestOptions.referrerPolicy;
      // Solid uses false to remove an attribute; Base UI's explicit aria-hidden
      // false must remain the string "false" and override the loading default.
      if ('aria-hidden' in componentProps) configuration['aria-hidden'] = componentProps['aria-hidden'] === false ? 'false' : componentProps['aria-hidden'];
      const source: ComponentProps<'img'> = {};
      if (componentProps.sizes !== undefined) source.sizes = componentProps.sizes;
      if (requestOptions.srcSet !== undefined) source.srcset = requestOptions.srcSet;
      if (componentProps.src !== undefined) source.src = componentProps.src;
      return [componentProps.keepMounted ? {
        'data-loading': status() === 'loading' ? '' : undefined,
        'data-error': status() === 'error' ? '' : undefined,
        'aria-hidden': status() !== 'loaded' ? 'true' : undefined,
        onLoad() { if (!disposed) setStatus('loaded'); },
        onError() { if (!disposed) setStatus('error'); },
      } : undefined, elementProps, configuration, source];
    },
    stateAttributesMapping,
    get enabled() { return !!componentProps.keepMounted || presence.mounted; },
  });
}

export interface AvatarImageState extends AvatarRootState { transitionStatus: TransitionStatus }
export interface AvatarImageProps extends BaseUIComponentProps<'img', AvatarImageState, ComponentProps<'img'>> {
  /** Source-compatible alias of Solid's `srcset`. */
  srcSet?: ComponentProps<'img'>['srcset'];
  /** Source-compatible alias of Solid's `crossorigin`. */
  crossOrigin?: ComponentProps<'img'>['crossorigin'];
  /** Source-compatible alias of Solid's `referrerpolicy`. */
  referrerPolicy?: ComponentProps<'img'>['referrerpolicy'];
  onLoadingStatusChange?: ((status: ImageLoadingStatus) => void) | undefined;
  /** Load in place and retain the image element, including when loading or failed. @default false */
  keepMounted?: boolean | undefined;
}
export namespace AvatarImage {
  export type State = AvatarImageState;
  export type Props = AvatarImageProps;
}
