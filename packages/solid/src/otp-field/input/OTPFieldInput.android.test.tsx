import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent } from '../../../test';
import { OTPField } from '../index';
import { focus, input, settle, slots, values } from '../OTPField.test-utils';

vi.mock('../../utils/platform', async (original) => {
  const actual = await original<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, android: true } } };
});

describe('OTPField.Input Android', () => {
  const { render } = createRenderer();
  it('commits incrementally during always-composing input without a duplicate end commit', async () => {
    const change = vi.fn();
    await render(() => <OTPField.Root length={3} validationType="alphanumeric" onValueChange={change}>
      <OTPField.Input /><OTPField.Input /><OTPField.Input />
    </OTPField.Root>);
    await focus(slots()[0]);
    fireEvent.compositionStart(slots()[0]);
    await input(slots()[0], 'a');
    expect(change).toHaveBeenCalledExactlyOnceWith('a', expect.anything());
    expect(slots()[1]).toHaveFocus();
    fireEvent.compositionEnd(slots()[0]);
    await settle();
    expect(change).toHaveBeenCalledTimes(1);
    expect(values()).toBe('a');
    expect(slots().map((node) => node.value)).toEqual(['a', '', '']);
  });
});
