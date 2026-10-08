import { describe, it, expect } from 'vitest';
import { isServer, renderToString, renderToStream } from '@solidjs/web';
import { createUniqueId } from 'solid-js';
import { HydrationFixture } from './HydrationFixture';
describe('Harness server conditions and IDs', () => {
  it('runs genuine server compilation in Node, with escaped HTML and hydration addresses', () => {
    expect(isServer, 'HARNESS_SERVER_CONDITIONS').toBe(true);
    expect(typeof document).toBe('undefined');
    const html = renderToString(() => <HydrationFixture label={'<request>'} />, { renderId: 'server-' });
    expect(html).toContain('&lt;request>');
    expect(html).not.toContain('<request>');
    expect(html).toContain('_hk=');
    const id = /<input[^>]*\bid="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`for="${id}"`);
  });
  it('isolates overlapping requests and produces deterministic IDs per render namespace', async () => {
    const first = renderToStream(() => <HydrationFixture label="A" />, { renderId: 'A-' });
    const second = renderToStream(() => <HydrationFixture label="B" />, { renderId: 'B-' });
    const [a, b] = await Promise.all([first, second]);
    expect(a).toContain('>A</label>');
    expect(a).not.toContain('>B</label>');
    expect(b).toContain('>B</label>');
    const id = (html: string) => /<input[^>]*\bid="([^"]+)"/.exec(html)?.[1];
    expect(id(a)).not.toBe(id(b));
    expect(id(renderToString(() => <HydrationFixture label="A" />, { renderId: 'A-' }))).toBe(id(a));
  });
  it('does not use a global/random ID substitute', () => {
    function IDs() { const a = createUniqueId(); const b = createUniqueId(); return <div data-a={a} data-b={b} />; }
    const first = renderToString(() => <IDs />, { renderId: 'stable-' });
    expect(renderToString(() => <IDs />, { renderId: 'stable-' })).toBe(first);
    const [, a, b] = /data-a="([^"]+)" data-b="([^"]+)"/.exec(first)!;
    expect(a).not.toBe(b);
  });
});
