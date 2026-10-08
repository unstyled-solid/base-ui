import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, fireEvent } from '@solidjs/testing-library';
import demos from './entry';

afterEach(cleanup);

describe('pinned menu demo islands', () => {
  for (const demo of demos) {
    for (const variant of demo.variants) {
      it(`${demo.id}/${variant.id} mounts and opens`, async () => {
        const Demo = variant.component;
        render(() => <Demo />);
        const trigger = screen.getAllByRole('button')[0];
        fireEvent.click(trigger);
        await waitFor(() => expect(screen.getAllByRole('menu').length).toBeGreaterThan(0));
      });
    }
  }

  it('hero closes with Escape', async () => {
    const Demo = demos[0].variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Song' }));
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('checkbox selection commits controlled state', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/checkbox-items')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Minimap' });
    expect(item.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(item);
    await waitFor(() => expect(item.getAttribute('aria-checked')).toBe('false'));
  });

  it('radio selection commits controlled state', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/radio-items')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Sort' }));
    const item = await screen.findByRole('menuitemradio', { name: 'Name' });
    fireEvent.click(item);
    await waitFor(() => expect(item.getAttribute('aria-checked')).toBe('true'));
  });

  it('filter exposes an empty result and clears', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/filter')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const input = await screen.findByRole('searchbox', { name: 'Filter actions' });
    fireEvent.input(input, { target: { value: 'no-matching-action' } });
    await waitFor(() => expect(screen.getByText('No actions found.').hidden).toBe(false));
    const clear = input.parentElement!.querySelector('button');
    expect(clear).not.toBeNull();
    fireEvent.click(clear!);
    await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
  });

  it('controlled detached action opens the playback payload', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/detached-triggers-controlled')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Open playback (controlled)' }));
    await screen.findByRole('menuitem', { name: 'Play' });
    expect(screen.queryByRole('menuitem', { name: 'Share' })).toBeNull();
  });

  it('detached payload switches between triggers', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/detached-triggers-full')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Library' }));
    await screen.findByRole('menuitem', { name: 'Create playlist' });
    fireEvent.click(screen.getByRole('button', { name: 'Playback' }));
    await screen.findByRole('menuitem', { name: 'Play now' });
  });

  it('submenu opens with keyboard navigation', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/submenu')!.variants[0].component;
    render(() => <Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Song' }));
    const trigger = await screen.findByRole('menuitem', { name: 'Add to Playlist' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    await screen.findByRole('menuitem', { name: 'Get Up!' });
  });

  it('hover trigger opens without a click', async () => {
    const Demo = demos.find((demo) => demo.id === 'menu/open-on-hover')!.variants[0].component;
    render(() => <Demo />);
    const trigger = screen.getByRole('button', { name: 'Add to playlist' });
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);
    await screen.findByRole('menuitem', { name: 'Get Up!' });
  });
});
