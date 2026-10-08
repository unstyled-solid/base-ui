import { renderToString, renderToStream, generateHydrationScript, isServer } from '@solidjs/web';
import { createMemo, createUniqueId, Loading } from 'solid-js';
import { createBaseUiId } from '../internals/createBaseUiId';
import { LifecycleIdFixture } from './createId.fixture';

if (!isServer || typeof createUniqueId !== 'function') throw new Error('Expected RC13 server ID export');
const records = ['lifecycle-a-', 'lifecycle-b-'].map((renderId) => ({
  renderId, html: renderToString(() => <LifecycleIdFixture />, { renderId }),
}));
function AsyncField(props: { value: string; ready: Promise<void> }) {
  const value = createMemo(async () => { await props.ready; return props.value; });
  function Resolved() {
    const id = createBaseUiId();
    return <output id={id()}>{value()}</output>;
  }
  return <Loading fallback={<span>pending</span>}><Resolved /></Loading>;
}
let releaseA!: () => void; let releaseB!: () => void;
const readyA = new Promise<void>((resolve) => { releaseA = resolve; });
const readyB = new Promise<void>((resolve) => { releaseB = resolve; });
const a = renderToStream(() => <AsyncField value="request-A" ready={readyA} />, { renderId: 'async-a-' });
const b = renderToStream(() => <AsyncField value="request-B" ready={readyB} />, { renderId: 'async-b-' });
releaseB(); releaseA();
const concurrent = await Promise.all([a, b]);
process.stdout.write(JSON.stringify({
  isServer, version: '2.0.0-rc.13', bootstrap: generateHydrationScript({ eventNames: [] }), records, concurrent,
  repeat: renderToString(() => <LifecycleIdFixture />, { renderId: 'lifecycle-a-' }),
}));
