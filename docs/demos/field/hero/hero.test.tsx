import { describe, expect, it } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor } from '../../../../packages/solid/test';
import entries from '../entry';

const { render } = createRenderer();

for (const variant of entries[0].variants) {
  describe(`field/hero ${variant.id}`, () => {
    it('associates its label and description and validates required input on Enter', async () => {
      const Demo = variant.component;
      await render(() => <Demo />);
      const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('placeholder', 'Required');
      expect(input).toHaveAccessibleDescription('Visible on your profile');
      expect(screen.queryByText('Please enter your name')).toBeNull();

      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(screen.queryByText('Please enter your name')).toBeNull();
      fireEvent.input(input, { target: { value: 'A' } });
      await waitFor(() => expect(input).toHaveAttribute('data-dirty'));
      fireEvent.input(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() => expect(screen.getByText('Please enter your name')).toBeVisible());
      expect(input).toHaveAttribute('aria-invalid', 'true');

      fireEvent.input(input, { target: { value: 'Ada' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() => expect(screen.queryByText('Please enter your name')).toBeNull());
      expect(input).toHaveValue('Ada');
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('textbox', { name: 'Name' })).toBe(input);
    });
  });
}
