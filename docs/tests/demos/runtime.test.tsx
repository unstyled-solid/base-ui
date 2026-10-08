import { afterEach, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { mountDemo } from '../../demos/shared/runtime';
import { createRegistry, loadSource } from '../../demos/shared/registry';
import Stateful, { lifecycle } from './fixtures/state';
import PortalFixture from './fixtures/portal';
import source from './fixtures/state.tsx?raw';
import css from './fixtures/style.module.css?raw';
import type { DemoEntry } from '../../demos/shared/types';
import { highlightSource } from '../../demos/shared/highlight';

const entry: DemoEntry = {
  id: 'fixture/hero',
  upstream: 'docs/example/index.ts',
  variants: [
    {
      id: 'state',
      label: 'CSS Modules',
      component: Stateful,
      files: [
        'docs/tests/demos/fixtures/state.tsx',
        'docs/tests/demos/fixtures/style.module.css',
      ],
    },
    {
      id: 'portal',
      label: 'Portal',
      component: PortalFixture,
      files: ['docs/tests/demos/fixtures/portal.tsx'],
    },
  ],
};
const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup.splice(0).forEach((dispose) => dispose());
  document.body.replaceChildren();
});
async function mount(value = entry) {
  const host = document.createElement('div');
  document.body.append(host);
  const copy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: copy },
  });
  const dispose = mountDemo(host, value.id, {
    loadDemo: async () => value,
    loadSource: async (path) => (path.endsWith('.css') ? css : source),
  });
  cleanup.push(dispose);
  await Promise.resolve();
  await Promise.resolve();
  flush();
  return { host, dispose, copy };
}
function click(host: HTMLElement, text: string) {
  (
    Array.from(host.querySelectorAll('button')).find(
      (button) =>
        button.textContent === text ||
        button.getAttribute('aria-label') === text,
    ) as HTMLButtonElement
  ).click();
}
it('executes state, exposes exact file bytes and copies the selected file with keyboard tabs', async () => {
  const { host, copy } = await mount();
  click(host, 'Count 0');
  flush();
  expect(host.textContent).toContain('Count 1');
  click(host, 'Show code');
  expect(
    host.querySelector('.DemoCodePanel')!.getAttribute('data-expanded'),
  ).toBe('true');
  expect(
    host.querySelector('[aria-label="Demo preview"]')!.textContent,
  ).toContain('Count 1');
  expect(host.querySelector('code')!.textContent).toBe(source);
  click(host, 'Copy code');
  await Promise.resolve();
  expect(copy).toHaveBeenCalledWith(source);
  const tab = host.querySelector('[role=tab]')!;
  tab.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
  );
  await Promise.resolve();
  expect(host.querySelector('code')!.textContent).toBe(css);
  expect(host.querySelector('[aria-selected=true]')!.textContent).toBe(
    'style.module.css',
  );
  click(host, 'Copy code');
  await Promise.resolve();
  expect(copy).toHaveBeenLastCalledWith(css);
});
it('loads authored fixture TSX and CSS through the actual lazy raw build imports', async () => {
  expect(await loadSource('docs/tests/demos/fixtures/state.tsx')).toBe(source);
  expect(await loadSource('docs/tests/demos/fixtures/style.module.css')).toBe(
    css,
  );
  await expect(loadSource('packages/solid/src/index.ts')).rejects.toThrow(
    'Invalid demo source',
  );
});
it('loads only the selected family and rejects duplicate IDs', async () => {
  const selected = vi.fn().mockResolvedValue({ default: [entry] });
  const unrelated = vi.fn();
  const registry = createRegistry({
    '../fixture/entry.ts': selected,
    '../unrelated/entry.ts': unrelated,
  });
  expect(await registry(entry.id)).toBe(entry);
  expect(selected).toHaveBeenCalledTimes(1);
  expect(unrelated).not.toHaveBeenCalled();
  await expect(
    createRegistry({
      '../fixture/entry.ts': async () => ({ default: [entry, entry] }),
    })(entry.id),
  ).rejects.toThrow('found 2');
});
it('disposes listeners and portals on variant changes, remounts and unmount under an eval-blocking policy', async () => {
  const { host, dispose } = await mount();
  const baseline = lifecycle.cleanups;
  const evalSpy = vi.spyOn(globalThis, 'eval').mockImplementation(() => {
    throw new Error('CSP unsafe-eval blocked');
  });
  try {
    const select = host.querySelector('select')!;
    select.value = 'portal';
    select.dispatchEvent(new Event('change'));
    flush();
    expect(lifecycle.cleanups).toBe(baseline + 1);
    const events = lifecycle.events;
    document.dispatchEvent(new Event('fixture-event'));
    expect(lifecycle.events).toBe(events);
    expect(
      document.querySelectorAll('[data-demo-fixture-portal]'),
    ).toHaveLength(1);
    const remounted = mountDemo(host, entry.id, {
      loadDemo: async () => ({ ...entry, variants: [entry.variants[1]] }),
      loadSource: async () => source,
    });
    cleanup.push(remounted);
    await Promise.resolve();
    flush();
    expect(
      document.querySelectorAll('[data-demo-fixture-portal]'),
    ).toHaveLength(1);
    dispose();
    remounted();
    remounted();
    flush();
    expect(
      document.querySelectorAll('[data-demo-fixture-portal]'),
    ).toHaveLength(0);
    expect(host.childElementCount).toBe(0);
    expect(evalSpy).not.toHaveBeenCalled();
  } finally {
    evalSpy.mockRestore();
  }
});
it('cancels lazy loads after disposal and reports missing families', async () => {
  const loader = createRegistry({});
  await expect(loader('missing/hero')).rejects.toThrow(
    'missing docs/demos/missing/entry.ts',
  );
  const host = document.createElement('div');
  let resolve!: (value: DemoEntry) => void;
  const dispose = mountDemo(host, entry.id, {
    loadDemo: () =>
      new Promise((done) => {
        resolve = done;
      }),
  });
  dispose();
  resolve(entry);
  await Promise.resolve();
  expect(host.childElementCount).toBe(0);
  cleanup.push(mountDemo(host, 'missing/hero', { loadDemo: loader }));
  await Promise.resolve();
  await Promise.resolve();
  expect(host.querySelector('[role=alert]')!.textContent).toContain(
    'missing/hero',
  );
});
it('replaces a host root and shows component failure diagnostics', async () => {
  const { host } = await mount();
  function Broken() {
    throw new Error('fixture exploded');
    return null;
  }
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => ({
        ...entry,
        variants: [{ ...entry.variants[0], component: Broken }],
      }),
      loadSource: async () => source,
    }),
  );
  await Promise.resolve();
  flush();
  expect(host.querySelectorAll('section')).toHaveLength(1);
  expect(host.querySelector('[role=alert]')!.textContent).toContain(
    'fixture exploded',
  );
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => entry,
      loadSource: async () => source,
    }),
  );
  await Promise.resolve();
  flush();
  expect(host.querySelector('[role=alert]')).toBeNull();
  expect(host.querySelectorAll('[data-demo] button')).toHaveLength(1);
  expect(host.querySelector('[data-demo]')!.textContent).toContain('Count 0');
});
it('ignores stale source loads after variant changes and reports source failures', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  let resolve!: (text: string) => void;
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => entry,
      loadSource: (path) =>
        path.endsWith('state.tsx')
          ? new Promise((done) => {
              resolve = done;
            })
          : Promise.reject(new Error('missing fixture source')),
    }),
  );
  await Promise.resolve();
  const select = host.querySelector('select')!;
  select.value = 'portal';
  select.dispatchEvent(new Event('change'));
  await Promise.resolve();
  resolve('stale source');
  await Promise.resolve();
  expect(host.querySelector('code')!.textContent).toContain(
    'Source failed: missing fixture source',
  );
  expect(host.querySelector('code')!.textContent).not.toContain('stale source');
  expect(
    (host.querySelector('[aria-label="Copy code"]') as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
it('links binary assets without treating their bytes as copyable source', async () => {
  const host = document.createElement('div');
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => ({
        ...entry,
        variants: [
          { ...entry.variants[0], files: ['docs/demos/fixture/image.png'] },
        ],
      }),
      loadAsset: async () => '/assets/image-hash.png',
    }),
  );
  await Promise.resolve();
  await Promise.resolve();
  expect(host.querySelector('code')!.textContent).toBe(
    'Binary asset: docs/demos/fixture/image.png',
  );
  const link = Array.from(host.querySelectorAll('a')).find(
    (item) => item.textContent === 'Open asset',
  )!;
  expect(link.getAttribute('href')).toBe('/assets/image-hash.png');
  expect(link.hidden).toBe(false);
});

it('preserves reveal focus and live preview state, expands on file/variant selection, and scopes Select All to source', async () => {
  const { host } = await mount();
  click(host, 'Count 0');
  flush();
  const setups = lifecycle.setups;
  const reveal = host.querySelector('.DemoCodeReveal') as HTMLButtonElement;
  reveal.focus();
  reveal.click();
  expect(document.activeElement).toBe(reveal);
  expect(reveal.getAttribute('aria-expanded')).toBe('true');
  reveal.click();
  expect(document.activeElement).toBe(reveal);
  expect(host.querySelector('pre')!.getAttribute('aria-hidden')).toBe('true');
  expect(lifecycle.setups).toBe(setups);
  expect(host.querySelector('[data-demo]')!.textContent).toContain('Count 1');
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role=tab]');
  tabs[0].focus();
  tabs[0].dispatchEvent(
    new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
  );
  await Promise.resolve();
  expect(document.activeElement).toBe(tabs[1]);
  expect(reveal.getAttribute('aria-expanded')).toBe('true');
  expect(host.querySelector('code')!.textContent).toBe(css);
  const pre = host.querySelector('pre')!;
  pre.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(document.getSelection()!.toString()).toBe(css);
  const select = host.querySelector('select')!;
  select.value = 'portal';
  select.dispatchEvent(new Event('change'));
  await Promise.resolve();
  flush();
  expect(
    host.querySelector('.DemoCodePanel')!.getAttribute('data-expanded'),
  ).toBe('true');
  expect(host.querySelector('.DemoTabsList')!.hasAttribute('hidden')).toBe(
    true,
  );
});

it('handles wrapping, Home/End and RTL file keyboard navigation with roving focus', async () => {
  const { host } = await mount();
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role=tab]');
  tabs[0].focus();
  for (const [from, key, to] of [
    [0, 'ArrowLeft', 1],
    [1, 'ArrowRight', 0],
    [0, 'End', 1],
    [1, 'Home', 0],
  ] as const) {
    tabs[from].dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true }),
    );
    expect(document.activeElement).toBe(tabs[to]);
    expect(tabs[to].tabIndex).toBe(0);
    expect(tabs[1 - to].tabIndex).toBe(-1);
  }
  (host.querySelector('.DemoTabsList') as HTMLElement).style.direction = 'rtl';
  tabs[0].dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
  );
  expect(document.activeElement).toBe(tabs[1]);
  await Promise.resolve();
  expect(host.querySelector('code')!.textContent).toBe(css);
});

it('renders short files fully and clears copy/source when switching to a variant without files', async () => {
  const host = document.createElement('div');
  const value = {
    ...entry,
    variants: [entry.variants[0], { ...entry.variants[1], files: [] }],
  };
  const copy = vi.fn();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: copy },
  });
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => value,
      loadSource: async () => 'export default 1;\r\n',
    }),
  );
  await Promise.resolve();
  await Promise.resolve();
  expect(host.querySelector('.DemoCodeReveal')!.hasAttribute('hidden')).toBe(
    true,
  );
  expect(host.querySelector('pre')!.getAttribute('aria-hidden')).toBe('false');
  const select = host.querySelector('select')!;
  select.value = 'portal';
  select.dispatchEvent(new Event('change'));
  flush();
  expect(host.querySelector('code')!.textContent).toBe(
    'No source files declared.',
  );
  expect(
    (host.querySelector('.DemoCopyButton') as HTMLButtonElement).disabled,
  ).toBe(true);
  click(host, 'Copy code');
  await Promise.resolve();
  expect(copy).not.toHaveBeenCalled();
});

it('keeps the latest file when raw loads resolve out of order and ignores late clipboard completion', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const pending = new Map<string, (source: string) => void>();
  let copied!: () => void;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: () =>
        new Promise<void>((resolve) => {
          copied = resolve;
        }),
    },
  });
  cleanup.push(
    mountDemo(host, entry.id, {
      loadDemo: async () => entry,
      loadSource: (path) =>
        new Promise((resolve) => pending.set(path, resolve)),
    }),
  );
  await Promise.resolve();
  click(host, 'style.module.css');
  pending.get(entry.variants[0].files[1])!(css);
  await Promise.resolve();
  pending.get(entry.variants[0].files[0])!(source);
  await Promise.resolve();
  expect(host.querySelector('code')!.textContent).toBe(css);
  click(host, 'Copy code');
  await Promise.resolve();
  click(host, 'state.tsx');
  copied();
  await Promise.resolve();
  await Promise.resolve();
  expect(host.querySelector('[role=status]')!.textContent).toBe('');
  expect(
    (host.querySelector('.DemoCopyButton') as HTMLButtonElement).disabled,
  ).toBe(true);
});

it('provides pinned variant source actions, menu keyboard dismissal, outside dismissal and clipboard failures', async () => {
  const { host, copy } = await mount();
  const summary = host.querySelector('summary')!;
  summary.focus();
  summary.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }),
  );
  const items = host.querySelectorAll<HTMLElement>('[role=menuitem]');
  expect(items).toHaveLength(2);
  expect(document.activeElement).toBe(items[0]);
  expect((items[0] as HTMLAnchorElement).href).toBe(
    'https://github.com/mui/base-ui/tree/19511bb171f3b360b006c94cf6d07e53cb446505/docs/example/state',
  );
  items[0].dispatchEvent(
    new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
  );
  expect(document.activeElement).toBe(items[1]);
  items[1].click();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(copy).toHaveBeenCalledWith((items[0] as HTMLAnchorElement).href);
  expect(host.querySelector('details')!.open).toBe(true);
  items[1].dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(host.querySelector('details')!.open).toBe(false);
  expect(document.activeElement).toBe(summary);
  summary.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    }),
  );
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  expect(host.querySelector('details')!.open).toBe(false);
  copy.mockRejectedValueOnce(new Error('permission denied'));
  click(host, 'Copy code');
  await vi.waitFor(() =>
    expect(host.querySelector('[role=status]')!.textContent).toContain(
      'Copy failed: permission denied',
    ),
  );
});

it('invalidates queued clipboard work and detached controls after disposal', async () => {
  const { host, dispose, copy } = await mount();
  const summary = host.querySelector('summary')!;
  const reveal = host.querySelector('.DemoCodeReveal') as HTMLButtonElement;
  const menu = host.querySelector('details')!;
  click(host, 'Copy code');
  dispose();
  await Promise.resolve();
  await Promise.resolve();
  expect(copy).not.toHaveBeenCalled();
  summary.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
  );
  expect(menu.open).toBe(false);
  reveal.click();
  expect(reveal.getAttribute('aria-expanded')).toBe('false');
  expect(host.childElementCount).toBe(0);
});

it('highlights authored TSX/CSS without HTML interpretation, byte normalization or stale spans', () => {
  const code = document.createElement('code');
  const raw =
    '// comment\r\nconst template = `hello ${name}`;\r\n<Component class = "<script>" count={1.5} />\n/* css */ .rule { color: red; }\t\n';
  highlightSource(code, raw);
  expect(code.textContent).toBe(raw);
  expect(code.querySelector('script')).toBeNull();
  expect(code.querySelector('.SiteToken-tag')!.textContent).toBe('Component');
  expect(code.querySelector('.SiteToken-number')!.textContent).toBe('1.5');
  highlightSource(code, css);
  expect(code.textContent).toBe(css);
  expect(code.textContent).not.toContain('template');
});
