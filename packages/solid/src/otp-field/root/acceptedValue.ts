/** OTP-specific pending actions, not a second controlled-state implementation.
 * An allowed request is not a controlled acknowledgement. Only an observed value
 * change can consume its focus/completion, and every new edit invalidates it.
 */
export function createAcceptedValueActions<CompleteDetails>() {
  let generation = 0;
  let pending: { token: number; value: string; focus?: number; complete?: CompleteDetails } | null = null;
  return {
    begin() { pending = null; return ++generation; },
    queue(token: number, value: string, complete?: CompleteDetails) {
      if (token === generation) pending = { token, value, complete };
    },
    focus(token: number, value: string, index: number) {
      if (pending?.token === token && pending.value === value) pending.focus = index;
    },
    consume(value: string) {
      const attempt = pending;
      pending = null;
      if (attempt?.value === value && attempt.token === generation) return attempt;
      // An unrelated external update also invalidates a previously consumed
      // action whose DOM/completion microtask has not run yet.
      generation += 1;
      return null;
    },
    isCurrent(token: number) { return token === generation; },
  };
}
