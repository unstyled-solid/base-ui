import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance, expectDiagnostic } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Toggle } from './Toggle';
import { ToggleGroup } from '../toggle-group/ToggleGroup';
import { reset } from '../utils/error';

// Source: packages/react/src/toggle/Toggle.test.tsx @19511bb171f3b360b006c94cf6d07e53cb446505.
// React rerenders become live renderProps updates; callbacks receive native events.
describe('<Toggle />', () => {
  const { render, renderProps } = createRenderer();

  // The harness accepts only object styles and callback refs; the public API also
  // supports native string styles and the complete RC13 ref union.
  for (const testRenderPropWith of ['div', 'button'] as const) {
    describe(`conformance custom host ${testRenderPropWith}`, () => {
      describeConformance<Toggle.State, Toggle.Props & ConformantComponentProps<Toggle.State>>((props) => <Toggle {...props} />, {
        initialProps: { pressed: false },
        refInstanceof: HTMLButtonElement,
        testRenderPropWith,
        button: true,
        state: {
          change: { pressed: true },
          assert: (state, changed) => expect(untrack(() => state.pressed)).toBe(changed),
          class: (state) => state.pressed ? 'pressed' : 'unpressed',
          before: 'unpressed', after: 'pressed',
        },
      });
    });
  }

  it('pressed state: controlled, including refused requests and live props', async () => {
    const onPressedChange = vi.fn();
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, {
      pressed: false, onPressedChange,
    });
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(button);
    await view.user.click(button);
    expect(onPressedChange.mock.calls.map(([next]) => next)).toEqual([true, true]);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.setProps({ pressed: true });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-pressed');
    await view.setProps({ pressed: false });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-pressed');
  });

  it.each([undefined, false, true])('pressed state: uncontrolled default %s is captured once', async (defaultPressed) => {
    // Source useControlled.test.tsx: changed defaults warn once via error's
    // shared log-once cache. Each parameter case needs an independent cache.
    reset();
    try {
      const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, { defaultPressed });
      const button = view.getByRole('button');
      const initial = defaultPressed ?? false;
      const message = /^Base UI: A component is changing the default pressed state of an uncontrolled Toggle after being initialized\. To suppress this warning opt to use a controlled Toggle\.$/;
      expect(button).toHaveAttribute('aria-pressed', String(initial));
      await expectDiagnostic({ message }, () => view.setProps({ defaultPressed: !initial }));
      expect(button).toHaveAttribute('aria-pressed', String(initial));
      await view.setProps({ defaultPressed: initial });
      await expectDiagnostic({ message, count: 0 }, () => view.setProps({ defaultPressed: !initial }));
      expect(view.getByRole('button')).toBe(button);
      expect(button).toHaveAttribute('aria-pressed', String(initial));
      await view.user.click(button);
      expect(button).toHaveAttribute('aria-pressed', String(!initial));
      await view.user.click(button);
      expect(button).toHaveAttribute('aria-pressed', String(initial));
    } finally {
      reset();
    }
  });

  it('onPressedChange is current and receives the original native event and none reason', async () => {
    const old = vi.fn();
    const current = vi.fn();
    let event: MouseEvent | undefined;
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, {
      onPressedChange: old,
      onClick: (nextEvent) => { event = nextEvent; },
    });
    const button = view.getByRole('button');
    await view.setProps({ onPressedChange: current });
    await view.user.click(button);
    expect(old).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({
      reason: 'none', event, isCanceled: false,
    }));
    expect(event).toBeInstanceOf(MouseEvent);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('onPressedChange: cancellation prevents local commit', async () => {
    const view = await render(() => <Toggle onPressedChange={(_, details) => details.cancel()} />);
    const button = view.getByRole('button');
    await view.user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('preventDefault does not cancel Base UI; preventBaseUIHandler does', async () => {
    const change = vi.fn();
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, {
      onPressedChange: change, onClick: (event) => event.preventDefault(),
    });
    const button = view.getByRole('button');
    await view.user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await view.setProps({ onClick: (event) => event.preventBaseUIHandler() });
    await view.user.click(button);
    expect(change).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('disabled: native disabled and data state update on the same host', async () => {
    const change = vi.fn();
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, {
      disabled: true, onPressedChange: change,
    });
    const button = view.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(button);
    expect(change).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.setProps({ disabled: false });
    expect(view.getByRole('button')).toBe(button);
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('data-disabled');
    await view.user.click(button);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it.each(['Enter', 'Space'])('native keyboard activation: %s toggles exactly once', async (key) => {
    const change = vi.fn();
    const view = await render(() => <Toggle onPressedChange={change} />);
    const button = view.getByRole('button');
    await view.user.tab();
    expect(button).toHaveFocus();
    await view.user.keyboard(`[${key}]`);
    expect(change).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await view.user.keyboard(`[${key}]`);
    expect(change).toHaveBeenCalledTimes(2);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it.each(['Enter', 'Space'])('non-native render delegates %s activation to shared button', async (key) => {
    const change = vi.fn();
    const ancestor = vi.fn();
    const view = await render(() => <div onClick={ancestor}>
      <Toggle nativeButton={false} render={(props) => <span {...props} />} onPressedChange={change} />
    </div>);
    const button = view.getByRole('button');
    await view.user.tab();
    await view.user.keyboard(`[${key}]`);
    expect(change).toHaveBeenCalledTimes(1);
    expect(ancestor).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it.each(['Enter', 'Space'])('native %s default prevention cancels keyboard activation', async (key) => {
    const change = vi.fn();
    const view = await render(() => <Toggle onPressedChange={change} onKeyDown={(event) => event.preventDefault()} />);
    const button = view.getByRole('button');
    await view.user.tab();
    await view.user.keyboard(`[${key}]`);
    expect(change).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('controlled default changes do not diagnose or override the external pressed state', async () => {
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, { pressed: false, defaultPressed: false });
    const button = view.getByRole('button');
    await view.setProps({ defaultPressed: true });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('default undefined is false and does not count as a changed default', async () => {
    const view = await renderProps((props: Toggle.Props) => <Toggle {...props} />, { defaultPressed: false });
    const button = view.getByRole('button');
    await view.setProps({ defaultPressed: undefined });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('ignores form/type/value participation and never submits or resets a form', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const resetForm = vi.fn();
    const view = await renderProps((props: Toggle.Props) => <>
      <form id="other-form" onSubmit={submit} />
      <form data-testid="form" onSubmit={submit} onReset={resetForm}>
        <Toggle {...props} name="toggle" />
      </form>
    </>, { type: 'submit', form: 'other-form', value: 'one' });
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('form');
    expect(button).not.toHaveAttribute('value');
    await view.user.click(button);
    await view.user.keyboard('[Enter][Space]');
    await view.setProps({ type: 'reset' });
    await view.user.click(button);
    expect(submit).not.toHaveBeenCalled();
    expect(resetForm).not.toHaveBeenCalled();
    expect([...new FormData(view.getByTestId('form') as HTMLFormElement)]).toEqual([]);
  });

  // Source: ToggleGroup.test.tsx: omitted/empty values, initialization diagnostic.
  it.each([false, true])('generated values remain unique and stable (multiple=%s)', async (multiple) => {
    const change = vi.fn();
    const view = await render(() => <ToggleGroup multiple={multiple} onValueChange={change}>
      <Toggle />
      <Toggle value="" />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one);
    const firstValue = change.mock.calls[0][0][0];
    expect(firstValue).toEqual(expect.any(String));
    expect(firstValue).not.toBe('');
    await view.user.click(two);
    const secondValues = change.mock.calls[1][0];
    expect(secondValues).toHaveLength(multiple ? 2 : 1);
    expect(secondValues.at(-1)).not.toBe(firstValue);
    expect(one).toHaveAttribute('aria-pressed', String(multiple));
    expect(two).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(two);
    expect(two).toHaveAttribute('aria-pressed', 'false');
    expect(change.mock.calls[2][0]).toEqual(multiple ? [firstValue] : []);
  });

  it('warns once when initialized groups contain Toggles without explicit values', async () => {
    reset();
    await expectDiagnostic({
      message: /^Base UI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop\. This will cause issues between the Toggle Group and Toggle values\. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type\.$/,
    }, () => render(() => <ToggleGroup defaultValue={['one']}><Toggle /><Toggle /></ToggleGroup>));
    reset();
  });

  it('an explicit empty value uses fallback without the omitted-value warning', async () => {
    const view = await render(() => <ToggleGroup defaultValue={['']}><Toggle value="" /></ToggleGroup>);
    expect(view.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('render: passes composite props and live state without replacing the host', async () => {
    const view = await renderProps((props: { pressed: boolean }) => <ToggleGroup value={props.pressed ? ['one'] : []}>
      <Toggle value="one" render={(host, state) => {
        // This fixture deliberately chooses the native button target, narrowing
        // the renderer's otherwise element-agnostic ref to its actual host.
        return <button {...host as JSX.ButtonHTMLAttributes<HTMLButtonElement>} data-live={String(state.pressed)} />;
      }} />
    </ToggleGroup>, { pressed: false });
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('data-live', 'false');
    await view.setProps({ pressed: true });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveAttribute('data-live', 'true');
  });
  it('render: selected item receives composite tabindex zero', async () => {
    // Solid render setup runs once before composite registration settles. The
    // spread consumes live props; observe their committed native host outcome.
    const view = await render(() => <ToggleGroup defaultValue={['left']}><Toggle value="left"
      render={(props) => <button {...props as JSX.ButtonHTMLAttributes<HTMLButtonElement>} />} /></ToggleGroup>);
    expect(view.getByRole('button')).toHaveAttribute('tabindex', '0');
    expect(view.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
