import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createComponent, isServer, renderToStream, renderToString } from '@solidjs/web';
import { Fixture, type FixtureProps } from './fixtures';

const cases: { id: string; props: FixtureProps; stream?: boolean }[] = [
  { id: 'controls-a', props: { kind: 'controls', request: 'request-a' } },
  { id: 'controls-b', props: { kind: 'controls', request: 'request-b' } },
  ...[false, true].map(keepMounted => ({ id: `tabs-${keepMounted}`, props: { kind: 'tabs' as const, request: 'tabs', keepMounted } })),
  ...[false, true].flatMap(initialOpen => [false, true].map(keepMounted => ({ id: `dialog-${initialOpen}-${keepMounted}`, props: { kind: 'dialog' as const, request: 'dialog', initialOpen, keepMounted } }))),
  { id: 'detached', props: { kind: 'detached', request: 'detached' }, stream: true },
  { id: 'stream', props: { kind: 'stream', request: 'stream-request' }, stream: true },
  { id: 'error', props: { kind: 'error', request: 'error-request' }, stream: true },
  ...[false, true].map(disabledStyles => ({ id: `csp-${disabledStyles}`, props: { kind: 'csp' as const, request: 'csp', nonce: 'qualification-nonce', disabledStyles } })),
  { id: 'csp-null', props: { kind: 'csp', request: 'csp', nonce: 'qualification-nonce', noSelection: true } },
];

async function main() {
  assert.equal(isServer, true, 'SERVER_RESOLVED_CLIENT');
  assert.equal(typeof document, 'undefined', 'SSR must run without browser globals');
  const development = process.env.NODE_ENV === 'development';
  const resolutions = Object.fromEntries(['@solidjs/web', 'solid-js', 'baseui-solid2/field', 'baseui-solid2/dialog', 'baseui-solid2/tabs', 'baseui-solid2/slider'].map(name => [name, import.meta.resolve(name)]));
  assert(resolutions['@solidjs/web'].endsWith(development ? '/server.dev.js' : '/server.js'), 'SERVER_RUNTIME_CONDITIONS');
  for (const [name, location] of Object.entries(resolutions)) {
    if (name.startsWith('baseui-solid2/')) assert(location.includes('/server/'), `PACKAGE_SERVER_CONDITIONS:${name}:${location}`);
  }
  const errors: unknown[] = [];
  const rendered = await Promise.all(cases.map(async entry => {
    const options = { renderId: entry.id, nonce: 'qualification-nonce', onError: (error: unknown, context: unknown) => {
      errors.push({ id: entry.id, error: String(error), context });
    } };
    const fn = () => createComponent(Fixture, entry.props);
    const chunks: { text: string; atMs: number }[] = [];
    let html: string;
    if (entry.stream) {
      const start = performance.now();
      const reader = renderToStream(fn, { ...options, signal: AbortSignal.timeout(15_000) }).readable.getReader();
      const decoder = new TextDecoder();
      let complete = false;
      for (let chunk = 0; chunk < 1000; chunk += 1) {
        const { done, value } = await reader.read();
        if (done) { complete = true; break; }
        chunks.push({ text: decoder.decode(value, { stream: true }), atMs: performance.now() - start });
      }
      assert(complete, 'STREAM_CHUNK_LIMIT');
      html = chunks.map(chunk => chunk.text).join('') + decoder.decode();
    } else html = renderToString(fn, options);
    return { ...entry, html, chunks };
  }));
  // Persist raw evidence before assertions so a mismatch retains emitted markup,
  // complete streaming chunks and error-hook context for diagnosis.
  await writeFile(process.argv[2], JSON.stringify({ isServer, resolutions, rendered, errors }, null, 2));
  // Same namespace on separate concurrent requests must be deterministic and isolated.
  const isolated = await Promise.all(['isolated-a', 'isolated-b'].map(request =>
    Promise.resolve().then(() => renderToString(() => createComponent(Fixture, { kind: 'controls', request }), { renderId: 'same-request-namespace' }))));
  assert(!isolated[0].includes('isolated-b') && !isolated[1].includes('isolated-a'), 'REQUEST_STATE_LEAK');
  const ids = (html: string) => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const isolatedStreams = await Promise.all(['stream-isolated-a', 'stream-isolated-b'].map(request =>
    renderToStream(() => createComponent(Fixture, { kind: 'stream', request }), { renderId: 'same-stream-namespace', nonce: 'qualification-nonce', signal: AbortSignal.timeout(15_000) }).then(html => html)));
  assert(!isolatedStreams[0].includes('stream-isolated-b') && !isolatedStreams[1].includes('stream-isolated-a'), 'STREAM_REQUEST_STATE_LEAK');
  assert.deepEqual(ids(isolatedStreams[0]), ids(isolatedStreams[1]), 'STREAM_REQUEST_ID_LEAK');
  assert.deepEqual(ids(isolated[0]), ids(isolated[1]), 'REQUEST_ID_COUNTER_LEAK');
  assert(ids(isolated[0]).length > 0, 'NO_REAL_COMPONENT_IDS');
  const firstIds = ids(rendered[0].html), secondIds = ids(rendered[1].html);
  assert(firstIds.every(id => !secondIds.includes(id)), 'ROOT_ID_COLLISION');
  for (const entry of rendered.filter(entry => entry.props.kind === 'dialog')) {
    assert(!entry.html.includes('data-probe="popup"'), 'PORTAL_MUST_BE_CLIENT_ONLY');
  }
  const pending = renderToString(() => createComponent(Fixture, { kind: 'stream', request: 'sync-pending' }), { renderId: 'pending' });
  assert(pending.includes('data-probe="pending"'), 'SYNC_LOADING_FALLBACK_ABSENT');
  const stream = rendered.find(entry => entry.id === 'stream')!;
  assert(stream.chunks.length > 1, 'STREAM_NOT_INCREMENTAL');
  assert(stream.chunks[0].text.includes('data-probe="pending"'), 'STREAM_SHELL_NOT_PENDING');
  assert(stream.html.includes('stream-request:0:a'), 'STREAM_NOT_SETTLED');
  const unexpected = errors.filter((entry: any) => entry.id !== 'error' || !entry.error.includes('expected:error-request'));
  assert.deepEqual(unexpected, [], 'UNEXPECTED_SERVER_ERROR');
  assert(errors.some((entry: any) => entry.id === 'error'), 'ERROR_BOUNDARY_NOT_EXERCISED');
  await writeFile(process.argv[2], JSON.stringify({ isServer, resolutions, rendered, isolated, isolatedStreams, pending, errors }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
