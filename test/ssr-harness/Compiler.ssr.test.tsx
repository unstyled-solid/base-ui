import { it, expect } from 'vitest';
import { renderToString, isServer } from '@solidjs/web';
import { GenericFixture, GenericChildren } from '../harness/GenericFixture';

it('erases generic type-only captures in JSX props and nested callback bodies', () => {
  expect(isServer).toBe(true);
  const html = renderToString(() => <GenericChildren values={['one', 'two']} render={(value) => <GenericFixture value={value} />} />);
  expect(html).toContain('one');
  expect(html).toContain('two');
});
