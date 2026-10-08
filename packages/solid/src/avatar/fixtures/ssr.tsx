import { generateHydrationScript, isServer, renderToString } from '@solidjs/web';
import { AvatarHydrationFixture } from './AvatarHydrationFixture';

/** Called only from an independently compiled server module, never the browser bundle. */
export function renderFixture(options: { renderId: string; keepMounted: boolean }) {
  if (!isServer || typeof document !== 'undefined') {
    throw new Error('Avatar fixture requires independent server compilation');
  }
  return {
    isServer,
    renderId: options.renderId,
    html: renderToString(() => <AvatarHydrationFixture keepMounted={options.keepMounted} />, { renderId: options.renderId }),
    bootstrap: generateHydrationScript({ eventNames: [] }),
  };
}
