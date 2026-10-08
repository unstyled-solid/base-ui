// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, onCleanup } from 'solid-js';
export function useInvalidFeedback() {
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  const [invalidPulse, setInvalidPulse] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal('');
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let skipClear = false;
  onCleanup(() => clearTimeout(timeout));
  function handleValueChange() {
    if (skipClear) { skipClear = false; return; }
    clearTimeout(timeout);
    setInvalidPulse(0);
    setStatusMessage('');
  }
  function handleValueInvalid(value: string) {
    skipClear = true;
    setInvalidPulse(current => current + 1);
    setStatusMessage(`Unsupported characters were ignored from ${value}.`);
    clearTimeout(timeout);
    timeout = setTimeout(() => setInvalidPulse(0), 400);
  }
  return { activeInvalidIndex: () => invalidPulse() > 0 ? focusedIndex() : -1, invalidPulse, statusMessage, setFocusedIndex, handleValueChange, handleValueInvalid };
}
