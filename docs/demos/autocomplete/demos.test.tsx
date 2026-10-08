import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@solidjs/testing-library';
import entries from './entry';

function typeValue(input: HTMLElement, value: string) {
  input.focus();
  fireEvent.input(input, { target: { value }, inputType: 'insertText' });
}

describe('pinned autocomplete demos', () => {
  for (const entry of entries) {
    for (const variant of entry.variants) {
      it(`mounts ${entry.id}/${variant.id}`, async () => {
        const Demo = variant.component;
        await render(() => <Demo />);
        expect(document.body.textContent?.trim().length).toBeGreaterThan(0);
        cleanup();
      });
    }
  }

  for (const variantId of ['css-modules', 'tailwind']) {
    async function mount(id: string) {
      const Demo = entries.find(entry => entry.id === `autocomplete/${id}`)!.variants.find(variant => variant.id === variantId)!.component;
      await render(() => <Demo />);
    }

    it(`${variantId}: hero filters and selects by keyboard`, async () => {
      await mount('hero');
      const input = screen.getByRole('combobox');
      typeValue(input, 'feature');
      await screen.findByRole('option', { name: 'feature' });
      expect(screen.getAllByRole('option')).toHaveLength(1);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() => expect((input as HTMLInputElement).value).toBe('feature'));
      cleanup();
    });

    it(`${variantId}: limits results and updates hidden count`, async () => {
      await mount('limit');
      typeValue(screen.getByRole('combobox'), 'component');
      await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(8));
      expect(screen.getByText(/Hiding \d+ results/)).toBeTruthy();
      typeValue(screen.getByRole('combobox'), 'nonexistent');
      await screen.findByText('No results found for "nonexistent"');
      cleanup();
    });

    it(`${variantId}: Ctrl+N/P invokes highlight actions`, async () => {
      await mount('keyboard-shortcuts');
      const input = screen.getByRole('combobox');
      typeValue(input, 'changes');
      await screen.findByRole('option', { name: 'Commit changes' });
      fireEvent.keyDown(input, { key: 'n', ctrlKey: true });
      await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy());
      const first = input.getAttribute('aria-activedescendant');
      fireEvent.keyDown(input, { key: 'N', ctrlKey: true, shiftKey: true });
      await waitFor(() => expect(input.getAttribute('aria-activedescendant')).not.toBe(first));
      fireEvent.keyDown(input, { key: 'p', ctrlKey: true });
      await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(first));
      cleanup();
    });

    it(`${variantId}: async results, errors, and stale-request cancellation`, async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      await mount('async');
      const input = screen.getByRole('combobox');
      typeValue(input, 'Pulp');
      typeValue(input, 'will_error');
      await screen.findByText('Failed to fetch movies. Please try again.');
      expect(screen.queryByRole('option', { name: /Pulp Fiction/ })).toBeNull();
      typeValue(input, 'Pulp Fiction');
      await screen.findByRole('option', { name: /Pulp Fiction/ });
      typeValue(input, '');
      await waitFor(() => expect(screen.queryByText('Searching…')).toBeNull());
      vi.restoreAllMocks();
      cleanup();
    });

    it(`${variantId}: grouped results retain their labels`, async () => {
      await mount('grouped');
      typeValue(screen.getByRole('combobox'), 'feature');
      await screen.findByRole('option', { name: 'feature' });
      expect(screen.getByText('Type')).toBeTruthy();
      expect(screen.queryByText('Component')).toBeNull();
      cleanup();
    });

    it(`${variantId}: auto-highlight selects without ArrowDown`, async () => {
      await mount('auto-highlight');
      const input = screen.getByRole('combobox');
      typeValue(input, 'feature');
      await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy());
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('false'));
      expect((input as HTMLInputElement).value).toBe('feature');
      cleanup();
    });

    it(`${variantId}: inline completion selects the suffix`, async () => {
      await mount('inline');
      const input = screen.getByRole('combobox') as HTMLInputElement;
      typeValue(input, 'feat');
      await screen.findByRole('option', { name: 'feature' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => expect(input.value).toBe('feature'));
      await waitFor(() => expect(input.selectionStart).toBe(4));
      expect(input.selectionEnd).toBe(7);
      cleanup();
    });

    it(`${variantId}: fuzzy matching and literal highlighted fragments`, async () => {
      await mount('fuzzy-matching');
      const input = screen.getByRole('combobox');
      typeValue(input, 'rct');
      await screen.findByRole('option', { name: /React Hooks Guide/ });
      typeValue(input, 'React');
      await waitFor(() => expect(document.querySelector('mark')?.textContent).toBe('React'));
      typeValue(input, '[[[[');
      await screen.findByText('No results found for "[[[["');
      cleanup();
    });

    it(`${variantId}: command palette filters and closes on activation`, async () => {
      await mount('command-palette');
      fireEvent.click(screen.getByRole('button', { name: 'Open command palette' }));
      const input = await screen.findByRole('combobox', { name: 'Search commands' });
      typeValue(input, 'Linear');
      const option = await screen.findByRole('option', { name: /Linear/ });
      fireEvent.click(option, { detail: 1 });
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      cleanup();
    });

    it(`${variantId}: emoji insertion preserves text and restores caret`, async () => {
      await mount('grid');
      const message = screen.getByRole('textbox', { name: 'Message' }) as HTMLInputElement;
      typeValue(message, 'hello world');
      await waitFor(() => expect(message.value).toBe('hello world'));
      message.setSelectionRange(6, 11);
      fireEvent.click(screen.getByRole('combobox', { name: 'Choose emoji' }));
      await screen.findByRole('combobox', { name: 'Search emojis' });
      const emoji = await screen.findByText('🐶');
      fireEvent.click(emoji);
      await waitFor(() => expect(message.value).toBe('hello 🐶'));
      await waitFor(() => expect(message.selectionStart).toBe(8));
      expect(message.selectionEnd).toBe(8);
      cleanup();
    });
  }
});
