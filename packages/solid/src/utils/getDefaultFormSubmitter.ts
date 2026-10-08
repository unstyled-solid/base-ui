export type DefaultFormSubmitter = HTMLButtonElement | HTMLInputElement;
/** Native form.elements order includes externally associated and disabled submitters.
 * Image inputs are intentionally excluded, as in the pinned source. */
export function getDefaultFormSubmitter(form: HTMLFormElement | null): DefaultFormSubmitter | null {
  if (!form) return null;
  for (const candidate of form.elements) {
    if (candidate.tagName === 'BUTTON' || candidate.tagName === 'INPUT') {
      const button = candidate as DefaultFormSubmitter;
      if (button.type === 'submit') return button;
    }
  }
  return null;
}
