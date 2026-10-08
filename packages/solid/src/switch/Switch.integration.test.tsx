import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, browserCase, waitFor } from '../../test';
import { Switch } from './index';
import * as Field from '../field/index.parts';
import { Form } from '../form/Form';

// Real public-wrapper replay of the pinned SwitchRoot Field/Form cases.
// These tests intentionally do not substitute a passing field/form mock.
const { render, renderProps } = createRenderer();
describe('Switch public Field/Form replay', () => {
  it.each(['implicit', 'sibling', 'non-native label'] as const)('associates Field.Label (%s)', async (kind) => {
    const view = await render(() => <Field.Root>
      {kind === 'sibling' ? <><Field.Label data-testid="label">Setting</Field.Label><Switch.Root /></> :
        <Field.Label data-testid="label" nativeLabel={kind !== 'non-native label'}
          render={kind === 'non-native label' ? (props) => {
            return <span {...props as JSX.HTMLAttributes<HTMLSpanElement>} />;
          } : undefined}><Switch.Root />Setting</Field.Label>}
    </Field.Root>);
    const label = view.getByTestId('label');
    const input = view.getByRole('checkbox', { hidden: true });
    const root = view.getByRole('switch');
    expect(root).toHaveAttribute('aria-labelledby', label.id);
    if (kind === 'non-native label') expect(label).not.toHaveAttribute('for');
    else expect(label).toHaveAttribute('for', input.id);
    await view.user.click(label);
    expect(root).toHaveAttribute('aria-checked', kind === 'non-native label' ? 'false' : 'true');
  });

  it('prefers aria-label to Field.Label and composes description IDs', async () => {
    const view = await render(() => <Field.Root>
      <Field.Label>Implicit</Field.Label>
      <Switch.Root aria-label="Explicit" aria-describedby="external" />
      <Field.Description data-testid="description">Description</Field.Description>
    </Field.Root>);
    const root = view.getByRole('switch');
    const description = view.getByTestId('description');
    expect(root).toHaveAccessibleName('Explicit');
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(root).toHaveAttribute('aria-describedby', `external ${description.id}`);
    expect(view.getByRole('checkbox', { hidden: true })).toHaveAttribute('aria-describedby', description.id);
  });

  it('retains field initialValue across control replacement and clears filled/focused on replacement', async () => {
    const view = await renderProps((props: { replace: boolean; mounted: boolean }) => <Field.Root data-testid="field">
      {props.mounted && (props.replace ? <Switch.Root checked={false} /> : <Switch.Root checked={true} />)}
    </Field.Root>, { replace: false, mounted: true });
    const field = view.getByTestId('field');
    expect(field).toHaveAttribute('data-filled');
    view.getByRole('switch').focus(); flush();
    expect(field).toHaveAttribute('data-focused');
    await view.setProps({ replace: true });
    expect(field).not.toHaveAttribute('data-filled');
    expect(field).not.toHaveAttribute('data-focused');
    view.getByRole('switch').focus(); flush();
    expect(field).toHaveAttribute('data-focused');
    await view.setProps({ mounted: false });
    expect(field).not.toHaveAttribute('data-focused');
  });

  it('clears external errors only after an accepted change', async () => {
    let cancel = true;
    const view = await render(() => <Form errors={{ setting: 'external' }}>
      <Field.Root name="setting"><Switch.Root onCheckedChange={(_, details) => { if (cancel) details.cancel(); }} />
        <Field.Error data-testid="error" /></Field.Root>
    </Form>);
    const root = view.getByRole('switch');
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toHaveTextContent('external');
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-invalid', 'true');
    cancel = false;
    await view.user.click(root);
    await waitFor(() => expect(root).not.toHaveAttribute('aria-invalid'));
    expect(view.queryByTestId('error')).toBe(null);
  });

  it('native submit publishes required errors then revalidates checked transitions', async () => {
    const view = await render(() => <Form><Field.Root name="setting">
      <Switch.Root required /><Field.Error match="valueMissing" data-testid="error">required</Field.Error>
    </Field.Root><button type="submit">Submit</button></Form>);
    const root = view.getByRole('switch');
    expect(root).not.toHaveAttribute('aria-invalid');
    await view.user.click(view.getByText('Submit'));
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toHaveTextContent('required');
    await view.user.click(root);
    expect(root).not.toHaveAttribute('aria-invalid');
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates committed controlled values once and leaves refused or canceled proposals alone', async () => {
    const validate = vi.fn((value: unknown) => value ? 'checked error' : null);
    let cancel = false;
    const changed = vi.fn((_: boolean, details: import('./root/SwitchRoot').SwitchRootChangeEventDetails) => {
      if (cancel) details.cancel();
    });
    const view = await renderProps<{ checked: boolean }>((props) => <Form><Field.Root name="setting" validationMode="onChange" validate={validate}>
      <Switch.Root checked={props.checked} onCheckedChange={changed}><Switch.Thumb data-testid="thumb" /></Switch.Root>
      <Field.Error data-testid="error" />
    </Field.Root></Form>, { checked: false });
    const root = view.getByRole('switch');
    await view.user.click(root);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(validate).not.toHaveBeenCalled();
    expect(root).not.toHaveAttribute('data-dirty');
    cancel = true;
    await view.user.click(root);
    expect(validate).not.toHaveBeenCalled();
    await view.setProps({ checked: true });
    expect(validate).toHaveBeenCalledExactlyOnceWith(true, { setting: true });
    expect(view.getByRole('switch')).toBe(root);
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('thumb')).toHaveAttribute('data-invalid');
    expect(root).toHaveAttribute('data-dirty');
    expect(root).toHaveAttribute('data-filled');
    expect(view.getByTestId('error')).toHaveTextContent('checked error');
    await view.setProps({ checked: false });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(root).not.toHaveAttribute('aria-invalid');
    expect(root).not.toHaveAttribute('data-dirty');
    expect(root).not.toHaveAttribute('data-filled');
  });

  it('projects boolean form values and removes disabled field controls from contextual submission', async () => {
    const submit = vi.fn();
    const view = await renderProps<{ disabled: boolean }>((props) => <Form onFormSubmit={submit}>
      <Field.Root name="setting" disabled={props.disabled}>
        <Switch.Root value="yes" uncheckedValue="no" />
      </Field.Root><button type="submit">Submit</button>
    </Form>, { disabled: false });
    await view.user.click(view.getByText('Submit'));
    expect(submit.mock.lastCall?.[0]).toEqual({ setting: false });
    await view.user.click(view.getByRole('switch'));
    await view.user.click(view.getByText('Submit'));
    expect(submit.mock.lastCall?.[0]).toEqual({ setting: true });
    await view.setProps({ disabled: true });
    await view.user.click(view.getByText('Submit'));
    expect(submit.mock.lastCall?.[0]).toEqual({});
    await view.setProps({ disabled: false });
    await view.user.click(view.getByText('Submit'));
    expect(submit.mock.lastCall?.[0]).toEqual({ setting: true });
  });

  browserCase({ source: 'packages/react/src/switch/root/SwitchRoot.test.tsx',
    case: 'preserves Field validation props through canceled changes, submit, and reset',
    environment: 'browser', issue: 'bsolid-browser' }, async () => {
    let cancel = true;
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const view = await render(() => <Form onSubmit={submit}><Field.Root name="setting">
      <Switch.Root required aria-describedby="external" onCheckedChange={(_, details) => { if (cancel) details.cancel(); }} />
      <Field.Description data-testid="description">Description</Field.Description>
      <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
    </Field.Root><button type="submit">Submit</button><button type="reset">Reset</button></Form>);
    const root = view.getByRole('switch');
    const description = view.getByTestId('description');
    expect(root).toHaveAttribute('aria-describedby', `external ${description.id}`);
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-checked', 'false');
    await view.user.click(view.getByText('Submit'));
    expect(submit).not.toHaveBeenCalled();
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toHaveTextContent('required');
    cancel = false;
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-checked', 'true');
    expect(root).not.toHaveAttribute('aria-invalid');
    await view.user.click(view.getByText('Submit'));
    expect(submit).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByText('Reset'));
    expect(root).toHaveAttribute('aria-checked', 'true');
    expect(root).not.toHaveAttribute('aria-invalid');
    expect(root).toHaveAttribute('aria-describedby', `external ${description.id}`);
  });
});
