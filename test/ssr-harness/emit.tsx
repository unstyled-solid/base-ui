import { renderToString, generateHydrationScript, isServer } from '@solidjs/web';
import { HydrationFixture } from './HydrationFixture';
if (!isServer || typeof document !== 'undefined') throw new Error('HARNESS_SERVER_CONDITIONS: expected Node/server');
const records = ['request-a', 'request-b'].map((renderId) => ({
  renderId,
  label: renderId,
  html: renderToString(() => <HydrationFixture label={renderId} />, { renderId }),
}));
process.stdout.write(JSON.stringify({ isServer, bootstrap: generateHydrationScript({ eventNames: [] }), records }));
