// Adapted from Base UI (MIT), upstream/base-ui at the pinned baseline.
export type RequestStatus = 'queued' | 'pending' | 'unknown';
export interface RequestQueueOptions<TKey> {
  fetchFn: (key: TKey) => Promise<void>;
  maxConcurrentRequests?: number | undefined;
  getKeyId?: ((key: TKey) => string) | undefined;
}
/** Successful fetches remain pending until explicitly settled by their consumer. */
export class RequestQueue<TKey> {
  protected pendingRequests = new Map<string, TKey>();
  protected queuedRequests = new Map<string, TKey>();
  protected fetchFn: (key: TKey) => Promise<void>;
  protected maxConcurrentRequests: number;
  protected getKeyId: (key: TKey) => string;
  constructor(options: RequestQueueOptions<TKey>) {
    this.fetchFn = options.fetchFn;
    this.maxConcurrentRequests = options.maxConcurrentRequests ?? Infinity;
    this.getKeyId = options.getKeyId ?? String;
  }
  protected pickEntries(count: number): [string, TKey][] {
    const result: [string, TKey][] = [];
    const iterator = this.queuedRequests.entries();
    for (let i = 0; i < count; i += 1) {
      const { value } = iterator.next() as IteratorYieldResult<[string, TKey]>;
      result.push(value);
    }
    return result;
  }
  protected processQueue = async () => {
    if (this.queuedRequests.size === 0 || this.pendingRequests.size >= this.maxConcurrentRequests) return;
    const count = Math.min(this.maxConcurrentRequests - this.pendingRequests.size, this.queuedRequests.size);
    const promises: Promise<void>[] = [];
    for (const [keyId, key] of this.pickEntries(count)) {
      this.queuedRequests.delete(keyId);
      this.pendingRequests.set(keyId, key);
      promises.push(this.fetchFn(key).catch(() => { this.pendingRequests.delete(keyId); }));
    }
    await Promise.all(promises);
    if (this.queuedRequests.size > 0) await this.processQueue();
  };
  queue = async (keys: TKey[]) => {
    for (const key of keys) {
      const keyId = this.getKeyId(key);
      if (!this.pendingRequests.has(keyId)) this.queuedRequests.set(keyId, key);
    }
    await this.processQueue();
  };
  setRequestSettled = async (key: TKey) => {
    this.pendingRequests.delete(this.getKeyId(key));
    await this.processQueue();
  };
  clear = () => { this.queuedRequests.clear(); this.pendingRequests.clear(); };
  clearPendingRequest = async (key: TKey) => {
    this.pendingRequests.delete(this.getKeyId(key));
    await this.processQueue();
  };
  getRequestStatus = (key: TKey): RequestStatus => {
    const id = this.getKeyId(key);
    return this.pendingRequests.has(id) ? 'pending' : this.queuedRequests.has(id) ? 'queued' : 'unknown';
  };
}
