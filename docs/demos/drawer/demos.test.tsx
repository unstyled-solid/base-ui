import { describe, expect, it } from 'vitest';
import { screen, within } from '@solidjs/testing-library';
import { createRenderer, waitFor } from '../../../packages/solid/test';
import entries from './entry';
import { timedSwipe } from '../../../packages/solid/src/drawer/test/timedSwipe';

const triggers: Record<string, string> = {
  hero: 'Open drawer',
  'close-confirmation': 'Tweet',
  'indent-provider': 'Open drawer',
  'mobile-nav': 'Open mobile menu',
  nested: 'Open drawer stack',
  'non-modal': 'Open non-modal drawer',
  position: 'Open bottom drawer',
  'snap-points': 'Open snap drawer',
  uncontained: 'Open action sheet',
  'virtual-keyboard-aware': 'Open keyboard-aware drawer',
};

describe('Pinned drawer demos: real Solid components', () => {
  const { render } = createRenderer();
  for (const entry of entries) for (const variant of entry.variants) {
    const name = entry.id.slice('drawer/'.length);
    const Demo = variant.component;
    it(`${entry.id}/${variant.id}: mounts and opens`, async () => {
      const view = await render(() => <Demo />);
      if (name === 'swipe-area') {
        expect(view.getByText('Swipe here')).toBeVisible();
        expect(screen.queryByRole('dialog')).toBeNull();
        return;
      }
      await view.user.click(view.getByRole('button', { name: triggers[name] }));
      await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    });
  }

  for (const variantId of ['css-modules', 'tailwind']) {
    function demo(name: string) {
      return entries.find(entry => entry.id === `drawer/${name}`)!.variants.find(variant => variant.id === variantId)!.component;
    }
    it(`${variantId}: hero closes with Escape and restores trigger focus`, async () => {
      const Demo = demo('hero');
      const view = await render(() => <Demo />);
      const trigger = view.getByRole('button', { name: 'Open drawer' });
      await view.user.click(trigger);
      await view.user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it(`${variantId}: confirmation preserves the draft on Go back and clears it on Discard`, async () => {
      const Demo = demo('close-confirmation');
      const view = await render(() => <Demo />);
      await view.user.click(view.getByRole('button', { name: 'Tweet' }));
      const textarea = screen.getByRole('textbox', { name: 'New tweet' });
      await view.user.type(textarea, 'Solid draft');
      await view.user.click(screen.getByRole('button', { name: 'Cancel' }));
      const alert = await screen.findByRole('alertdialog', { name: 'Discard tweet?' });
      await view.user.click(within(alert).getByRole('button', { name: 'Go back' }));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(textarea).toHaveValue('Solid draft');
      await view.user.click(screen.getByRole('button', { name: 'Cancel' }));
      await view.user.click(await screen.findByRole('button', { name: 'Discard' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await view.user.click(view.getByRole('button', { name: 'Tweet' }));
      expect(screen.getByRole('textbox', { name: 'New tweet' })).toHaveValue('');
    });

    it(`${variantId}: submit clears the draft without opening confirmation`, async () => {
      const Demo = demo('close-confirmation');
      const view = await render(() => <Demo />);
      await view.user.click(view.getByRole('button', { name: 'Tweet' }));
      await view.user.type(screen.getByRole('textbox', { name: 'New tweet' }), 'Posted tweet');
      await view.user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tweet' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it(`${variantId}: nested drawers retain their parents through child dismissal`, async () => {
      const Demo = demo('nested');
      const view = await render(() => <Demo />);
      await view.user.click(view.getByRole('button', { name: 'Open drawer stack' }));
      await view.user.click(screen.getByRole('button', { name: 'Security settings' }));
      await view.user.click(screen.getByRole('button', { name: 'Advanced options' }));
      expect(screen.getByRole('textbox', { name: 'Device name' })).toHaveValue('Personal laptop');
      await view.user.click(screen.getByRole('button', { name: 'Done' }));
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Device name' })).toBeNull());
      expect(screen.getByRole('dialog', { name: 'Security' })).toBeVisible();
      await view.user.click(within(screen.getByRole('dialog', { name: 'Security' })).getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.getByRole('dialog', { name: 'Account' })).toBeVisible());
    });

    it(`${variantId}: controlled action sheet closes and reopens`, async () => {
      const Demo = demo('uncontained');
      const view = await render(() => <Demo />);
      await view.user.click(view.getByRole('button', { name: 'Open action sheet' }));
      await view.user.click(screen.getByRole('button', { name: 'Mute' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await view.user.click(view.getByRole('button', { name: 'Open action sheet' }));
      await view.user.click(screen.getByRole('button', { name: 'Block User' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it(`${variantId}: indent portal mounts inside the ref-owned container`, async () => {
      const Demo = demo('indent-provider');
      const view = await render(() => <Demo />);
      const trigger = view.getByRole('button', { name: 'Open drawer' });
      const host = trigger.parentElement!.parentElement!.parentElement!;
      await view.user.click(trigger);
      expect(host.contains(screen.getByRole('dialog'))).toBe(true);
      await view.user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it(`${variantId}: edge swipe opens inside its local portal container`, async () => {
      const Demo = demo('swipe-area');
      const view = await render(() => <Demo />);
      const area = view.getByText('Swipe here').parentElement!;
      const host = area.parentElement!;
      await timedSwipe(area, 'left', 180);
      await waitFor(() => expect(screen.getByRole('dialog', { name: 'Library' })).toBeVisible());
      expect(host.contains(screen.getByRole('dialog'))).toBe(true);
      await view.user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it(`${variantId}: non-modal ignores outside clicks and allows outside focus`, async () => {
      const Demo = demo('non-modal');
      const view = await render(() => <><button>Outside control</button><Demo /></>);
      await view.user.click(view.getByRole('button', { name: 'Open non-modal drawer' }));
      const outside = view.getByRole('button', { name: 'Outside control' });
      await view.user.click(outside);
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(outside).toHaveFocus();
      await view.user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  }
});
