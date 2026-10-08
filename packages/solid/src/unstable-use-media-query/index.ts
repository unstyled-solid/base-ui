import { createEffect, createMemo, createSignal, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
import { createIsHydrated } from '../utils/hydration';
export interface UseMediaQueryOptions {
  defaultMatches?: boolean | undefined;
  matchMedia?: typeof window.matchMedia | null | undefined;
  ssrMatchMedia?: ((query: string) => { matches: boolean }) | null | undefined;
  noSsr?: boolean | undefined;
}
export interface UseMediaQueryState {}
export function createMediaQuery(query: string | Accessor<string>, options: UseMediaQueryOptions = {}): Accessor<boolean> {
  const hydrated = createIsHydrated();
  const list = createMemo(() => {
    const text = (typeof query === 'function' ? query() : query).replace(/^@media( ?)/m, '');
    const match = options.matchMedia === undefined ? typeof window !== 'undefined' && window.matchMedia ? window.matchMedia.bind(window) : null : options.matchMedia;
    return { text, match, media: match?.(text) ?? null, defaultMatches: options.defaultMatches ?? false,
      server: options.ssrMatchMedia, noSsr: options.noSsr ?? false };
  }, { transparent: true });
  const [change, setChange] = createSignal<{ media: MediaQueryList; matches: boolean } | undefined>(undefined);
  createEffect(() => ({ source: list(), hydrated: hydrated() }), ({ source, hydrated: ready }) => {
    const media = source.media;
    if (!ready || !media) return;
    const update = () => setChange({ media, matches: media.matches });
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  return () => {
    const source = list();
    if (isServer || !hydrated()) return source.noSsr && source.media ? source.media.matches : source.server?.(source.text).matches ?? source.defaultMatches;
    const event = change();
    return event?.media === source.media ? event!.matches : source.media?.matches ?? source.defaultMatches;
  };
}
export { createMediaQuery as useMediaQuery };
export namespace createMediaQuery { export type State = UseMediaQueryState; export type Options = UseMediaQueryOptions }
