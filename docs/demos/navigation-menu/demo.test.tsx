import { render, cleanup } from '@solidjs/testing-library';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { afterEach, expect, it } from 'vitest';
import demos from './entry';

afterEach(cleanup);

for (const demo of demos) {
  for (const variant of demo.variants) {
    it(`${demo.id}/${variant.id} opens its first panel and closes with Escape`, async () => {
      const Demo = variant.component;
      await render(() => <Demo />);
      const label = demo.id.endsWith('nested-inline') ? 'Product' : 'Overview';
      const trigger = screen.getByRole('button', { name: label });
      fireEvent.click(trigger);
      await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
      const text = demo.id.endsWith('nested-inline') ? 'Developers' : 'Quick Start';
      await waitFor(() => expect(screen.getByText(text)).toBeTruthy());
      fireEvent.keyDown(trigger, { key: 'Escape' });
      await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));
    });
  }
}
