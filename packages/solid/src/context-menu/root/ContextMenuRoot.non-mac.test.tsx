import { expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, fireEvent, firePointer, screen } from '../../../test';
import { ContextMenuFixture } from '../ContextMenu.test-fixture';

vi.mock('../../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, mac: false, apple: false } } };
});

// Source: ContextMenuRoot.non-mac.test.tsx; retained as an independent module/platform variant.
it('ContextMenu ignores context-menu mouseup on non-Mac platforms after movement', async () => {
  const changed = vi.fn();
  await createRenderer().render(() => <ContextMenuFixture root={{ onOpenChange: changed }} positioner={{ alignOffset: 0 }} />);
  fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 12, clientY: 12, button: 2 });
  flush();
  firePointer.move(document.body, { clientX: 24, clientY: 24, timeStamp: 100 });
  fireEvent.mouseUp(screen.getByTestId('item'), { clientX: 24, clientY: 24, button: 2 });
  flush();
  expect(screen.getByTestId('popup')).toBeInTheDocument();
  expect(changed).toHaveBeenCalledTimes(1);
});
