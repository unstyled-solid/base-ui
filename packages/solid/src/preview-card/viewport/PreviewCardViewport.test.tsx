import { beforeEach, describe, expect } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, screen, sourceCase } from '../../../test';
import { PreviewCard } from '../index';

const source = 'packages/react/src/preview-card/viewport/PreviewCardViewport.test.tsx';
const { render } = createRenderer();

describe('PreviewCard.Viewport', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  sourceCase({ source, case: 'should render children in the `current` container by default', environment: 'jsdom' }, async () => {
    await render(() => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup>
      <PreviewCard.Viewport><span data-testid="content">Content</span></PreviewCard.Viewport>
    </PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>);
    expect(screen.getByTestId('content').closest('[data-current]')?.textContent).toBe('Content');
  });
  sourceCase({ source, case: 'should remount the `current` container when the active trigger changes', environment: 'jsdom' }, async () => {
    const handle = PreviewCard.createHandle<string>();
    await render(() => <>
      <PreviewCard.Trigger handle={handle} id="one" payload="first" href="#">One</PreviewCard.Trigger>
      <PreviewCard.Trigger handle={handle} id="two" payload="second" href="#">Two</PreviewCard.Trigger>
      <PreviewCard.Root handle={handle}>{(context) => <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup>
        <PreviewCard.Viewport><span data-testid="content">{context.payload}</span></PreviewCard.Viewport>
      </PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>}</PreviewCard.Root>
    </>);
    handle.open('one'); flush();
    const first = screen.getByTestId('content').closest('[data-current]');
    expect(first?.textContent).toBe('first');
    handle.open('two'); flush();
    const second = document.querySelector('[data-current]');
    expect(second?.textContent).toBe('second');
    expect(second).not.toBe(first);
  });
});
