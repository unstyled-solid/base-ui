import { createUniqueId } from 'solid-js';
import { Avatar } from '../index';
import type { ImageLoadingStatus } from '../index';
import { AVATAR_IMAGE_URL } from './imageSource';

/** Compiled independently for server and browser by the qualification fixture. */
export function AvatarHydrationFixture(props: { keepMounted: boolean; onLoadingStatusChange?: (status: ImageLoadingStatus) => void }) {
  const id = createUniqueId();
  return <Avatar.Root id={id} data-testid="avatar-root">
    <Avatar.Image id={`${id}-image`} data-testid="image" keepMounted={props.keepMounted} src={AVATAR_IMAGE_URL} alt="Jane Doe" onLoadingStatusChange={props.onLoadingStatusChange} />
    <Avatar.Fallback id={`${id}-fallback`}>JD</Avatar.Fallback>
  </Avatar.Root>;
}
