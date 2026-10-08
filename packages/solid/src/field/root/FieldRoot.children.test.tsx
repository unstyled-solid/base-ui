// Pinned React Form.test.tsx: invalid submit / onFormSubmit; FieldRoot.test.tsx:
// label association on control remount and preservation of the field baseline.
// Source SHA: 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, waitFor } from '../../../test';
import { Field } from '../index';
import { Form } from '../../form/Form';

const { renderProps } = createRenderer();

describe('Field.Root provider-owned children', () => {
  it('blocks native invalid submission, owns label/error associations and retains the focused host on updates', async () => {
    const callbacks: unknown[] = [];
    const attach = vi.fn();
    const view = await renderProps((props: { title: string }) =>
      <Form onSubmit={(event) => {
        callbacks.push(['submit', [...new FormData(event.currentTarget).entries()]]);
      }} onFormSubmit={(values) => callbacks.push(['form-submit', values])}>
        <Field.Root name="name" title={props.title} data-testid="root">
          <Field.Label>Name</Field.Label>
          <Field.Control ref={attach} required />
          <Field.Error data-testid="error" />
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>, { title: 'before' });
    const input = view.getByRole('textbox', { name: 'Name' }) as HTMLInputElement;
    const root = view.getByTestId('root');
    const label = view.getByText('Name');
    expect(root.tagName).toBe('DIV');
    expect([...root.children].map((node) => node.tagName)).toEqual(['LABEL', 'INPUT']);
    expect(label).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('aria-labelledby', label.id);

    await view.user.click(view.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(view.getByTestId('error')).toBeVisible());
    const error = view.getByTestId('error');
    expect(error.textContent).toBe(input.validationMessage);
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
    expect(callbacks).toEqual([]);

    await view.setProps({ title: 'after' });
    expect(view.getByRole('textbox', { name: 'Name' })).toBe(input);
    expect(view.getByTestId('root')).toBe(root);
    expect(view.getByText('Name')).toBe(label);
    expect(input).toHaveFocus();
    expect(attach.mock.calls).toEqual([[input]]);
    await view.user.type(input, 'Ada');
    await waitFor(() => expect(view.queryByTestId('error')).toBeNull());
    await view.user.click(view.getByRole('button', { name: 'Submit' }));
    expect(callbacks).toEqual([
      ['submit', [['name', 'Ada']]],
      ['form-submit', { name: 'Ada' }],
    ]);
    view.unmount();
    expect(attach.mock.calls).toEqual([[input], [null]]);
  });

  it('disposes and remounts conditional controls under the same field and label ownership', async () => {
    const submitted = vi.fn();
    const view = await renderProps((props: { mounted: boolean; id: string; value: string }) =>
      <Form onFormSubmit={submitted}>
        <Field.Root name="name" data-testid="root">
          <Field.Label>Name</Field.Label>
          {props.mounted && <Field.Control id={props.id} value={props.value} />}
          <Field.Error />
        </Field.Root>
        <button type="submit">Submit</button>
      </Form>, { mounted: true, id: 'first-control', value: 'initial' });
    const root = view.getByTestId('root');
    const label = view.getByText('Name');
    const first = view.getByRole('textbox');
    await view.setProps({ value: 'changed' });
    expect(root).toHaveAttribute('data-dirty');
    await view.setProps({ mounted: false });
    expect(view.queryByRole('textbox')).toBeNull();
    await view.user.click(view.getByRole('button'));
    expect(submitted.mock.lastCall?.[0]).toEqual({});

    await view.setProps({ mounted: true, id: 'second-control' });
    const second = view.getByRole('textbox', { name: 'Name' });
    expect(second).not.toBe(first);
    expect(view.getByTestId('root')).toBe(root);
    expect(view.getByText('Name')).toBe(label);
    expect(label).toHaveAttribute('for', 'second-control');
    expect(second).toHaveAttribute('aria-labelledby', label.id);
    expect(root).toHaveAttribute('data-dirty');
    await view.user.click(view.getByRole('button'));
    expect(submitted.mock.lastCall?.[0]).toEqual({ name: 'changed' });
    await view.setProps({ value: 'initial' });
    expect(root).not.toHaveAttribute('data-dirty');
  });
});
