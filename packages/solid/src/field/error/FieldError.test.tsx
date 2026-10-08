import { afterEach, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { browserCase, createRenderer, screen, waitFor } from '../../../test';
import { Field } from '../index';

const { render } = createRenderer();
afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

browserCase({ source: 'packages/react/src/field/error/FieldError.test.tsx', case: 'enter animation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  const finished = vi.fn();
  const view = await render(() => {
    const [shown, setShown] = createSignal(false);
    return <><style>{'.field-error-enter { transition: opacity 100ms; } .field-error-enter[data-starting-style] { opacity: 0; }'}</style><button onClick={() => setShown(true)}>Show</button><Field.Root><Field.Error match={shown()} class="field-error-enter" data-testid="error" onTransitionEnd={finished}>Message</Field.Error></Field.Root></>;
  });
  expect(screen.queryByTestId('error')).toBeNull();
  await view.user.click(screen.getByText('Show'));
  await waitFor(() => expect(finished).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('error')).toBeVisible();
  await waitFor(() => expect(screen.getByTestId('error')).not.toHaveAttribute('data-starting-style'));
});

browserCase({ source: 'packages/react/src/field/error/FieldError.test.tsx', case: 'exit animation retains message until completion', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  const view = await render(() => {
    const [shown, setShown] = createSignal(true);
    return <><style>{'@keyframes field-error-exit { to { opacity: 0; } } .field-error-exit[data-ending-style] { animation: field-error-exit 200ms; }'}</style><button onClick={() => setShown(false)}>Hide</button><Field.Root><Field.Control /><Field.Error match={shown()} class="field-error-exit" data-testid="error">Message</Field.Error></Field.Root></>;
  });
  const id = screen.getByTestId('error').id;
  expect(screen.getByRole('textbox').getAttribute('aria-describedby')?.split(/\s+/)).toContain(id);
  await view.user.click(screen.getByText('Hide'));
  expect(screen.getByTestId('error')).toHaveAttribute('data-ending-style');
  expect(screen.getByTestId('error')).toHaveTextContent('Message');
  expect((screen.getByRole('textbox').getAttribute('aria-describedby') ?? '').split(/\s+/)).not.toContain(id);
  await waitFor(() => expect(screen.queryByTestId('error')).toBeNull());
});
