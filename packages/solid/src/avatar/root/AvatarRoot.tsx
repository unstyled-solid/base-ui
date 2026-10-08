import { createSignal, omit, type Accessor } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { AvatarRootContext } from './AvatarRootContext';
import { avatarStateAttributesMapping } from './stateAttributesMapping';

/** Displays a user's profile picture, initials, or fallback icon. Renders a `<span>`. */
export function AvatarRoot(componentProps: AvatarRoot.Props) {
  // Root selects the last notifying image, but reads that image's actual source.
  // Selection is event state; loading status must not be an effect-copied value.
  const [imageSource, setImageSource] = createSignal<Accessor<ImageLoadingStatus> | null>(null);
  const imageLoadingStatus = () => imageSource()?.() ?? 'idle';
  const state: AvatarRootState = { get imageLoadingStatus() { return imageLoadingStatus(); } };
  const context: AvatarRootContext = {
    get imageLoadingStatus() { return imageLoadingStatus(); },
    registerImage(source) {
      return {
        activate() { setImageSource(() => source); },
        // Pinned React resets Root to idle on ANY Image cleanup, including a
        // non-current image. A subsequent event on a surviving image reclaims it.
        dispose() { setImageSource(null); },
      };
    },
  };
  const elementProps = omit(componentProps, 'class', 'style', 'render');

  // A component boundary owns renderer setup once, beneath the context provider.
  const Host = () => createRenderElement('span', componentProps, {
    state,
    props: elementProps,
    stateAttributesMapping: avatarStateAttributesMapping,
  });
  return <AvatarRootContext value={context}><Host /></AvatarRootContext>;
}

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
export interface AvatarRootState { imageLoadingStatus: ImageLoadingStatus }
export interface AvatarRootProps extends BaseUIComponentProps<'span', AvatarRootState, ComponentProps<'span'>> {}
export namespace AvatarRoot {
  export type State = AvatarRootState;
  export type Props = AvatarRootProps;
}
