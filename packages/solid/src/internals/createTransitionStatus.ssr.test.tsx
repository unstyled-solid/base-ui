import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { createTransitionStatus } from './createTransitionStatus';
import { createRenderElement } from './createRenderElement';

it('closed presence is false and a getter-disabled host does not evaluate its children on the server', () => {
  let childCalls = 0;
  const html = renderToString(() => {
    const status = createTransitionStatus(() => false);
    return <><output>{String(status.mounted)}</output>{createRenderElement('span', {}, {
      get enabled() { return status.mounted; }, props: { get children() { childCalls++; return 'closed-presence-content'; } },
    })}</>;
  });
  expect(html).toContain('false'); expect(html).not.toContain('closed-presence-content'); expect(childCalls).toBe(0);
});
