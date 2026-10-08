import { expect, it, vi } from 'vitest';
import { createRenderer, flushMicrotasks } from '../../test';
import { createMediaQuery } from './index';
class QueryList extends EventTarget implements MediaQueryList {
  matches = false;
  onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => any) | null = null;
  listeners = 0;
  constructor(readonly media: string) { super(); }
  addListener(listener: ((this: MediaQueryList, event: MediaQueryListEvent) => any) | null) { if (listener) this.addEventListener('change', listener as EventListener); }
  removeListener(listener: ((this: MediaQueryList, event: MediaQueryListEvent) => any) | null) { if (listener) this.removeEventListener('change', listener as EventListener); }
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) { if (type === 'change') this.listeners++; super.addEventListener(type, listener, options); }
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) { if (type === 'change') this.listeners--; super.removeEventListener(type, listener, options); }
}
it('MediaQuery strips @media, follows native events and replaces exactly one subscription', async () => {
  const lists: QueryList[] = [];
  const provider = vi.fn((query: string) => { const list = new QueryList(query); lists.push(list); return list; });
  const view = await createRenderer().renderProps((props: { query: string }) => {
    const matches = createMediaQuery(() => props.query, { matchMedia: provider });
    return <output>{String(matches())}</output>;
  }, { query: '@media (min-width: 600px)' });
  expect(provider).toHaveBeenCalledWith('(min-width: 600px)');
  expect(lists[0]!.media).toBe('(min-width: 600px)');
  expect(view.getByRole('status')).toHaveTextContent('false');
  expect(lists[0]!.listeners).toBe(1);
  lists[0]!.matches = true; lists[0]!.dispatchEvent(new Event('change'));
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('true');
  await view.setProps({ query: '(max-width: 10px)' });
  expect(lists[0]!.listeners).toBe(0);
  expect(lists[1]!.listeners).toBe(1);
  view.unmount();
  expect(lists[1]!.listeners).toBe(0);
});
it('MediaQuery returns defaultMatches when matchMedia is unavailable', async () => {
  const { render } = createRenderer();
  const first = await render(() => {
    const matches = createMediaQuery('(min-width: 600px)', { matchMedia: null });
    return <span data-testid="result">{String(matches())}</span>;
  });
  expect(first.getByTestId('result')).toHaveTextContent('false');
  await render(() => {
    const matches = createMediaQuery('(min-width: 600px)', { matchMedia: null, defaultMatches: true });
    return <span data-testid="result">{String(matches())}</span>;
  });
  expect(first.getAllByTestId('result')[1]).toHaveTextContent('true');
});
