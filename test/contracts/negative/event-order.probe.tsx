import { it, expect } from 'vitest';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
it('rejects reversed handler order and missing native prevention', async () => {
  const seen: string[] = [];
  const view = await createRenderer().render(() => <button onClick={(event) => {
    // Deliberate defect: the internal handler runs before external cancellation.
    seen.push(`internal:${event.defaultPrevented}`);
    event.preventDefault(); seen.push('external');
  }}>Order</button>);
  await view.user.click(view.getByRole('button'));
  expect(seen, 'HARNESS_EVENT_ORDER_PROBE').toEqual(['external', 'internal:true']);
});
