import { it } from 'vitest';
import { onSettled } from 'solid-js';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
it('rejects a throwing real owner cleanup', async () => {
  await createRenderer().render(() => {
    onSettled(() => () => { throw new Error('deliberately broken disposal'); });
    return <button>Cleanup probe</button>;
  });
});
