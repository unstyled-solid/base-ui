import { expect, vi } from 'vitest';
import { hydrate } from '@solidjs/web';
import { browserCase } from '../../test';
import { AvatarHydrationFixture } from '../avatar/fixtures/AvatarHydrationFixture';
import { AVATAR_IMAGE_URL } from '../avatar/fixtures/imageSource';
import { FieldHydrationFixture } from '../field/FieldHydrationFixture';
import { userEvent } from 'vitest/browser';
import { RendererHydrationFixture } from './createRenderElement.hydration.fixture';

browserCase({ source: 'packages/react/src/internals/useRenderElement.test.tsx', case: 'default dynamic text host and sibling retain server ownership slots', environment: 'browser', issue: 'bsolid-itlx' }, async () => {
  const renderId = 'foundation-default-hosts';
  const query = new URLSearchParams({ module: 'packages/solid/src/internals/createRenderElement.hydration.fixture.tsx', export: 'RendererHydrationFixture', renderId });
  const response = await fetch(`/__harness__/ssr.html?${query}`);
  const html = await response.text(); expect(response.ok, html).toBe(true);
  expect(response.headers.get('X-Harness-Renderer')).toBe('independent-solid2-ssr');
  const template = document.createElement('template'); template.innerHTML = html;
  const previous = globalThis._$HY;
  for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
  const root = template.content.querySelector('main')!; document.body.append(root);
  const button = root.querySelector('button')!;
  const separator = root.querySelector('[role="separator"]')!;
  const disposed = vi.fn();
  let dispose: (() => void) | undefined;
  try {
    dispose = hydrate(() => <RendererHydrationFixture disposed={disposed} />, root, { renderId });
    expect(root.querySelector('button')).toBe(button);
    expect(root.querySelector('[role="separator"]')).toBe(separator);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(root.querySelector('output')).toHaveTextContent('on');
    expect(root.querySelector('button')).toBe(button);
    expect(root.querySelector('[role="separator"]')).toBe(separator);
  } finally {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    dispose?.(); root.remove();
    if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previous;
  }
  expect(disposed).toHaveBeenCalledOnce();
});

browserCase({ source: 'packages/react/src/field/control/FieldControl.test.tsx', case: 'native input value/defaultValue and stable selection after actual SSR hydration', environment: 'browser', issue: 'bsolid-itlx' }, async () => {
  const renderId = 'foundation-field-values';
  const query = new URLSearchParams({ module: 'packages/solid/src/field/FieldHydrationFixture.tsx', export: 'FieldHydrationFixture', renderId });
  const response = await fetch(`/__harness__/ssr.html?${query}`);
  const html = await response.text(); expect(response.ok, html).toBe(true);
  expect(response.headers.get('X-Harness-Renderer')).toBe('independent-solid2-ssr');
  const template = document.createElement('template'); template.innerHTML = html;
  const previous = globalThis._$HY;
  for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
  const root = template.content.querySelector('main')!; document.body.append(root);
  const controlled = root.querySelector<HTMLInputElement>('[name="controlled"]')!;
  const free = root.querySelector<HTMLInputElement>('[name="free"]')!;
  const ids = [controlled.id, free.id];
  let dispose: (() => void) | undefined;
  const changed = vi.fn();
  try {
    expect(controlled).toHaveAttribute('value', 'seed');
    expect(free).toHaveAttribute('value', 'initial');
    dispose = hydrate(() => <FieldHydrationFixture onValueChange={changed} />, root, { renderId });
    expect(root.querySelector('[name="controlled"]')).toBe(controlled);
    expect(root.querySelector('[name="free"]')).toBe(free);
    expect(controlled).toHaveAccessibleName('Controlled');
    expect(free).toHaveAccessibleName('Free');
    await userEvent.click(controlled);
    expect(controlled).toHaveFocus();
    controlled.setSelectionRange(2, 2);
    await userEvent.keyboard('x');
    expect(changed).toHaveBeenCalledExactlyOnceWith('sexed');
    expect(controlled).toHaveValue('sexed');
    expect(controlled).toHaveAttribute('value', 'sexed');
    expect(controlled.selectionStart).toBe(3);
    await userEvent.keyboard('!');
    expect(controlled).toHaveValue('sexed');
    expect(controlled).toHaveAttribute('value', 'sexed');
    await userEvent.fill(free, 'edited');
    await userEvent.click(root.querySelector<HTMLButtonElement>('[type="button"]')!);
    expect(free).toHaveValue('edited');
    expect(free).toHaveAttribute('value', 'reset');
    expect(new FormData(free.form!).get('free')).toBe('edited');
    await userEvent.click(root.querySelector<HTMLButtonElement>('[type="reset"]')!);
    expect(free).toHaveValue('reset');
    expect(controlled).toHaveValue('sexed');
    expect([controlled.id, free.id]).toEqual(ids);
    expect(root.querySelector('[name="controlled"]')).toBe(controlled);
    expect(root.querySelector('[name="free"]')).toBe(free);
  } finally {
    // Drain native hydration replay before restoring the surrounding bootstrap.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    dispose?.(); root.remove();
    if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previous;
  }
});

for (const keepMounted of [false, true]) {
  browserCase({ source: 'packages/react/src/avatar/image/AvatarImage.test.tsx', case: `native renderer cached SSR claim, keepMounted=${keepMounted}`, environment: 'browser', issue: 'bsolid-avatar-hydration-runtime' }, async () => {
    const cached = new Image(); cached.src = AVATAR_IMAGE_URL; await cached.decode();
    const renderId = keepMounted ? 'foundation-avatar-kept' : 'foundation-avatar-default';
    const query = new URLSearchParams({ module: 'packages/solid/src/avatar/fixtures/AvatarHydrationFixture.tsx', export: 'AvatarHydrationFixture', renderId, props: JSON.stringify({ keepMounted }) });
    const response = await fetch(`/__harness__/ssr.html?${query}`);
    const html = await response.text(); expect(response.ok, html).toBe(true);
    expect(response.headers.get('X-Harness-Renderer')).toBe('independent-solid2-ssr');
    const template = document.createElement('template'); template.innerHTML = html;
    const previous = globalThis._$HY;
    for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
    const root = template.content.querySelector('main')!; document.body.append(root);
    const originalRoot = root.querySelector('[data-testid="avatar-root"]')!;
    const originalImage = root.querySelector('img');
    const originalId = originalRoot.id;
    const originalImageId = originalImage?.id;
    const loaded = vi.fn();
    let dispose: (() => void) | undefined;
    try {
      expect(root).toHaveAttribute('data-harness-ssr', 'true');
      expect(originalId.startsWith(renderId)).toBe(true);
      expect(originalRoot.getAttribute('_hk')?.startsWith(renderId)).toBe(true);
      expect(root.textContent).toContain('JD');
      expect(Boolean(originalImage)).toBe(keepMounted);
      if (originalImage) await originalImage.decode();
      dispose = hydrate(() => <AvatarHydrationFixture keepMounted={keepMounted} onLoadingStatusChange={loaded} />, root, { renderId });
      expect(root.querySelector('[data-testid="avatar-root"]')).toBe(originalRoot);
      if (keepMounted) expect(root.querySelector('img')).toBe(originalImage);
      expect(root.querySelector('img')?.naturalWidth).toBe(48);
      expect(root.textContent).not.toContain('JD');
      expect(loaded).toHaveBeenCalledExactlyOnceWith('loaded');
      const image = root.querySelector('img')!;
      expect(originalRoot.id).toBe(originalId);
      expect(image.id).toBe(originalImageId ?? `${originalId}-image`);
      expect(image).not.toHaveAttribute('aria-hidden');
      if (keepMounted) expect(image).not.toHaveAttribute('data-starting-style');
      const inserted: Node[] = [];
      const observer = new MutationObserver((records) => {
        for (const record of records) inserted.push(...record.addedNodes);
      });
      observer.observe(root, { childList: true, subtree: true });
      try {
        // Native paints also drain RC13's queued hydration-event replay before
        // restoring the global bootstrap state used by that replay.
        for (let frame = 0; frame < 2; frame += 1) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          expect(root.querySelector('[data-testid="avatar-root"]')).toBe(originalRoot);
          expect(root.querySelector('img')).toBe(image);
          expect(originalRoot.id).toBe(originalId);
          expect(image.id).toBe(`${originalId}-image`);
          expect(root.textContent).not.toContain('JD');
          expect(loaded).toHaveBeenCalledExactlyOnceWith('loaded');
          if (keepMounted) expect(image).not.toHaveAttribute('data-starting-style');
        }
        expect(inserted.some((node) => node.textContent?.includes('JD'))).toBe(false);
      } finally {
        observer.disconnect();
      }
    } finally {
      dispose?.(); root.remove();
      if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previous;
    }
  });
}
