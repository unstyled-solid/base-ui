import { For, Show } from 'solid-js';
import { expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, flushMicrotasks } from '../../../test';
import { Field } from '../index';
import { Input } from '../../input';
import { Form } from '../../form/Form';

it('replaces server-refetched field rows without halting surviving inputs', async () => {
  const rows = [{ id: 'a' }, { id: 'b' }];
  const view = await createRenderer().renderProps((p: { rows: { id: string }[] }) => <>
    <For each={p.rows}>{row => <Field.Root name={row.id}>
      <Field.Label>{row.id}</Field.Label><Field.Control defaultValue="initial" />
    </Field.Root>}</For>
    <Field.Root><Field.Label>survivor</Field.Label><Field.Control /></Field.Root>
  </>, { rows });
  const previous = view.getByRole('textbox', { name: 'a' });
  await view.setProps({ rows: [{ id: 'a' }, { id: 'b' }] });
  expect(previous.isConnected).toBe(false);
  const survivor = view.getByRole('textbox', { name: 'survivor' });
  await view.user.type(survivor, 'works');
  expect(survivor).toHaveValue('works');
  expect(survivor.closest('[data-filled]')).not.toBeNull();
});

for (const kind of ['Field.Control', 'Input'] as const) {
  it.each(['replace', 'remove', 'filter', 'hide'] as const)(
    `${kind} releases retired rows while surviving fields still validate and submit: %s`,
    async (operation) => {
      const Control = kind === 'Field.Control' ? Field.Control : Input;
      const rows = [{ id: 'a' }, { id: 'b' }];
      const submitted = vi.fn();
      const validateSurvivor = vi.fn(() => null);
      const validateRows = vi.fn(() => null);
      const view = await createRenderer().renderProps((props: { rows: { id: string }[]; visible: boolean }) => (
        <Form onFormSubmit={submitted} data-testid="form">
          <Show when={props.visible}>
            <For each={props.rows}>{(row) => (
              <Field.Root name={row.id} validate={validateRows}>
                <Field.Label>{row.id}</Field.Label>
                <Control defaultValue="initial" />
              </Field.Root>
            )}</For>
          </Show>
          <Field.Root name="survivor" validate={validateSurvivor} data-testid="survivor-root">
            <Field.Label>survivor</Field.Label><Control />
          </Field.Root>
        </Form>
      ), { rows, visible: true });
      const retired = view.getByRole('textbox', { name: 'a' });
      const other = view.getByRole('textbox', { name: 'b' });
      const survivor = view.getByRole('textbox', { name: 'survivor' });
      const remaining = operation === 'replace' ? [{ id: 'a' }, { id: 'b' }]
        : operation === 'filter' ? rows.filter((row) => row.id !== 'a') : [];
      await view.setProps(operation === 'hide' ? { visible: false } : { rows: remaining });
      expect(retired.isConnected).toBe(false);
      if (operation === 'filter') expect(view.getByRole('textbox', { name: 'b' })).toBe(other);
      expect(view.getByRole('textbox', { name: 'survivor' })).toBe(survivor);
      await view.user.type(survivor, 'works');
      expect(survivor).toHaveValue('works');
      expect(view.getByTestId('survivor-root')).toHaveAttribute('data-filled');
      fireEvent.submit(view.getByTestId('form'));
      await flushMicrotasks();
      expect(submitted).toHaveBeenCalledTimes(1);
      expect(submitted.mock.lastCall?.[0]).toEqual({
        ...Object.fromEntries(remaining.map((row) => [row.id, 'initial'])), survivor: 'works',
      });
      expect(validateSurvivor).toHaveBeenCalledTimes(1);
      expect(validateRows).toHaveBeenCalledTimes(remaining.length);
    },
  );
}

it.each(['explicit control ID', 'description', 'focused control'] as const)(
  'disposes a field row with %s without halting updates',
  async (variant) => {
    const view = await createRenderer().renderProps((props: { rows: { id: string }[] }) => <>
      <For each={props.rows}>{(row) => (
        <Field.Root name={row.id}>
          <Field.Control aria-label={row.id} id={variant === 'explicit control ID' ? row.id : undefined} />
          {variant === 'description' && <Field.Description>Help</Field.Description>}
        </Field.Root>
      )}</For>
      <Field.Root><Field.Control aria-label="survivor" /></Field.Root>
    </>, { rows: [{ id: 'row' }] });
    const retired = view.getByRole('textbox', { name: 'row' });
    if (variant === 'focused control') await view.user.click(retired);
    await view.setProps({ rows: [] });
    expect(retired.isConnected).toBe(false);
    const survivor = view.getByRole('textbox', { name: 'survivor' });
    await view.user.type(survivor, 'works');
    expect(survivor).toHaveValue('works');
  },
);
