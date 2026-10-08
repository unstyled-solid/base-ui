import type { ReadableModel } from '../internals/contracts/state';
/** Stable detached read-through model. No subscriptions or React store machinery. */
export class NullStore<S extends object, C = Record<string, never>> implements ReadableModel<S> {
  constructor(readonly state: Readonly<S>, readonly context: C) {}
  select<T>(selector: (state: Readonly<S>) => T): T { return selector(this.state); }
  setState(_next: S): void {}
  update<K extends keyof S>(_next: Pick<S, K>): void {}
  set<K extends keyof S>(_key: K, _next: S[K]): void {}
}
