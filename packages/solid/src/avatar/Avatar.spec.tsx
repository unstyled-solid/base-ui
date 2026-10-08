import type { ComponentProps } from '@solidjs/web';
import { expectType } from '../../test';
import { Avatar, AvatarImageDataAttributes, type ImageLoadingStatus } from './index';

export function AvatarTypeFixture() {
  return <Avatar.Root render={(props, state) => {
    expectType<ImageLoadingStatus, typeof state.imageLoadingStatus>(state.imageLoadingStatus);
    return <span {...props} />;
  }}>
    <Avatar.Image crossOrigin="anonymous" keepMounted loading="lazy" referrerPolicy="no-referrer"
      sizes="48px" srcSet="avatar.png 1x, avatar@2x.png 2x"
      onLoadingStatusChange={(status) => { expectType<ImageLoadingStatus, typeof status>(status); }}
      onLoad={(event) => { event.preventBaseUIHandler(); }}
      render={(props, state) => {
        expectType<ComponentProps<'img'>['src'], typeof props.src>(props.src);
        expectType<ComponentProps<'img'>['alt'], typeof props.alt>(props.alt);
        expectType<ImageLoadingStatus, typeof state.imageLoadingStatus>(state.imageLoadingStatus);
        return <img {...props} />;
      }} />
    <Avatar.Fallback delay={100} render={(props, state) => {
      expectType<ImageLoadingStatus, typeof state.imageLoadingStatus>(state.imageLoadingStatus);
      return <span {...props} />;
    }} />
  </Avatar.Root>;
}

expectType<'data-loading', typeof AvatarImageDataAttributes.loading>(AvatarImageDataAttributes.loading);
expectType<'data-error', typeof AvatarImageDataAttributes.error>(AvatarImageDataAttributes.error);

export function AvatarNegativeTypes() {
  // @ts-expect-error only the source loading status union is accepted
  const status: ImageLoadingStatus = 'complete';
  // @ts-expect-error delay is milliseconds, not a CSS duration
  return <Avatar.Fallback delay="100ms">{status}</Avatar.Fallback>;
}
