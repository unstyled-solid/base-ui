import { it, expect, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fetchSSRFixture, hydrateSSRFixture, mountSSRFixtureHTML } from '#test-utils';
import { HTTPHydrationFixture } from './HTTPHydrationFixture';
import { HTTPAssetFixture } from './HTTPAssetFixture';
import { waitFor } from '#test-utils';

const module = '/test/harness/HTTPHydrationFixture.tsx';
function fixtureURL(exportName: string, renderId: string, props: object, mode = 'string') {
  return `/__harness__/ssr.html?${new URLSearchParams({ module, export: exportName, renderId, props: JSON.stringify(props), mode })}`;
}

it('uses native server-emitted global asset mappings to preload and hydrate actual lazy exports', async () => {
  const renderId = 'http-assets';
  const props = { label: 'Actual lazy module' };
  const html = await fetchSSRFixture({ module: '/test/harness/HTTPAssetFixture.tsx', exportName: 'HTTPAssetFixture', renderId, props, mode: 'stream' });
  const mounted = mountSSRFixtureHTML(html);
  const root = mounted.root;
  const original = root.querySelector('button')!;
  expect(original).not.toBeNull();
  expect(root.querySelector('output')!.getBoundingClientRect().width).toBe(73);
  let dispose: (() => void) | undefined;
  try {
    const state = globalThis._$HY as { r: Record<string, unknown>; modules?: Record<string, unknown> };
    const mappings = Object.entries(state.r).filter(([key]) => key.endsWith('_assets'));
    expect(mappings.length).toBeGreaterThan(0);
    expect(JSON.stringify(mappings)).toContain('HTTPLazyPart.fixture.tsx');
    dispose = hydrateSSRFixture(HTTPAssetFixture, props, root, renderId);
    await waitFor(() => expect(Object.keys(state.modules ?? {}).length).toBeGreaterThan(0));
    expect(root.querySelector('button')).toBe(original);
    await userEvent.click(original);
    await waitFor(() => expect(root.querySelector('output')).toHaveTextContent('1'));
  } finally {
    dispose?.(); root.remove();
    mounted.restoreHydration();
  }
}, 15_000);

it('serves independent actual SSR exports and hydrates original nodes across concurrent requests', async () => {
  const records = ['http-a', 'http-b'].map(renderId => ({ renderId, props: { label: renderId, initial: 'initial' } }));
  const html = await Promise.all(records.map(record => fetchSSRFixture({ module, exportName: 'HTTPHydrationFixture', renderId: record.renderId, props: record.props })));
  const previous = globalThis._$HY;
  const disposers: (() => void)[] = [];
  const roots: HTMLElement[] = [];
  const ready = vi.fn(); const disposed = vi.fn();
  try {
    for (const [index, record] of records.entries()) {
      const template = document.createElement('template');
      template.innerHTML = html[index]!;
      for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
      const root = template.content.querySelector('main')!;
      document.body.append(root); roots.push(root);
      const input = root.querySelector('input')!;
      const label = root.querySelector('label')!;
      const id = input.id;
      disposers.push(hydrateSSRFixture(HTTPHydrationFixture, { ...record.props, onReady: ready, onDispose: disposed }, root, record.renderId));
      expect(root.querySelector('input')).toBe(input);
      expect(root.querySelector('label')).toBe(label);
      expect(input.id).toBe(id);
      expect(label.htmlFor).toBe(id);
    }
    expect(ready).toHaveBeenCalledTimes(2);
    expect(roots[0]!.querySelector('input')!.id).not.toBe(roots[1]!.querySelector('input')!.id);
    const edited = roots[0]!.querySelector('input')!;
    edited.focus(); edited.setSelectionRange(edited.value.length, edited.value.length);
    await userEvent.type(edited, '-changed');
    expect(roots[0]!.querySelector('output')).toHaveTextContent('initial-changed');
    expect(roots[1]!.querySelector('output')).toHaveTextContent('initial');
  } finally {
    disposers.forEach(dispose => dispose()); roots.forEach(root => root.remove());
    if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY');
    else globalThis._$HY = previous;
  }
  expect(disposed).toHaveBeenCalledTimes(2);
}, 15_000);

it('supports real awaited server streaming and rejects absent exports instead of fake HTML', async () => {
  const streamed = await fetch(fixtureURL('HTTPStreamingFixture', 'http-stream', { label: 'resolved server value' }, 'stream'));
  expect(streamed.ok).toBe(true);
  expect(await streamed.text()).toContain('resolved server value');
  const missing = await fetch(fixtureURL('AbsentFixtureExport', 'http-invalid', {}));
  expect(missing.status).toBe(500);
  expect(await missing.text()).toContain('Missing callable SSR fixture export');
}, 15_000);

it('loads and decodes real cacheable image bytes while absent images remain errors', async () => {
  const image = new Image();
  image.src = '/__harness__/assets/pixel.svg';
  await image.decode();
  expect(image.naturalWidth).toBe(48);
  const cached = new Image(); cached.src = image.src;
  await cached.decode();
  expect(cached.complete).toBe(true);
  expect(cached.naturalWidth).toBe(48);
  expect((await fetch('/missing-avatar.png')).status).toBe(404);
});
