// Pinned source: AvatarImage.test.tsx + AvatarFallback.test.tsx, SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
// Native Chromium source replay; SSR comes from an independently compiled server fixture.
import { afterEach, expect, vi } from 'vitest';
import { createSignal, omit } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { browserCase, createRenderer, fetchSSRFixture, hydrateSSRFixture, mountSSRFixtureHTML, waitFor, within } from '#test-utils';
import { Avatar } from './index';
import { AvatarHydrationFixture } from './fixtures/AvatarHydrationFixture';
import { AVATAR_IMAGE_URL } from './fixtures/imageSource';

const source = 'packages/react/src/avatar/image/AvatarImage.test.tsx';
const { render, renderProps } = createRenderer();
const animationGlobals = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
afterEach(() => { animationGlobals.BASE_UI_ANIMATIONS_DISABLED = true; });
const browser = (name: string, body: () => Promise<void>) => browserCase({ source, case: name, environment: 'browser', issue: 'bsolid-browser' }, body);

async function preload() {
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth !== 48) reject(new Error('Avatar browser fixture did not decode'));
      else resolve();
    };
    image.onerror = () => reject(new Error('Avatar browser fixture failed to preload'));
    image.src = AVATAR_IMAGE_URL;
  });
}

for (const keepMounted of [false, true]) {
  browserCase({ source, case: keepMounted ? 'server image resolves cached hydration without replaying enter animation' : 'cached image does not flash fallback during SSR hydration', environment: 'browser', issue: 'bsolid-hydration' }, async () => {
    await preload();
    animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
    const renderId = keepMounted ? 'avatar-kept' : 'avatar-preloaded';
    const html = await fetchSSRFixture({
      module: '/packages/solid/src/avatar/fixtures/AvatarHydrationFixture.tsx',
      exportName: 'AvatarHydrationFixture',
      renderId,
      props: { keepMounted },
    });
    const mounted = mountSSRFixtureHTML(html);
    const root = mounted.root;
    const screen = within(root);
    const originalRoot = screen.getByTestId('avatar-root');
    const rootId = originalRoot.id;
    const originalFallback = screen.getByText('JD');
    const fallbackId = originalFallback.id;
    const original = root.querySelector('img');
    const imageId = original?.id;
    const loading = vi.fn();
    const fallbackReinsertions: Node[] = [];
    const rootMovements: Node[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of [...record.addedNodes, ...record.removedNodes]) {
          if (node === originalRoot) rootMovements.push(node);
        }
        for (const node of record.addedNodes) {
          if (node === originalFallback || (node instanceof Element &&
            (node.id === fallbackId || node.querySelector(`#${CSS.escape(fallbackId)}`)))) {
            fallbackReinsertions.push(node);
          }
        }
      }
    });
    let dispose: (() => void) | undefined;
    try {
      expect(root).toBeInstanceOf(HTMLElement);
      expect(root.ownerDocument).toBe(document);
      expect(root).toHaveAttribute('data-harness-ssr', 'true');
      expect(screen.getByText('JD')).toBeVisible();
      expect(screen.queryByRole('img')).toBeNull();
      expect(rootId).not.toBe('');
      expect(originalFallback.id).toBe(`${rootId}-fallback`);
      if (keepMounted) {
        expect(original).toHaveAttribute('src', AVATAR_IMAGE_URL);
        expect(original).toHaveAttribute('aria-hidden', 'true');
        await waitFor(() => expect(original!.complete).toBe(true));
        expect(original!.naturalWidth).toBe(48);
      } else expect(original).toBeNull();
      observer.observe(root, { childList: true, subtree: true });
      dispose = hydrateSSRFixture(AvatarHydrationFixture, { keepMounted, onLoadingStatusChange: loading }, root, renderId);
      // Deliberately no waitFor: cached success must resolve before the first paint.
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', AVATAR_IMAGE_URL);
      expect(screen.queryByText('JD')).toBeNull();
      expect(screen.getByTestId('avatar-root')).toBe(originalRoot);
      expect(originalRoot.id).toBe(rootId);
      expect(root.querySelector('img')!.id).toBe(`${rootId}-image`);
      expect(loading.mock.calls).toEqual([['loaded']]);
      if (keepMounted) {
        expect(root.querySelector('img')).toBe(original);
        expect(original).not.toHaveAttribute('aria-hidden');
        expect(original!.id).toBe(imageId);
        expect(original).not.toHaveAttribute('data-starting-style');
      }
      // Observe the first actual browser paints as well as the synchronous post-hydration DOM.
      for (let frame = 0; frame < 2; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        expect(screen.queryByText('JD')).toBeNull();
      }
      expect(fallbackReinsertions).toHaveLength(0);
      expect(rootMovements).toHaveLength(0);
    } finally {
      observer.disconnect();
      // Native hydration queues event replay even if an early assertion fails.
      // Keep its bootstrap alive until that microtask has drained.
      await Promise.resolve();
      dispose?.(); root.remove();
      mounted.restoreHydration();
    }
  });
}

browser('loads the image without a detached preload', async () => {
  const OriginalImage = window.Image;
  const constructed: HTMLImageElement[] = [];
  class TrackedImage extends OriginalImage {
    constructor() { super(); constructed.push(this); }
  }
  window.Image = TrackedImage;
  try {
    const view = await render(() => <Avatar.Root><Avatar.Image keepMounted src={AVATAR_IMAGE_URL} alt="Jane Doe" /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>);
    await waitFor(() => expect(view.queryByText('JD')).toBeNull());
    expect(constructed).toHaveLength(0);
    expect(view.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', AVATAR_IMAGE_URL);
    expect((view.getByRole('img') as HTMLImageElement).naturalWidth).toBe(48);
  } finally { window.Image = OriginalImage; }
});

browser('reports an error when there is no source', async () => {
  const callback = vi.fn();
  const view = await render(() => <Avatar.Root><Avatar.Image keepMounted onLoadingStatusChange={callback} /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>);
  expect(callback.mock.calls).toEqual([['error']]);
  expect(view.getByText('JD')).toBeVisible();
});

for (const forwardRef of [true, false]) {
  browser(forwardRef ? 'preserves loaded status when render props change' : 'keeps event-reported status when a render wrapper drops the ref', async () => {
    const callback = vi.fn();
    const view = await renderProps((props: { class: string }) => <Avatar.Root>
      <Avatar.Image keepMounted onLoadingStatusChange={callback} render={(imageProps) => <img {...(forwardRef ? imageProps : omit(imageProps, 'ref'))} data-testid="image" class={props.class} src={AVATAR_IMAGE_URL} />} />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>, { class: 'initial' });
    await waitFor(() => expect(view.queryByText('JD')).toBeNull());
    if (!forwardRef) expect(callback.mock.calls).toEqual([['loaded']]);
    callback.mockClear();
    const image = view.getByTestId('image');
    await view.setProps({ class: 'updated' });
    expect(view.getByTestId('image')).toBe(image);
    expect(image).toHaveClass('updated');
    expect(callback).not.toHaveBeenCalled();
    expect(view.queryByText('JD')).toBeNull();
  });
}

browser('resets the status when the source changes to an unloaded one; keepMounted has no ending style', async () => {
  await preload();
  animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
  const callback = vi.fn();
  const loaded = vi.fn();
  const view = await renderProps((props: { src: string }) => <>
    <style>{'@keyframes avatar-kept-exit { to { opacity: 0; } } .avatar-kept-exit[data-ending-style] { animation: avatar-kept-exit 1ms; }'}</style>
    <Avatar.Root>
      <Avatar.Image class="avatar-kept-exit" data-testid="image" keepMounted src={props.src} onLoadingStatusChange={callback} onLoad={loaded} />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>
  </>, { src: AVATAR_IMAGE_URL });
  await waitFor(() => expect(view.queryByText('JD')).toBeNull());
  // Cached inspection can resolve before Firefox dispatches the native load
  // event. Complete the first request before testing its replacement.
  await waitFor(() => expect(loaded).toHaveBeenCalledTimes(1));
  expect(loaded.mock.calls[0][0].isTrusted).toBe(true);
  await view.setProps({ src: '/missing-avatar.png' });
  expect(view.getByTestId('image')).toHaveAttribute('data-loading');
  expect(view.getByTestId('image')).not.toHaveAttribute('data-ending-style');
  await waitFor(() => expect(view.getByTestId('image')).toHaveAttribute('data-error'));
  expect(callback.mock.calls).toEqual([['loaded'], ['loading'], ['error']]);
});

for (const duration of [30, 1]) {
browser(`triggers enter animation via data-starting-style without waiting for animations on enter (${duration}ms)`, async () => {
  animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
  await preload();
  const getAnimations = vi.fn((): Animation[] => []);
  const finished = vi.fn<(event: TransitionEvent) => void>();
  const view = await render(() => {
    const [src, setSrc] = createSignal<string>();
    return <>
      <style>{`.avatar-enter { transition: opacity ${duration}ms; } .avatar-enter[data-starting-style], .avatar-enter[data-ending-style] { opacity: 0; }`}</style>
      <button onClick={() => setSrc(AVATAR_IMAGE_URL)}>Show image</button>
      <Avatar.Root><Avatar.Image class="avatar-enter" data-testid="image" src={src()} onTransitionEnd={finished} ref={(node) => { if (node) node.getAnimations = getAnimations; }} /></Avatar.Root>
    </>;
  });
  expect(view.queryByTestId('image')).toBeNull();
  let observedStartingStyle = false;
  const observer = new MutationObserver(() => {
    if (view.queryByTestId('image')?.hasAttribute('data-starting-style')) observedStartingStyle = true;
  });
  observer.observe(view.container, { childList: true, attributes: true, subtree: true, attributeFilter: ['data-starting-style'] });
  try {
    await userEvent.click(view.getByText('Show image'));
    await waitFor(() => expect(finished).toHaveBeenCalledTimes(1));
    expect(observedStartingStyle).toBe(true);
    expect(finished.mock.calls[0][0].propertyName).toBe('opacity');
    expect(finished.mock.calls[0][0].isTrusted).toBe(true);
    expect(getAnimations).not.toHaveBeenCalled();
    expect(view.getByTestId('image')).toBeInTheDocument();
  } finally { observer.disconnect(); }
});
}

browser('source 1ms exit applies ending style before unmount after Hide image click', async () => {
  animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
  await preload();
  const view = await render(() => {
    const [showImage, setShowImage] = createSignal(true);
    return <>
      <style>{'@keyframes avatar-source-exit { to { opacity: 0; } } .avatar-source-exit[data-ending-style] { animation: avatar-source-exit 1ms; }'}</style>
      <button onClick={() => setShowImage(false)}>Hide image</button>
      <Avatar.Root><Avatar.Image class="avatar-source-exit" data-testid="image" src={showImage() ? AVATAR_IMAGE_URL : undefined} /></Avatar.Root>
    </>;
  });
  expect(view.getByTestId('image')).toBeInTheDocument();
  await view.user.click(view.getByText('Hide image'));
  expect(view.getByTestId('image')).toHaveAttribute('data-ending-style');
  await waitFor(() => expect(view.queryByTestId('image')).toBeNull());
});

browser('applies ending style before unmount without loading/error attributes in default mode', async () => {
  animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
  await preload();
  const view = await renderProps((props: { src?: string }) => <>
    <style>{'@keyframes avatar-exit { to { opacity: 0; } } .avatar-exit[data-ending-style] { animation: avatar-exit 200ms; }'}</style>
    <Avatar.Root><Avatar.Image class="avatar-exit" data-testid="image" src={props.src} /></Avatar.Root>
  </>, { src: AVATAR_IMAGE_URL });
  await waitFor(() => expect(view.queryByTestId('image')).not.toBeNull());
  await view.setProps({ src: undefined });
  expect(view.getByTestId('image')).toHaveAttribute('data-ending-style');
  expect(view.getByTestId('image')).not.toHaveAttribute('data-error');
  expect(view.getByTestId('image')).not.toHaveAttribute('data-loading');
  await waitFor(() => expect(view.queryByTestId('image')).toBeNull());
});

browserCase({ source: 'packages/react/src/avatar/fallback/AvatarFallback.test.tsx', case: 'keeps only one of image or fallback mounted when switching to image', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  animationGlobals.BASE_UI_ANIMATIONS_DISABLED = false;
  await preload();
  const view = await renderProps((props: { src?: string }) => <>
    <style>{'@keyframes avatar-fallback-exit { to { opacity: 0; } } .avatar-fallback[data-ending-style] { animation: avatar-fallback-exit 2s; }'}</style>
    <Avatar.Root><Avatar.Image data-testid="image" src={props.src} /><Avatar.Fallback class="avatar-fallback">JD</Avatar.Fallback></Avatar.Root>
  </>, {});
  expect(view.queryByTestId('image')).toBeNull();
  expect(view.getByText('JD')).toBeVisible();
  await view.setProps({ src: AVATAR_IMAGE_URL });
  expect(view.getByTestId('image')).toBeInTheDocument();
  expect(view.queryByText('JD')).toBeNull();
});
