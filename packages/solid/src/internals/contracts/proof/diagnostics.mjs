import { afterEach, beforeEach, expect, vi } from 'vitest';

let warnings;
let errors;
beforeEach(() => {
  // Spies retain original implementations: diagnostics remain visible as well as failing tests.
  warnings = vi.spyOn(console, 'warn');
  errors = vi.spyOn(console, 'error');
});
afterEach(() => {
  try {
    expect(warnings.mock.calls, 'Unexpected development warning').toEqual([]);
    expect(errors.mock.calls, 'Unexpected development error').toEqual([]);
  } finally { warnings.mockRestore(); errors.mockRestore(); }
});
