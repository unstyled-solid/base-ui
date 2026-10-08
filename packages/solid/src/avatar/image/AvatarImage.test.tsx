import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEffect, createSignal, flush, omit } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { createRenderer, describeConformance, fireEvent, waitFor } from '../../../test';
import { Avatar } from '../index';
import type { AvatarImageProps, AvatarImageState } from './AvatarImage';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { mockImageLoading } from '../testImage';
import { useAvatarRootContext } from '../root/AvatarRootContext';

describe('Avatar.Image', () => {
  const { render, renderProps } = createRenderer();
  let mock: ReturnType<typeof mockImageLoading>;
  let renderedComplete: ReturnType<typeof vi.spyOn>;
  const isolateRenderedRequest = (event: Event) => {
    // This suite controls load/error explicitly. The browser's real cached
    // /avatar.png fixture must not race those events; actual network/cached
    // rendering is covered separately by Avatar.browser.test.tsx.
    if (event.isTrusted && event.target instanceof HTMLImageElement) event.stopImmediatePropagation();
  };
  beforeEach(() => {
    mock = mockImageLoading({ cached: true });
    renderedComplete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function (this: HTMLImageElement) {
      return !this.getAttribute('src') && !this.getAttribute('srcset');
    });
    document.addEventListener('load', isolateRenderedRequest, true);
    document.addEventListener('error', isolateRenderedRequest, true);
  });
  afterEach(() => {
    mock.restore(); renderedComplete.mockRestore();
    document.removeEventListener('load', isolateRenderedRequest, true);
    document.removeEventListener('error', isolateRenderedRequest, true);
  });
  const pending = (width?: number) => {
    mock.restore();
    mock = mockImageLoading(width === undefined ? {} : { cached: true, width });
    return mock;
  };
  const mount = (initial: AvatarImageProps = {}) => renderProps((props: AvatarImageProps) =>
    <Avatar.Root data-testid="root" class={(state) => state.imageLoadingStatus}>
      <Avatar.Image data-testid="image" {...props} />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>, initial);

  describeConformance<AvatarImageState, AvatarImageProps & ConformantComponentProps<AvatarImageState>>((props) => <Avatar.Root><Avatar.Image {...props} /></Avatar.Root>, {
    initialProps: { src: 'test.png' }, refInstanceof: HTMLImageElement,
  });

  it('restores fallback and idle root state after a loaded Image is disposed', async () => {
    const view = await renderProps((props: { show: boolean }) => <Avatar.Root data-testid="root" class={(s) => s.imageLoadingStatus}>
      {props.show && <Avatar.Image data-testid="image" src="avatar.png" />}
      <Avatar.Fallback>AC</Avatar.Fallback>
    </Avatar.Root>, { show: true });
    expect(view.queryByText('AC')).toBeNull();
    expect(view.getByTestId('image')).toBeInTheDocument();
    expect(view.getByTestId('root')).toHaveClass('loaded');
    await view.setProps({ show: false });
    expect(view.getByText('AC')).toBeInTheDocument();
    expect(view.queryByTestId('image')).toBeNull();
    expect(view.getByTestId('root')).toHaveClass('idle');
  });

  it('passes request attributes to both the preload and rendered img in source order', async () => {
    const view = await mount({ src: 'fallback.png', srcSet: 'avatar.png 1x, avatar@2x.png 2x', sizes: '48px', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' });
    const image = view.getByTestId('image');
    expect(image.tagName).toBe('IMG');
    for (const [attribute, value] of Object.entries({ src: 'fallback.png', srcset: 'avatar.png 1x, avatar@2x.png 2x', sizes: '48px', crossorigin: 'anonymous', referrerpolicy: 'no-referrer' })) {
      expect(image).toHaveAttribute(attribute, value);
    }
    expect(mock.images[0]).toMatchObject({ src: 'fallback.png', srcset: 'avatar.png 1x, avatar@2x.png 2x', sizes: '48px', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' });
    expect(mock.assignments[0]).toEqual(['srcset', 'src']);
    expect(view.queryByText('JD')).toBeNull();
  });
  it('supports srcSet without src', async () => {
    const view = await mount({ srcSet: 'avatar.png 1x', sizes: '48px' });
    expect(view.getByTestId('image')).toHaveAttribute('srcset', 'avatar.png 1x');
    expect(view.queryByText('JD')).toBeNull();
  });
  it('shows the image immediately for a cached src', async () => {
    const view = await mount({ src: 'https://example.com/cached-avatar.png', alt: 'Jane Doe' });
    expect(view.getByRole('img', { name: 'Jane Doe' })).toBe(view.getByTestId('image'));
    expect(view.getByTestId('image')).toHaveAttribute('src', 'https://example.com/cached-avatar.png');
    expect(view.queryByText('JD')).toBeNull();
  });
  it('reports error without constructing a probe when no source is supplied', async () => {
    const callback = vi.fn();
    const view = await mount({ onLoadingStatusChange: callback });
    expect(callback.mock.calls).toEqual([['error']]);
    expect(mock.images).toHaveLength(0);
    expect(view.getByText('JD')).toBeInTheDocument();
    expect(view.queryByTestId('image')).toBeNull();
  });
  for (const [width, status] of [[100, 'loaded'], [0, 'error']] as const) {
    it(`reports cached ${status} without idle or a transient loading notification`, async () => {
      pending(width);
      const callback = vi.fn();
      const view = await mount({ src: 'cached.png', onLoadingStatusChange: callback });
      expect(callback.mock.calls).toEqual([[status]]);
      expect(!!view.queryByTestId('image')).toBe(width > 0);
      if (status === 'error') expect(view.getByText('JD')).toBeInTheDocument();
    });
  }
  for (const outcome of ['loaded', 'error'] as const) {
    it(`notifies the same loading callback in loading/${outcome} order`, async () => {
      pending();
      const callback = vi.fn();
      const view = await mount({ src: 'avatar.png', onLoadingStatusChange: callback });
      expect(callback.mock.calls).toEqual([['loading']]);
      mock.images[0][outcome === 'loaded' ? 'onload' : 'onerror']?.();
      await waitFor(() => expect(callback.mock.calls).toEqual([['loading'], [outcome]]));
      expect(view.getByTestId('root')).toHaveClass(outcome);
    });
    it(`reports loading then ${outcome} and uses the current callback`, async () => {
      pending();
      const previous = vi.fn();
      const current = vi.fn();
      const view = await mount({ src: 'avatar.png', onLoadingStatusChange: previous });
      expect(previous.mock.calls).toEqual([['loading']]);
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(view.queryByTestId('image')).toBeNull();
      await view.setProps({ onLoadingStatusChange: current });
      expect(mock.images).toHaveLength(1);
      mock.images[0][outcome === 'loaded' ? 'onload' : 'onerror']?.();
      flush();
      expect(current.mock.calls).toEqual([[outcome]]);
      expect(previous.mock.calls).toEqual([['loading']]);
      expect(view.getByTestId('root')).toHaveClass(outcome);
      expect(!!view.queryByText('JD')).toBe(outcome === 'error');
    });
  }
  it('preserves the pending probe across unrelated prop updates', async () => {
    pending();
    const callback = vi.fn();
    const view = await mount({ src: 'avatar.png', onLoadingStatusChange: callback });
    const load = mock.images[0].onload;
    await view.setProps({ class: 'updated', alt: 'Jane Doe', sizes: undefined });
    expect(mock.images).toHaveLength(1);
    expect(mock.images[0].onload).toBe(load);
    mock.images[0].onload?.(); flush();
    const image = view.getByRole('img', { name: 'Jane Doe' });
    expect(image).toHaveClass('updated');
    expect(callback.mock.calls).toEqual([['loading'], ['loaded']]);
    await view.setProps({ class: 'after-load' });
    expect(view.getByRole('img', { name: 'Jane Doe' })).toBe(image);
    expect(mock.images).toHaveLength(1);
    expect(callback.mock.calls).toEqual([['loading'], ['loaded']]);
  });
  it('notifies the user before projecting the new loading status into Root', async () => {
    pending();
    const order: string[] = [];
    const view = await render(() => <Avatar.Root data-testid="root" class={(state) => state.imageLoadingStatus}>
      <Avatar.Image src="avatar.png" onLoadingStatusChange={(status) => {
        order.push(`${status}:${document.querySelector('[data-testid="root"]')?.className}`);
      }} />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>);
    mock.images[0].onload?.(); flush();
    expect(order).toEqual(['loading:idle', 'loaded:loading']);
    expect(view.getByTestId('root')).toHaveClass('loaded');
    expect(view.queryByText('JD')).toBeNull();
  });
  it('ignores stale requests after replacement and after disposal', async () => {
    pending();
    const callback = vi.fn();
    const view = await mount({ src: 'first.png', onLoadingStatusChange: callback });
    const lateLoad = mock.images[0].onload!;
    await view.setProps({ src: 'second.png' });
    lateLoad();
    flush();
    expect(view.queryByTestId('image')).toBeNull();
    mock.images[1].onload?.();
    flush();
    expect(view.getByTestId('image')).toHaveAttribute('src', 'second.png');
    const lateError = mock.images[1].onerror!;
    view.unmount();
    callback.mockClear();
    lateError();
    flush();
    expect(callback).not.toHaveBeenCalled();
  });
  it('shares live status with the latest notifying Image and resets on any Image disposal', async () => {
    pending();
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: { first: boolean }) => <Avatar.Root data-testid="root" class={(state) => state.imageLoadingStatus}>
      {props.first && <Avatar.Image keepMounted src="first.png" data-testid="first" onLoadingStatusChange={first} />}
      <Avatar.Image keepMounted src="second.png" data-testid="second" onLoadingStatusChange={second} />
      <Avatar.Fallback delay={0}>JD</Avatar.Fallback>
    </Avatar.Root>, { first: true });
    const a = view.getByTestId('first');
    const b = view.getByTestId('second');
    fireEvent.load(a); flush();
    expect(view.getByTestId('root')).toHaveClass('loaded');
    expect(b).toHaveAttribute('data-loading');
    fireEvent.error(b); flush();
    expect(view.getByTestId('root')).toHaveClass('error');
    expect(a).not.toHaveAttribute('data-error');
    fireEvent.load(b); flush();
    expect(view.getByTestId('root')).toHaveClass('loaded');
    // React cleanup resets even the non-current image; it does not pick the
    // surviving image or replay its callback until that image changes status.
    await view.setProps({ first: false });
    expect(view.getByTestId('root')).toHaveClass('idle');
    fireEvent.error(b); flush();
    expect(view.getByTestId('root')).toHaveClass('error');
    expect(view.getByTestId('second')).toBe(b);
    expect(first.mock.calls).toEqual([['loading'], ['loaded']]);
    expect(second.mock.calls).toEqual([['loading'], ['error'], ['loaded'], ['error']]);
  });
  it('projects Root and Image from the same source commit without a status relay', async () => {
    pending();
    const snapshots: string[][] = [];
    const release = attribution.enable();
    try {
      const view = await mount({ src: 'avatar.png', render: (props, state) => {
        const root = useAvatarRootContext();
        createEffect(() => [root.imageLoadingStatus, state.imageLoadingStatus], (statuses) => { snapshots.push(statuses); });
        return <img {...props} />;
      } });
      mock.images[0].onload?.(); flush();
      expect(view.getByTestId('root')).toHaveClass('loaded');
      mock.images[0].onerror?.(); flush();
      expect(view.getByTestId('root')).toHaveClass('error');
      expect(snapshots.length).toBeGreaterThan(0);
      expect(snapshots.every(([root, image]) => root === image)).toBe(true);
      view.unmount();
    } finally { release(); }
  });
  it.each(['src', 'srcSet', 'sizes', 'crossOrigin', 'referrerPolicy'] as const)('restarts the probe when %s changes', async (key) => {
    pending();
    const view = await mount({ src: 'first.png' });
    const values = { src: 'second.png', srcSet: 'second.png 1x', sizes: '64px', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' } as const;
    await view.setProps({ [key]: values[key] });
    expect(mock.images).toHaveLength(2);
    expect(mock.images[0].onload).toBeNull();
  });

  describe('keepMounted', () => {
    it('reports loading then error directly from the retained image', async () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', onLoadingStatusChange: callback, onError });
      const image = view.getByTestId('image');
      fireEvent.error(image);
      await waitFor(() => expect(callback.mock.calls).toEqual([['loading'], ['error']]));
      expect(onError).toHaveBeenCalledTimes(1);
      expect(view.getByTestId('image')).toBe(image);
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(image).toHaveAttribute('data-error');
      expect(image).toHaveAttribute('aria-hidden', 'true');
    });
    it('loads in place, hides from accessibility until loaded, and retains identity after error', async () => {
      pending();
      const callback = vi.fn();
      const onLoad = vi.fn();
      const onError = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', alt: 'Jane Doe', onLoadingStatusChange: callback, onLoad, onError });
      const image = view.getByTestId('image');
      expect(mock.images).toHaveLength(0);
      expect(image).toHaveAttribute('src', 'avatar.png');
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(image).toHaveAttribute('data-loading');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(view.queryByRole('img')).toBeNull();
      fireEvent.load(image); flush();
      expect(view.getByRole('img', { name: 'Jane Doe' })).toBe(image);
      expect(view.queryByText('JD')).toBeNull();
      expect(image).not.toHaveAttribute('data-loading');
      expect(image).not.toHaveAttribute('data-error');
      expect(image).not.toHaveAttribute('aria-hidden');
      fireEvent.error(image); flush();
      expect(view.getByTestId('image')).toBe(image);
      expect(image).toHaveAttribute('data-error');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).not.toHaveAttribute('data-ending-style');
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls).toEqual([['loading'], ['loaded'], ['error']]);
    });
    it('allows preventBaseUIHandler while preventDefault does not block the internal handler', async () => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', onLoadingStatusChange: callback, onLoad: (e) => e.preventBaseUIHandler() });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      expect(image).toHaveAttribute('data-loading');
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(callback.mock.calls).toEqual([['loading']]);
      await view.setProps({ onLoad: (e) => e.preventDefault() });
      fireEvent.load(image); flush();
      expect(view.queryByText('JD')).toBeNull();
      expect(callback.mock.calls).toEqual([['loading'], ['loaded']]);
    });
    it('resets status and accessibility on source changes', async () => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, src: 'first.png', onLoadingStatusChange: callback });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      expect(view.queryByText('JD')).toBeNull();
      expect(image).not.toHaveAttribute('aria-hidden');
      callback.mockClear();
      await view.setProps({ src: 'second.png' });
      expect(view.getByTestId('image')).toBe(image);
      expect(image).toHaveAttribute('data-loading');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(callback.mock.calls).toEqual([['loading']]);
      fireEvent.load(image); flush();
      expect(callback.mock.calls).toEqual([['loading'], ['loaded']]);
      expect(view.queryByText('JD')).toBeNull();
    });
    it('does not re-inspect an event-loaded image for unrelated prop or callback changes', async () => {
      const previous = vi.fn();
      const current = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', onLoadingStatusChange: previous });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      await view.setProps({ class: 'updated', alt: 'Jane Doe', onLoadingStatusChange: current });
      expect(view.getByRole('img', { name: 'Jane Doe' })).toBe(image);
      expect(view.queryByText('JD')).toBeNull();
      expect(previous.mock.calls).toEqual([['loading'], ['loaded']]);
      expect(current).not.toHaveBeenCalled();
      fireEvent.error(image); flush();
      expect(current.mock.calls).toEqual([['error']]);
      expect(image).toHaveAttribute('data-error');
    });
    it.each(['srcSet', 'sizes', 'crossOrigin', 'referrerPolicy'] as const)('re-inspects the rendered request when %s changes', async (key) => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', onLoadingStatusChange: callback });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      const values = { srcSet: 'second.png 1x', sizes: '64px', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' } as const;
      await view.setProps({ [key]: values[key] });
      expect(view.getByTestId('image')).toBe(image);
      expect(image).toHaveAttribute('data-loading');
      expect(callback.mock.calls).toEqual([['loading'], ['loaded'], ['loading']]);
      expect(mock.images).toHaveLength(0);
      fireEvent.load(image); flush();
      expect(view.queryByText('JD')).toBeNull();
    });
    it('preserves explicit aria-hidden', async () => {
      const view = await mount({ keepMounted: true, src: 'avatar.png', 'aria-hidden': false });
      const image = view.getByTestId('image');
      expect(image).toHaveAttribute('aria-hidden', 'false');
      fireEvent.load(image); flush();
      expect(view.queryByText('JD')).toBeNull();
      expect(image).toHaveAttribute('aria-hidden', 'false');
    });
    it('does not mask source props provided by a render callback', async () => {
      const view = await mount({ keepMounted: true, render: (props) => <img alt="" sizes="48px" src="avatar.png" srcset="avatar.png 1x" {...props} /> });
      expect(view.getByTestId('image')).toHaveAttribute('src', 'avatar.png');
      expect(view.getByTestId('image')).toHaveAttribute('srcset', 'avatar.png 1x');
      expect(view.getByTestId('image')).toHaveAttribute('sizes', '48px');
    });
    it('orders sizes/srcSet/src after request configuration in render props', async () => {
      let keys: string[] = [];
      await mount({ keepMounted: true, src: 'avatar.png', srcSet: 'avatar.png 1x', sizes: '48px', loading: 'lazy', render: (props) => {
        keys = Object.keys(props);
        return <img {...props} />;
      } });
      for (const key of ['sizes', 'srcset', 'loading']) expect(keys.indexOf('src')).toBeGreaterThan(keys.indexOf(key));
    });
    it('inspects cached rendered success on initial attachment without starting style', async () => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, src: 'cached.png', onLoadingStatusChange: callback, ref: (node) => {
        if (node) Object.defineProperties(node, { complete: { value: true, configurable: true }, naturalWidth: { value: 100, configurable: true } });
      } });
      expect(callback.mock.calls).toEqual([['loaded']]);
      expect(view.queryByText('JD')).toBeNull();
      expect(view.getByTestId('image')).not.toHaveAttribute('data-starting-style');
    });
    it.each([true, false])('consumes a ref-less keepMounted commit before a cached replacement (initial keepMounted=%s)', async (keepMounted) => {
      // Pinned React AvatarImage.tsx:67-71 consumes the first keepMounted layout commit
      // before checking imageRef. Only a cache hit on that commit skips entry.
      if (!keepMounted) pending();
      const callback = vi.fn();
      let forwardRef!: () => void;
      let keepImage!: () => void;
      const view = await render(() => {
        const [forward, setForward] = createSignal(false);
        const [kept, setKept] = createSignal(keepMounted);
        forwardRef = () => { setForward(true); flush(); };
        keepImage = () => { setKept(true); flush(); };
        return <Avatar.Root>
          <Avatar.Image data-testid="image" keepMounted={kept()} src="cached.png" onLoadingStatusChange={callback}
            ref={(node) => {
              if (node) Object.defineProperties(node, { complete: { value: true, configurable: true }, naturalWidth: { value: 100, configurable: true } });
            }}
            render={(props) => <>{forward() ? <img {...props} /> : <img {...omit(props, 'ref')} />}</>} />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar.Root>;
      });
      if (!keepMounted) {
        keepImage();
        await Promise.resolve();
      }
      const previous = view.getByTestId('image');
      callback.mockClear();
      forwardRef();
      await Promise.resolve();
      // Renderer replacement refs are delivered at the native microtask
      // checkpoint. Observe the subsequent staged inspection synchronously.
      flush();
      const replacement = view.getByTestId('image');
      expect(replacement).not.toBe(previous);
      expect(replacement).toHaveAttribute('data-starting-style');
      expect(callback.mock.calls).toEqual([['loaded']]);
      expect(view.queryByText('JD')).toBeNull();
      expect(mock.images).toHaveLength(keepMounted ? 0 : 1);
    });
    it('inspects cached rendered errors and source-less rendered images', async () => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, onLoadingStatusChange: callback });
      expect(callback.mock.calls).toEqual([['error']]);
      expect(view.getByTestId('image')).toHaveAttribute('data-error');
      expect(view.getByText('JD')).toBeInTheDocument();
    });
    it('watches source changes owned by a stable Solid render callback', async () => {
      const callback = vi.fn();
      const view = await renderProps((props: { src: string }) => <Avatar.Root>
        <Avatar.Image keepMounted onLoadingStatusChange={callback} render={(imageProps) => <img {...imageProps} data-testid="image" src={props.src} />} />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar.Root>, { src: 'first.png' });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      expect(view.queryByText('JD')).toBeNull();
      callback.mockClear();
      await view.setProps({ src: 'second.png' });
      flush();
      expect(image).toHaveAttribute('data-loading');
      expect(view.getByText('JD')).toBeInTheDocument();
      expect(callback.mock.calls).toEqual([['loading']]);
      fireEvent.load(image); flush();
      expect(callback.mock.calls).toEqual([['loading'], ['loaded']]);
      expect(view.queryByText('JD')).toBeNull();
    });
    it('retains event-reported status when a custom wrapper drops the ref', async () => {
      const callback = vi.fn();
      const view = await mount({ keepMounted: true, src: 'avatar.png', onLoadingStatusChange: callback, render: (props) => <img {...omit(props, 'ref')} /> });
      const image = view.getByTestId('image');
      fireEvent.load(image); flush();
      await view.setProps({ class: 'updated' });
      expect(callback.mock.calls).toEqual([['loaded']]);
      expect(view.queryByText('JD')).toBeNull();
      expect(image).toHaveClass('updated');
    });
    it('changes loading mode without accepting abandoned preload callbacks', async () => {
      pending();
      const callback = vi.fn();
      const view = await mount({ src: 'avatar.png', onLoadingStatusChange: callback });
      const stale = mock.images[0].onload!;
      await view.setProps({ keepMounted: true });
      stale(); flush();
      expect(view.getByTestId('image')).toHaveAttribute('data-loading');
      fireEvent.load(view.getByTestId('image')); flush();
      await view.setProps({ keepMounted: false });
      expect(mock.images).toHaveLength(2);
      expect(view.getByText('JD')).toBeInTheDocument();
    });
  });
});
