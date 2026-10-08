import { expect, it } from 'vitest';
import { createRenderer } from '../../test';
import { FocusGuard } from './FocusGuard';
import { platform } from './platform';

it('FocusGuard preserves pinned visuallyHidden declarations and overrides consumer guard flags', async () => {
  const view = await createRenderer().render(() => <FocusGuard
    data-testid="guard" tabindex={-1} role="link" aria-hidden="false"
    data-base-ui-focus-guard="consumer" style={{ position: 'absolute', color: 'red' }}
  />);
  const guard = view.getByTestId('guard');
  expect(guard.tagName).toBe('SPAN');
  expect(guard).toHaveAttribute('tabindex', '0');
  // Pinned FocusGuard.tsx:16-23 gives VoiceOver/WebKit a role-button guard.
  if (platform.screenReader.voiceOver && platform.engine.webkit) {
    expect(guard).not.toHaveAttribute('aria-hidden');
    expect(guard).toHaveAttribute('role', 'button');
  } else {
    expect(guard).toHaveAttribute('aria-hidden', 'true');
    expect(guard).not.toHaveAttribute('role');
  }
  expect(guard).toHaveAttribute('data-base-ui-focus-guard', '');
  // Actual FocusGuard.tsx imports visuallyHidden, not ownerVisuallyHidden.
  const expected = document.createElement('span');
  Object.assign(expected.style, {
    clipPath: 'inset(50%)', overflow: 'hidden', whiteSpace: 'nowrap', border: '0',
    padding: '0', width: '1px', height: '1px', margin: '0', position: 'fixed', top: '0', left: '0',
  });
  expect(guard.getAttribute('style')).toBe(expected.getAttribute('style'));
  view.unmount();
});
