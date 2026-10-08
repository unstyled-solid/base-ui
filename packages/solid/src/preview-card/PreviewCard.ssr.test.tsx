import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { PreviewCard } from './index';

describe('PreviewCard SSR', () => {
  it('renders link semantics with stable IDs and leaves portal content client-owned', async () => {
    const html = await renderToString(() => <PreviewCard.Root defaultOpen>
      <PreviewCard.Trigger href="/article" id="preview-article">Article</PreviewCard.Trigger>
      <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup>Client content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
    </PreviewCard.Root>);
    expect(html).toContain('href="/article"');
    expect(html).toContain('id="preview-article"');
    expect(html).not.toContain('Client content');
  });
  it('never attaches a server-rendered Root to a shared handle', async () => {
    const handle = PreviewCard.createHandle<number>();
    const fallback = handle.serverStore;
    await Promise.all([1, 2].map((payload) => renderToString(() => <>
      <PreviewCard.Trigger handle={handle} id={`trigger-${payload}`} payload={payload} href="/article">Article</PreviewCard.Trigger>
      <PreviewCard.Root handle={handle} defaultOpen defaultTriggerId={`trigger-${payload}`} />
    </>)));
    expect(handle.store).toBe(fallback);
    expect(handle.isOpen).toBe(false);
  });
  it('does not publish imperative actions or invoke native refs during server rendering', async () => {
    const actions: (PreviewCard.Root.Actions | null)[] = [];
    const refs: HTMLAnchorElement[] = [];
    const html = await renderToString(() => <PreviewCard.Root defaultOpen actionsRef={(value) => { actions.push(value); }}>
      <PreviewCard.Trigger href="/article" ref={(node) => { refs.push(node); }}>Article</PreviewCard.Trigger>
    </PreviewCard.Root>);
    expect(html).toContain('href="/article"');
    expect(actions).toEqual([]);
    expect(refs).toEqual([]);
  });
});
