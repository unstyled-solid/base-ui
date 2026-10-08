import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEffect, flush } from 'solid-js';
import { createRenderer } from '../../../test';
import { createImageLoadingStatus, type ImageLoadingOptions } from './createImageLoadingStatus';
import { mockImageLoading } from '../testImage';

describe('Avatar loading resource', () => {
  const { renderProps } = createRenderer();
  let mock: ReturnType<typeof mockImageLoading>;
  beforeEach(() => { mock = mockImageLoading(); });
  afterEach(() => { mock.restore(); });
  interface Props extends ImageLoadingOptions { src?: string; enabled: boolean }
  const mount = (props: Props, onStatus = vi.fn()) => renderProps((live: Props) => {
    const [status] = createImageLoadingStatus(() => live.src, live, () => live.enabled);
    createEffect(status, (next) => { onStatus(next); });
    return <output>{status()}</output>;
  }, props);

  it('loads, retries on source changes, and rejects stale callbacks', async () => {
    const view = await mount({ enabled: true, src: 'first.png' });
    expect(view.getByText('loading')).toBeInTheDocument();
    const old = mock.images[0].onload!;
    await view.setProps({ src: 'second.png' });
    old(); flush();
    expect(view.getByText('loading')).toBeInTheDocument();
    mock.images[1].onload?.(); flush();
    expect(view.getByText('loaded')).toBeInTheDocument();
    await view.setProps({ src: undefined });
    expect(view.getByText('error')).toBeInTheDocument();
  });
  for (const width of [0, 100]) {
    it(`resolves a cached resource with naturalWidth ${width} without an async event`, async () => {
      mock.restore(); mock = mockImageLoading({ cached: true, width });
      const view = await mount({ enabled: true, srcSet: 'avatar.png 1x' });
      expect(view.getByText(width ? 'loaded' : 'error')).toBeInTheDocument();
    });
  }
  it('does not preload while disabled and aborts when disabled during loading', async () => {
    const view = await mount({ enabled: false, src: 'avatar.png' });
    expect(mock.images).toHaveLength(0);
    expect(view.getByText('idle')).toBeInTheDocument();
    await view.setProps({ enabled: true });
    expect(mock.images).toHaveLength(1);
    const lateError = mock.images[0].onerror!;
    await view.setProps({ enabled: false });
    lateError(); flush();
    expect(view.getByText('loading')).toBeInTheDocument();
  });
  it('applies the complete request configuration and cleans listeners on disposal', async () => {
    const callback = vi.fn();
    const view = await mount({ enabled: true, src: 'avatar.png', srcSet: 'avatar.png 1x', sizes: '48px', crossOrigin: 'use-credentials', referrerPolicy: 'no-referrer' }, callback);
    expect(mock.images[0]).toMatchObject({ src: 'avatar.png', srcset: 'avatar.png 1x', sizes: '48px', crossOrigin: 'use-credentials', referrerPolicy: 'no-referrer' });
    const lateLoad = mock.images[0].onload!;
    view.unmount(); callback.mockClear();
    expect(mock.images[0].onload).toBeNull();
    expect(mock.images[0].onerror).toBeNull();
    lateLoad(); flush();
    expect(callback).not.toHaveBeenCalled();
  });
  it('reports error without a request for an absent source', async () => {
    const view = await mount({ enabled: true });
    expect(view.getByText('error')).toBeInTheDocument();
    expect(mock.images).toHaveLength(0);
  });
});
