import { execFileSync } from 'node:child_process';
import { hydrate, isServer } from '@solidjs/web';
import { createUniqueId, flush } from 'solid-js';
import { describe, it, expect, vi } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { LifecycleIdFixture } from './createId.fixture';

describe('Lifecycle IDs and hydration', () => {
  const { renderProps, render } = createRenderer();
  it('keeps live overrides including empty strings and restores the original generated ID on the same node', async () => {
    const view = await renderProps<{ id: string | undefined }>((props) => <LifecycleIdFixture id={props.id} />, { id: undefined });
    const input = view.container.querySelector('input')!;
    const original = input.id; expect(original).toMatch(/^base-ui-/);
    await view.setProps({ id: 'explicit' }); expect(input.id).toBe('explicit');
    await view.setProps({ id: '' }); expect(input.id).toBe('');
    await view.setProps({ id: undefined }); expect(input.id).toBe(original);
    expect(view.container.querySelector('input')).toBe(input);
    const refs = input.getAttribute('aria-labelledby')!.split(' ');
    expect(refs).toEqual([view.container.querySelector('label')!.id, view.container.querySelector('span')!.id]);
    expect(view.container.querySelector('label')!.htmlFor).toBe(original);
  });
  it('client-only mounts are already hydrated and distinct roots have distinct IDs', async () => {
    const observed = vi.fn();
    const a = await render(() => <LifecycleIdFixture observed={observed} />);
    const b = await render(() => <LifecycleIdFixture observed={observed} />);
    expect(observed.mock.calls.map((args) => args.slice(1))).toEqual([[true, false], [true, false]]);
    expect(a.container.querySelector('input')!.id).not.toBe(b.container.querySelector('input')!.id);
  });
  it('hydrates independent production SSR with matching IDs, state and raw nodes across roots; isolates concurrent async requests', () => {
    expect(isServer).toBe(false); expect(typeof createUniqueId).toBe('function');
    const artifact = JSON.parse(execFileSync(process.execPath, ['packages/solid/src/utils/createId.proof.mjs'], { encoding: 'utf8' })) as {
      isServer: boolean; version: string; bootstrap: string; records: { html: string; renderId: string }[]; repeat: string; concurrent: string[];
    };
    expect(artifact.isServer).toBe(true); expect(artifact.version).toBe('2.0.0-rc.13');
    expect(artifact.repeat).toBe(artifact.records[0]!.html);
    const asyncIds = artifact.concurrent.map((html) => /<output[^>]*id="([^"]+)"/.exec(html)?.[1]);
    expect(asyncIds.every(Boolean)).toBe(true); expect(new Set(asyncIds).size).toBe(2);
    expect(artifact.concurrent[0]).toContain('request-A'); expect(artifact.concurrent[0]).not.toContain('request-B');
    expect(artifact.concurrent[1]).toContain('request-B'); expect(artifact.concurrent[1]).not.toContain('request-A');
    const previousHydration = globalThis._$HY;
    const template = document.createElement('template'); template.innerHTML = artifact.bootstrap;
    for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
    const roots: HTMLElement[] = []; const disposers: (() => void)[] = []; const ids: string[] = [];
    try {
      for (const record of artifact.records) {
        const root = document.createElement('div'); root.innerHTML = record.html; document.body.append(root); roots.push(root);
        const input = root.querySelector('input')!; const id = input.id; ids.push(id);
        expect(root.querySelector('section')!.dataset.hydrated).toBe('false');
        expect(root.querySelector('section')!.dataset.hydrating).toBe('true');
        const observed = vi.fn();
        disposers.push(hydrate(() => <LifecycleIdFixture observed={observed} />, root, { renderId: record.renderId }));
        expect(observed).toHaveBeenCalledWith(id, false, true);
        flush();
        expect(root.querySelector('input')).toBe(input); expect(input.id).toBe(id);
        expect(root.querySelector('label')!.htmlFor).toBe(id);
        expect(root.querySelector('section')!.dataset.hydrated).toBe('true');
        expect(root.querySelector('section')!.dataset.hydrating).toBe('false');
      }
      expect(new Set(ids).size).toBe(2);
    } finally {
      disposers.forEach((dispose) => dispose()); roots.forEach((root) => root.remove());
      if (previousHydration === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previousHydration;
    }
  }, 30000);
});
