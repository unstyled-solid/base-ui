import { it } from 'vitest';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
function Broken(props: { value: number }) { const snapshot = props.value; return <output>{snapshot}</output>; }
it('rejects genuine unapproved Solid component-setup diagnostics', async () => {
  await createRenderer().renderProps((props: { value: number }) => <Broken {...props} />, { value: 1 });
});
