import '@testing-library/jest-dom/vitest';
import { it, expect } from 'vitest';

it('source matcher entry and central setup retain ordinary and asymmetric native assertions', () => {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = true;
  expect(input).toBeChecked();
  expect(input).toEqual(expect.toBeChecked());
  input.checked = false;
  expect(input).not.toBeChecked();
  expect(input).not.toEqual(expect.toBeChecked());
});
