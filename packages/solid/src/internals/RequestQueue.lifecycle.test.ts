import { describe, it, expect, vi } from 'vitest';
import { RequestQueue } from './RequestQueue';

describe('Lifecycle RequestQueue', () => {
  it('calls fetchFn for each queued key', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const queue = new RequestQueue({ fetchFn });
    await queue.queue(['a', 'b']);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenCalledWith('a');
    expect(fetchFn).toHaveBeenCalledWith('b');
    queue.clear();
  });

  it('supports custom getKeyId for complex key types', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const queue = new RequestQueue({ fetchFn, getKeyId: (key: { id: number }) => String(key.id) });
    await queue.queue([{ id: 1 }, { id: 2 }, { id: 1 }]);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    queue.clear();
  });

  it('continues processing when a deferred fetchFn rejects', async () => {
    const deferreds = new Map<string, { resolve: () => void; reject: (reason: unknown) => void; promise: Promise<void> }>();
    const fetchFn = vi.fn((key: string) => {
      let resolve!: () => void;
      let reject!: (reason: unknown) => void;
      const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
      deferreds.set(key, { resolve, reject, promise });
      return promise;
    });
    const queue = new RequestQueue({ fetchFn, maxConcurrentRequests: 1 });
    const pending = queue.queue(['a', 'b']);
    deferreds.get('a')!.reject(new Error('fail'));
    await vi.waitFor(() => { expect(queue.getRequestStatus('a')).toBe('unknown'); });
    await vi.waitFor(() => { expect(queue.getRequestStatus('b')).toBe('pending'); });
    deferreds.get('b')!.resolve();
    await pending;
    queue.clear();
  });

  it('reports correct request status before a deferred fetch resolves', async () => {
    let resolve!: () => void;
    const deferred = new Promise<void>((done) => { resolve = done; });
    const fetchFn = vi.fn(() => deferred);
    const queue = new RequestQueue({ fetchFn, maxConcurrentRequests: 1 });
    const pending = queue.queue(['a', 'b']);
    expect(queue.getRequestStatus('a')).toBe('pending');
    expect(queue.getRequestStatus('b')).toBe('queued');
    expect(queue.getRequestStatus('c')).toBe('unknown');
    const duplicate = queue.queue(['a']);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    queue.clear();
    expect(queue.getRequestStatus('a')).toBe('unknown');
    expect(queue.getRequestStatus('b')).toBe('unknown');
    resolve();
    await Promise.all([pending, duplicate]);
  });

  it('setRequestSettled advances while the original fetch remains unresolved', async () => {
    const resolvers: (() => void)[] = [];
    const fetchFn = vi.fn((_key: string) => new Promise<void>((resolve) => resolvers.push(resolve)));
    const queue = new RequestQueue({ fetchFn, maxConcurrentRequests: 1 });
    const pending = queue.queue(['a', 'b']);
    expect(queue.getRequestStatus('a')).toBe('pending');
    expect(queue.getRequestStatus('b')).toBe('queued');
    const next = queue.setRequestSettled('a');
    expect(queue.getRequestStatus('a')).toBe('unknown');
    expect(queue.getRequestStatus('b')).toBe('pending');
    expect(fetchFn.mock.calls).toEqual([['a'], ['b']]);
    queue.clear();
    resolvers.forEach((resolve) => resolve());
    await Promise.all([pending, next]);
  });
  it('defaults to unlimited concurrent requests in insertion order', async () => {
    const fetchFn = vi.fn(async (_key: string) => {});
    const queue = new RequestQueue({ fetchFn });
    await queue.queue(['c', 'a', 'b']);
    expect(fetchFn.mock.calls).toEqual([['c'], ['a'], ['b']]);
    expect(queue.getRequestStatus('missing')).toBe('unknown');
    queue.clear();
  });
  it('fetches FIFO, deduplicates and keeps successful requests pending until explicit settlement', async () => {
    const fetchFn = vi.fn(async (_key: string) => {});
    const queue = new RequestQueue({ fetchFn, maxConcurrentRequests: 2 });
    await queue.queue(['c', 'a', 'b', 'a']);
    expect(fetchFn.mock.calls).toEqual([['c'], ['a']]);
    expect(queue.getRequestStatus('b')).toBe('queued'); expect(queue.getRequestStatus('c')).toBe('pending');
    await queue.queue(['c']); expect(fetchFn).toHaveBeenCalledTimes(2);
    await queue.setRequestSettled('c');
    expect(fetchFn.mock.calls).toEqual([['c'], ['a'], ['b']]);
    expect(queue.getRequestStatus('c')).toBe('unknown'); expect(queue.getRequestStatus('b')).toBe('pending');
    await queue.clearPendingRequest('b'); expect(queue.getRequestStatus('b')).toBe('unknown');
    queue.clear(); expect(queue.getRequestStatus('a')).toBe('unknown');
  });
  it('rejection releases concurrency and continues processing; custom IDs replace queued duplicates', async () => {
    const fetchFn = vi.fn(async (key: { id: number; value: string }) => { if (key.id === 1) throw Error('expected'); });
    const queue = new RequestQueue({ fetchFn, maxConcurrentRequests: 1, getKeyId: (key: { id: number; value: string }) => String(key.id) });
    await queue.queue([{ id: 1, value: 'a' }, { id: 2, value: 'old' }, { id: 2, value: 'new' }]);
    expect(fetchFn.mock.calls).toEqual([[{ id: 1, value: 'a' }], [{ id: 2, value: 'new' }]]);
    expect(queue.getRequestStatus({ id: 1, value: '' })).toBe('unknown');
    expect(queue.getRequestStatus({ id: 2, value: '' })).toBe('pending');
  });
  it('explicit settlement advances even before the original fetch promise resolves; clear forgets queued work', async () => {
    const resolvers: (() => void)[] = [];
    const queue = new RequestQueue({ fetchFn: (_key: string) => new Promise<void>((resolve) => resolvers.push(resolve)), maxConcurrentRequests: 1 });
    const started = queue.queue(['a', 'b', 'c']);
    const next = queue.clearPendingRequest('a');
    expect(queue.getRequestStatus('a')).toBe('unknown');
    expect(queue.getRequestStatus('b')).toBe('pending'); expect(queue.getRequestStatus('c')).toBe('queued');
    queue.clear(); resolvers.forEach((resolve) => resolve()); await Promise.all([started, next]);
    expect(queue.getRequestStatus('c')).toBe('unknown'); expect(resolvers).toHaveLength(2);
  });
});
