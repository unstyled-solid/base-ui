import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@solidjs/testing-library';
import { fireEvent, waitFor } from '@testing-library/dom';
import entries from './entry';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

for (const entry of entries) {
  for (const variant of entry.variants) {
    describe(`${entry.id}/${variant.id}`, () => {
      it('renders its real form, labels, and submit button', async () => {
        const Demo = variant.component;
        const view = await render(() => <Demo />);
        expect(view.container.querySelector('form')).not.toBeNull();
        expect(view.getByRole('button', { name: 'Submit' })).not.toBeNull();
        if (entry.id === 'form/hero') {
          expect((view.getByLabelText('Homepage') as HTMLInputElement).value).toBe('https://example.com');
        } else if (entry.id === 'form/form-action') {
          expect((view.getByLabelText('Username') as HTMLInputElement).value).toBe('admin');
        } else {
          expect(view.getByLabelText('Name')).not.toBeNull();
          expect(view.getByLabelText('Age')).not.toBeNull();
        }
      });

      if (entry.id === 'form/hero') {
        it('blocks required and malformed URLs before submitting', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const input = view.getByLabelText('Homepage') as HTMLInputElement;
          const button = view.getByRole('button', { name: 'Submit' });
          fireEvent.input(input, { target: { value: '' } });
          await new Promise<void>((resolve) => queueMicrotask(resolve));
          fireEvent.submit(input.form!);
          await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));
          expect(button.hasAttribute('data-disabled')).toBe(false);
          fireEvent.input(input, { target: { value: 'not-a-url' } });
          await new Promise<void>((resolve) => queueMicrotask(resolve));
          fireEvent.submit(input.form!);
          await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));
          expect(button.hasAttribute('data-disabled')).toBe(false);
        });

        it('shows the delayed domain error, clears it on editing, and accepts another domain', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const input = view.getByLabelText('Homepage') as HTMLInputElement;
          const button = view.getByRole('button', { name: 'Submit' });
          fireEvent.submit(input.form!);
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(true));
          await waitFor(() => expect(view.queryByText('The example domain is not allowed')).not.toBeNull(), { timeout: 2000 });
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(false));
          fireEvent.input(input, { target: { value: 'https://solidjs.com' } });
          await waitFor(() => expect(view.queryByText('The example domain is not allowed')).toBeNull());
          fireEvent.submit(input.form!);
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(true));
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(false), { timeout: 2000 });
          expect(view.queryByText('The example domain is not allowed')).toBeNull();
          expect(input.value).toBe('https://solidjs.com');
        });
      }

      if (entry.id === 'form/form-action') {
        it('reports the reserved username and resets uncontrolled fields after a resolved action', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const input = view.getByLabelText('Username') as HTMLInputElement;
          const button = view.getByRole('button', { name: 'Submit' });
          fireEvent.submit(input.form!);
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(true));
          await waitFor(() => expect(view.queryByText("'admin' is reserved for system use")).not.toBeNull(), { timeout: 2000 });
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(false));
          fireEvent.input(input, { target: { value: 'alice132' } });
          await waitFor(() => expect(view.queryByText("'admin' is reserved for system use")).toBeNull());
          vi.spyOn(Math, 'random').mockReturnValue(1);
          fireEvent.submit(input.form!);
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(true));
          await waitFor(() => expect(button.hasAttribute('data-disabled')).toBe(false), { timeout: 2000 });
          expect(input.value).toBe('admin');
          expect(view.queryByText("'admin' is reserved for system use")).toBeNull();
        });

        it('retains the unavailable-username response', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const input = view.getByLabelText('Username') as HTMLInputElement;
          vi.spyOn(Math, 'random').mockReturnValue(0);
          fireEvent.input(input, { target: { value: 'alice132' } });
          await waitFor(() => expect(input.value).toBe('alice132'));
          fireEvent.submit(input.form!);
          await waitFor(() => expect(view.queryByText('alice132 is unavailable')).not.toBeNull(), { timeout: 2000 });
          expect(input.value).toBe('admin');
        });
      }

      if (entry.id === 'form/zod') {
        it('validates non-numeric and negative ages with the upstream schema messages', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const name = view.getByLabelText('Name') as HTMLInputElement;
          const age = view.getByLabelText('Age') as HTMLInputElement;
          fireEvent.input(name, { target: { value: 'Alice' } });
          fireEvent.input(age, { target: { value: 'not-a-number' } });
          await new Promise<void>((resolve) => queueMicrotask(resolve));
          fireEvent.submit(name.form!);
          await waitFor(() => expect(view.queryByText('Age must be a number')).not.toBeNull());
          fireEvent.input(age, { target: { value: '-1' } });
          await waitFor(() => expect(view.queryByText('Age must be a number')).toBeNull());
          fireEvent.submit(name.form!);
          await waitFor(() => expect(view.queryByText('Age must be a positive number')).not.toBeNull());
        });

        it('renders schema errors and clears them after valid submission', async () => {
          const Demo = variant.component;
          const view = await render(() => <Demo />);
          const name = view.getByLabelText('Name') as HTMLInputElement;
          const age = view.getByLabelText('Age') as HTMLInputElement;
          fireEvent.submit(name.form!);
          await waitFor(() => expect(view.queryByText('Name is required')).not.toBeNull());
          await waitFor(() => expect(view.queryByText('Age must be a positive number')).not.toBeNull());
          fireEvent.input(name, { target: { value: 'Alice' } });
          fireEvent.input(age, { target: { value: '30' } });
          await waitFor(() => expect(view.queryByText('Name is required')).toBeNull());
          await waitFor(() => expect(view.queryByText('Age must be a positive number')).toBeNull());
          fireEvent.submit(name.form!);
          await new Promise((resolve) => setTimeout(resolve, 20));
          expect(view.queryByText('Name is required')).toBeNull();
          expect(view.queryByText('Age must be a positive number')).toBeNull();
          expect(name.value).toBe('Alice');
          expect(age.value).toBe('30');
        });
      }
    });
  }
}
