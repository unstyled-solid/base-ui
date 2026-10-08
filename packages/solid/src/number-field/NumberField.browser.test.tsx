import { expect, vi } from 'vitest';
import { cdp } from 'vitest/browser';
import { browserCase, createRenderer, fireEvent, screen, waitFor } from '../../test';
import { NumberField } from './index';
import { getViewportRect } from './utils/getViewportRect';

browserCase({ source: 'packages/react/src/number-field/utils/getViewportRect.test.ts',
  case: 'uses the visual viewport when no teleport distance is set', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const viewport = window.visualViewport;
  if (!viewport) throw new Error('Expected visualViewport in a browser test.');
  const spies = [vi.spyOn(viewport, 'offsetLeft', 'get').mockReturnValue(7),
    vi.spyOn(viewport, 'offsetTop', 'get').mockReturnValue(11),
    vi.spyOn(viewport, 'width', 'get').mockReturnValue(300),
    vi.spyOn(viewport, 'height', 'get').mockReturnValue(400)];
  try {
    expect(getViewportRect(undefined, document.body)).toEqual({ left: 7, top: 11, right: 307, bottom: 411 });
  } finally { spies.forEach((spy) => spy.mockRestore()); }
});

browserCase({ source: 'packages/react/src/number-field/root/NumberFieldRoot.test.tsx',
  case: 'blocks submission when step mismatch occurs with default step', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await createRenderer().render(() => <form data-testid="form">
    <NumberField.Root name="quantity" min={0}><NumberField.Group><NumberField.Input /></NumberField.Group></NumberField.Root>
    <button type="submit">Submit</button>
  </form>);
  fireEvent.input(screen.getByRole('textbox'), { target: { value: '0.11' } }); await Promise.resolve();
  const hidden = document.querySelector<HTMLInputElement>('input[type="number"][name="quantity"]');
  expect(hidden).not.toBeNull();
  expect(hidden!.validity.stepMismatch).toBe(true);
  expect(screen.getByTestId<HTMLFormElement>('form').checkValidity()).toBe(false);
});

for (const requireGrant of [true, false]) {
  browserCase({ source: 'packages/react/src/number-field/scrub-area/NumberFieldScrubArea.test.tsx',
    case: requireGrant ? 'trusted Chromium pointer-lock acquisition, movement and final release'
      : 'trusted Chromium scrub handles the real pointer-lock outcome, movement and commit', environment: 'browser',
    issue: requireGrant ? 'bsolid-number-field-native-lock-document' : 'bsolid-number-field-browser-replay' }, async () => {
    const { render } = createRenderer();
    const requestSpy = vi.spyOn(document.body, 'requestPointerLock');
    const change = vi.fn(); const commit = vi.fn(); const down = vi.fn();
    await render(() => <NumberField.Root defaultValue={0} data-testid="trusted-root" onValueChange={change} onValueCommitted={commit}>
      <NumberField.Input />
      <NumberField.ScrubArea data-testid="trusted-area" onPointerDown={(event) => down(event.isTrusted)}
        style={{ position: 'fixed', left: '100px', top: '100px', width: '100px', height: '40px' }}>
        Amount<NumberField.ScrubAreaCursor data-testid="trusted-cursor" />
      </NumberField.ScrubArea>
    </NumberField.Root>);
    const rect = screen.getByTestId('trusted-area').getBoundingClientRect();
    const frame = window.frameElement?.getBoundingClientRect() ?? new DOMRect();
    const scale = frame.width / window.innerWidth || 1;
    const point = { x: frame.left + (rect.left + rect.width / 2) * scale, y: frame.top + (rect.top + rect.height / 2) * scale };
    // Consume the runner's trusted CDP driver and record the real native lock result.
    const driver = cdp();
    await driver.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    // Chromium resolves requestPointerLock before DidAcquirePointerLock finishes.
    // Observe its queued native acquisition event before sending locked movement.
    let acquired!: () => void;
    const acquisition = new Promise<void>((resolve) => { acquired = resolve; });
    const onLockChange = () => {
      if (document.pointerLockElement === document.body) acquired();
    };
    document.addEventListener('pointerlockchange', onLockChange);
    try {
      await driver.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
      expect(down).toHaveBeenCalledExactlyOnceWith(true);
      expect(requestSpy).toHaveBeenCalledTimes(1);
      const result = requestSpy.mock.results[0];
      const request = result.type === 'throw' ? Promise.reject(result.value) : Promise.resolve(result.value);
      const [outcome] = await Promise.allSettled([request]);
      if (outcome.status === 'rejected' && requireGrant) throw outcome.reason;
      if (outcome.status === 'fulfilled') {
        await acquisition;
        await waitFor(() => expect(document.pointerLockElement).toBe(document.body));
        expect(screen.getByTestId('trusted-cursor')).toBeInTheDocument();
      } else {
        expect(outcome.reason).toBeInstanceOf(DOMException);
        console.info('NumberField native pointer-lock rejection:', outcome.reason.name, outcome.reason.message);
        expect(document.pointerLockElement).toBeNull();
        await waitFor(() => expect(screen.queryByTestId('trusted-cursor')).toBeNull());
      }
      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(screen.getByTestId('trusted-root')).toHaveAttribute('data-scrubbing');
      // CDP x/y are top-level CSS positions, not movementX/Y. With the native
      // lock acquired, this absolute 10px displacement must deliver delta 10.
      await driver.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x + 10, y: point.y, button: 'left', buttons: 1 });
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('10'));
      expect(change.mock.lastCall?.[1].reason).toBe('scrub');
      expect(change.mock.lastCall?.[1].event.isTrusted).toBe(true);
      expect(change.mock.lastCall?.[1].event.movementX).toBe(10);
      expect(change.mock.lastCall?.[1].event.movementY).toBe(0);
      expect(commit).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('pointerlockchange', onLockChange);
      await driver.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x + 10, y: point.y, button: 'left', buttons: 0, clickCount: 1 });
      requestSpy.mockRestore();
    }
    await waitFor(() => expect(document.pointerLockElement).toBeNull());
    await waitFor(() => expect(commit).toHaveBeenCalledTimes(1));
    expect(commit.mock.lastCall?.[0]).toBe(10);
    expect(commit.mock.lastCall?.[1].reason).toBe('scrub');
    expect(commit.mock.lastCall?.[1].event.isTrusted).toBe(true);
    expect(screen.getByTestId('trusted-root')).not.toHaveAttribute('data-scrubbing');
    expect(screen.queryByTestId('trusted-cursor')).toBeNull();
  });
}
