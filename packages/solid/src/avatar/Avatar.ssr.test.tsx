import { renderToString, isServer } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { Avatar } from './index';

describe('Avatar server output', () => {
  it('defaults to fallback without attempting a client preload', () => {
    expect(isServer).toBe(true);
    const html = renderToString(() => <Avatar.Root><Avatar.Image src="avatar.png" alt="Jane Doe" /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>);
    expect(html).toContain('JD');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('data-image-loading-status');
  });
  it('retains an accessible fallback beside the aria-hidden keepMounted image', () => {
    const html = renderToString(() => <Avatar.Root><Avatar.Image keepMounted src="avatar.png" srcSet="avatar.png 1x" loading="lazy" sizes="48px" alt="Jane Doe" /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>);
    expect(html).toContain('<img');
    expect(html).toContain('src="avatar.png"');
    expect(html).toContain('srcset="avatar.png 1x"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('JD');
    expect(html).not.toContain('data-starting-style');
    expect(html).not.toContain('data-loading');
  });
  it('does not render a delayed fallback on the server', () => {
    const html = renderToString(() => <Avatar.Root><Avatar.Fallback delay={100}>JD</Avatar.Fallback></Avatar.Root>);
    expect(html).not.toContain('JD');
  });
  it('preserves explicit aria-hidden on the server', () => {
    const html = renderToString(() => <Avatar.Root><Avatar.Image keepMounted src="avatar.png" aria-hidden={false} /></Avatar.Root>);
    expect(html).toContain('aria-hidden="false"');
  });
});
