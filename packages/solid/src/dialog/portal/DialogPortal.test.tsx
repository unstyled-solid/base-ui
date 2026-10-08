import { describe, expect, it } from 'vitest';
import { Loading, lazy } from 'solid-js';
import { createRenderer } from '../../../test';
import { Dialog } from '../index';

describe('Dialog.Portal host Loading boundary', () => {
  const { render } = createRenderer();
  it('reveals async content without repeated state synchronization or stale ownership', async () => {
    let resolve!: (component: { default: () => ReturnType<typeof Content> }) => void;
    const Content = () => <p>Greetings</p>;
    const promise = new Promise<{ default: typeof Content }>((done) => { resolve = done; });
    const AsyncContent = lazy(() => promise);
    const view = await render(() => <Loading fallback="Loading…">
      <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup><AsyncContent /></Dialog.Popup></Dialog.Portal></Dialog.Root>
    </Loading>);
    expect(await view.findByText('Loading…')).toBeInTheDocument();
    resolve({ default: Content });
    expect(await view.findByText('Greetings')).toBeInTheDocument();
    expect(view.getAllByRole('dialog')).toHaveLength(1);
  });
});
