import { it, expect } from 'vitest';
import { isServer } from '@solidjs/web';
it('rejects a server suite accidentally resolved as browser', () => {
  expect(isServer, 'HARNESS_SERVER_CONDITIONS').toBe(true);
});
