import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import entries from './entry';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function demo(name: string, variant: string) {
  return entries.find((entry) => entry.id === `combobox/${name}`)!.variants.find((item) => item.id === variant)!.component;
}
for (const variant of ['css-modules', 'tailwind']) {
  describe(variant, () => {
    for (const entry of entries) {
      it(`mounts ${entry.id}`, async () => {
        const Demo = demo(entry.id.split('/')[1], variant);
        await render(() => <Demo />);
        expect(document.querySelector('input, button')).not.toBeNull();
      });
    }
    it('hero filters, selects, and clears', async () => {
      const Demo = demo('hero', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Choose a fruit') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Apple' } });
      await waitFor(() => expect(screen.getAllByRole('option').map((node) => node.textContent)).toEqual(['Apple', 'Pineapple']));
      fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
      await waitFor(() => expect(input.value).toBe('Apple'));
      fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
      await waitFor(() => expect(input.value).toBe(''));
    });
    it('multiple adds and removes a chip', async () => {
      const Demo = demo('multiple', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Programming languages');
      fireEvent.focus(input);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'TypeScript' } });
      await waitFor(() => expect(screen.getByRole('option', { name: 'TypeScript' })).not.toBeNull());
      fireEvent.click(screen.getByRole('option', { name: 'TypeScript' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove TypeScript' })).not.toBeNull());
      expect(screen.getByLabelText('Programming languages')).toBe(input);
      fireEvent.click(screen.getByRole('button', { name: 'Remove TypeScript' }));
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove TypeScript' })).toBeNull());
    });
    it('grouped filters both groups without losing their headings', async () => {
      const Demo = demo('grouped', variant);
      await render(() => <Demo />);
      fireEvent.input(screen.getByLabelText('Select produce'), { inputType: 'insertText', target: { value: 'a' } });
      await waitFor(() => expect(screen.getByRole('option', { name: 'Carrot' })).not.toBeNull());
      expect(screen.getByText('Fruits')).not.toBeNull();
      expect(screen.getByText('Vegetables')).not.toBeNull();
    });
    it('create-items displays the banana default and selects a mapped id', async () => {
      const Demo = demo('create-items', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Choose a fruit') as HTMLInputElement;
      expect(input.value).toBe('Banana');
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Apple' } });
      await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).not.toBeNull());
      fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
      await waitFor(() => expect(input.value).toBe('Apple'));
    });
    it('input-inside-popup selects a country and updates the trigger', async () => {
      const Demo = demo('input-inside-popup', variant);
      await render(() => <Demo />);
      const trigger = screen.getByRole('combobox', { name: 'Country' });
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByPlaceholderText('e.g. United Kingdom')).not.toBeNull());
      fireEvent.input(screen.getByPlaceholderText('e.g. United Kingdom'), { inputType: 'insertText', target: { value: 'United Kingdom' } });
      await waitFor(() => expect(screen.getByRole('option', { name: 'United Kingdom' })).not.toBeNull());
      fireEvent.click(screen.getByRole('option', { name: 'United Kingdom' }));
      await waitFor(() => expect(trigger.textContent).toBe('United Kingdom'));
    });
    it('async multiple selects and removes a reviewer', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const Demo = demo('async-multiple', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Assign reviewers');
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Michael' } });
      await waitFor(() => expect(screen.getByRole('option', { name: /Michael Foster/ })).not.toBeNull());
      fireEvent.click(screen.getByRole('option', { name: /Michael Foster/ }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove Michael Foster' })).not.toBeNull());
      expect(screen.getByLabelText('Assign reviewers')).toBe(input);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Michael Foster' }));
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Michael Foster' })).toBeNull());
    });
    it('async search shows results and deterministic errors', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const Demo = demo('async-single', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Assign reviewer');
      fireEvent.focus(input);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Michael' } });
      await waitFor(() => expect(screen.getByText('Searching…')).not.toBeNull());
      await waitFor(() => expect(screen.getByRole('option', { name: /Michael Foster/ })).not.toBeNull());
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'will_error' } });
      await waitFor(() => expect(screen.getByText('Failed to fetch people. Please try again.')).not.toBeNull());
    });
    it('creatable opens a populated dialog and submits a new label', async () => {
      const Demo = demo('creatable', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Labels');
      fireEvent.focus(input);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'new label' } });
      await waitFor(() => expect(screen.getByRole('option', { name: 'Create "new label"' })).not.toBeNull());
      fireEvent.click(screen.getByRole('option', { name: 'Create "new label"' }));
      await waitFor(() => expect(screen.getByRole('dialog')).not.toBeNull());
      expect((screen.getByPlaceholderText('Label name') as HTMLInputElement).value).toBe('new label');
      fireEvent.submit(screen.getByPlaceholderText('Label name').closest('form')!);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove new label' })).not.toBeNull());
    });
    it('virtualized renders a bounded window of 10,000 rows and filters', async () => {
      // TanStack reads real element geometry; jsdom has no layout engine.
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function () {
        return this.hasAttribute('data-index') ? 32 : 360;
      });
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(256);
      const Demo = demo('virtualized', variant);
      await render(() => <Demo />);
      const input = screen.getByLabelText('Search 10,000 items');
      fireEvent.focus(input);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Item' } });
      await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));
      expect(screen.getAllByRole('option').length).toBeLessThan(100);
      fireEvent.input(input, { inputType: 'insertText', target: { value: 'Item 9999' } });
      await waitFor(() => expect(screen.getAllByRole('option').map((node) => node.textContent)).toEqual(['Item 9999']));
    });
  });
}
