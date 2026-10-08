import { createSignal } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, expectDiagnostic, fireEvent, screen } from '../../../test';
import { OTPField } from '../index';
import { Fixture, focus, hidden, input, paste, settle, slots, values } from '../OTPField.test-utils';
import { reset } from '../../utils/warn';

// Root/source tests: values, normalization, transactions, native forms and labels.
// React rerender/act become renderProps and deliberate test-only flush observation.
describe('OTPField.Root', () => {
  const { render, renderProps } = createRenderer();
  beforeEach(() => reset());

  it('normalizes/clamps the default before slots mount and supports grouped render ordering', async () => {
    await render(() => <OTPField.Root length={6} defaultValue="12a34b56c7" name="otp" id="code">
      <div data-testid="first-group"><OTPField.Input /><OTPField.Input /><OTPField.Input /></div>
      <OTPField.Separator>-</OTPField.Separator>
      <div data-testid="second-group"><OTPField.Input /><OTPField.Input /><OTPField.Input /></div>
    </OTPField.Root>);
    expect(values()).toBe('123456');
    expect(slots().map((node) => node.value)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(screen.getByRole('group')).toContainElement(screen.getByTestId('first-group'));
    expect(screen.getByRole('group')).toContainElement(screen.getByTestId('second-group'));
    expect(hidden()).toHaveValue('123456');
    expect(slots().map((node) => node.id)).toEqual(['code', 'code-2', 'code-3', 'code-4', 'code-5', 'code-6']);
    expect(slots()[0]).toHaveAttribute('maxlength', '6');
    slots().slice(1).forEach((node) => expect(node).not.toHaveAttribute('maxlength'));
    expect(screen.getByText('-')).toBeVisible();
    expect(screen.getByRole('group')).toHaveAttribute('data-complete');
  });

  it('keeps host identity and live controlled state/class/render callbacks', async () => {
    const view = await renderProps((props: { value: string }) => <Fixture value={props.value}
      class={(state) => ['otp', { complete: state.complete }]}
      render={(host, state) => <div {...host} data-value={state.value} />}
    />, { value: '12' });
    const group = screen.getByRole('group');
    const first = slots()[0];
    await view.setProps({ value: '654321' });
    expect(values()).toBe('654321');
    expect(slots()[0]).toBe(first);
    expect(screen.getByRole('group')).toBe(group);
    expect(group).toHaveClass('complete');
    expect(group).toHaveAttribute('data-value', '654321');
    expect(group).not.toHaveAttribute('length');
  });

  it('reindexes retained grouped slots after DOM order changes', async () => {
    await render(() => <OTPField.Root length={3} id="ordered" defaultValue="123">
      <div data-testid="first"><OTPField.Input /><OTPField.Input /></div>
      <div data-testid="last"><OTPField.Input /></div>
    </OTPField.Root>);
    const original = slots();
    screen.getByTestId('first').prepend(original[2]);
    await settle();
    expect(slots()).toEqual([original[2], original[0], original[1]]);
    expect(slots().map((node) => node.value)).toEqual(['1', '2', '3']);
    expect(slots().map((node) => node.id)).toEqual(['ordered', 'ordered-2', 'ordered-3']);
    await input(original[0], '9');
    expect(values()).toBe('193');
    expect(original[1]).toHaveFocus();
  });

  it('normalizes live controlled values and length without synthesizing completion', async () => {
    const complete = vi.fn();
    const view = await renderProps((props: { value: string; length: number }) => <OTPField.Root
      {...props} name="otp" validationType="alphanumeric" normalizeValue={(v) => v.toUpperCase()} onValueComplete={complete}>
      <OTPField.Input /><OTPField.Input />{props.length === 3 && <OTPField.Input />}
    </OTPField.Root>, { value: 'a!1b234', length: 3 });
    expect(values()).toBe('A1B');
    expect(hidden()).toHaveValue('A1B');
    await view.setProps({ value: 'z9y8', length: 2 });
    expect(values()).toBe('Z9');
    expect(hidden()).toHaveValue('Z9');
    expect(hidden()).toHaveAttribute('pattern', '[a-zA-Z0-9]{2}');
    expect(complete).not.toHaveBeenCalled();
  });

  it.each([
    ['alpha', '1a2b3Cd4', 'abCd', '[a-zA-Z]{1}', '[a-zA-Z]{6}'],
    ['alphanumeric', 'A1-B2c3', 'A1B2c3', '[a-zA-Z0-9]{1}', '[a-zA-Z0-9]{6}'],
    ['numeric', 'a1b234567', '123456', '\\d{1}', '\\d{6}'],
    ['none', 'a! 12', 'a!12', null, null],
  ] as const)('applies %s validation to logical value and native constraints', async (validationType, raw, expected, slotPattern, rootPattern) => {
    await render(() => <Fixture validationType={validationType} name="otp" />);
    await input(slots()[0], raw);
    expect(values()).toBe(expected);
    expect(slots()[0].getAttribute('pattern')).toBe(slotPattern);
    expect(hidden().getAttribute('pattern')).toBe(rootPattern);
  });

  it.each(['numeric', 'none'] as const)('supports custom inputMode in %s validation', async (validationType) => {
    await render(() => <Fixture validationType={validationType} inputMode="tel" />);
    expect(slots()[0]).toHaveAttribute('inputmode', 'tel');
    expect(hidden()).toHaveAttribute('inputmode', 'tel');
  });

  it.each(['input', 'paste', 'autofill'] as const)('reports rejected %s before change/complete and custom-normalizes', async (kind) => {
    const calls: string[] = [];
    await render(() => <Fixture name="otp" validationType="alphanumeric" normalizeValue={(v) => v.toUpperCase()}
      onValueInvalid={(v, details) => calls.push(`invalid:${v}:${details.reason}`)}
      onValueChange={(v, details) => calls.push(`change:${v}:${details.reason}`)}
      onValueComplete={(v, details) => calls.push(`complete:${v}:${details.reason}`)}
    />);
    if (kind === 'paste') await paste(slots()[0], 'ab-12 cd!');
    else await input(kind === 'autofill' ? hidden() : slots()[0], 'ab-12 cd!');
    const reason = kind === 'paste' ? 'input-paste' : 'input-change';
    expect(calls).toEqual([`invalid:ab-12 cd!:${reason}`, `change:AB12CD:${reason}`, `complete:AB12CD:${reason}`]);
    expect(values()).toBe('AB12CD');
    expect(slots()[5]).toHaveFocus();
  });

  it.each(['numeric', 'none'] as const)('reports characters removed by custom normalization in %s', async (validationType) => {
    const invalid = vi.fn();
    await render(() => <Fixture validationType={validationType} normalizeValue={(v) => v.replace(/[^0-3]/g, '')} onValueInvalid={invalid} />);
    await input(slots()[0], '1209');
    expect(values()).toBe('120');
    expect(invalid).toHaveBeenCalledTimes(1);
    expect(invalid).toHaveBeenCalledWith('1209', expect.objectContaining({ reason: 'input-change' }));
  });

  it('clears hidden autofill without moving focus and ignores default completion', async () => {
    const complete = vi.fn();
    await render(() => <Fixture defaultValue="123456" onValueComplete={complete} />);
    expect(complete).not.toHaveBeenCalled();
    await focus(slots()[5]);
    await input(hidden(), '');
    expect(values()).toBe('');
    expect(slots()[5]).toHaveFocus();
  });

  it('accepts change-only password manager autofill and does not complete twice for its trailing change', async () => {
    const change = vi.fn();
    const complete = vi.fn();
    await render(() => <Fixture name="otp" onValueChange={change} onValueComplete={complete} />);
    fireEvent.change(hidden(), { target: { value: '12a34b56' } });
    await settle();
    expect(values()).toBe('123456');
    expect(hidden()).toHaveValue('123456');
    expect(slots()[5]).toHaveFocus();
    expect(change).toHaveBeenCalledExactlyOnceWith('123456', expect.objectContaining({ reason: 'input-change' }));
    expect(complete).toHaveBeenCalledTimes(1);
    fireEvent.change(hidden(), { target: { value: '123456' } });
    await settle();
    expect(change).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('retains source completion semantics for replacement typing and identical complete paste', async () => {
    const complete = vi.fn();
    const change = vi.fn();
    await render(() => <Fixture onValueComplete={complete} onValueChange={change} />);
    await input(slots()[0], '12345');
    expect(complete).not.toHaveBeenCalled();
    await input(slots()[5], '6');
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenLastCalledWith('123456', expect.objectContaining({ reason: 'input-change' }));
    await input(slots()[0], '9');
    expect(complete).toHaveBeenCalledTimes(1);
    await paste(slots()[0], '654321');
    const changeCount = change.mock.calls.length;
    await paste(slots()[0], '654321');
    expect(change).toHaveBeenCalledTimes(changeCount);
    expect(complete).toHaveBeenCalledTimes(3);
    expect(complete.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([
      ['123456', 'input-change'], ['654321', 'input-paste'], ['654321', 'input-paste'],
    ]);
    expect(complete).toHaveBeenLastCalledWith('654321', expect.objectContaining({ reason: 'input-paste' }));
  });

  it('waits for async controlled acceptance and invokes current callbacks once', async () => {
    let accept!: (value: string) => void;
    let proposed = '';
    const before = vi.fn();
    const after = vi.fn();
    const view = await renderProps((props: { complete: typeof before }) => {
      const [value, setValue] = createSignal('');
      accept = setValue;
      return <Fixture value={value()} onValueChange={(next) => { proposed = next; }} onValueComplete={props.complete} />;
    }, { complete: before });
    await focus(slots()[0]);
    await input(slots()[0], '123456');
    expect(values()).toBe('');
    expect(slots()[0]).toHaveFocus();
    expect(before).not.toHaveBeenCalled();
    await view.setProps({ complete: after });
    accept(proposed);
    await settle();
    expect(values()).toBe('123456');
    expect(slots()[5]).toHaveFocus();
    expect(after).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledWith('123456', expect.objectContaining({ reason: 'input-change' }));
    expect(before).not.toHaveBeenCalled();
    accept('654321');
    await settle();
    expect(after).toHaveBeenCalledTimes(1);
  });

  it.each(['unrelated', 'canceled', 'rejected'] as const)('invalidates stale controlled completion after %s update', async (kind) => {
    let accept!: (value: string) => void;
    const complete = vi.fn();
    await render(() => {
      const [value, setValue] = createSignal('');
      accept = setValue;
      return <Fixture value={value()} onValueComplete={complete} onValueChange={(v, details) => { if (v === '9') details.cancel(); }} />;
    });
    await focus(slots()[0]);
    await input(slots()[0], '123456');
    if (kind === 'unrelated') { accept('9'); await settle(); }
    else await input(slots()[0], kind === 'canceled' ? '9' : 'x');
    accept('123456');
    await settle();
    expect(complete).not.toHaveBeenCalled();
    expect(slots()[0]).toHaveFocus();
  });

  it('does not complete for unrelated controlled complete-to-complete changes', async () => {
    const complete = vi.fn();
    const view = await renderProps((props: { value: string }) => <Fixture value={props.value} onValueComplete={complete} />, { value: '123456' });
    await view.setProps({ value: '654321' });
    expect(complete).not.toHaveBeenCalled();
  });

  it.each(['disabled', 'readOnly'] as const)('blocks %s autofill and resets native mutation', async (lock) => {
    const change = vi.fn(); const invalid = vi.fn(); const complete = vi.fn();
    await render(() => <Fixture {...{ [lock]: true }} onValueChange={change} onValueInvalid={invalid} onValueComplete={complete} />);
    await input(hidden(), '12a3456');
    expect(values()).toBe('');
    expect(hidden()).toHaveValue('');
    expect(change).not.toHaveBeenCalled();
    expect(invalid).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it('forwards group descriptions, but explicit group labeling does not leak onto slots', async () => {
    await render(() => <><span id="label">Code</span><Fixture aria-labelledby="label" aria-describedby="description" /></>);
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('aria-describedby', 'description');
    slots().forEach((node) => expect(node).not.toHaveAttribute('aria-labelledby', 'label'));
  });

  it('applies native shared labels and preserves first-slot label precedence', async () => {
    await render(() => <><label for="code">Code</label><OTPField.Root length={2} id="code">
      <OTPField.Input aria-label="Character 1" /><OTPField.Input aria-label="Character 2" />
    </OTPField.Root></>);
    expect(slots()[0]).toHaveAccessibleName('Code');
    expect(slots()[0]).not.toHaveAttribute('aria-label');
    expect(slots()[1]).toHaveAccessibleName('Character 2');
  });

  it('applies the native shared label to every slot and honors later explicit labelledby', async () => {
    await render(() => <><label for="shared">Verification code</label><span id="second-label">Second character</span>
      <OTPField.Root length={3} id="shared">
        <OTPField.Input /><OTPField.Input aria-labelledby="second-label" /><OTPField.Input />
      </OTPField.Root></>);
    expect(slots()[0]).toHaveAccessibleName('Verification code');
    expect(slots()[1]).toHaveAccessibleName('Second character');
    expect(slots()[2]).toHaveAccessibleName('Verification code');
  });

  it('applies autocomplete only to first slot and hidden input, and supports overrides', async () => {
    const view = await renderProps((props: { autoComplete?: string }) => <Fixture {...props} />, {});
    expect(slots()[0]).toHaveAttribute('autocomplete', 'one-time-code');
    expect(slots()[1]).toHaveAttribute('autocomplete', 'off');
    await view.setProps({ autoComplete: 'off' });
    expect(slots()[0]).toHaveAttribute('autocomplete', 'off');
    expect(hidden()).toHaveAttribute('autocomplete', 'off');
  });

  it('masks slots with native password inputs and permits per-slot type overrides', async () => {
    const { container } = await render(() => <OTPField.Root length={2} mask defaultValue="12"><OTPField.Input /><OTPField.Input type="tel" /></OTPField.Root>);
    expect(container.querySelector('input[type="password"]')).toHaveValue('1');
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    expect(hidden()).toHaveAttribute('type', 'text');
  });

  it.each([['123', false], ['123456', true]] as const)('uses native validity for %s', async (defaultValue, valid) => {
    await render(() => <form data-testid="form"><Fixture name="otp" defaultValue={defaultValue} required /></form>);
    expect(screen.getByTestId<HTMLFormElement>('form').checkValidity()).toBe(valid);
  });

  it('gives unnamed hidden input a derived ID and redirects focus', async () => {
    await render(() => <Fixture id="code" />);
    expect(hidden()).toHaveAttribute('id', 'code-hidden-input');
    await focus(hidden());
    expect(slots()[0]).toHaveFocus();
  });

  it.each([false, true])('autoSubmit=%s synchronizes form data before submit and calls completion first', async (autoSubmit) => {
    const order: string[] = [];
    await render(() => <form onSubmit={(event) => {
      event.preventDefault();
      order.push(`submit:${new FormData(event.currentTarget).get('otp')}`);
    }}><Fixture name="otp" required autoSubmit={autoSubmit} onValueComplete={(v) => order.push(`complete:${v}`)} /></form>);
    await input(slots()[0], '12345');
    expect(order).toEqual([]);
    await input(slots()[5], '6');
    expect(order).toEqual(autoSubmit ? ['complete:123456', 'submit:123456'] : ['complete:123456']);
  });

  it('submits an external form rather than the ancestor', async () => {
    const external = vi.fn((event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
      event.preventDefault();
      expect(new FormData(event.currentTarget).get('otp')).toBe('123456');
    });
    const ancestor = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(() => <><form id="external" onSubmit={external} /><form onSubmit={ancestor}><Fixture form="external" name="otp" autoSubmit /></form></>);
    await paste(slots()[0], '123456');
    expect(external).toHaveBeenCalledTimes(1);
    expect(ancestor).not.toHaveBeenCalled();
  });

  it('waits for controlled acceptance before exposing completed form data or submitting', async () => {
    let accept!: (value: string) => void;
    const complete = vi.fn();
    const submitted: string[] = [];
    await render(() => {
      const [value, setValue] = createSignal('');
      accept = setValue;
      return <form onSubmit={(event) => {
        event.preventDefault();
        submitted.push(String(new FormData(event.currentTarget).get('otp')));
      }}><Fixture name="otp" required value={value()} autoSubmit onValueComplete={complete} /></form>;
    });
    await focus(slots()[0]);
    await paste(slots()[0], '123456');
    expect(hidden()).toHaveValue('');
    expect(submitted).toEqual([]);
    expect(complete).not.toHaveBeenCalled();
    accept('123456');
    await settle();
    expect(hidden()).toHaveValue('123456');
    expect(submitted).toEqual(['123456']);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(slots()[5]).toHaveFocus();
  });

  it('canceled completion leaves native forms incomplete and does not submit', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const complete = vi.fn();
    await render(() => <form onSubmit={submit}><Fixture name="otp" required autoSubmit
      onValueChange={(_, details) => details.cancel()} onValueComplete={complete} /></form>);
    await focus(slots()[0]);
    await input(hidden(), '123456');
    expect(hidden()).toHaveValue('');
    expect(values()).toBe('');
    expect(slots()[0]).toHaveFocus();
    expect(complete).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it.each(['missing', 'non-form', 'no-method'] as const)('keeps accepted completion when owning form is %s', async (kind) => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const complete = vi.fn();
    await render(() => <><div id="not-form" /><form data-testid="form" onSubmit={submit}>
      <Fixture form={kind === 'no-method' ? undefined : kind === 'missing' ? 'absent' : 'not-form'} autoSubmit onValueComplete={complete} />
    </form></>);
    if (kind === 'no-method') Object.defineProperty(screen.getByTestId('form'), 'requestSubmit', { configurable: true, value: undefined });
    await input(slots()[0], '123456');
    expect(values()).toBe('123456');
    expect(complete).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  it.each([0, -1, 3.7, NaN, Infinity])('warns and omits hidden native constraints for invalid length %s', async (length) => {
    await expectDiagnostic({ message: /length.*must be a positive integer/ }, () => render(() => <OTPField.Root length={length} />));
    expect(document.querySelector('input[aria-hidden]')).toBeNull();
  });

  it.each([1, 2])('warns for mismatched slot count %s', async (count) => {
    await expectDiagnostic({ message: new RegExp(`rendered ${count} input${count === 1 ? '' : 's'}`) }, () => render(() => <OTPField.Root length={3}>
      <OTPField.Input />{count === 2 && <OTPField.Input />}
    </OTPField.Root>));
  });
});
