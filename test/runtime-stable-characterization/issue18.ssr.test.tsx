import { expect, test } from 'vitest';
import { createUniqueId, onCleanup } from 'solid-js';
import { isServer, renderToString } from '@solidjs/web';

test('server onCleanup runs at render disposal', () => {
  const calls: string[] = [];
  function App() { onCleanup(() => calls.push('cleanup')); return <div>server</div>; }
  expect(isServer).toBe(true); expect(renderToString(() => <App />)).toContain('server');
  expect(calls).toEqual(['cleanup']);
});

test('SSR spread defaultValue key presence takes precedence over value', () => {
  expect(renderToString(() => <input {...{ value: 'controlled' }} />)).toContain('value="controlled"');
  expect(renderToString(() => <input {...{ value: 'controlled', defaultValue: undefined }} />)).not.toContain('value="controlled"');
  expect(renderToString(() => <input {...{ value: 'controlled', defaultValue: 'default' }} />)).toContain('value="default"');
});

test.each(['checkbox', 'radio'])('SSR conditional value omission preserves native %s default without an attribute', type => {
  for (const value of [undefined, '', 'explicit']) {
    const html = renderToString(() => <input type={type} name="choice" checked {...(value === undefined ? {} : { value })} />);
    if (value === undefined) expect(html).not.toMatch(/\svalue(?:=|\s|>)/);
    else if (value === '') expect(html).toMatch(/\svalue(?:=""|(?=\s|>))/);
    else expect(html).toContain(`value="${value}"`);
  }
});

test('server createUniqueId is available, unique within a request and deterministic between requests', () => {
  function App() { const first = createUniqueId(); const second = createUniqueId();
    expect(typeof first).toBe('string'); expect(first.length).toBeGreaterThan(0); expect(second).not.toBe(first);
    return <><label for={first}>label</label><input id={first} /><input id={second} /></>;
  }
  expect(renderToString(() => <App />)).toBe(renderToString(() => <App />));
});
