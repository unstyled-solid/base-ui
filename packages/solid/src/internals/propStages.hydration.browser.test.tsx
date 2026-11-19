import { expect } from 'vitest';
import { hydrate } from '@solidjs/web';
import { userEvent } from 'vitest/browser';
import { browserCase } from '../../test';
import { PropStageHydrationFixture, propStageParts } from './propStages.fixture';

for (const part of Object.keys(propStageParts)) {
  browserCase({ source: 'packages/react/src/internals/useRenderElement.test.tsx', case: `${part} component host hydrates its original node and keeps live props`, environment: 'browser', issue: 'https://github.com/unstyled-solid/base-ui/issues/15' }, async () => {
    const renderId = `composition-${part}`;
    const query = new URLSearchParams({ module: 'packages/solid/src/internals/propStages.fixture.tsx', export: 'PropStageHydrationFixture', props: JSON.stringify({ part }), renderId });
    const response = await fetch(`/__harness__/ssr.html?${query}`);
    const html = await response.text();
    expect(response.ok, html).toBe(true);
    expect(response.headers.get('X-Harness-Renderer')).toBe('independent-solid2-ssr');
    const template = document.createElement('template'); template.innerHTML = html;
    const previous = globalThis._$HY;
    for (const script of template.content.querySelectorAll('script')) new Function(script.textContent ?? '')();
    const root = template.content.querySelector('main')!; document.body.append(root);
    const original = root.querySelector<HTMLElement>('[data-composed-host]');
    expect(original, `${part} must actually server-render its host`).not.toBeNull();
    const id = original!.id;
    const originalMenu = part === 'MenuItem' ? root.querySelector('[role="menu"]') : null;
    const originalPositioner = originalMenu?.parentElement;
    let dispose: (() => void) | undefined;
    try {
      // The global harness fails every unapproved warn/error, including every
      // hydration warning. No diagnostic optout is permitted for this matrix.
      dispose = hydrate(() => <PropStageHydrationFixture part={part} />, root, { renderId });
      const assertHost = () => {
        expect(root.querySelectorAll('[data-composed-host]')).toHaveLength(1);
        expect(root.querySelector('[data-composed-host]')).toBe(original);
        expect(original!.id).toBe(id);
        if (part === 'MenuItem') {
          expect(root.querySelector('[role="menu"]')).toBe(originalMenu);
          expect(originalMenu!.parentElement).toBe(originalPositioner);
        }
      };
      assertHost();
      if (part === 'FieldControl') await userEvent.fill(original!, 'edited');
      else if (part === 'Separator') await userEvent.click(root.querySelector('[data-update]')!);
      else await userEvent.click(original!);
      expect(root.querySelector('[data-events]')).toHaveTextContent('1');
      expect(original).toHaveAttribute('data-revision', '1');
      if (part === 'Toggle') expect(original).toHaveAttribute('aria-pressed', 'true');
      if (['Checkbox', 'Switch', 'Radio'].includes(part)) expect(original).toHaveAttribute('aria-checked', 'true');
      if (part === 'TabsTab') expect(original).toHaveAttribute('aria-selected', 'true');
      if (part === 'FieldControl') expect(original).toHaveValue('edited');
      if (part === 'NumberFieldIncrement') expect(root.querySelector('input')).toHaveValue('2');
      assertHost();
      // A modal menu correctly blocks its outside update button. Exercise a
      // second real item activation inside it instead of bypassing the backdrop.
      await userEvent.click(part === 'MenuItem' ? original! : root.querySelector('[data-update]')!);
      expect(original).toHaveAttribute('data-revision', '2');
      assertHost();
      if (part === 'MenuItem') {
        await userEvent.keyboard('{Escape}');
        // Inline positioning retains its host while closed (Portal owns the
        // conditional unmount path). Its retained node must remain usable.
        expect(originalMenu).toHaveAttribute('data-closed');
        await expect.element(originalPositioner!).not.toBeVisible();
        assertHost();
        const trigger = root.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
        await userEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(originalMenu).toHaveAttribute('data-open');
        assertHost();
        const reopened = root.querySelector('[data-composed-host]')!;
        await userEvent.click(reopened);
        expect(root.querySelector('[data-events]')).toHaveTextContent('3');
        expect(reopened).toHaveAttribute('data-revision', '3');
      }
    } finally {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      dispose?.(); root.remove();
      if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previous;
    }
  });
}
