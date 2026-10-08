import { it, expect } from 'vitest';

it(`HARNESS_LONG_SCREENSHOT_PROBE ${'full-source-case-and-parameter-values-'.repeat(24)}`, () => {
  const block = document.createElement('div');
  block.style.height = '80px';
  block.textContent = 'Actual failing-test screenshot';
  document.body.append(block);
  expect('deliberate screenshot regression').toBe('expected failure');
});
