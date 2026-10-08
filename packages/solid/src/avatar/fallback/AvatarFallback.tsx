import { createEffect, createSignal, omit, untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTimeout } from '../../utils/createTimeout';
import { useAvatarRootContext } from '../root/AvatarRootContext';
import type { AvatarRootState } from '../root/AvatarRoot';
import { avatarStateAttributesMapping } from '../root/stateAttributesMapping';

/** Shown while the image is unavailable. Renders a `<span>`. */
export function AvatarFallback(componentProps: AvatarFallback.Props) {
  const context = useAvatarRootContext();
  const [delayPassed, setDelayPassed] = createSignal(untrack(() => (componentProps.delay ?? 0) === 0));
  const timeout = createTimeout();
  createEffect(() => componentProps.delay ?? 0, (delay) => {
    if (delay > 0) timeout.start(delay, () => { setDelayPassed(true); });
    else setDelayPassed(true);
    return timeout.clear;
  });
  const state: AvatarFallbackState = {
    get imageLoadingStatus() { return context.imageLoadingStatus; },
  };
  return createRenderElement('span', componentProps, {
    state,
    props: omit(componentProps, 'class', 'style', 'render', 'delay'),
    stateAttributesMapping: avatarStateAttributesMapping,
    get enabled() { return context.imageLoadingStatus !== 'loaded' && ((componentProps.delay ?? 0) === 0 || delayPassed()); },
  });
}

export interface AvatarFallbackState extends AvatarRootState {}
export interface AvatarFallbackProps extends BaseUIComponentProps<'span', AvatarFallbackState, ComponentProps<'span'>> {
  /** Delay before showing the fallback, in milliseconds. @default 0 */
  delay?: number | undefined;
}
export namespace AvatarFallback {
  export type State = AvatarFallbackState;
  export type Props = AvatarFallbackProps;
}
