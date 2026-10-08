import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { DrawerProvider } from './DrawerProvider';
import { DrawerIndent } from '../indent/DrawerIndent';
import { DrawerIndentBackground } from '../indent-background/DrawerIndentBackground';

it('Drawer provider and indentation serialize without allocating browser resources', () => {
  const html = renderToString(() => <DrawerProvider><DrawerIndentBackground /><DrawerIndent id="application">App</DrawerIndent></DrawerProvider>);
  expect(html).toContain('data-inactive'); expect(html).toContain('id="application"'); expect(html).toContain('App');
});
