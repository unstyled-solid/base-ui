import { describe, expect, it } from 'vitest';
import { createAcceptedValueActions } from './acceptedValue';

describe('OTPField accepted controlled value actions', () => {
  it('waits for explicit accepted value, consuming focus and completion once', () => {
    const actions = createAcceptedValueActions<{ reason: string }>();
    const token = actions.begin();
    const complete = { reason: 'input-paste' };
    actions.queue(token, '123', complete);
    actions.focus(token, '123', 2);
    expect(actions.consume('123')).toEqual({ token, value: '123', focus: 2, complete });
    expect(actions.consume('123')).toBeNull();
  });
  it('invalidates after an unrelated controlled change even if the attempted value arrives later', () => {
    const actions = createAcceptedValueActions<string>();
    const token = actions.begin();
    actions.queue(token, '123', 'complete');
    expect(actions.consume('9')).toBeNull();
    expect(actions.consume('123')).toBeNull();
  });
  it('invalidates a prior completion when a newer attempt is canceled or fully rejected', () => {
    const actions = createAcceptedValueActions<string>();
    const first = actions.begin();
    actions.queue(first, '123', 'complete');
    actions.begin(); // No accepted result for the newer attempt.
    actions.focus(first, '123', 2);
    expect(actions.consume('123')).toBeNull();
  });
  it('prevents callback reentrancy or stale asynchronous code from installing an old token', () => {
    const actions = createAcceptedValueActions<string>();
    const old = actions.begin();
    const current = actions.begin();
    actions.queue(current, '456', 'new');
    actions.queue(old, '123', 'old');
    expect(actions.consume('456')).toEqual({ token: current, value: '456', complete: 'new' });
    expect(actions.isCurrent(old)).toBe(false);
  });
  it('invalidates already-consumed deferred DOM actions before submission', () => {
    const actions = createAcceptedValueActions<string>();
    const token = actions.begin();
    actions.queue(token, '123', 'complete');
    const queued = actions.consume('123')!;
    actions.begin();
    expect(actions.isCurrent(queued.token)).toBe(false);
  });
  it('invalidates deferred completion if another external value is observed first', () => {
    const actions = createAcceptedValueActions<string>();
    const token = actions.begin();
    actions.queue(token, '123', 'complete');
    const queued = actions.consume('123')!;
    expect(actions.consume('456')).toBeNull();
    expect(actions.isCurrent(queued.token)).toBe(false);
  });
});
