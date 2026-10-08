import { it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@solidjs/testing-library';
import Demo from './virtualized/css-modules';

it('virtualizes 10,000 items and filters the measured window', async () => {
  await render(() => <Demo />);
  const input = screen.getByRole('combobox');
  input.focus();
  fireEvent.click(input);
  await screen.findByRole('option', { name: 'Item 0001' });
  expect(screen.getAllByRole('option').length).toBeLessThan(100);
  expect(screen.getAllByRole('option')[0].getAttribute('aria-setsize')).toBe('10000');
  fireEvent.input(input, { target: { value: 'Item 9999' }, inputType: 'insertText' });
  await screen.findByRole('option', { name: 'Item 9999' });
  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
  expect(screen.getByRole('option').getAttribute('aria-posinset')).toBe('1');
  cleanup();
});
