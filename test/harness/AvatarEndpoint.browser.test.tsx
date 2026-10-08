import { it, expect, vi } from 'vitest';
import { fetchSSRFixture, mountSSRFixtureHTML, hydrateSSRFixture, waitFor } from '#test-utils';
import { AvatarHydrationFixture } from '../../packages/solid/src/avatar/fixtures/AvatarHydrationFixture';
import { AVATAR_IMAGE_URL } from '../../packages/solid/src/avatar/fixtures/imageSource';

// Native source oracle: AvatarImage.test.tsx:429-477. This integration tests the
// actual owner export through the setup-owned independent compiler endpoint.
it.each([false, true])('independently SSR-compiles actual cached Avatar and claims original nodes (keepMounted=%s)', async keepMounted => {
  const cached = new Image(); cached.src = AVATAR_IMAGE_URL; await cached.decode();
  const renderId = keepMounted ? 'endpoint-avatar-kept' : 'endpoint-avatar-default';
  const html = await fetchSSRFixture({ module: '/packages/solid/src/avatar/fixtures/AvatarHydrationFixture.tsx',
    exportName: 'AvatarHydrationFixture', renderId, props: { keepMounted } });
  const mounted = mountSSRFixtureHTML(html);
  const root = mounted.root;
  const originalRoot = root.querySelector('[data-testid="avatar-root"]')!;
  const originalImage = root.querySelector('img');
  const rootId = originalRoot.id;
  const loading = vi.fn();
  let dispose: (() => void) | undefined;
  try {
    expect(root).toHaveAttribute('data-harness-ssr', 'true');
    expect(root.textContent).toContain('JD');
    if (keepMounted) {
      expect(originalImage).toHaveAttribute('aria-hidden', 'true');
      await waitFor(() => expect(originalImage!.complete).toBe(true));
    } else expect(originalImage).toBeNull();
    dispose = hydrateSSRFixture(AvatarHydrationFixture, { keepMounted, onLoadingStatusChange: loading }, root, renderId);
    const image = root.querySelector('img')!;
    expect(image).toHaveAttribute('src', AVATAR_IMAGE_URL);
    expect(image).not.toHaveAttribute('aria-hidden');
    expect(root.textContent).not.toContain('JD');
    expect(root.querySelector('[data-testid="avatar-root"]')).toBe(originalRoot);
    expect(originalRoot.id).toBe(rootId);
    expect(image.id).toBe(`${rootId}-image`);
    expect(loading.mock.calls).toEqual([['loaded']]);
    if (keepMounted) expect(image).toBe(originalImage);
    // Hydration schedules its native completion after these synchronous cached
    // image assertions. Keep the emitted bootstrap alive until that completion.
    await waitFor(() => expect(globalThis._$HY).toHaveProperty('done', true));
  } finally {
    dispose?.(); root.remove(); mounted.restoreHydration();
  }
}, 15_000);
